/** @jsxImportSource @emotion/react */
import { Component } from 'react';
import { GlassCard } from './GlassCard.jsx';

// 라우트 단위 에러 Fallback — 재시도 버튼 포함. 렌더 에러 및 승격된 서버 오류(5xx)를 잡는다.
function ErrorFallback({ onRetry }) {
  return (
    <div css={{ width: 'min(100%, 520px)', margin: '48px auto', padding: '0 16px' }}>
      <GlassCard css={{ display: 'grid', gap: 14, padding: 32, textAlign: 'center' }}>
        <div css={{ fontSize: 40, lineHeight: 1 }} aria-hidden="true">⚠️</div>
        <h3 css={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>문제가 발생했어요</h3>
        <p css={{ margin: 0, color: 'var(--sub)', fontSize: 13, fontWeight: 700, lineHeight: 1.6 }}>
          일시적인 오류로 화면을 불러오지 못했어요.<br />잠시 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={onRetry}
          css={{
            justifySelf: 'center',
            marginTop: 6,
            padding: '11px 26px',
            borderRadius: 12,
            border: 0,
            background: 'var(--ink)',
            color: 'var(--on-ink)',
            fontSize: 14,
            fontWeight: 900,
            fontFamily: 'inherit',
            cursor: 'pointer'
          }}
        >
          다시 시도
        </button>
      </GlassCard>
    </div>
  );
}

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // 디버깅용 로깅 (프로덕션 모니터링 연동 시 이 지점에 연결)
    console.error('[ErrorBoundary]', error);
  }

  componentDidUpdate(prevProps) {
    // 라우트 등 resetKey가 바뀌면 에러 상태 자동 해제 (다른 화면으로 이동 시 복구)
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  handleRetry = () => {
    this.props.onReset?.(); // QueryErrorResetBoundary reset → 쿼리 에러 초기화 후 refetch
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
