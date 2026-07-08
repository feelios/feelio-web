import axios from 'axios';

const STORAGE_KEY = 'feelio-dc-react-state-v4-temp-seed';

function getStoreState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function updateStoreState(patch) {
  try {
    const currentState = getStoreState() || {};
    const newState = { ...currentState, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    // 상태 동기화를 위해 커스텀 이벤트 발생 (useFeelioStore.js 에서 수신)
    window.dispatchEvent(new CustomEvent('feelio-store-sync', { detail: patch }));
  } catch (err) {
    console.error('Failed to update store state', err);
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Access Token 자동 주입
client.interceptors.request.use(
  (config) => {
    const state = getStoreState();
    if (state?.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 처리
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 UNAUTHORIZED 에러 발생 및 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const state = getStoreState();
      
      // TOKEN_EXPIRED 인지 확인 (에러 응답 본문에 코드 포함 여부, 혹은 단순히 401일 때 리프레시 시도)
      // 서버에서 TOKEN_EXPIRED 코드를 주거나, 공통적으로 401 시 refresh 시도
      const errorCode = error.response?.data?.error?.code;

      if (errorCode === 'TOKEN_EXPIRED' || (!errorCode && state?.refreshToken)) {
        try {
          // Token Refresh API 호출
          const res = await axios.post(`${client.defaults.baseURL}/auth/token/refresh`, {
            refreshToken: state.refreshToken,
          });
          
          const { accessToken, refreshToken } = res.data.data;
          
          // 상태 업데이트 (스토리지에 새 토큰 저장 및 이벤트 발생)
          updateStoreState({ accessToken, refreshToken });
          
          // 기존 요청 헤더 업데이트 및 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // 리프레시 토큰도 만료되었거나 갱신 실패 시 -> UNAUTHORIZED로 간주
          // 상태 초기화 이벤트 발생 (React Router 등에서 이를 감지하여 라우팅 처리)
          updateStoreState({ isLoggedIn: false, onboardingDone: false, accessToken: null, refreshToken: null });
          return Promise.reject(refreshError);
        }
      } else {
        // TOKEN_EXPIRED가 명확히 아니거나 리프레시 토큰이 없는 401 (UNAUTHORIZED, FORBIDDEN 등)
        updateStoreState({ isLoggedIn: false, onboardingDone: false, accessToken: null, refreshToken: null });
      }
    }

    return Promise.reject(error);
  }
);

export default client;
