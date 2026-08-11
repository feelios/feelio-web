/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { EmotionBlob } from '../components/common/EmotionBlob.jsx';
import { GoogleLogo, KakaoLogo } from '../components/common/SocialLogos.jsx';
import { stepIn } from '../styles/animations.js';
import { emotionPalette } from '../styles/theme.js';

const Page = styled.main`
  min-height: 100dvh;
  width: 100%;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  overflow-x: clip;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    /* Hero 가 남는 높이를 전부 먹고 시트는 하단에 붙는다.
       auto auto 로 두면 stretch 가 남는 공간을 두 행에 나눠 넣어 사이가 벌어진다. */
    grid-template-rows: 1fr auto;
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

  @media (max-width: 900px) {
    min-height: auto;
    padding: 20px 22px 14px;
    /* 로고만 좌측에 남으면 축이 둘로 갈린다. 아래 내용과 같은 중앙 축에 태운다. */
    text-align: center;

    > strong {
      font-size: 19px;
    }
  }
`;

const HeroContent = styled.div`
  margin: auto 0;

  h1 {
    margin: 34px 0 0;
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

  @media (max-width: 900px) {
    /* Hero 가 1fr 이라 auto 마진이 히어로를 세로 가운데로 잡아준다. */
    margin: auto 0;
    text-align: center;

    h1 {
      margin-top: 22px;
      font-size: clamp(22px, 6.4vw, 27px);
      line-height: 1.16;
    }

    p {
      /* 가운데 정렬에서는 폭을 좁혀야 줄바꿈이 예쁘게 떨어진다. */
      max-width: 280px;
      margin: 10px auto 0;
      font-size: 13px;
      line-height: 1.6;
    }
  }
`;

const BlobSpot = styled.div`
  display: grid;
  place-items: center;
  margin-bottom: 8px;

  @media (max-width: 900px) {
    margin: 0 auto 6px;
  }
`;

const AuthPanel = styled.section`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 28px;
  background: linear-gradient(90deg, rgba(255,255,255,.16), rgba(255,255,255,.34));

  /* 모바일에서는 하단에 붙는 시트로 바뀐다. 그리드가 이 행을 auto 로 잡아 시트가 화면 밑에 고정되므로,
     위쪽 문구가 슬라이드로 바뀌어도 버튼 위치는 움직이지 않는다. */
  @media (max-width: 900px) {
    min-height: auto;
    align-items: start;
    padding: 20px 20px max(24px, env(safe-area-inset-bottom));
    border-top: 1px solid var(--card-border);
    border-radius: 24px 24px 0 0;
    background: var(--card);
    backdrop-filter: blur(20px);
    box-shadow: 0 -14px 34px rgba(0, 0, 0, .07);
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

  @media (max-width: 900px) {
    h2 {
      font-size: 20px;
    }

    p {
      margin: 8px 0 14px;
      font-size: 13px;
      line-height: 1.55;
    }
  }
`;

const Button = styled.button`
  position: relative;
  width: 100%;
  height: 52px;
  border: ${({ solid }) => solid ? 0 : '1px solid var(--line)'};
  border-radius: 14px;
  margin-top: 12px;
  background: ${({ tone }) => tone || 'rgba(255,255,255,.34)'};
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
    /* SVG 는 인라인이라 baseline 에 걸려 몇 px 내려앉는다. flex 로 가운데 맞춘다 (#298). */
    display: flex;
    align-items: center;
  }

  @media (max-width: 900px) {
    height: 46px;
    margin-top: 8px;
    border-radius: 12px;
    font-size: 14px;
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
    background: rgba(255,255,255,.34);
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

  /* 시트가 화면 아래를 차지하는 만큼 히어로에 남는 높이가 적다.
     기능 뱃지는 로그인 판단에 필요한 정보가 아니라 모바일에서는 접는다. */
  @media (max-width: 900px) {
    display: none;
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

  @media (max-width: 900px) {
    top: 22px;
    right: 20px;
    width: 42px;
    height: 42px;
  }
`;

