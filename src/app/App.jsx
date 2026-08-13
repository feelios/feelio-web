/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import MonthlyAnalysisSwitcher from '../components/analysis/MonthlyAnalysisSwitcher.jsx';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { GlobalStyles } from '../styles/globalStyles.jsx';
import { theme } from '../styles/theme.js';
import { useFeelioStore } from '../stores/useFeelioStore.js';
import { AppLayoutDc } from '../components/common/AppLayoutDc.jsx';
import { AuroraBackground } from '../components/common/AuroraBackground.jsx';
import { BudgetSync } from '../components/common/BudgetSync.jsx';
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx';
import { Toast, NotificationToast } from '../components/common/Toast.jsx';
import ProfileModalDc from '../components/profile/ProfileModalDc.jsx';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import HomePageDesign from '../pages/HomePageDesign.jsx';
import RecordPageDc from '../pages/RecordPageDc.jsx';
import TransactionsPageDesign from '../pages/TransactionsPageDesign.jsx';
import AnalysisPageDc from '../pages/AnalysisPageDc.jsx';
import UniversePageDc from '../pages/UniversePageDc.jsx';
import { monthAnchorDate } from '../utils/date.js';

const Root = styled.div`
  --bg-1: ${({ mode }) => mode === 'dark' ? '#12141e' : '#f6f2eb'};
  --bg-2: ${({ mode }) => mode === 'dark' ? '#0b0d15' : '#ede6dc'};
  --card: ${({ mode }) => mode === 'dark' ? 'rgba(255,255,255,.055)' : 'rgba(255,255,255,.34)'};
  --card-strong: ${({ mode }) => mode === 'dark' ? 'rgba(255,255,255,.085)' : 'rgba(255,255,255,.52)'};
  --card-border: ${({ mode }) => mode === 'dark' ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.58)'};
  --text: ${({ mode }) => mode === 'dark' ? '#ECEBF0' : '#3a352f'};
  --sub: ${({ mode }) => mode === 'dark' ? '#9a97a8' : '#8a837a'};
  --ink: ${({ mode }) => mode === 'dark' ? '#ECEBF0' : '#2b2723'};
  --on-ink: ${({ mode }) => mode === 'dark' ? '#141220' : '#fbf9f6'};
  --line: ${({ mode }) => mode === 'dark' ? 'rgba(255,255,255,.10)' : 'rgba(50,42,32,.10)'};
  /* AppLayoutDc 의 Shell 과 같은 값을 유지한다(두 곳에 중복 정의돼 있다). */
  --modal-bg: ${({ mode }) => mode === 'dark' ? 'rgba(255,255,255,.14)' : 'rgba(248,245,240,.46)'};
  --scrim: ${({ mode }) => mode === 'dark' ? 'rgba(5,6,12,.42)' : 'rgba(40,32,24,.22)'};
  --shadow: ${({ mode }) => mode === 'dark' ? theme.darkShadow : theme.shadow};
  position: relative;
  min-height: 100dvh;
  color: var(--text);
  background: linear-gradient(160deg, var(--bg-1), var(--bg-2));
  overflow-x: hidden;
`;

const titles = {
  home: '홈',
  record: '지출·수입 기록',
  transactions: '거래내역',
  universe: '평행우주'
};

