import client from './client.js';

export const universeAPI = {
  getUniverseSimulation: async (goalId) => {
    const response = await client.get('/universe/simulation', { params: { goalId } });
    return response.data.data;
  }
};
