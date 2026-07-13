import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalsAPI } from '../../api/goals.js';

export const useGoalsQuery = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: goalsAPI.getGoals,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

const invalidateRelatedQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['goals'] });
  queryClient.invalidateQueries({ queryKey: ['universe'] });
};

export const useCreateGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => goalsAPI.createGoal(data),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient);
    }
  });
};

export const useUpdateGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, data }) => goalsAPI.updateGoal(goalId, data),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient);
    }
  });
};

export const useToggleMainGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, data }) => goalsAPI.updateGoal(goalId, data),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient);
    },
  });
};

export const useDeleteGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId) => goalsAPI.deleteGoal(goalId),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient);
    }
  });
};
