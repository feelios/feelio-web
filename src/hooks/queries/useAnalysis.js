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

export const useAiInsightsQuery = () => {
  return useQuery({
    queryKey: ['aiInsights'],
    queryFn: () => analysisAPI.getAiInsights(),
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const useMonthlyTrendQuery = () => {
  return useQuery({
    queryKey: ['analysis', 'trend'],
    queryFn: () => analysisAPI.getMonthlyTrend(),
    staleTime: 1000 * 60 * 5, // 5분
  });
};
