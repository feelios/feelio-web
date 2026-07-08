import client from './client.js';

export const authAPI = {
  // 소셜 로그인 (실제 인가 코드와 리다이렉트 URI를 전달)
  login: async (provider, code, redirectUri) => {
    const response = await client.post('/auth/login', {
      provider: provider.toUpperCase(),
      code,
      redirectUri,
    });
    return response.data.data; // { accessToken, refreshToken, user: { ... } }
  },

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
