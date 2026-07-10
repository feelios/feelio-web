import { useQuery } from '@tanstack/react-query';
import { universeAPI } from '../../api/universe.js';

export const useUniverseQuery = (goalId) => {
  return useQuery({
    queryKey: ['universe', goalId],
    queryFn: () => universeAPI.getUniverseSimulation(goalId),
    enabled: !!goalId,
    staleTime: 1000 * 60 * 5, // 5분
  });
};
