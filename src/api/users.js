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

  completeOnboarding: async () => {
    const response = await client.patch('/users/me/onboarding');
    return response.data.data;
  },

  updateSettings: async (data) => {
    const response = await client.patch('/users/me/settings', data);
    return response.data.data;
  },

  withdraw: async (data = {}) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const response = await fetch(`${baseUrl}/users/me`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        reason: data.reason || '사용 빈도 낮음'
      })
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.error?.message || payload?.message || '회원탈퇴 요청에 실패했습니다.';
      throw new Error(message);
    }

    return payload?.data ?? payload ?? { withdrawn: true };
  }
};
