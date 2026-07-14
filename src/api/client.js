import axios from 'axios';

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

// ── 토큰 refresh 직렬화 (레이스 컨디션 방지) ──────────────────
// 여러 요청이 동시에 401을 받아도 refresh는 "한 번"만 호출한다.
// refresh 토큰은 회전(rotation)+재사용 감지 방식이라, 동시에 여러 번
// refresh하면 두 번째부터 "구 토큰 재사용"으로 실패 → 엉뚱한 로그아웃이 발생.
// → 첫 요청만 refresh를 수행하고, 나머지는 큐에서 대기 후 재시도한다.
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  pendingQueue = [];
};

const logout = () => {
  window.dispatchEvent(
    new CustomEvent('feelio-store-sync', { detail: { isLoggedIn: false, onboardingDone: false } })
  );
};

// Response Interceptor: 401 처리
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 이고, 아직 재시도하지 않은 요청만 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.error?.code;

      // TOKEN_EXPIRED 이거나 단순 401 → refresh 시도
      if (errorCode === 'TOKEN_EXPIRED' || !errorCode) {
        originalRequest._retry = true;

        // 이미 다른 요청이 refresh 중이면 → 큐에서 대기했다가 재시도
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
          }).then(() => client(originalRequest));
        }

        // 이 요청이 대표로 단 한 번 refresh 수행
        isRefreshing = true;
        try {
          await axios.post(`${client.defaults.baseURL}/auth/token/refresh`, {}, { withCredentials: true });
          flushQueue(null);              // 대기하던 요청들 재시도 허용
          return client(originalRequest); // 새 토큰 쿠키로 원 요청 재시도
        } catch (refreshError) {
          flushQueue(refreshError);      // 대기하던 요청들도 실패 처리
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // TOKEN_EXPIRED가 아닌 401(UNAUTHORIZED 등) → 바로 로그아웃
      originalRequest._retry = true;
      logout();
    }

    return Promise.reject(error);
  }
);

export default client;
