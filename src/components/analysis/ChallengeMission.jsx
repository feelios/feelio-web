/** @jsxImportSource @emotion/react */
import { Skeleton } from '../common/Skeleton.jsx';

// AI 맞춤 챌린지(A7-6) 미션 문구.
//
// 미션은 읽고 끝내는 지표가 아니라 해볼 거리라서 잘라내지 않는다.
// 서버 문구가 최대 80자까지 오므로 줄바꿈으로 전부 보여준다(칸 높이가 그만큼 늘어난다).
export function ChallengeMission({ value, loading = false }) {
  if (loading) {
    return <Skeleton w="82%" h={16} radius={6} css={{ marginTop: 4 }} />;
  }

  return (
    <p css={{
      margin: '3px 0 0',
      color: 'var(--text)',
      fontSize: 13,
      fontWeight: 900,
      lineHeight: 1.34,
      wordBreak: 'keep-all',
      overflowWrap: 'anywhere'
    }}>
      {value}
    </p>
  );
}

// 챌린지 칸의 왼쪽 표시. 다른 칸은 막대, 소비 위험도는 신호등이라 여기는 깃발을 둔다.
export function ChallengeFlag() {
  return (
    <span aria-hidden="true" css={{ display: 'grid', placeItems: 'center', width: 19, color: 'var(--sub)', opacity: .78 }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 21V4" />
        <path d="M5 4h11l-2.4 3.6L16 11H5" />
      </svg>
    </span>
  );
}
