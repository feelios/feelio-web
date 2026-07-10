import client from './client.js';

export const summaryAPI = {
  getCalendarSummary: async (year, month) => {
    const response = await client.get('/summary/calendar', { params: { year, month } });
    return response.data.data;
  },

  getEmotionSummary: async (year, month) => {
    const response = await client.get('/summary/emotions', { params: { year, month } });
    return response.data.data;
  }
};
