import { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '../../styles/theme.js';
import { SidebarDesign } from './SidebarDesign.jsx';
import { BottomNav } from './BottomNav.jsx';
import { AuroraBackground } from './AuroraBackground.jsx';
import { useUpdateSettingsMutation } from '../../hooks/queries/useUsers.js';

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
  /* 다크의 유리는 '어두운 막'이 아니라 --card 처럼 배경 위에 얹는 '흰 막'이다.
     예전 rgba(22,24,34,.58) 은 어두운 막이라 페이지보다 가라앉아 새까맸고,
     불투명한 회보라 판으로 바꿨더니 이번엔 유리질이 죽었다.
     카드(.055)·카드강조(.085)와 같은 계열로 두되, 모달이라 한 단계 진하게 간다. */
  --modal-bg: ${({ mode }) => mode === 'dark' ? 'rgba(255,255,255,.14)' : 'rgba(248,245,240,.46)'};
  --scrim: ${({ mode }) => mode === 'dark' ? 'rgba(5,6,12,.42)' : 'rgba(40,32,24,.22)'};
  --shadow: ${({ mode }) => mode === 'dark' ? theme.darkShadow : theme.shadow};
  --mobile-nav-height: 67px;
  --mobile-nav-offset: 12px;
  /* clearance 는 메뉴바가 깔고 앉는 자리까지만 비웠다. 그래서 홈을 뺀 화면은 마지막 카드가
     메뉴바에 딱 붙었다. 홈이 혼자 갖고 있던 30px 숨통을 토큰으로 올려 모든 화면이 같이 쓴다. */
  --mobile-nav-gap: 30px;
  --mobile-nav-clearance: calc(var(--mobile-nav-height) + var(--mobile-nav-offset) + var(--mobile-nav-gap) + env(safe-area-inset-bottom, 0px));
  position: relative;
  height: 100dvh;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
  background: linear-gradient(160deg, var(--bg-1), var(--bg-2));
`;

const Veil = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: ${({ mode }) => mode === 'dark' ? 'rgba(12,14,22,.3)' : 'rgba(247,244,238,.08)'};
`;

const Main = styled.main`
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 820px) {
    padding: 22px 16px var(--mobile-nav-clearance);
  }
`;

const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;

  ${({ hideScrollbar }) => hideScrollbar ? `
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  ` : ''}

  @media (max-width: 820px) {
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;

const Frame = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1800px;
  height: 100%;
  display: flex;
  gap: 100px;
  padding: 24px;

  @media (max-width: 820px) {
    padding: 0;
    gap: 0;
  }
`;

const Top = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  width: 100%;
  margin: 0 0 10px;

  p {
    margin: 0;
    color: var(--sub);
    font-size: 14.5px;
    font-weight: 600;
  }

  h1 {
    margin: 3px 0 0;
    font-size: 32px;
    letter-spacing: -.02em;
  }

  @media (max-width: 820px) {
    margin: 0 0 6px;

    p { font-size: 12.5px; }
    h1 { font-size: 22px; margin: 2px 0 0; }
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
  overflow: hidden;
  padding: 0;

  @media (max-width: 820px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export function AppLayoutDc({ route, title, state, actions, onRoute, onProfile, children }) {
  const now = new Date();
  const liveDate = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  const [erroredAvatarUrl, setErroredAvatarUrl] = useState(null);
  const updateSettingsMutation = useUpdateSettingsMutation();

  return (
    <Shell mode={state.mode}>
      <AuroraBackground mode={state.mode} aurora={state.aurora} />
      <Veil mode={state.mode} />
      <Frame>
      <SidebarDesign route={route} onRoute={onRoute} user={state.user} onProfile={onProfile} />
      <Main>
        <Top>
          <div>
            <p>{liveDate}</p>
            <h1>{title}</h1>
          </div>
          <TopRight>
            <DarkModeToggle type="button" onClick={async () => {
              const nextMode = state.mode === 'dark' ? 'light' : 'dark';
              actions.syncSettings({ mode: nextMode, aurora: state.aurora });
              try {
                const updated = await updateSettingsMutation.mutateAsync({
                  themeMode: nextMode.toUpperCase(),
                  auroraTheme: state.aurora
                });
                actions.syncSettings({
                  mode: updated?.themeMode || nextMode,
                  aurora: updated?.auroraTheme || state.aurora
                });
              } catch (e) {
                console.error('Failed to update theme settings', e);
              }
            }} aria-label="화면 모드 전환">
              {state.mode === 'dark' ? '☀' : '☾'}
            </DarkModeToggle>
            <MobileProfile
              type="button" onClick={onProfile} aria-label="프로필 열기"
              style={(state.user?.profileImageUrl && erroredAvatarUrl !== state.user.profileImageUrl) ? { background: 'var(--card)' } : undefined}
            >
              {state.user?.profileImageUrl && erroredAvatarUrl !== state.user.profileImageUrl
                ? <img src={state.user.profileImageUrl} alt="프로필" referrerPolicy="no-referrer" onError={() => setErroredAvatarUrl(state.user.profileImageUrl)} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', transform: 'scale(1.12)' }} />
                : (state.user?.nickname?.slice(0, 1) || '나')}
            </MobileProfile>
          </TopRight>
        </Top>
        <Content hideScrollbar={route === 'transactions' || route === 'analysis'}>{children}</Content>
      </Main>
      </Frame>
      <BottomNav route={route} onRoute={onRoute} />
    </Shell>
  );
}
