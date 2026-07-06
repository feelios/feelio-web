import styled from '@emotion/styled';
import { routes } from '../../app/routes.js';

const Bar = styled.nav`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 40;
  display: none;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  padding: 8px;
  border-radius: 22px;
  background: var(--card-strong);
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow);
  backdrop-filter: blur(28px);

  @media (max-width: 820px) {
    display: grid;
  }
`;

const Button = styled.button`
  display: grid;
  justify-items: center;
  gap: 3px;
  border: 0;
  border-radius: 16px;
  padding: 7px 4px;
  background: ${({ active }) => active ? 'var(--card-strong)' : 'transparent'};
  color: ${({ active }) => active ? 'var(--text)' : 'var(--sub)'};
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;

  span {
    font-size: 16px;
    line-height: 1;
  }
`;

export function BottomNav({ route, onRoute }) {
  return (
    <Bar>
      {routes.map(item => (
        <Button key={item.key} active={route === item.key} type="button" onClick={() => onRoute(item.key)}>
          <span>{item.icon}</span>{item.label}
        </Button>
      ))}
    </Bar>
  );
}

