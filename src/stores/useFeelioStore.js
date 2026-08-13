import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth.js';
import { goalsAPI } from '../api/goals.js'; // fix 브랜치 반영
import { usersAPI } from '../api/users.js';
import { BASE_URL } from '../api/client.js';

const initialState = {
  isLoggedIn: false,
  onboardingDone: false,
  mode: 'light',
  aurora: '블루',
  user: { nickname: '서연', provider: 'Google', email: '' },
  goals: [],
  transactions: [],
  toast: '',
  toastNotification: null
};

function normalizeMode(mode) {
  return (mode && mode.toLowerCase() === 'dark') ? 'dark' : 'light';
}

const useStore = create(
  persist(
    (set, get) => ({
      state: initialState,
      actions: {
        login: (provider) => {
          const providerId = provider.toLowerCase();
          window.location.href = `${BASE_URL}/oauth2/authorization/${providerId}`;
        },
        fetchMe: async () => {
          try {
            const user = await authAPI.getMe();
            // fix 브랜치: 탈퇴 복구 대응을 위해 goals 안전하게 조회
            const goals = await goalsAPI.getGoals().catch((goalError) => {
              console.error('Failed to fetch user goals', goalError);
              return null;
            });

            /*
             * 로그인 화면에서 고른 테마가 로그인하는 순간 덮이던 문제.
             *
             * 서버 themeMode 를 무조건 우선했는데, 아직 온보딩 전인 사용자의 그 값은
             * 본인이 고른 게 아니라 DB 기본값(LIGHT)이다. 그래서 로그인 화면에서 다크를
             * 켜고 들어와도 온보딩이 라이트로 떴다 — 방금 누른 선택이 조용히 사라졌다.
             *
             * 온보딩 전이고 로컬 선택이 서버 기본값과 다르면 로컬을 살린다.
             * 서버에도 밀어 두어야 다음 로그인·다른 기기에서도 유지된다.
             * 이미 온보딩을 마친 사용자는 서버 값이 본인의 저장된 설정이므로 그대로 따른다.
             */
            const localMode = normalizeMode(get().state.mode);
            const serverMode = user.themeMode ? normalizeMode(user.themeMode) : null;
            const keepLocalMode = !user.onboardingDone && serverMode !== null && serverMode !== localMode;

            set((prev) => ({
              state: {
                ...prev.state,
                user,
                isLoggedIn: true,
                onboardingDone: user.onboardingDone,
                mode: keepLocalMode ? localMode : (serverMode ?? prev.state.mode),
                aurora: user.auroraTheme || prev.state.aurora,
                goals: Array.isArray(goals) ? goals : prev.state.goals // fix 브랜치 반영
              }
            }));

            if (keepLocalMode) {
              // 화면은 이미 로컬 선택으로 그려졌다. 저장 실패해도 이번 세션을 막지 않는다.
              usersAPI.updateSettings({ themeMode: localMode.toUpperCase() }).catch((settingsError) => {
                console.error('Failed to persist the theme chosen before login', settingsError);
              });
            }
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
        // 거래가 바뀌면 총자산이 달라진다. 총자산은 서버가 계산해 주는 값(feelio-api #200)이라
        // 다시 받아와야 홈 카드가 갱신된다. fetchMe 와 달리 실패해도 로그인 상태는 건드리지 않는다
        // — 거래는 이미 저장됐는데 일시적인 조회 실패로 로그인 화면으로 튕기면 안 된다 (#272).
        refreshUser: async () => {
          try {
            const user = await authAPI.getMe();
            set((prev) => ({
              state: { ...prev.state, user, onboardingDone: user.onboardingDone }
            }));
          } catch (error) {
            console.error('Failed to refresh user after transaction change', error);
          }
        },
        /**
         * 온보딩 화면이 PATCH /users/me/onboarding 성공 직후에만 부른다.
         *
         * 그래서 '완료'는 이 시점에 이미 사실이다. 예전엔 여기서 getMe() 를 다시 불러
         * 그 응답의 onboardingDone 으로 전환을 판단했는데, 재조회가 실패하거나 아직 false 로
         * 오면 화면이 안 넘어갔다. 온보딩 화면의 제출 잠금(submittingRef)은 성공 뒤 풀리지 않으므로
         * 사용자는 '시작하기'를 한 번 더 눌러야 겨우 빠져나올 수 있었다.
         *
         * 재조회는 프로필·테마·목표를 채우는 용도로만 쓰고, 전환 자체는 재조회에 매달리지 않는다.
         */
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
                onboardingDone: true,
                /* 온보딩 내내 화면에 떠 있던 테마를 그대로 이어간다.
                   위 fetchMe 의 저장이 실패했다면 서버는 아직 기본값(LIGHT)이라,
                   여기서 서버 값을 따르면 온보딩을 마치는 순간 라이트로 튕긴다. */
                mode: prev.state.mode,
                aurora: user.auroraTheme || prev.state.aurora,
                goals: Array.isArray(goals) ? goals : prev.state.goals // fix 브랜치 반영
              }
            }));
          } catch (error) {
            console.error('Failed to refresh user after onboarding', error);
            // 갱신에 실패해도 온보딩은 끝났다. 화면만은 넘겨 사용자를 가두지 않는다.
            set((prev) => ({ state: { ...prev.state, onboardingDone: true } }));
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
              // 완료 안내는 확인창과 맞춰 window.alert 로 띄운다(ProfileModalDc) — 토스트와 겹치지 않게 비워 둔다
              toast: ''
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
        clearToastNotification: () => {
          set((prev) => ({ state: { ...prev.state, toastNotification: null } }));
        },
        showToastNotification: (payload) => {
          set((prev) => ({ state: { ...prev.state, toastNotification: payload } }));
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
