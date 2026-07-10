import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalsAPI } from '../../api/goals.js';

export const useGoalsQuery = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: goalsAPI.getGoals,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const useCreateGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => goalsAPI.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['universe'] });
    }
  });
};

export const useUpdateGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, data }) => goalsAPI.updateGoal(goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['universe'] });
    }
  });
};

export const useDeleteGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId) => goalsAPI.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['universe'] });
    }
  });
};
