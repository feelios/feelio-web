/** @jsxImportSource @emotion/react */
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { GlassCard } from './GlassCard.jsx';

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

// 재사용 shimmer 프리미티브. w/h는 문자열(예: '40px','60%','clamp(...)') 또는 숫자(px)로 받는다.
// styled 원본은 파일 내부에만 두고(SkeletonBox), export는 컴포넌트만 한다(react-refresh 규칙).
const SkeletonBox = styled.div`
  width: ${({ w = '100%' }) => (typeof w === 'number' ? `${w}px` : w)};
  height: ${({ h = 14 }) => (typeof h === 'number' ? `${h}px` : h)};
  border-radius: ${({ radius = 8 }) => radius}px;
  background: linear-gradient(90deg, var(--line) 25%, rgba(255, 255, 255, 0.14) 37%, var(--line) 63%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
  flex-shrink: 0;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export function Skeleton(props) {
  return <SkeletonBox {...props} />;
}

// 거래 목록 로딩 스켈레톤 — 실제 그룹/Row 구조를 근사.
export function TransactionListSkeleton({ groups = 2, rowsPerGroup = 3 }) {
  return (
    <div css={{ display: 'grid', gap: 20 }} aria-hidden="true">
      {Array.from({ length: groups }).map((_, g) => (
        <div key={g}>
          <div css={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
            <Skeleton w="72px" h={16} radius={6} />
            <Skeleton w="88px" h={16} radius={6} />
          </div>
          <GlassCard padding={0}>
            {Array.from({ length: rowsPerGroup }).map((_, i) => (
              <div
                key={i}
                css={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line)'
                }}
              >
                <Skeleton w="40px" h={40} radius={12} />
                <div css={{ display: 'grid', gap: 7, minWidth: 0 }}>
                  <Skeleton w="42%" h={13} radius={6} />
                  <Skeleton w="66%" h={11} radius={6} />
                </div>
                <Skeleton w="64px" h={14} radius={6} />
              </div>
            ))}
          </GlassCard>
        </div>
      ))}
    </div>
  );
}

// 홈(메인) 좌측 감정 요약 로딩 스켈레톤 — 감정 말랑이 + 감정 능선 영역을 근사.
export function HomeSummarySkeleton() {
  return (
    <div css={{ display: 'grid', gap: 20 }} aria-hidden="true">
      <div css={{ display: 'grid', placeItems: 'center', gap: 12, padding: '24px 0' }}>
        <Skeleton w="clamp(230px, 20vw, 290px)" h="clamp(230px, 20vw, 290px)" radius={999} css={{ maxWidth: '100%' }} />
        <Skeleton w="150px" h={12} radius={6} />
        <Skeleton w="190px" h={22} radius={8} />
      </div>
      <GlassCard>
        <div css={{ display: 'grid', gap: 14, padding: 4 }}>
          <Skeleton w="46%" h={15} radius={6} />
          <Skeleton w="100%" h={120} radius={12} />
          <Skeleton w="70%" h={12} radius={6} />
        </div>
      </GlassCard>
    </div>
  );
}
