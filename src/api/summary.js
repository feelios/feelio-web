import client from './client.js';

export const summaryAPI = {
  getCalendarSummary: async (year, month) => {
    const response = await client.get('/summary/calendar', { params: { year, month } });
    return response.data.data;
  },

  getEmotionSummary: async (year, month) => {
    const response = await client.get('/summary/emotions', { params: { year, month } });
    return response.data.data;
  },

  getEmotionSignalComment: async (year, month) => {
    const response = await client.get('/summary/emotion-signal', { params: { year, month } });
    return response.data.data;
  },

  // 홈 말랑이 말풍선. 당월 기준이라 year/month 파라미터가 없다 (계약 §7)
  getMallangComment: async () => {
    const response = await client.get('/summary/mallang-comment');
    return response.data.data;
  }
};
