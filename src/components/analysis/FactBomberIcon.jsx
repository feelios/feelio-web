/** @jsxImportSource @emotion/react */

// 팩트 리포트 칸의 왼쪽 표시.
// 이 칸의 페르소나가 'MZ 팩트 폭격기'라 폭탄으로 표시한다 (#280).
// 다른 칸(위험 루트 경고, 챌린지 깃발, 위험도 신호등)과 함께 아이콘만 보고 구분되게 한다.
export function FactBomberIcon({ color }) {
  return (
    <span
      aria-hidden="true"
      css={{
        display: 'grid',
        placeItems: 'center',
        width: 19,
        color: color || '#E87573',
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10.5" cy="14.5" r="6.5" />
        <path d="M15.2 9.8 17.4 7.6" />
        <path d="M17.4 7.6h2.2" />
        <path d="M17.4 7.6V5.4" />
        <path d="M19.8 4.2 21 3" />
      </svg>
    </span>
  );
}
