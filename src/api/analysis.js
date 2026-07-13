import client from './client.js';

export const analysisAPI = {
  getMonthlyAnalysis: async (year, month) => {
    const response = await client.get('/analysis/monthly', { params: { year, month } });
    return response.data.data;
  }
};
