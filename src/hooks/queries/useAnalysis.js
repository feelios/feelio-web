import { useQuery } from '@tanstack/react-query';
import { analysisAPI } from '../../api/analysis.js';

export const useMonthlyAnalysisQuery = (year, month) => {
  return useQuery({
    queryKey: ['analysis', year, month],
    queryFn: () => analysisAPI.getMonthlyAnalysis(year, month),
    staleTime: 1000 * 60 * 5, // 5분
    enabled: !!year && !!month,
  });
};

export const useAiInsightsQuery = (year, month) => {
  return useQuery({
    queryKey: ['aiInsights', year, month],
    queryFn: () => analysisAPI.getAiInsights(year, month),
    staleTime: 1000 * 60 * 5, // 5분
    enabled: !!year && !!month,
  });
};

export const useAiReportQuery = (year, month) => {
  return useQuery({
    queryKey: ['aiReport', year, month],
    queryFn: () => analysisAPI.getAiReport(year, month),
    staleTime: 1000 * 60 * 5, // 5분
    enabled: !!year && !!month,
  });
};

// 추이도 선택한 달을 따라간다. year·month 가 queryKey 에 없으면 달을 바꿔도 캐시된 값이 그대로 나와,
// 화면에서는 월 전환이 아예 동작하지 않는 것처럼 보인다.
export const useMonthlyTrendQuery = (year, month) => {
  return useQuery({
    queryKey: ['analysis', 'trend', year, month],
    queryFn: () => analysisAPI.getMonthlyTrend(year, month),
    staleTime: 1000 * 60 * 5, // 5분
    enabled: !!year && !!month,
  });
};

export const useBudgetStatusQuery = (year, month) => {
  return useQuery({
    queryKey: ['analysis', 'budget', year, month],
    queryFn: () => analysisAPI.getBudgetStatus(year, month),
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const usePatternQuery = () => {
  return useQuery({
    queryKey: ['analysis', 'pattern'],
    queryFn: () => analysisAPI.getPattern(),
    staleTime: 1000 * 60 * 5, // 5분
  });
};
