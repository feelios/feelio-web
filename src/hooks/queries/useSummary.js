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
