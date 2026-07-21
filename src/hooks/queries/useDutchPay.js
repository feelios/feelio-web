import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '../../api/transactions.js';

export const usePendingDutchPayQuery = () => {
  return useQuery({
    queryKey: ['tx', 'dutch-pay'],
    queryFn: transactionsAPI.getPendingDutchPay,
  });
};

export const useSettleDutchPayMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId) => transactionsAPI.settleDutchPay(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tx'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
    },
  });
};
