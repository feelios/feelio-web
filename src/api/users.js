import client from './client.js';

export const usersAPI = {
  getMe: async () => {
    const response = await client.get('/users/me');
    return response.data.data;
  },
  
  updateMe: async (data) => {
    const response = await client.patch('/users/me', data);
    return response.data.data;
  },

  completeOnboarding: async (totalAsset) => {
    const response = await client.patch('/users/me/onboarding', { totalAsset });
    return response.data.data;
  },

  updateSettings: async (data) => {
    const response = await client.patch('/users/me/settings', data);
    return response.data.data;
  },

  updateFcmToken: async (fcmToken) => {
    const response = await client.post('/users/me/fcm-token', { fcmToken });
    return response.data.data;
  },

  // 다른 호출과 같은 axios 클라이언트를 쓴다.
  // 직접 fetch로 URL을 조립하면 baseURL의 '/api'가 빠져 배포에서 404가 나고,
  // 401 토큰 갱신 인터셉터도 타지 못한다.
  withdraw: async (data = {}) => {
    const response = await client.delete('/users/me', {
      data: { reason: data.reason || '사용 빈도 낮음' }
    });
    return response.data?.data ?? { withdrawn: true };
  }
};
