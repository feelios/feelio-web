import client from './client.js';

export const authAPI = {
  // 유저 프로필 조회
  getMe: async () => {
    const response = await client.get('/users/me');
    return response.data.data;
  },

  // 로그아웃
  logout: async () => {
    const response = await client.post('/auth/logout');
    return response.data.data;
  },
};
