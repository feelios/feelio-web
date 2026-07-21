import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { universeAPI } from '../../api/universe.js';

export const useUniverseQuery = (goalId) => {
  return useQuery({
    queryKey: ['universe', goalId],
    queryFn: () => universeAPI.getUniverseSimulation(goalId),
    enabled: !!goalId,
    staleTime: 1000 * 60 * 5, // 5분
    // 목표 전환 시 이전 우주를 유지하며 새 데이터 로드 → 전체 화면 로딩 깜빡임 방지
    placeholderData: keepPreviousData,
  });
};
