import client from './client.js';

// 감정·카테고리 마스터. 계약 §5 기준 이 응답이 단일 기준이며,
// emotionId·categoryId 는 DB 가 만드는 값이라 프론트가 임의로 가질 수 없다 (#266).
export const metaAPI = {
  getMetadata: async () => {
    const response = await client.get('/meta');
    return response.data.data; // { emotions: [], categories: [] }
  },
};
