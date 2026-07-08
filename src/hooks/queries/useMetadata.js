import { useQuery } from '@tanstack/react-query';
import { metaAPI } from '../../api/meta.js';

export const useMetadata = () => {
  return useQuery({
    queryKey: ['metadata'],
    queryFn: metaAPI.getMetadata,
    staleTime: 1000 * 60 * 60 * 24, // 24시간 동안 fresh 상태 유지 (메타데이터는 자주 안 변함)
    gcTime: 1000 * 60 * 60 * 24, // 캐시 유지 시간도 24시간으로 설정
    retry: 2, // 실패 시 2번 재시도
  });
};
