/** @jsxImportSource @emotion/react */

// AI 맞춤 챌린지 칸의 왼쪽 표시.
// 다른 칸은 세로 막대, 소비 위험도는 신호등이라 이 칸만 구분이 없었다. 깃발로 표시한다.
export function ChallengeFlag({ expanded = false }) {
  return (
    <span
      aria-hidden="true"
      css={{
        display: 'grid',
        placeItems: 'center',
        width: 19,
        color: 'var(--sub)',
        opacity: .78,
        marginTop: expanded ? 2 : 0,
        '@media (min-width: 821px)': { marginTop: 0 }
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 21V4" />
        <path d="M5 4h11l-2.4 3.6L16 11H5" />
      </svg>
    </span>
  );
}
