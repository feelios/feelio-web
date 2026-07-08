import { Global, css } from '@emotion/react';
import { theme } from './theme.js';

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; }
        body {
          margin: 0;
          font-family: ${theme.font};
          color: var(--text);
          background: var(--bg-2);
          -webkit-font-smoothing: antialiased;
          word-break: keep-all;
        }
        button, input, textarea { font: inherit; }
        button { color: inherit; }
        input, textarea { color: var(--text); }
        input::placeholder, textarea::placeholder { color: var(--sub); opacity: .72; }
        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-thumb {
          background: rgba(120,110,100,.22);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}
    />
  );
}

