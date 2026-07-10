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

  withdraw: async (data) => {
    const response = await client.delete('/users/me', { data });
    return response.data.data;
  }
};
