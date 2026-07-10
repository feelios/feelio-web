import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '../../api/transactions.js';

// 1. 거래 내역 목록 조회 쿼리 훅
export const useTransactionsQuery = (filters) => {
  return useQuery({
    queryKey: ['tx', 'list', filters],
    queryFn: () => transactionsAPI.getTransactions(filters),
    staleTime: 1000 * 60 * 5, // 5분 동안 fresh 상태 유지
  });
};

// 2. 캐시 일괄 무효화 유틸리티 함수
const invalidateRelatedQueries = (queryClient) => {
  [
    ['tx', 'list'],
    ['summary', 'calendar'],
    ['summary', 'emotions'],
    ['analysis'],
    ['universe'],
  ].forEach(queryKey => {
    queryClient.invalidateQueries({ queryKey });
  });
};

// 3. 거래 내역 생성 뮤테이션 훅
export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => transactionsAPI.createTransaction(data),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient);
    },
  });
};

// 4. 거래 내역 수정 뮤테이션 훅
export const useUpdateTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, data }) => transactionsAPI.updateTransaction(transactionId, data),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient);
    },
  });
};

// 5. 거래 내역 삭제 뮤테이션 훅
export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionId) => transactionsAPI.deleteTransaction(transactionId),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient);
    },
  });
};

// 6. 거래 내역 전체 초기화 뮤테이션 훅
export const useClearTransactionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => transactionsAPI.clearTransactions(),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient);
    },
  });
};
