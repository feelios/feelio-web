/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { EmotionBlob } from '../components/common/EmotionBlob.jsx';
import { stepIn } from '../styles/animations.js';

const Page = styled.main`
  min-height: 100dvh;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr .95fr;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

const Hero = styled.section`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: clamp(42px, 6vw, 72px) clamp(38px, 7vw, 92px);
  animation: ${stepIn} .45s ease;

  > strong {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -.03em;
  }

  @media (max-width: 980px) {
    min-height: auto;
    padding: 32px 24px 16px;
  }
`;

const HeroContent = styled.div`
  margin: auto 0;

  h1 {
    margin: 20px 0 0;
    color: var(--text);
    font-size: clamp(34px, 5vw, 52px);
    line-height: 1.14;
    letter-spacing: -.045em;
  }

  h1 span {
    display: block;
    color: ${({ accent }) => accent};
    transition: color .35s ease;
  }

  p {
    max-width: 500px;
    margin: 18px 0 0;
    color: var(--sub);
    font-size: 16px;
    line-height: 1.75;
  }

  @media (max-width: 980px) {
    margin: 32px 0 16px;
    
    h1 {
      font-size: 32px;
    }
  }
`;

const BlobSpot = styled.div`
  position: relative;
  width: 158px;
  height: 158px;
  display: grid;
  place-items: center;
  margin-bottom: 8px;

  i {
    position: absolute;
    border-radius: 50%;
  }
`;

const AuthPanel = styled.section`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 28px;
  background: linear-gradient(90deg, var(--glass), var(--glass-strong));

  @media (max-width: 980px) {
    min-height: auto;
    padding: 32px 24px 64px;
    align-items: start;
    background: linear-gradient(180deg, var(--glass), var(--glass-strong));
  }
`;

const AuthBox = styled.div`
  width: min(352px, 100%);
  text-align: center;

  h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -.02em;
  }

  p {
    margin: 10px 0 30px;
    color: var(--sub);
    line-height: 1.7;
  }
`;

const Button = styled.button`
  position: relative;
  width: 100%;
  height: 52px;
  border: ${({ solid }) => solid ? 0 : '1px solid var(--line)'};
  border-radius: 14px;
  margin-top: 12px;
  background: ${({ tone }) => tone || 'var(--card)'};
  color: ${({ color }) => color || 'var(--text)'};
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.5);

  span {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 900;
  }
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;

  span {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 15px;
    border-radius: 999px;
    background: var(--card);
    border: 1px solid var(--line);
    color: var(--sub);
    font-size: 13px;
    font-weight: 700;
  }

  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
`;

const ModeButton = styled.button`
  position: fixed;
  top: 28px;
  right: 28px;
  z-index: 5;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--card-border);
  background: var(--card);
  cursor: pointer;
  backdrop-filter: blur(20px);
`;

const heroSlides = [
  {
    emotion: '스트레스',
    accent: '#A68BEA',
    eyebrow: '스트레스였던 밤',
    title: '그 소비의 이유를 읽어드릴게요',
    copy: 'feelio는 감정에 따라 반복되는 소비 패턴을 분석해, 나도 몰랐던 소비의 이유를 인사이트로 건네는 감정 기록 서비스예요.'
  },
  {
    emotion: '외로움',
    accent: '#6EA7E8',
    eyebrow: '외로웠던 새벽',
    title: '지갑이 열린 순간을 함께 볼게요',
    copy: '기록이 쌓이면 어떤 시간, 어떤 마음에서 소비가 반복되는지 말랑한 신호로 보여드려요.'
  },
  {
    emotion: '뿌듯함',
    accent: '#E5B84E',
    eyebrow: '뿌듯했던 하루',
    title: '좋은 소비는 더 선명하게 남겨요',
    copy: '아낄 소비와 지켜도 되는 소비를 구분해, 목표에 가까워지는 흐름을 부드럽게 이어가요.'
  }
];

export default function LoginPage({ mode, onToggleMode, onLogin }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = heroSlides[slideIndex];
  const pills = [
    ['감정 태그 기록', '#F28AB7'],
    ['AI 패턴 분석', '#A68BEA'],
    ['평행우주 목표', '#83C9B0']
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex(index => (index + 1) % heroSlides.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Page>
      <ModeButton type="button" onClick={onToggleMode} aria-label="화면 모드 전환">
        {mode === 'dark' ? '☀' : '☾'}
      </ModeButton>
      <Hero>
        <strong>feelio</strong>
        <HeroContent accent={slide.accent}>
          <BlobSpot>
            <i style={{ width: 10, height: 10, left: -6, top: 54, background: '#F2C766' }} />
            <i style={{ width: 12, height: 12, right: -2, top: 40, background: '#F28AB7' }} />
            <i style={{ width: 9, height: 9, right: -18, bottom: 34, background: '#83C9B0' }} />
            <EmotionBlob emotion={slide.emotion} size={150} />
          </BlobSpot>
          <h1><span>{slide.eyebrow}</span>{slide.title}</h1>
          <p>{slide.copy}</p>
          <Pills>
            {pills.map(([label, color]) => <span key={label}><i style={{ background: color }} />{label}</span>)}
          </Pills>
        </HeroContent>
        <small css={{ color: 'var(--sub)', fontWeight: 700 }}>Feel + I/O · 감정 기반 소비 인사이트</small>
      </Hero>
      <AuthPanel>
        <AuthBox>
          <h2>feelio 시작하기</h2>
          <p>소셜 계정으로 3초 만에 시작해요.<br />따로 가입할 필요 없어요.</p>
          <Button onClick={() => onLogin('Google')}><span>G</span>Google로 계속하기</Button>
          <Button solid tone="#FFE100" color="#3A1D1D" onClick={() => onLogin('Kakao')}><span>●</span>Kakao로 계속하기</Button>
          <Button solid tone="#08C963" color="#fff" onClick={() => onLogin('Naver')}><span>N</span>Naver로 계속하기</Button>
          <small css={{ display: 'block', marginTop: 24, color: 'var(--sub)', lineHeight: 1.6 }}>가입하면 feelio의 서비스 약관과 개인정보 처리방침에 동의하게 돼요.</small>
        </AuthBox>
      </AuthPanel>
    </Page>
  );
}
