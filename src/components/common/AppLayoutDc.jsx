import styled from '@emotion/styled';
import { theme } from '../../styles/theme.js';
import { driftA, driftB } from '../../styles/animations.js';
import { SidebarDesign } from './SidebarDesign.jsx';
import { BottomNav } from './BottomNav.jsx';
import { getAurora } from '../../data/aurorasDc.js';

const Shell = styled.div`
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
  min-height: 100vh;
  overflow-x: hidden;
  background: linear-gradient(160deg, var(--bg-1), var(--bg-2));
`;

const Orb = styled.div`
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  opacity: ${({ mode }) => mode === 'dark' ? .5 : .42};
`;

const Veil = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: ${({ mode }) => mode === 'dark' ? 'rgba(12,14,22,.3)' : 'rgba(247,244,238,.08)'};
`;

const Main = styled.main`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  padding: clamp(22px, 2.4vw, 32px) clamp(24px, 3vw, 54px) 42px 268px;

  @media (max-width: 820px) {
    padding: 22px 16px calc(96px + env(safe-area-inset-bottom));
  }
`;

const Top = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: min(100%, 1420px);
  margin: 0 auto 10px;

  p {
    margin: 0;
    color: var(--sub);
    font-size: 13px;
    font-weight: 600;
  }

  h1 {
    margin: 2px 0 0;
    font-size: 24px;
    letter-spacing: -.02em;
  }
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--card-border);
  background: var(--card);
  cursor: pointer;
  backdrop-filter: blur(20px);
`;

const DarkModeToggle = styled(IconButton)`
  @media (max-width: 820px) {
    display: none;
  }
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MobileProfile = styled(IconButton)`
  display: none;
  background: linear-gradient(135deg, #FF8A62, #F2C766);
  color: #fff;
  font-weight: 900;
  font-size: 16px;
  border: 0;
  
  @media (max-width: 820px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export function AppLayoutDc({ route, title, state, actions, onRoute, onProfile, children }) {
  const colors = getAurora(state.aurora).colors;
  const now = new Date();
  const liveDate = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <Shell mode={state.mode}>
      <Orb mode={state.mode} style={{ width: 640, height: 640, left: -100, top: -180, background: colors[0], filter: 'blur(110px)', animation: `${driftA} 28s ease-in-out infinite` }} />
      <Orb mode={state.mode} style={{ width: 560, height: 560, right: -140, top: '16%', background: colors[1], filter: 'blur(115px)', animation: `${driftB} 32s ease-in-out infinite` }} />
      <Orb mode={state.mode} style={{ width: 640, height: 640, left: '32%', bottom: -200, background: colors[2], filter: 'blur(120px)', animation: `${driftA} 36s ease-in-out infinite reverse` }} />
      <Veil mode={state.mode} />
      <SidebarDesign route={route} onRoute={onRoute} user={state.user} onProfile={onProfile} />
      <Main>
        <Top>
          <div>
            <p>{liveDate}</p>
            <h1>{title}</h1>
          </div>
          <TopRight>
            <DarkModeToggle type="button" onClick={actions.toggleMode} aria-label="화면 모드 전환">
              {state.mode === 'dark' ? '☀' : '☾'}
            </DarkModeToggle>
            <MobileProfile type="button" onClick={onProfile} aria-label="프로필 열기">
              {state.user?.nickname?.slice(0, 1) || '나'}
            </MobileProfile>
          </TopRight>
        </Top>
        {children}
      </Main>
      <BottomNav route={route} onRoute={onRoute} />
    </Shell>
  );
}
