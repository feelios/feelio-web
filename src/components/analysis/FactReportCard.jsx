/** @jsxImportSource @emotion/react */
import { Skeleton } from '../common/Skeleton.jsx';

// 팩트 리포트(A7-5). 레일 네 칸의 높이를 맞추기 위해 한 줄로만 둔다.
// 서버 문구가 최대 80자라 잘리는 만큼은 title 로 남긴다.
const POINT = '#E87573';

export function FactReportCard({ value, loading = false }) {
  if (loading) {
    return <Skeleton w="82%" h={17} radius={6} css={{ marginTop: 4 }} />;
  }

  return (
    <p
      title={value}
      css={{
        margin: '3px 0 0',
        color: POINT,
        fontSize: 14,
        fontWeight: 950,
        lineHeight: 1.25,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {value}
    </p>
  );
}
