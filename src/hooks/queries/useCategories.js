import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesAPI } from '../../api/categories.js';

export const useCategoriesQuery = (type) => {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoriesAPI.getCategories(type),
    enabled: !!type,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => categoriesAPI.createCustomCategory(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.type] });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId }) => categoriesAPI.deleteCustomCategory(categoryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.type] });
    },
  });
};

export const useUpdateCategoryOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => categoriesAPI.updateCategoryOrder(data),
    onMutate: async (newOrder) => {
      // 낙관적 업데이트 로직 추가 시 유용
      await queryClient.cancelQueries({ queryKey: ['categories', newOrder.type] });
      const previousCategories = queryClient.getQueryData(['categories', newOrder.type]);
      
      if (previousCategories?.categories) {
        // Create a new ordered array based on the requested orders
        const newArray = [...previousCategories.categories].sort((a, b) => {
          const orderA = newOrder.orders.find(o => o.categoryId === a.categoryId)?.sortOrder || 999;
          const orderB = newOrder.orders.find(o => o.categoryId === b.categoryId)?.sortOrder || 999;
          return orderA - orderB;
        });
        queryClient.setQueryData(['categories', newOrder.type], { categories: newArray });
      }

      return { previousCategories };
    },
    onError: (err, newOrder, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories', newOrder.type], context.previousCategories);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.type] });
    },
  });
};
