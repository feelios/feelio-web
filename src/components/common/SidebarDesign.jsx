import styled from '@emotion/styled';
import { routes } from '../../app/routes.js';
import { EmotionBlob } from './EmotionBlob.jsx';
import { MenuIcon } from './MenuIcon.jsx';

const Aside = styled.aside`
  position: fixed;
  left: 14px;
  top: 14px;
  bottom: 14px;
  z-index: 30;
  width: 224px;
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  border-radius: 28px;
  background: var(--card-strong);
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow);
  backdrop-filter: blur(30px) saturate(1.3);
  -webkit-backdrop-filter: blur(30px) saturate(1.3);

  @media (max-width: 820px) {
    display: none;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 6px 4px;

  strong {
    display: block;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0;
  }

  span {
    display: block;
    margin-top: -2px;
    color: var(--sub);
    font-size: 10.5px;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 20px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  border-radius: 15px;
  border: 1px solid ${({ active }) => active ? 'var(--card-border)' : 'transparent'};
  padding: 12px 14px;
  background: ${({ active }) => active ? 'var(--card)' : 'transparent'};
  color: ${({ active }) => active ? 'var(--text)' : 'var(--sub)'};
  font-size: 15.5px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
`;

const Profile = styled.button`
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--card);
  cursor: pointer;
  text-align: left;
  color: var(--text);

  i {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    background: linear-gradient(135deg, #FF8A62, #F2C766);
    color: #fff;
    font-style: normal;
    font-weight: 900;
  }

  strong,
  small {
    display: block;
  }

  small {
    color: var(--sub);
    margin-top: 2px;
    font-size: 11.5px;
  }
`;

export function SidebarDesign({ route, onRoute, user, onProfile }) {
  return (
    <Aside>
      <Brand>
        <EmotionBlob emotion="설렘" size={40} interactive={false} />
        <div><strong>feelio</strong><span>Feel + I/O</span></div>
      </Brand>
      <Nav>
        {routes.map(item => (
          <NavButton key={item.key} type="button" active={route === item.key} onClick={() => onRoute(item.key)}>
            <MenuIcon name={item.key} />
            {item.label}
          </NavButton>
        ))}
      </Nav>
      <Profile type="button" onClick={onProfile}>
        <i>{user.nickname.slice(0, 1)}</i>
        <span><strong>{user.nickname}</strong><small>{user.provider} 계정</small></span>
      </Profile>
    </Aside>
  );
}
