import { useQuery } from '@tanstack/react-query';
import { summaryAPI } from '../../api/summary.js';

/**
 * 홈 집계 3종은 마운트할 때마다 서버에 다시 묻는다.
 *
 * 거래 mutation 이 ['summary'] 를 invalidate 하고 있는데도, 거래내역에서 삭제한 뒤
 * 홈으로 오면 삭제 전 값이 그대로 남는 일이 실제로 있었다(2026-08-12 확인:
 * 지운 지출이 말랑이 금액·능선·달력에 계속 남고 새로고침해야 맞아졌다).
 * 무효화가 왜 화면까지 닿지 않는지는 아직 못 밝혔다. 다만 홈은 라우트 전환마다
 * 언마운트되므로, 마운트 시 한 번 더 확인하면 그 경로가 어디서 끊기든 화면은 맞는다.
 *
 * 비용은 홈에 들어올 때 GET 3번이다. 셋 다 DB 집계 한 방이고 mallang-comment 는
 * 서버가 (userId, 날짜) 로 캐싱해 거래가 바뀌었을 때만 AI 를 태운다.
 */
const ALWAYS_REVALIDATE_ON_MOUNT = 'always';

export const useCalendarSummaryQuery = (year, month) => {
  return useQuery({
    queryKey: ['summary', 'calendar', year, month],
    queryFn: () => summaryAPI.getCalendarSummary(year, month),
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnMount: ALWAYS_REVALIDATE_ON_MOUNT,
    enabled: !!year && !!month,
  });
};

export const useEmotionSummaryQuery = (year, month) => {
  return useQuery({
    queryKey: ['summary', 'emotions', year, month],
    queryFn: () => summaryAPI.getEmotionSummary(year, month),
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnMount: ALWAYS_REVALIDATE_ON_MOUNT,
    enabled: !!year && !!month,
  });
};

/** AI 지연이 감정 능선 로딩을 막지 않도록 별도로 조회한다. */
export const useEmotionSignalCommentQuery = (year, month) => {
  return useQuery({
    queryKey: ['summary', 'emotionSignal', year, month],
    queryFn: () => summaryAPI.getEmotionSignalComment(year, month),
    staleTime: 1000 * 60 * 30,
    refetchOnMount: ALWAYS_REVALIDATE_ON_MOUNT,
    enabled: !!year && !!month,
    retry: 1,
    // AI 문구는 부가 정보다. 서버 AI 호출이 5xx여도 홈 전체를 ErrorBoundary로 보내지 않고
    // HomePageDesign의 실제 감정 통계 기반 문구로 대체한다.
    throwOnError: false,
  });
};

/**
 * 홈 말랑이 말풍선 문구 (F18-5).
 *
 * 서버가 (userId, 날짜, 대표 감정) 기준으로 캐싱하고 감정이 바뀔 때만 새로 만든다.
 * 실패해도 화면은 하드코딩 문구로 버티므로 재시도는 1회면 충분하다.
 */
export const useMallangCommentQuery = () => {
  return useQuery({
    queryKey: ['summary', 'mallangComment'],
    queryFn: () => summaryAPI.getMallangComment(),
    staleTime: 1000 * 60 * 30, // 30분
    refetchOnMount: ALWAYS_REVALIDATE_ON_MOUNT,
    retry: 1,
    // 말랑이 문구도 부가 AI 응답이다. 실패하면 HomePageDesign의 예산 문구를 사용한다.
    throwOnError: false,
  });
};
