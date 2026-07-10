import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../../api/users.js';

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersAPI.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    }
  });
};

export const useCompleteOnboardingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => usersAPI.completeOnboarding(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    }
  });
};
