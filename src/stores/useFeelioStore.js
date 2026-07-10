import { useEffect, useMemo, useState } from 'react';
import { authAPI } from '../api/auth.js';
import { mockGoals } from '../data/mockGoals.js';
import { mockTransactions } from '../data/mockTransactions.js';

const STORAGE_KEY = 'feelio-dc-react-state-v4-temp-seed';

const initialState = {
  isLoggedIn: false,
  onboardingDone: false,
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

  useEffect(() => {
    const handleSync = (e) => {
      setState(prev => ({ ...prev, ...e.detail }));
    };
    window.addEventListener('feelio-store-sync', handleSync);
    return () => window.removeEventListener('feelio-store-sync', handleSync);
  }, []);

  const actions = useMemo(() => ({
    login: (provider) => {
      const providerId = provider.toLowerCase();
      window.location.href = `http://localhost:8080/oauth2/authorization/${providerId}`;
    },

    fetchMe: async () => {
      try {
        const user = await authAPI.getMe();
        setState(prev => ({
          ...prev,
          user,
          isLoggedIn: true,
          onboardingDone: user.onboardingDone,
          mode: user.themeMode ? user.themeMode.toLowerCase() : prev.mode,
          aurora: user.auroraTheme || prev.aurora
        }));
      } catch (error) {
        console.error('Failed to fetch user profile', error);
        setState(prev => ({ ...prev, isLoggedIn: false }));
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
          user: { nickname: '', provider: '' }
        }));
      }
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
