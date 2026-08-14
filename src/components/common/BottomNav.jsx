import styled from '@emotion/styled';
import { routes } from '../../app/routes.js';
import { MenuIcon } from './MenuIcon.jsx';

const Bar = styled.nav`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(var(--mobile-nav-offset) + env(safe-area-inset-bottom, 0px));
  z-index: 40;
  display: none;
  height: var(--mobile-nav-height);
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

/**
 * 선택된 칸을 웹 사이드바와 같은 '유리' 결로 맞춘다.
 *
 * 예전에는 배경색(--card-strong)만 바꿔서, 이미 같은 색인 바 위에 옅은 사각형 하나가
 * 얹힌 것처럼 보였다. 유리로 읽히게 하는 건 색이 아니라 가장자리다 — 웹 사이드바도
 * 테두리(--card-border)로 면을 세운다. 여기에 윗변 하이라이트와 아래 그림자를 더해
 * 판이 바에서 살짝 떠 보이게 하고, 반지름을 키워 각진 느낌을 덜어낸다.
 *
 * 테두리는 비활성일 때도 투명으로 깔아 둔다. 활성일 때만 넣으면 그 순간 1px 씩 밀린다.
 */
const Button = styled.button`
  display: grid;
  justify-items: center;
  gap: 3px;
  border: 1px solid ${({ active }) => active ? 'var(--card-border)' : 'transparent'};
  border-radius: 18px;
  padding: 7px 4px;
  background: ${({ active }) => active ? 'var(--card-strong)' : 'transparent'};
  color: ${({ active }) => active ? 'var(--text)' : 'var(--sub)'};
  box-shadow: ${({ active }) => active
    ? 'inset 0 1px 0 color-mix(in srgb, var(--on-ink) 30%, transparent), 0 6px 14px -9px rgba(0,0,0,.55)'
    : 'none'};
  backdrop-filter: ${({ active }) => active ? 'blur(18px) saturate(1.4)' : 'none'};
  -webkit-backdrop-filter: ${({ active }) => active ? 'blur(18px) saturate(1.4)' : 'none'};
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease, box-shadow .18s ease;

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
          <MenuIcon name={item.key} size={20} />{item.label}
        </Button>
      ))}
    </Bar>
  );
}

