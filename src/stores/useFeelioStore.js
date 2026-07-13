import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth.js';
import { goalsAPI } from '../api/goals.js'; // fix 브랜치 반영

const STORAGE_KEY = 'feelio-dc-react-state-v4-temp-seed';

const initialState = {
  isLoggedIn: false,
  onboardingDone: false,
  mode: 'light',
  aurora: '블루',
  user: { nickname: '서연', provider: 'Google', email: '' },
  goals: [],
  transactions: [],
  toast: ''
};

function normalizeMode(mode) {
  return mode === 'dark' ? 'dark' : 'light';
}

const useStore = create(
  persist(
    (set) => ({
      state: initialState,
      actions: {
        login: (provider) => {
          const providerId = provider.toLowerCase();
          window.location.href = `http://localhost:8080/oauth2/authorization/${providerId}`;
        },
        fetchMe: async () => {
          try {
            const user = await authAPI.getMe();
            // fix 브랜치: 탈퇴 복구 대응을 위해 goals 안전하게 조회
            const goals = await goalsAPI.getGoals().catch((goalError) => {
              console.error('Failed to fetch user goals', goalError);
              return null;
            });

            set((prev) => ({
              state: {
                ...prev.state,
                user,
                isLoggedIn: true,
                onboardingDone: user.onboardingDone,
                mode: user.themeMode ? user.themeMode.toLowerCase() : prev.state.mode,
                aurora: user.auroraTheme || prev.state.aurora,
                goals: Array.isArray(goals) ? goals : prev.state.goals // fix 브랜치 반영
              }
            }));
          } catch (error) {
            console.error('Failed to fetch user profile', error);
            set((prev) => ({
              state: {
                ...prev.state,
                isLoggedIn: false,
                onboardingDone: false,
                user: { nickname: '', provider: '', email: '' }
              }
            }));
          }
        },
        completeOnboarding: async () => {
          try {
            const user = await authAPI.getMe();
            // fix 브랜치: 탈퇴 복구 대응을 위해 goals 안전하게 조회
            const goals = await goalsAPI.getGoals().catch((goalError) => {
              console.error('Failed to fetch user goals', goalError);
              return null;
            });

            set((prev) => ({
              state: {
                ...prev.state,
                user,
                isLoggedIn: true,
                onboardingDone: user.onboardingDone,
                mode: user.themeMode ? user.themeMode.toLowerCase() : prev.state.mode,
                aurora: user.auroraTheme || prev.state.aurora,
                goals: Array.isArray(goals) ? goals : prev.state.goals // fix 브랜치 반영
              }
            }));
          } catch (error) {
            console.error('Failed to refresh user after onboarding', error);
          }
        },
        logout: async () => {
          try {
            await authAPI.logout();
          } catch (error) {
            console.error('Logout API failed, but clearing local state anyway', error);
          } finally {
            set((prev) => ({
              state: {
                ...prev.state,
                isLoggedIn: false,
                onboardingDone: false,
                user: { nickname: '', provider: '', email: '' }
              }
            }));
          }
        },
        toggleMode: () => {
          set((prev) => ({
            state: { ...prev.state, mode: prev.state.mode === 'dark' ? 'light' : 'dark' }
          }));
        },
        syncSettings: ({ mode, aurora }) => {
          set((prev) => ({
            state: {
              ...prev.state,
              mode: normalizeMode(mode || prev.state.mode),
              aurora: aurora || prev.state.aurora
            }
          }));
        },
        clearAccount: () => {
          set((prev) => ({
            state: {
              ...prev.state,
              isLoggedIn: false,
              onboardingDone: false,
              mode: 'light',
              aurora: '블루',
              user: { nickname: '', provider: '', email: '' },
              goals: [], // fix 브랜치 회원탈퇴 시 클리어 데이터 보존
              transactions: [], // fix 브랜치 회원탈퇴 시 클리어 데이터 보존
              toast: '회원탈퇴가 완료되었어요'
            }
          }));
        },
        setAurora: (aurora) => {
          set((prev) => ({ state: { ...prev.state, aurora } }));
        },
        updateUser: (userPatch) => {
          set((prev) => ({
            state: { ...prev.state, user: { ...prev.state.user, ...userPatch } }
          }));
        },
        addGoal: (goal) => {
          set((prev) => ({
            state: {
              ...prev.state,
              goals: [{ id: `g-${Date.now()}`, ...goal }, ...prev.state.goals],
              toast: '목표가 추가되었어요'
            }
          }));
        },
        updateGoal: (index, patch) => {
          set((prev) => {
            const newGoals = [...prev.state.goals];
            newGoals[index] = { ...newGoals[index], ...patch };
            return { 
              state: { ...prev.state, goals: newGoals, toast: '목표가 수정되었어요' } 
            };
          });
        },
        removeGoal: (index) => {
          set((prev) => {
            if (prev.state.goals.length <= 1) {
              return { state: { ...prev.state, toast: '최소 1개의 목표는 있어야 해요' } };
            }
            const newGoals = [...prev.state.goals];
            newGoals.splice(index, 1);
            return { 
              state: { ...prev.state, goals: newGoals, toast: '목표가 삭제되었어요' } 
            };
          });
        },
        setPrimaryGoal: (index) => {
          set((prev) => {
            if (index === 0 || !prev.state.goals[index]) return { state: prev.state };
            const newGoals = [...prev.state.goals];
            const [targetGoal] = newGoals.splice(index, 1);
            newGoals.unshift(targetGoal);
            return { 
              state: { ...prev.state, goals: newGoals, toast: '대표 목표로 변경되었어요' } 
            };
          });
        },
        clearToast: () => {
          set((prev) => ({ state: { ...prev.state, toast: '' } }));
        },
        showToast: (message) => {
          set((prev) => ({ state: { ...prev.state, toast: message } }));
        },
        resetData: () => {
          set((prev) => ({
            state: { ...prev.state, transactions: [], toast: '모든 기록을 초기화했어요' }
          }));
        }
      }
    }),
    {
      name: 'feelio-storage', // 기존 STORAGE_KEY 값을 직접 적거나 변수가 있다면 맞춰주세요.
      partialize: (store) => ({
        mode: store.state.mode,
        aurora: store.state.aurora
      }),
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          state: {
            ...currentState.state,
            ...(persistedState || {})
          }
        };
      }
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('feelio-store-sync', (e) => {
    useStore.setState((prev) => ({
      state: { ...prev.state, ...e.detail }
    }));
  });
}

export function useFeelioStore() {
  const store = useStore();
  return { state: store.state, actions: store.actions };
}

export default useStore;