export default function App() {
  const { state, actions } = useFeelioStore();
  const [route, setRoute] = useState('home');

  /*
   * 온보딩 미리보기 스위치 (개발 서버 전용).
   *
   * 온보딩은 가입 직후 한 번만 보이는 화면이라, 이미 완료한 계정으로는 다시 볼 수가 없다.
   * localStorage 를 고쳐도 앱이 뜨면서 getMe() 가 서버 값으로 덮어버린다.
   * 그래서 화면을 손볼 때마다 계정을 새로 만들어야 했다.
   *
   * ?onboarding 을 붙이면 완료 여부와 무관하게 온보딩을 띄운다.
   * import.meta.env.DEV 로 막아 두어 프로덕션 번들에서는 조건이 상수 false 가 되고 제거된다.
   */
  const previewOnboarding = import.meta.env.DEV
    && typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('onboarding');
  const showOnboarding = state.isLoggedIn && (!state.onboardingDone || previewOnboarding);
  const showApp = state.isLoggedIn && state.onboardingDone && !previewOnboarding;
  const [isInitializing, setIsInitializing] = useState(true);

  const [globalDate, setGlobalDate] = useState(() => new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  // 프로필 모달을 어느 화면으로 열지 (홈 목표 카드에서 목표 관리로 바로 들어오는 경로용)
  const [profileView, setProfileView] = useState('profile');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [recordPrefill, setRecordPrefill] = useState(null);

  // 목표 카드 '저금하기' → 저축·해당 목표 프리필된 기록 화면으로 (F7-9)
  // 다 모은 목표 카드 '목표 관리로 가기' → 프로필 모달의 목표 관리 화면으로
  const openGoals = () => {
    setProfileView('goals');
    setProfileOpen(true);
  };

  const openRecordForGoal = (goalId) => {
    setRecordPrefill({ goalId });
    setRoute('record');
  };

  useEffect(() => {
    const init = async () => {
      await actions.fetchMe();
      setIsInitializing(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 유저가 로그인 상태일 때 FCM 토큰을 발급받아 DB에 저장
  useEffect(() => {
    if (state.isLoggedIn) {
      import('../utils/firebase.js').then(({ requestForToken }) => {
        requestForToken().then(token => {
          if (token) {
            import('../api/users.js').then(({ usersAPI }) => {
              usersAPI.updateFcmToken(token)
                .then(() => console.log('✅ [App] FCM Token successfully saved to DB'))
                .catch(e => console.error('❌ [App] Failed to save FCM Token to DB', e));
            });
          }
        });
      });
    }
  }, [state.isLoggedIn]);

  // 로그아웃·세션 만료로 인증이 풀리면 열려 있던 모달·팝업과 라우트를 되돌린다 (F15-8).
  // 로그아웃 버튼이 프로필 모달 안에 있어 이걸 안 지우면 다시 로그인했을 때 그 모달이 다시 뜬다.
  // effect가 아니라 렌더 중에 맞춰야 로그인 화면이 한 프레임도 옛 상태로 그려지지 않는다.
  const [wasLoggedIn, setWasLoggedIn] = useState(state.isLoggedIn);
  if (wasLoggedIn !== state.isLoggedIn) {
    setWasLoggedIn(state.isLoggedIn);
    if (!state.isLoggedIn) {
      setProfileOpen(false);
      setSelectedTxn(null);
      setRecordPrefill(null);
      setRoute('home');
    }
  }

  if (isInitializing) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }


  const content = {
    home: <HomePageDesign state={state} onRoute={setRoute} selectedDate={globalDate} onSelectDate={setGlobalDate} onSaveToGoal={openRecordForGoal} onOpenGoals={openGoals} />,
    record: <RecordPageDc state={state} actions={actions} prefill={recordPrefill} selectedDate={globalDate} onConsumePrefill={() => setRecordPrefill(null)} onSaved={(date) => {
      setGlobalDate(new Date(date));
    }} />,
    transactions: <TransactionsPageDesign state={state} onSelect={setSelectedTxn} globalDate={globalDate} setGlobalDate={setGlobalDate} />,
    analysis: <AnalysisPageDc state={state} globalDate={globalDate} setGlobalDate={setGlobalDate} />,
    universe: <UniversePageDc state={state} />
  }[route];

  return (
    <Root mode={state.mode} id="app-root">
      <GlobalStyles />
      {(!state.isLoggedIn || showOnboarding) && (
        <AuroraBackground mode={state.mode} aurora={state.aurora} />
      )}
      {!state.isLoggedIn && (
        <LoginPage mode={state.mode} onToggleMode={actions.toggleMode} onLogin={actions.login} />
      )}
      {showOnboarding && (
        <OnboardingPage onComplete={actions.completeOnboarding} />
      )}
      {showApp && <BudgetSync />}
      {showApp && (
        <AppLayoutDc
          route={route}
          title={
            route === 'analysis' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>AI 분석</span>
                <MonthlyAnalysisSwitcher 
                  year={globalDate.getFullYear()} 
                  month={globalDate.getMonth()} 
                  onChangeMonth={(y, m) => setGlobalDate(monthAnchorDate(y, m))} 
                />
              </div>
            ) : titles[route]
          }
          state={state}
          actions={actions}
          onRoute={setRoute}
          onProfile={() => setProfileOpen(true)}
        >
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary onReset={reset} resetKey={route}>
                {content}
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </AppLayoutDc>
      )}
      {state.isLoggedIn && profileOpen && (
        <ProfileModalDc
          state={state}
          actions={actions}
          initialView={profileView}
          onClose={() => { setProfileOpen(false); setProfileView('profile'); }}
        />
      )}
      {state.isLoggedIn && selectedTxn && <TransactionDetailModal transaction={selectedTxn} actions={actions} onClose={() => setSelectedTxn(null)} />}
      <Toast message={state.toast} onDone={actions.clearToast} />
      <NotificationToast 
        notification={state.toastNotification} 
        onClose={actions.clearToastNotification} 
        onClick={(noti) => {
          if (noti.url) {
            try {
              const url = new URL(noti.url, window.location.origin);
              // Push query params to history so RecordPage can read them
              window.history.pushState({}, '', url.pathname + url.search);
              if (url.pathname.includes('record')) {
                setRoute('record');
              } else {
                setRoute(url.pathname.replace('/', '') || 'home');
              }
            } catch (e) {
              console.error('Invalid URL in notification', e);
            }
          }
        }} 
      />
    </Root>
  );
}
