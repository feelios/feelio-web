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
  withCredentials: true,
});

// Request Interceptor: 토큰 주입 로직 제거 (쿠키로 자동 전송됨)
client.interceptors.request.use(
  (config) => config,
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
      
      const errorCode = error.response?.data?.error?.code;

      // TOKEN_EXPIRED 이거나 단순 401일 때 리프레시 시도 (쿠키 자동 전송)
      if (errorCode === 'TOKEN_EXPIRED' || !errorCode) {
        try {
          // Token Refresh API 호출 (페이로드 없음, 쿠키 활용)
          await axios.post(`${client.defaults.baseURL}/auth/token/refresh`, {}, { withCredentials: true });
          
          // 기존 요청 재시도 (새로운 토큰 쿠키가 자동으로 담겨서 전송됨)
          return client(originalRequest);
        } catch (refreshError) {
          // 리프레시 실패 (만료 등) -> UNAUTHORIZED
          updateStoreState({ isLoggedIn: false, onboardingDone: false });
          return Promise.reject(refreshError);
        }
      } else {
        // TOKEN_EXPIRED가 명확히 아닌 401 (UNAUTHORIZED 등)
        updateStoreState({ isLoggedIn: false, onboardingDone: false });
      }
    }

    return Promise.reject(error);
  }
);

export default client;
