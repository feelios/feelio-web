import { useEffect } from 'react';
import { useFeelioStore } from '../stores/useFeelioStore.js';

export default function AuthCallbackPage() {
  const { actions } = useFeelioStore();

  useEffect(() => {
    const handleCallback = async () => {
      // 1. URL에서 code와 state(provider) 추출
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const provider = params.get('state');

      if (!code || !provider) {
        alert('로그인에 실패했습니다 (인증 코드 누락)');
        window.location.href = '/';
        return;
      }

      try {
        const REDIRECT_URI = `${window.location.origin}/auth/callback`;
        
        // 2. 백엔드 API 호출!
        const result = await actions.handleCallbackLogin(provider, code, REDIRECT_URI);
        
        // 3. 성공 시: 발급받은 토큰과 유저 정보를 스토어에 저장하고 홈 화면으로 이동
        if (result.success) {
          // 브라우저 히스토리에서 callback 파라미터 지우고 깔끔하게 홈으로 덮어씌우기
          window.history.replaceState({}, document.title, '/');
        } else {
          alert('로그인 처리 중 오류가 발생했습니다.');
          window.location.href = '/';
        }
      } catch (error) {
        console.error('백엔드 소셜 로그인 실패:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
        window.location.href = '/';
      }
    };

    handleCallback();
  }, [actions]);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', background: 'var(--bg-1)' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--card-border)', borderTopColor: 'var(--ink)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
        안전하게 로그인 처리 중입니다...<br />
        <span style={{ fontSize: '14px', color: 'var(--sub)', fontWeight: '400', marginTop: '8px', display: 'block' }}>잠시만 기다려주세요! 🔒</span>
      </h2>
    </div>
  );
}
