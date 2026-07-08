import { useEffect, useMemo, useState } from 'react';
import { authAPI } from '../api/auth.js';
import { mockGoals } from '../data/mockGoals.js';
import { mockTransactions } from '../data/mockTransactions.js';

const STORAGE_KEY = 'feelio-dc-react-state-v4-temp-seed';

const initialState = {
  isLoggedIn: false,
  onboardingDone: false,
  accessToken: null,
  refreshToken: null,
  mode: 'light',
  aurora: '블루',
  user: { nickname: '서연', provider: 'Google' },
  goals: mockGoals,
  transactions: mockTransactions,
  toast: ''
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  } catch {
    return initialState;
  }
}

export function useFeelioStore() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // client.js에서 발생하는 상태 동기화 이벤트를 수신하여 React state에 반영합니다.
  useEffect(() => {
    const handleSync = (e) => {
      setState(prev => ({ ...prev, ...e.detail }));
    };
    window.addEventListener('feelio-store-sync', handleSync);
    return () => window.removeEventListener('feelio-store-sync', handleSync);
  }, []);

  const actions = useMemo(() => ({
    login: async (provider = 'Google', providerToken) => {
      try {
        let tokenToUse = providerToken;
        // 개발 환경에서만 더미 토큰 허용, 프로덕션에서는 로그인 중단 및 결과 반환
        if (!tokenToUse) {
          if (import.meta.env.DEV) {
            tokenToUse = 'dummy-token';
            console.warn('⚠️ [DEV ONLY] Using dummy token for login');
          } else {
            console.error('Security Error: providerToken is required for login in production.');
            setState(prev => ({ ...prev, toast: '로그인에 필요한 인증 정보가 없습니다.' }));
            return { success: false, reason: 'MISSING_PROVIDER_TOKEN' };
          }
        }
        
        const data = await authAPI.login(provider, tokenToUse);
        setState(prev => ({
          ...prev,
          isLoggedIn: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          onboardingDone: data.user.onboardingDone,
          mode: data.user.themeMode ? data.user.themeMode.toLowerCase() : prev.mode,
          aurora: data.user.auroraTheme || prev.aurora,
          toast: '로그인되었습니다.'
        }));
        return { success: true };
      } catch (error) {
        console.error('Login failed', error);
        setState(prev => ({ ...prev, toast: '로그인에 실패했습니다.' }));
        return { success: false, error };
      }
    },
    fetchMe: async () => {
      try {
        const user = await authAPI.getMe();
        setState(prev => ({
          ...prev,
          user,
          onboardingDone: user.onboardingDone,
          mode: user.themeMode ? user.themeMode.toLowerCase() : prev.mode,
          aurora: user.auroraTheme || prev.aurora
        }));
      } catch (error) {
        console.error('Failed to fetch user profile', error);
      }
    },
    completeOnboarding(goalPatch) {
      setState(prev => ({
        ...prev,
        onboardingDone: true,
        goals: goalPatch ? [{ ...prev.goals[0], ...goalPatch }] : prev.goals
      }));
    },
    logout: async () => {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Logout API failed, but clearing local state anyway', error);
      } finally {
        setState(prev => ({ 
          ...prev, 
          isLoggedIn: false, 
          onboardingDone: false,
          accessToken: null,
          refreshToken: null,
          user: { nickname: '', provider: '' }
        }));
      }
    },
    setTokens(accessToken, refreshToken) {
      setState(prev => ({ ...prev, accessToken, refreshToken }));
    },
    toggleMode() {
      setState(prev => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }));
    },
    setAurora(aurora) {
      setState(prev => ({ ...prev, aurora }));
    },
    updateUser(userPatch) {
      setState(prev => ({ ...prev, user: { ...prev.user, ...userPatch } }));
    },
    addGoal(goal) {
      setState(prev => ({
        ...prev,
        goals: [{ id: `g-${Date.now()}`, ...goal }, ...prev.goals],
        toast: '목표가 추가되었어요'
      }));
    },
    updateGoal(index, patch) {
      setState(prev => {
        const newGoals = [...prev.goals];
        newGoals[index] = { ...newGoals[index], ...patch };
        return { ...prev, goals: newGoals, toast: '목표가 수정되었어요' };
      });
    },
    removeGoal(index) {
      setState(prev => {
        if (prev.goals.length <= 1) return { ...prev, toast: '최소 1개의 목표는 있어야 해요' };
        const newGoals = [...prev.goals];
        newGoals.splice(index, 1);
        return { ...prev, goals: newGoals, toast: '목표가 삭제되었어요' };
      });
    },
    setPrimaryGoal(index) {
      setState(prev => {
        if (index === 0 || !prev.goals[index]) return prev;
        const newGoals = [...prev.goals];
        const [targetGoal] = newGoals.splice(index, 1);
        newGoals.unshift(targetGoal);
        return { ...prev, goals: newGoals, toast: '대표 목표로 변경되었어요' };
      });
    },
    addTransaction(transaction) {
      setState(prev => ({
        ...prev,
        transactions: [{ id: `t-${Date.now()}`, ...transaction }, ...prev.transactions],
        toast: '기록 저장됨'
      }));
    },
    updateTransaction(id, patch) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(item => item.id === id ? { ...item, ...patch } : item),
        toast: '기록 수정됨'
      }));
    },
    removeTransaction(id) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(item => item.id !== id),
        toast: '기록 삭제됨'
      }));
    },
    clearToast() {
      setState(prev => ({ ...prev, toast: '' }));
    },
    showToast(message) {
      setState(prev => ({ ...prev, toast: message }));
    },
    resetData() {
      setState(prev => ({ ...prev, transactions: [], toast: '모든 기록을 초기화했어요' }));
    }
  }), []);

  return { state, actions };
}
