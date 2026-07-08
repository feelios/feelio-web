/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { GlobalStyles } from '../styles/globalStyles.jsx';
import { theme } from '../styles/theme.js';
import { driftA, driftB } from '../styles/animations.js';
import { useFeelioStore } from '../stores/useFeelioStore.js';
import { AppLayoutDc } from '../components/common/AppLayoutDc.jsx';
import { Toast } from '../components/common/Toast.jsx';
import ProfileModalDc from '../components/profile/ProfileModalDc.jsx';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import OnboardingPage from '../pages/OnboardingPage.jsx';
import HomePageDesign from '../pages/HomePageDesign.jsx';
import RecordPageDc from '../pages/RecordPageDc.jsx';
import TransactionsPageDesign from '../pages/TransactionsPageDesign.jsx';
import AnalysisPageDc from '../pages/AnalysisPageDc.jsx';
import UniversePageDc from '../pages/UniversePageDc.jsx';
import AuthCallbackPage from '../pages/AuthCallbackPage.jsx';
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

const Orb = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 0;
  border-radius: 50%;
  filter: blur(80px);
  opacity: ${({ mode }) => mode === 'dark' ? .46 : .62};
  mix-blend-mode: ${({ mode }) => mode === 'dark' ? 'screen' : 'multiply'};
`;

const titles = {
  home: '홈',
  record: '지출·수입 기록',
  transactions: '거래내역',
  analysis: 'AI 분석',
  universe: '평행우주'
};

export default function App() {
  const { state, actions } = useFeelioStore();
  const [route, setRoute] = useState('home');

  // 콜백 라우트 처리 (가장 먼저 가로채기)
  const isCallback = window.location.pathname.startsWith('/auth/callback');
  if (isCallback) {
    return <AuthCallbackPage />;
  }

  const [homeDate, setHomeDate] = useState(() => new Date(2026, 6, 1));
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const colors = getAurora(state.aurora).colors;

  const content = {
    home: <HomePageDesign state={state} onRoute={setRoute} selectedDate={homeDate} onSelectDate={setHomeDate} />,
    record: <RecordPageDc state={state} actions={actions} onSaved={(date) => {
      setHomeDate(new Date(date));
    }} />,
    transactions: <TransactionsPageDesign state={state} onSelect={setSelectedTxn} />,
    analysis: <AnalysisPageDc state={state} />,
    universe: <UniversePageDc state={state} />
  }[route];

  return (
    <Root mode={state.mode}>
      <GlobalStyles />
      {(!state.isLoggedIn || !state.onboardingDone) && (
        <>
          <Orb mode={state.mode} style={{ width: 520, height: 520, left: '10%', top: '8%', background: colors[0], animation: `${driftA} 14s ease-in-out infinite` }} />
          <Orb mode={state.mode} style={{ width: 600, height: 600, right: '-8%', top: '22%', background: colors[2], animation: `${driftB} 16s ease-in-out infinite` }} />
          <Orb mode={state.mode} style={{ width: 420, height: 420, left: '34%', bottom: '-16%', background: colors[1] }} />
        </>
      )}
      {!state.isLoggedIn && (
        <LoginPage mode={state.mode} onToggleMode={actions.toggleMode} onLogin={actions.login} />
      )}
      {state.isLoggedIn && !state.onboardingDone && (
        <OnboardingPage onComplete={actions.completeOnboarding} />
      )}
      {state.isLoggedIn && state.onboardingDone && (
        <AppLayoutDc
          route={route}
          title={titles[route]}
          state={state}
          actions={actions}
          onRoute={setRoute}
          onProfile={() => setProfileOpen(true)}
        >
          {content}
        </AppLayoutDc>
      )}
      {profileOpen && <ProfileModalDc state={state} actions={actions} onClose={() => setProfileOpen(false)} />}
      {selectedTxn && <TransactionDetailModal transaction={selectedTxn} actions={actions} onClose={() => setSelectedTxn(null)} />}
      <Toast message={state.toast} onDone={actions.clearToast} />
    </Root>
  );
}
