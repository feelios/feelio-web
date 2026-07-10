import client from './client.js';

export const categoriesAPI = {
  // 카테고리 목록 조회 (공통 + 커스텀 통합, 정렬 순서 반영)
  getCategories: async (type) => {
    const response = await client.get('/categories', { params: { type } });
    return response.data.data; // { categories: [...] }
  },

  // 커스텀 카테고리 생성
  createCustomCategory: async (data) => {
    const response = await client.post('/categories/custom', data);
    return response.data.data;
  },

  // 커스텀 카테고리 삭제
  deleteCustomCategory: async (categoryId) => {
    const response = await client.delete(`/categories/custom/${categoryId}`);
    return response.data.data;
  },

  // 카테고리 정렬 순서 업데이트
  updateCategoryOrder: async (data) => {
    const response = await client.put('/categories/order', data);
    return response.data.data;
  },
};
