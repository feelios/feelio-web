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

// ['goals'] 캐시를 낙관적으로 선반영하고, 롤백용 이전 스냅샷을 반환한다.
const optimisticGoals = async (queryClient, updater) => {
  await queryClient.cancelQueries({ queryKey: ['goals'] });
  const previous = queryClient.getQueryData(['goals']);
  queryClient.setQueryData(['goals'], (old) => {
    if (!old?.goals) return old;
    return { ...old, goals: updater(old.goals) };
  });
  return { previous };
};

const rollbackGoals = (queryClient, context) => {
  if (context?.previous !== undefined) {
    queryClient.setQueryData(['goals'], context.previous);
  }
};

export const useCreateGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => goalsAPI.createGoal(data),
    // 생성은 서버 id·정렬 배치가 필요해 낙관적 삽입 대신 재조회로 반영한다.
    onSuccess: () => {
      invalidateRelatedQueries(queryClient);
    }
  });
};

export const useUpdateGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, data }) => goalsAPI.updateGoal(goalId, data),
    onMutate: ({ goalId, data }) =>
      optimisticGoals(queryClient, (goals) =>
        goals.map((g) => (g.goalId === goalId ? { ...g, ...data } : g))
      ),
    onError: (_err, _vars, context) => rollbackGoals(queryClient, context),
    onSettled: () => invalidateRelatedQueries(queryClient),
  });
};

export const useToggleMainGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, data }) => goalsAPI.updateGoal(goalId, data),
    // 대표목표 지정 시 대상은 반영, 나머지는 대표 해제(단일 대표 보장).
    onMutate: ({ goalId, data }) =>
      optimisticGoals(queryClient, (goals) =>
        goals.map((g) => {
          if (g.goalId === goalId) return { ...g, ...data };
          return data?.isMain ? { ...g, isMain: false } : g;
        })
      ),
    onError: (_err, _vars, context) => rollbackGoals(queryClient, context),
    onSettled: () => invalidateRelatedQueries(queryClient),
  });
};

export const useDeleteGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId) => goalsAPI.deleteGoal(goalId),
    onMutate: (goalId) =>
      optimisticGoals(queryClient, (goals) => goals.filter((g) => g.goalId !== goalId)),
    onError: (_err, _vars, context) => rollbackGoals(queryClient, context),
    onSettled: () => invalidateRelatedQueries(queryClient),
  });
};
