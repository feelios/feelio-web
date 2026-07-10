import client from './client.js';

export const transactionsAPI = {
  getTransactions: async (params) => {
    // params: { year, month, day, emotionId, categoryId, query, sort }
    const response = await client.get('/transactions', { params });
    return response.data.data;
  },

  getTransaction: async (transactionId) => {
    const response = await client.get(`/transactions/${transactionId}`);
    return response.data.data;
  },

  createTransaction: async (data) => {
    // data: { type, amount, categoryId, emotionId, memo, occurredAt }
    const response = await client.post('/transactions', data);
    return response.data.data;
  },

  updateTransaction: async (transactionId, data) => {
    // data: { type, amount, categoryId, emotionId, memo, occurredAt }
    const response = await client.put(`/transactions/${transactionId}`, data);
    return response.data.data;
  },

  deleteTransaction: async (transactionId) => {
    const response = await client.delete(`/transactions/${transactionId}`);
    return response.data.data;
  },

  clearTransactions: async () => {
    const response = await client.delete('/transactions');
    return response.data.data;
  },
};