const heroSlides = [
  ['스트레스', '스트레스였던 밤', '그 소비의 이유를 읽어드릴게요', '그 소비의 이유를 읽어드려요', '감정에 따라 반복되는 소비를 찾아드려요.'],
  ['외로움', '외로웠던 새벽', '지갑이 열린 순간을 함께 볼게요', '지갑이 열린 순간을 봐요', '어떤 시간, 어떤 마음이었는지 함께 봐요.'],
  ['뿌듯함', '뿌듯했던 하루', '좋은 소비는 더 선명하게 남겨요', '좋은 소비는 선명하게 남겨요', '아낄 소비와 지켜도 될 소비를 구분해요.'],
  ['신남', '신났던 오후', '즐거웠던 소비도 이유가 있어요', '즐거운 소비도 이유가 있어요', '나를 기분 좋게 만든 선택을 발견해요.'],
  ['설렘', '설렜던 순간', '기대가 담긴 소비를 기억해요', '기대가 담긴 소비를 기억해요', '새로운 시작을 앞둔 마음도 함께 기록해요.'],
  ['화남', '화가 났던 저녁', '욱했던 결제에는 신호가 있어요', '욱했던 결제의 신호를 찾아요', '다음 선택에는 작은 틈을 만들어요.'],
  ['평온', '평온했던 하루', '편안한 선택은 오래 남겨요', '편안한 선택은 오래 남겨요', '나에게 맞는 소비 리듬을 찾아가요.'],
  ['무덤덤', '무덤덤했던 순간', '별생각 없던 소비도 들여다봐요', '무심했던 소비도 들여다봐요', '습관처럼 지나친 결제의 패턴을 찾아요.']
].map(([emotion, eyebrow, title, titleMobile, copyMobile]) => ({ emotion, eyebrow, title, titleMobile, copyMobile }));

export default function LoginPage({ mode, onToggleMode, onLogin }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1280 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight
  }));
  const isMobile = viewport.width <= 900;
  const slide = heroSlides[slideIndex];
  const accent = emotionPalette[slide.emotion].color;
  const pills = [
    ['감정 태그 기록', '#F28AB7'],
    ['AI 패턴 분석', '#A68BEA'],
    ['평행우주 목표', '#83C9B0']
  ];

  // 900px 는 이 파일의 미디어쿼리 기준과 같다. 둘이 어긋나면 블롭만 데스크톱 크기로 남는다.
  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex(index => (index + 1) % heroSlides.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const blobSize = isMobile
    ? Math.max(150, Math.min(220, Math.round(viewport.height * 0.28)))
    : 190;

  return (
    <Page>
      <ModeButton type="button" onClick={onToggleMode} aria-label="화면 모드 전환">
        {mode === 'dark' ? '☀' : '☾'}
      </ModeButton>
      <Hero>
        <strong>feelio</strong>
        <HeroContent accent={accent}>
          <BlobSpot style={{ width: blobSize, height: blobSize * 1.05 }}>
            <EmotionBlob emotion={slide.emotion} size={blobSize} />
          </BlobSpot>
          <h1><span>{slide.eyebrow}</span>{isMobile ? slide.titleMobile : slide.title}</h1>
          <p>{isMobile ? slide.copyMobile : `${slide.copyMobile} 기록이 쌓이면 나만의 소비 흐름이 보여요.`}</p>
          <Pills>
            {pills.map(([label, color]) => <span key={label}><i style={{ background: color }} />{label}</span>)}
          </Pills>
        </HeroContent>
        <small css={{ color: 'var(--sub)', fontWeight: 700, '@media (max-width: 900px)': { display: 'none' } }}>Feel + I/O · 감정 기반 소비 인사이트</small>
      </Hero>
      <AuthPanel>
        <AuthBox>
          <h2>feelio 시작하기</h2>
          <p>{isMobile ? '소셜 계정으로 3초 만에 시작해요.' : <>소셜 계정으로 3초 만에 시작해요.<br />따로 가입할 필요 없어요.</>}</p>
          <Button onClick={() => onLogin('Google')}><span><GoogleLogo /></span>Google로 계속하기</Button>
          <Button solid tone="#FFE100" color="#3A1D1D" onClick={() => onLogin('Kakao')}><span><KakaoLogo /></span>Kakao로 계속하기</Button>
          <Button solid tone="#08C963" color="#fff" onClick={() => onLogin('Naver')}><span>N</span>Naver로 계속하기</Button>
          <small css={{ display: 'block', marginTop: 24, color: 'var(--sub)', lineHeight: 1.6, '@media (max-width: 900px)': { marginTop: 12, fontSize: 11 } }}>
            {isMobile ? '가입 시 서비스 약관과 개인정보 처리방침에 동의하게 돼요.' : '가입하면 feelio의 서비스 약관과 개인정보 처리방침에 동의하게 돼요.'}
          </small>
        </AuthBox>
      </AuthPanel>
    </Page>
  );
}
