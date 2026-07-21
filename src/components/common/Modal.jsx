import styled from '@emotion/styled';
import { modalIn } from '../../styles/animations.js';

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 220;
  display: grid;
  place-items: center;
  padding: 20px;
  background: var(--scrim);
  backdrop-filter: blur(8px);
`;

const Panel = styled.div`
  width: ${({ width }) => width || 'min(560px, 100%)'};
  height: ${({ height }) => height || 'auto'};
  max-height: ${({ maxHeight }) => maxHeight || 'min(720px, 92vh)'};
  overflow: ${({ overflow }) => overflow || 'auto'};
  border-radius: 28px;
  background: var(--modal-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow);
  backdrop-filter: blur(28px) saturate(1.25);
  animation: ${modalIn} .24s ease;

  ${({ hideScrollbar }) => hideScrollbar ? `
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  ` : ''}

  @media (max-width: 820px) {
    border-radius: 22px;
    max-height: ${({ maxHeight }) => maxHeight || '88vh'};
  }
`;

export function Modal({ children, onClose, width, height, maxHeight, overflow, hideScrollbar }) {
  return (
    <Scrim onMouseDown={onClose}>
      <Panel
        width={width}
        height={height}
        maxHeight={maxHeight}
        overflow={overflow}
        hideScrollbar={hideScrollbar}
        onMouseDown={event => event.stopPropagation()}
      >
        {children}
      </Panel>
    </Scrim>
  );
}
