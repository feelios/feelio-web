import client from './client.js';

export const analysisAPI = {
  getMonthlyAnalysis: async (year, month) => {
    const response = await client.get('/analysis/monthly', { params: { year, month } });
    return response.data.data;
  },
  getAiInsights: async (year, month) => {
    const response = await client.get('/analysis/ai-insights', { params: { year, month } });
    return response.data.data;
  },
  getAiReport: async (year, month) => {
    const response = await client.get('/analysis/ai-report', { params: { year, month } });
    return response.data.data;
  },
  getMonthlyTrend: async () => {
    const response = await client.get('/analysis/trend');
    return response.data.data;
  },
  getBudgetStatus: async () => {
    const response = await client.get('/analysis/budget');
    return response.data.data;
  },
  getPattern: async () => {
    const response = await client.get('/transactions/patterns');
    return response.data.data;
  }
};
