import { useEffect } from 'react';
import { useBudgetStatusQuery } from '../../hooks/queries/useAnalysis.js';
import { useBudgetStore } from '../../stores/budgetStore.js';

// 예산 현황(서버) → 전역 예산 스토어 동기화 다리.
// 로그인·온보딩 완료 후 앱 상단에 한 번만 마운트해, 홈/분석이 공유하는
// 전역 예산을 패칭하여 스토어에 동기화한다. UI는 렌더링하지 않는다.
export function BudgetSync() {
  const now = new Date();
  const { data } = useBudgetStatusQuery(now.getFullYear(), now.getMonth() + 1);
  const setFromServer = useBudgetStore((s) => s.setFromServer);

  useEffect(() => {
    if (data?.budgetItems) setFromServer(data.budgetItems);
  }, [data, setFromServer]);

  return null;
}
