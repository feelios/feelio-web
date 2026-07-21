/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';

const ToggleButton = styled.button`
  width: 130px;
  height: 46px;
  background: var(--line);
  border: 0;
  border-radius: 14px;
  padding: 4px;
  position: relative;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.4 : 1};
  transition: background 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
  display: flex;
  align-items: center;

  &.active {
    background: ${props => props.accent || 'var(--card-strong)'};
  }
`;

const IconWrap = styled.span`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: ${props => props.accent || 'var(--card-strong)'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 4px;
  left: 4px;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;

  .active & {
    left: calc(100% - 42px);
    background: var(--card);
  }

  svg {
    width: 18px;
    height: 18px;
    stroke: ${props => props.accent ? '#fff' : 'var(--text)'};
    transition: stroke 0.3s ease;
  }

  .active & svg {
    stroke: ${props => props.accent ? props.accent : 'var(--text)'};
  }
`;

const Label = styled.span`
  position: absolute;
  top: 50%;
  left: 50px;
  transform: translateY(-50%);
  color: var(--sub);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s ease;

  .active & {
    left: 14px;
    color: ${props => props.accent ? '#fff' : 'var(--text)'};
    font-weight: 800;
  }
`;

export default function DutchPayToggleDc({ active, onClick, accent, disabled }) {
  return (
    <ToggleButton 
      type="button" 
      className={active ? 'active' : ''} 
      onClick={disabled ? undefined : onClick}
      accent={accent}
      disabled={disabled}
    >
      <IconWrap accent={accent}>
        {active ? (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2"></path>
            <path d="M14 8h-4"></path>
            <path d="M14 12h-4"></path>
          </svg>
        )}
      </IconWrap>
      <Label>{active ? '정산 대기' : '개인 지출'}</Label>
    </ToggleButton>
  );
}
