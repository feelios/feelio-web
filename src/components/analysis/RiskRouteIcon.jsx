/** @jsxImportSource @emotion/react */

// 위험 루트 칸의 왼쪽 표시.
// 세로 막대만 있어서 "무엇에 대한 값인지"가 라벨을 읽어야만 드러났다.
// 과소비가 몰린 경로를 경고하는 칸이므로 경고 삼각형으로 바꾼다 (#280).
export function RiskRouteIcon({ expanded = false, color }) {
  return (
    <span
      aria-hidden="true"
      css={{
        display: 'grid',
        placeItems: 'center',
        width: 19,
        color: color || 'var(--sub)',
        opacity: .82,
        marginTop: expanded ? 2 : 0,
        '@media (min-width: 821px)': { marginTop: 0 }
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4.5 2.8 20h18.4L12 4.5Z" />
        <path d="M12 10v4.2" />
        <path d="M12 17.3h.01" />
      </svg>
    </span>
  );
}
