import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '../../api/transactions.js';
import useStore from '../../stores/useFeelioStore.js';

// 1. 거래 내역 목록 조회 쿼리 훅
export const useTransactionsQuery = (filters) => {
  return useQuery({
    queryKey: ['tx', 'list', filters],
    queryFn: () => transactionsAPI.getTransactions(filters),
    staleTime: 1000 * 60 * 5, // 5분 동안 fresh 상태 유지
  });
};

export const useTransactionDetailQuery = (transactionId, initialData) => {
  return useQuery({
    queryKey: ['tx', 'detail', transactionId],
    queryFn: () => transactionsAPI.getTransaction(transactionId),
    enabled: !!transactionId,
    initialData,
    staleTime: 1000 * 60 * 5,
  });
};

// 2. 캐시 일괄 무효화 유틸리티 함수
const invalidateRelatedQueries = async (queryClient) => {
  const queryKeys = [
    ['tx', 'list'],
    // 상세 캐시도 비워야 한다. 빠져 있으면 수정 후에도 모달이 옛 값을 그대로 보여준다 (#280).
    ['tx', 'detail'],
    ['summary', 'calendar'],
    ['summary', 'emotions'],
    ['summary', 'mallangComment'],
    ['analysis'],
    ['universe'],
    ['goals'],
  ];

  await Promise.all(queryKeys.map(queryKey =>
    queryClient.invalidateQueries({ queryKey, refetchType: 'all' })
  ));

  // 총자산은 zustand state.user 에 있어 invalidateQueries 로는 갱신되지 않는다.
  // 서버가 거래를 반영해 계산해 주는 값이므로 여기서 직접 다시 받아온다 (#272).
  useStore.getState().actions.refreshUser();
};

// 3. 거래 내역 생성 뮤테이션 훅
export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => transactionsAPI.createTransaction(data),
    onSuccess: () => invalidateRelatedQueries(queryClient),
  });
};

// 4. 거래 내역 수정 뮤테이션 훅
export const useUpdateTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, data }) => transactionsAPI.updateTransaction(transactionId, data),
    onSuccess: () => invalidateRelatedQueries(queryClient),
  });
};

// 5. 거래 내역 삭제 뮤테이션 훅 (낙관적 삭제 + 실패 시 롤백)
export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionId) => transactionsAPI.deleteTransaction(transactionId),
    onMutate: async (transactionId) => {
      // 필터별로 여러 개일 수 있는 ['tx','list'] 캐시를 한번에 선반영.
      await queryClient.cancelQueries({ queryKey: ['tx', 'list'] });
      const previous = queryClient.getQueriesData({ queryKey: ['tx', 'list'] });
      queryClient.setQueriesData({ queryKey: ['tx', 'list'] }, (old) => {
        if (!old?.transactions) return old;
        return { ...old, transactions: old.transactions.filter((t) => t.transactionId !== transactionId) };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => invalidateRelatedQueries(queryClient),
  });
};

// 6. 거래 내역 다중 삭제 뮤테이션 훅 (선택 삭제 · 단건 DELETE 병렬 + 낙관적 삭제/롤백)
export const useBulkDeleteTransactionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // 계약에 bulk 엔드포인트가 없어 단건 DELETE를 병렬 호출한다.
    mutationFn: (ids) => Promise.all(ids.map((id) => transactionsAPI.deleteTransaction(id))),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['tx', 'list'] });
      const previous = queryClient.getQueriesData({ queryKey: ['tx', 'list'] });
      const idSet = new Set(ids);
      queryClient.setQueriesData({ queryKey: ['tx', 'list'] }, (old) => {
        if (!old?.transactions) return old;
        return { ...old, transactions: old.transactions.filter((t) => !idSet.has(t.transactionId)) };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    /*
     * 목록은 onMutate 에서 이미 삭제된 상태로 갱신됐다. 여기서 전체 관련 쿼리의
     * 재조회까지 반환해 기다리면, AI 분석·평행우주처럼 응답이 오래 걸리는 쿼리 하나 때문에
     * mutation 이 계속 pending 으로 남아 선택 바가 "삭제 중…"에 멈춘다.
     * 정합성 재확인은 백그라운드에서 진행하고 삭제 UI는 서버 DELETE 완료 즉시 끝낸다.
     */
    onSettled: () => {
      void invalidateRelatedQueries(queryClient);
    },
  });
};

// 7. 거래 내역 전체 초기화 뮤테이션 훅
export const useClearTransactionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => transactionsAPI.clearTransactions(),
    onSuccess: () => invalidateRelatedQueries(queryClient),
  });
};
