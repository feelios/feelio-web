import { useQuery } from '@tanstack/react-query';
import { summaryAPI } from '../../api/summary.js';

export const useCalendarSummaryQuery = (year, month) => {
  return useQuery({
    queryKey: ['summary', 'calendar', year, month],
    queryFn: () => summaryAPI.getCalendarSummary(year, month),
    staleTime: 1000 * 60 * 5, // 5분
    enabled: !!year && !!month,
  });
};

export const useEmotionSummaryQuery = (year, month) => {
  return useQuery({
    queryKey: ['summary', 'emotions', year, month],
    queryFn: () => summaryAPI.getEmotionSummary(year, month),
    staleTime: 1000 * 60 * 5, // 5분
    enabled: !!year && !!month,
  });
};

/**
 * 홈 말랑이 말풍선 문구 (F18-5).
 *
 * 서버가 (userId, 날짜, 대표 감정) 기준으로 캐싱하고 감정이 바뀔 때만 새로 만든다.
 * 클라이언트도 길게 잡아 홈에 들를 때마다 재요청하지 않는다.
 * 실패해도 화면은 하드코딩 문구로 버티므로 재시도는 1회면 충분하다.
 */
export const useMallangCommentQuery = () => {
  return useQuery({
    queryKey: ['summary', 'mallangComment'],
    queryFn: () => summaryAPI.getMallangComment(),
    staleTime: 1000 * 60 * 30, // 30분
    retry: 1,
  });
};
