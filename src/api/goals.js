import client from './client.js';

export const goalsAPI = {
  getGoals: async () => {
    const response = await client.get('/goals');
    return response.data.data;
  },

  createGoal: async (data) => {
    const response = await client.post('/goals', data);
    return response.data.data;
  },

  updateGoal: async (goalId, data) => {
    const response = await client.put(`/goals/${goalId}`, data);
    return response.data.data;
  },

  deleteGoal: async (goalId) => {
    const response = await client.delete(`/goals/${goalId}`);
    return response.data.data;
  }
};
