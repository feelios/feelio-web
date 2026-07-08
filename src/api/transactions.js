import client from './client.js';

export const transactionsAPI = {
  createTransaction: async (data) => {
    // data: { type, amount, categoryId, emotionId, memo, occurredAt }
    const response = await client.post('/transactions', data);
    return response.data.data;
  },
};
