import client from './client.js';

export const authAPI = {
  // 소셜 로그인 (providerToken은 임시로 mock을 넘기거나 실제 OAuth 응답을 받아서 넘깁니다)
  login: async (provider, providerToken = 'dummy-oauth-token') => {
    const response = await client.post('/auth/login', {
      provider: provider.toUpperCase(),
      providerToken,
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
