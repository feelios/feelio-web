import styled from '@emotion/styled';
import { driftA, driftB } from '../../styles/animations.js';
import { getAurora } from '../../data/aurorasDc.js';

/**
 * 오로라 배경 (DESIGN-GUIDE §1 — 디자인 정체성). 로그인 전후 모든 화면이 이걸 쓴다.
 *
 * 예전에는 App.jsx(로그인·온보딩)와 AppLayoutDc.jsx(로그인 후)가 각자 orb 를 그렸고
 * 값이 서로 달랐다. 크기·위치·블러는 물론 **색 순서까지** 달라서, 로그인하는 순간
 * 배경이 통째로 바뀌었다 (#300).
 *
 *   로그인 전   520/600/420px · blur 80 · colors[0],[2],[1] · 14s·16s
 *   로그인 후   640/560/640px · blur 110~120 · colors[0],[1],[2] · 28s·32s·36s
 *
 * 로그인 후 값을 기준으로 삼았다. 앱의 거의 모든 화면이 그 배경 위에 그려지고,
 * 모바일 대응도 그쪽에만 제대로 들어가 있었다.
 *
 * 위치·크기는 CSS 로 둔다. 인라인 style 로 넘기면 미디어 쿼리를 이겨서
 * 모바일 값이 무시된다 — 로그인 배경이 정확히 그 상태였다.
 */

/**
 * orb 를 담는 틀. 화면에 고정해두고 넘치는 부분을 여기서 잘라낸다.
 *
 * orb 는 일부러 화면 밖으로 걸쳐 배치되므로, 이 틀이 없으면 아래·옆으로 삐져나간
 * 만큼 스크롤이 생긴다. 부모(Root·Shell)에 overflow: hidden 을 거는 방법도 있지만
 * 그러면 내용이 화면보다 길 때 잘려서 못 보게 된다 — 배경 때문에 본문을 막을 일은 아니다.
 */
const Field = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

const Orb = styled.div`
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  opacity: ${({ mode }) => mode === 'dark' ? .5 : .42};
`;

/*
 * 모바일에서는 셋을 화면 가장자리로 벌린다. 가운데는 말랑이·문구 자리라 비워야 한다.
 * 폭에 따라 커지도록 clamp 를 쓴다 — 고정 px 로 두면 좁은 기기에서 서로 겹친다.
 */
const OrbA = styled(Orb)`
  width: 640px;
  height: 640px;
  left: -100px;
  top: -180px;
  filter: blur(110px);
  animation: ${driftA} 28s ease-in-out infinite;

  @media (max-width: 900px) {
    width: clamp(240px, 64vw, 360px);
    height: clamp(240px, 64vw, 360px);
    left: -24%;
    top: -3%;
    filter: blur(58px);
  }
`;

const OrbB = styled(Orb)`
  width: 560px;
  height: 560px;
  right: -140px;
  top: 16%;
  filter: blur(115px);
  animation: ${driftB} 32s ease-in-out infinite;

  @media (max-width: 900px) {
    width: clamp(220px, 58vw, 320px);
    height: clamp(220px, 58vw, 320px);
    right: -28%;
    top: 20%;
    filter: blur(60px);
  }
`;

const OrbC = styled(Orb)`
  width: 640px;
  height: 640px;
  left: 32%;
  bottom: -200px;
  filter: blur(120px);
  animation: ${driftA} 36s ease-in-out infinite reverse;

  @media (max-width: 900px) {
    width: clamp(240px, 64vw, 360px);
    height: clamp(240px, 64vw, 360px);
    left: 22%;
    bottom: -6%;
    filter: blur(64px);
  }
`;

/**
 * @param mode   'light' | 'dark'
 * @param aurora 테마 키 (useFeelioStore 의 state.aurora)
 */
export function AuroraBackground({ mode, aurora }) {
  // 색은 테마마다 달라지는 값이라 CSS 로 고정할 수 없다. 이것만 인라인으로 넘긴다.
  const colors = getAurora(aurora).colors;

  return (
    <Field>
      <OrbA mode={mode} style={{ background: colors[0] }} />
      <OrbB mode={mode} style={{ background: colors[1] }} />
      <OrbC mode={mode} style={{ background: colors[2] }} />
    </Field>
  );
}
