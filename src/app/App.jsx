/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import MonthlyAnalysisSwitcher from '../components/analysis/MonthlyAnalysisSwitcher.jsx';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { GlobalStyles } from '../styles/globalStyles.jsx';
import { theme } from '../styles/theme.js';
import { driftA, driftB } from '../styles/animations.js';
import { useFeelioStore } from '../stores/useFeelioStore.js';
import { AppLayoutDc } from '../components/common/AppLayoutDc.jsx';
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
import { getAurora } from '../data/aurorasDc.js';

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
  --modal-bg: ${({ mode }) => mode === 'dark' ? 'rgba(22,24,34,.58)' : 'rgba(248,245,240,.58)'};
  --scrim: ${({ mode }) => mode === 'dark' ? 'rgba(5,6,12,.42)' : 'rgba(40,32,24,.22)'};
  --shadow: ${({ mode }) => mode === 'dark' ? theme.darkShadow : theme.shadow};
  position: relative;
  min-height: 100dvh;
  color: var(--text);
  background: linear-gradient(160deg, var(--bg-1), var(--bg-2));
  overflow-x: hidden;
`;

/**
 * 오로라 배경 orb. 크기·위치는 각 orb 컴포넌트가 CSS 로 들고 있다.
 *
 * 예전에는 인라인 style 로 넘겼는데, 인라인이 CSS 보다 우선해서 아래 미디어 쿼리의
 * transform·filter·opacity 만 먹고 width·left 는 데스크톱 값이 그대로 남았다.
 * 520·600·420px 원 세 개가 375px 화면에 그대로 들어가 한 덩어리로 뭉쳤고,
 * 그 위에 로그인 히어로 문구가 겹쳐 강조색 첫 줄이 읽히지 않았다 (#300).
 */
const Orb = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 0;
  border-radius: 50%;
  filter: blur(80px);
  opacity: ${({ mode }) => mode === 'dark' ? .46 : .62};
  mix-blend-mode: ${({ mode }) => mode === 'dark' ? 'screen' : 'multiply'};

  @media (max-width: 900px) {
    filter: blur(46px);
    opacity: ${({ mode }) => mode === 'dark' ? .34 : .40};
  }
`;

/*
 * 모바일에서는 셋을 화면 가장자리로 벌린다. 가운데는 말랑이와 히어로 문구 자리라
 * 비워둬야 한다. 각각 한쪽 모서리 밖으로 절반쯤 걸쳐 색만 번지게 한다.
 */
const OrbA = styled(Orb)`
  width: 520px;
  height: 520px;
  left: 10%;
  top: 8%;
  animation: ${driftA} 14s ease-in-out infinite;

  @media (max-width: 900px) {
    width: 260px;
    height: 260px;
    left: -22%;
    top: 4%;
  }
`;

const OrbB = styled(Orb)`
  width: 600px;
  height: 600px;
  right: -8%;
  top: 22%;
  animation: ${driftB} 16s ease-in-out infinite;

  @media (max-width: 900px) {
    width: 280px;
    height: 280px;
    right: -26%;
    top: 26%;
  }
`;

const OrbC = styled(Orb)`
  width: 420px;
  height: 420px;
  left: 34%;
  bottom: -16%;

  @media (max-width: 900px) {
    width: 240px;
    height: 240px;
    /* 시트가 화면 아래를 덮으므로 더 내려 보내야 문구 뒤로 올라오지 않는다. */
    left: 8%;
    bottom: -14%;
  }
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




  const colors = getAurora(state.aurora).colors;

  const content = {
    home: <HomePageDesign state={state} onRoute={setRoute} selectedDate={globalDate} onSelectDate={setGlobalDate} onSaveToGoal={openRecordForGoal} onOpenGoals={openGoals} />,
    record: <RecordPageDc state={state} actions={actions} prefill={recordPrefill} onConsumePrefill={() => setRecordPrefill(null)} onSaved={(date) => {
      setGlobalDate(new Date(date));
    }} />,
    transactions: <TransactionsPageDesign state={state} onSelect={setSelectedTxn} globalDate={globalDate} setGlobalDate={setGlobalDate} />,
    analysis: <AnalysisPageDc state={state} globalDate={globalDate} setGlobalDate={setGlobalDate} />,
    universe: <UniversePageDc state={state} />
  }[route];

  return (
    <Root mode={state.mode} id="app-root">
      <GlobalStyles />
      {(!state.isLoggedIn || !state.onboardingDone) && (
        <>
          {/* 색만 인라인으로 넘긴다. 테마마다 달라지는 값이라 CSS 로 고정할 수 없다. */}
          <OrbA mode={state.mode} style={{ background: colors[0] }} />
          <OrbB mode={state.mode} style={{ background: colors[2] }} />
          <OrbC mode={state.mode} style={{ background: colors[1] }} />
        </>
      )}
      {!state.isLoggedIn && (
        <LoginPage mode={state.mode} onToggleMode={actions.toggleMode} onLogin={actions.login} />
      )}
      {state.isLoggedIn && !state.onboardingDone && (
        <OnboardingPage onComplete={actions.completeOnboarding} />
      )}
      {state.isLoggedIn && state.onboardingDone && <BudgetSync />}
      {state.isLoggedIn && state.onboardingDone && (
        <AppLayoutDc
          route={route}
          title={
            route === 'analysis' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>AI 분석</span>
                <MonthlyAnalysisSwitcher 
                  year={globalDate.getFullYear()} 
                  month={globalDate.getMonth()} 
                  onChangeMonth={(y, m) => setGlobalDate(new Date(y, m, 1))} 
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
