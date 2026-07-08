import client from './client.js';

export const metaAPI = {
  getMetadata: async () => {
    const response = await client.get('/meta');
    return response.data.data; // { emotions: [], categories: [], situations: [] } 예상
  },
};
