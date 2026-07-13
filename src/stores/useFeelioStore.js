import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth.js';

const STORAGE_KEY = 'feelio-dc-react-state-v4-temp-seed';

const initialState = {
  isLoggedIn: false,
  onboardingDone: false,
  mode: 'light',
  aurora: '블루',
  user: { nickname: '서연', provider: 'Google', email: '' },
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
        fetchMe: async () => {
          try {
            const user = await authAPI.getMe();
            set((prev) => ({
              state: {
                ...prev.state,
                user,
                isLoggedIn: true,
                onboardingDone: user.onboardingDone,
                mode: user.themeMode ? user.themeMode.toLowerCase() : prev.state.mode,
                aurora: user.auroraTheme || prev.state.aurora
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
            set((prev) => ({
              state: {
                ...prev.state,
                user,
                isLoggedIn: true,
                onboardingDone: user.onboardingDone,
                mode: user.themeMode ? user.themeMode.toLowerCase() : prev.state.mode,
                aurora: user.auroraTheme || prev.state.aurora
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
        clearToast: () => {
          set((prev) => ({ state: { ...prev.state, toast: '' } }));
        },
        showToast: (message) => {
          set((prev) => ({ state: { ...prev.state, toast: message } }));
        }
      }
    }),
    {
      name: STORAGE_KEY,
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
