import { create } from 'zustand';

// 예산 진행률(%) → 말랑이 브리핑 상태
// 홈/분석이 공유하는 단일 기준. 임계값을 여기 한 곳에서만 관리한다.
function deriveState(progress) {
  if (progress == null) return 'measuring';
  if (progress > 100) return 'over';
  if (progress < 85) return 'surplus';
  return 'ontrack';
}

const emptySummary = {
  budgetItems: [],
  totalBudget: 0,
  totalSpent: 0,
  remaining: 0,
  progress: null,
  state: 'measuring',
  isReady: false
};

// 예산 현황 전역 스토어
// - 서버 fetch는 TanStack Query(useBudgetStatusQuery)가 담당하고,
//   그 결과 파생값(총 예산/사용/잔여/진행률/상태)만 이 스토어에 동기화한다.
// - 홈 말랑이·분석 대시보드가 동일한 예산 상태를 구독한다.
export const useBudgetStore = create((set) => ({
  ...emptySummary,

  setFromServer: (budgetItems = []) => {
    const valid = budgetItems.filter((item) => item.budget > 0);
    const totalBudget = valid.reduce((sum, item) => sum + item.budget, 0);
    const totalSpent = valid.reduce((sum, item) => sum + (item.currentAmount || 0), 0);
    const progress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : null;
    set({
      budgetItems,
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      progress,
      state: deriveState(progress),
      isReady: true
    });
  },

  reset: () => set(emptySummary)
}));
