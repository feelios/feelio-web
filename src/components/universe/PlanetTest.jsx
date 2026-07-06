/** @jsxImportSource @emotion/react */
// 「소비 행성 관측」 — 평행우주 탭 인터랙티브 기질 테스트.
// 데이터/로직은 data/planetTest.mjs · utils/planetScoring.mjs (확정값)에서 주입.
import { useEffect, useId, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { AXES, AXIS_ORDER, QUESTIONS, TYPES, BRIDGE } from '../../data/planetTest.mjs';
import { scoreAnswers, gaugePercent, getWarpPlan } from '../../utils/planetScoring.mjs';

/* ---------- 모션 ---------- */

const floatSlow = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: .82; }
`;

const condense = keyframes`
  from { filter: blur(18px) saturate(.55); transform: scale(.9); }
  to { filter: blur(0) saturate(1); transform: scale(1); }
`;

const nebulaDrift = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(48px, -30px) scale(1.12); }
`;

const nebulaDriftAlt = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-42px, 34px) scale(1.08); }
`;

const orbitSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ---------- 레이아웃 ---------- */

const Observatory = styled.section`
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border-radius: 26px;
  padding: clamp(22px, 4vw, 44px) clamp(16px, 4vw, 44px) clamp(28px, 4vw, 44px);
  min-height: 540px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background:
    radial-gradient(circle at 78% 14%, #171430 0%, transparent 52%),
    linear-gradient(165deg, #100e1e, #0a0912 62%);
  color: #ECEBF0;
  box-shadow: var(--shadow);

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const Nebula = styled.div`
  position: absolute;
  inset: -12%;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(60px);
  opacity: .5;
  background: ${({ tone }) => tone};
  animation: ${({ alt }) => (alt ? nebulaDriftAlt : nebulaDrift)} ${({ dur }) => dur || 26}s ease-in-out infinite;
`;

const Stars = styled.svg`
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const Stage = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: ${fadeUp} .5s ease both;
`;

const MonoTag = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: .22em;
  color: rgba(236, 235, 240, .55);
  text-transform: uppercase;
`;

const Headline = styled.h2`
  margin: 10px 0 5px;
  font-size: clamp(18px, 2.5vw, 23px);
  font-weight: 900;
  line-height: 1.45;
`;

const SubCopy = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(236, 235, 240, .62);
`;

const PrimaryBtn = styled.button`
  appearance: none;
  border: 0;
  cursor: pointer;
  border-radius: 999px;
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 900;
  color: #141220;
  background: linear-gradient(120deg, #ECEBF0, #cfc9e8);
  transition: transform .18s ease, box-shadow .18s ease;

  &:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0, 0, 0, .4); }
  &:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
`;

const GhostBtn = styled(PrimaryBtn)`
  color: #ECEBF0;
  background: rgba(255, 255, 255, .07);
  border: 1px solid rgba(255, 255, 255, .18);
`;

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
`;

const Panel = styled.div`
  width: 100%;
  border-radius: 20px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, .045);
  border: 1px solid rgba(255, 255, 255, .1);
  text-align: left;
`;

const Disclaimer = styled.p`
  margin: 22px 0 0;
  font-size: 11px;
  color: rgba(236, 235, 240, .4);
`;

/* ---------- 행성 구체 (인라인 SVG) ---------- */

const MYSTERY_PAL = ['#9aa2c0', '#5d6488', '#23263c'];

function PlanetOrb({ pal, ink, mood, size = 190, blurred = false, condensing = false, floating = true, ariaLabel }) {
  const gid = useId().replace(/[:]/g, '');
  const mouth = {
    smile: <path d="M85 116 Q100 129 115 116" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />,
    frown: <path d="M86 123 Q100 111 114 123" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />,
    line: <path d="M88 119 L112 119" stroke={ink} strokeWidth="4" strokeLinecap="round" />
  }[mood];

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      css={{
        width: size,
        height: size,
        animation: floating ? `${floatSlow} 6s ease-in-out infinite` : 'none'
      }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        css={{
          display: 'block',
          overflow: 'visible',
          ...(blurred && { filter: 'blur(12px) saturate(.6)' }),
          ...(condensing && { animation: `${condense} 1.7s ease forwards` })
        }}
      >
        <defs>
          <radialGradient id={`${gid}-body`} cx="40%" cy="32%" r="78%">
            <stop offset="0%" stopColor={pal[0]} />
            <stop offset="52%" stopColor={pal[1]} />
            <stop offset="100%" stopColor={pal[2]} />
          </radialGradient>
        </defs>
        {/* 겹무리 halo 2겹 */}
        <circle cx="100" cy="100" r="96" fill={pal[1]} opacity=".16" css={{ filter: 'blur(22px)' }} />
        <circle cx="100" cy="100" r="86" fill={pal[0]} opacity=".22" css={{ filter: 'blur(14px)' }} />
        <circle cx="100" cy="100" r="76" fill={`url(#${gid}-body)`} />
        {/* 위성 */}
        <g css={{ transformOrigin: '100px 100px', animation: `${orbitSpin} 24s linear infinite` }}>
          <circle cx="176" cy="58" r="9" fill={pal[0]} opacity=".9" />
          <circle cx="173" cy="55" r="2.6" fill={pal[2]} opacity=".55" />
        </g>
        {!blurred && mood && (
          <g>
            <circle cx="82" cy="94" r="5" fill={ink} opacity=".92" />
            <circle cx="118" cy="94" r="5" fill={ink} opacity=".92" />
            {mouth}
          </g>
        )}
      </svg>
    </div>
  );
}

/* ---------- 반원 양극 게이지 ---------- */

const GaugeBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
`;

function polar(pct) {
  const rad = Math.PI * (1 - pct / 100);
  return { x: 100 + 84 * Math.cos(rad), y: 100 - 84 * Math.sin(rad) };
}

function BipolarGauge({ axis, score }) {
  const meta = AXES[axis];
  const pct = gaugePercent(score);
  const bit = score >= 2 ? 1 : 0;
  const marker = polar(pct);
  const label = `${meta.name}: ${bit ? meta.pole1 : meta.pole0} 쪽 ${pct}%`;

  return (
    <GaugeBox>
      <svg viewBox="0 0 200 112" width="100%" css={{ maxWidth: 190, display: 'block' }} role="img" aria-label={label}>
        <path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="rgba(255,255,255,.13)" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M16 100 A84 84 0 0 1 184 100"
          fill="none"
          stroke="rgba(255,255,255,.72)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${pct} 100`}
        />
        <circle cx={marker.x} cy={marker.y} r="8.5" fill="#fff" />
        <circle cx={marker.x} cy={marker.y} r="12.5" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" />
        <text x="100" y="86" textAnchor="middle" fill="#ECEBF0" fontSize="14" fontWeight="900">{meta.name}</text>
        <text x="100" y="103" textAnchor="middle" fill="rgba(236,235,240,.5)" fontSize="11">{score}/3</text>
      </svg>
      <div css={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 190, fontSize: 12, fontWeight: 800, marginTop: 4 }}>
        <span css={{ color: bit === 0 ? '#fff' : 'rgba(236,235,240,.4)' }}>{bit === 0 && '● '}{meta.pole0}</span>
        <span css={{ color: bit === 1 ? '#fff' : 'rgba(236,235,240,.4)' }}>{meta.pole1}{bit === 1 && ' ●'}</span>
      </div>
    </GaugeBox>
  );
}

/* ---------- 스캔 진행 링 ---------- */

function AxisRing({ axis, answered, active }) {
  const c = 2 * Math.PI * 13;
  return (
    <div css={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg viewBox="0 0 34 34" width="34" height="34">
        <circle cx="17" cy="17" r="13" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="3.5" />
        <circle
          cx="17" cy="17" r="13" fill="none"
          stroke={active ? '#fff' : 'rgba(255,255,255,.55)'}
          strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={`${(answered / 3) * c} ${c}`}
          transform="rotate(-90 17 17)"
          css={{ transition: 'stroke-dasharray .4s ease' }}
        />
        <text x="17" y="21" textAnchor="middle" fontSize="11" fontWeight="900" fill={active ? '#fff' : 'rgba(255,255,255,.5)'}>{axis}</text>
      </svg>
      <span css={{ fontSize: 10, fontWeight: 800, color: active ? '#fff' : 'rgba(236,235,240,.4)' }}>{AXES[axis].name}</span>
    </div>
  );
}

/* ---------- A/B 선택 카드 ---------- */

const ChoiceBtn = styled.button`
  appearance: none;
  cursor: pointer;
  width: 100%;
  border-radius: 18px;
  padding: 18px 20px;
  text-align: left;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.55;
  color: #ECEBF0;
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .12);
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: transform .16s ease, border-color .16s ease, background .16s ease;

  &:hover {
    transform: translateX(5px);
    border-color: rgba(255, 255, 255, .5);
    background: rgba(255, 255, 255, .09);
  }
  &:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
`;

const ChoiceKey = styled.span`
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: 900;
  background: rgba(255, 255, 255, .12);
`;

/* ---------- 별점 배경 (결정적 좌표 — 렌더마다 흔들리지 않게) ---------- */

const STAR_DOTS = Array.from({ length: 42 }, (_, i) => ({
  x: ((i * 137 + 29) % 100),
  y: ((i * 61 + 13) % 100),
  r: 0.6 + ((i * 7) % 10) / 9,
  o: 0.18 + ((i * 13) % 10) / 22
}));

function SpaceBackdrop() {
  return (
    <>
      <Nebula tone="radial-gradient(circle at 26% 30%, rgba(158,150,238,.34), transparent 58%)" dur={26} />
      <Nebula alt tone="radial-gradient(circle at 74% 64%, rgba(134,201,255,.26), transparent 55%)" dur={32} />
      <Nebula tone="radial-gradient(circle at 60% 18%, rgba(225,145,221,.18), transparent 52%)" dur={38} />
      <Stars viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {STAR_DOTS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.16} fill="#fff" opacity={s.o} />
        ))}
      </Stars>
    </>
  );
}

/* ---------- 메인 컴포넌트 ---------- */

export default function PlanetTest({ questions = QUESTIONS, types = TYPES, bridge = BRIDGE }) {
  const [stage, setStage] = useState('intro'); // intro | scan | reveal | result | warp
  const [answers, setAnswers] = useState({});
  const [qIndex, setQIndex] = useState(0);
  const [routeAxis, setRouteAxis] = useState(null);
  const [notice, setNotice] = useState('');

  const question = questions[qIndex];
  const scanAxisNo = Math.floor(qIndex / 3) + 1;

  const result = useMemo(() => {
    if (Object.keys(answers).length < questions.length) return null;
    return scoreAnswers(answers);
  }, [answers, questions.length]);

  const type = result ? types[result.code] : null;
  const warp = result ? getWarpPlan(result, routeAxis) : null;

  useEffect(() => {
    if (stage !== 'reveal') return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => setStage('result'), reduced ? 350 : 1700);
    return () => clearTimeout(timer);
  }, [stage]);

  function choose(option) {
    setAnswers(prev => ({ ...prev, [question.id]: option }));
    if (qIndex + 1 < questions.length) setQIndex(qIndex + 1);
    else setStage('reveal');
  }

  function restart() {
    setStage('intro');
    setAnswers({});
    setQIndex(0);
    setRouteAxis(null);
    setNotice('');
  }

  const answeredIn = axis => questions.filter(q => q.axis === axis && answers[q.id]).length;

  return (
    <Observatory>
      <SpaceBackdrop />

      {stage === 'intro' && (
        <Stage>
          <MonoTag>OBSERVATION 001</MonoTag>
          <div css={{ margin: '18px 0 14px' }}>
            <PlanetOrb pal={MYSTERY_PAL} size={140} blurred ariaLabel="정체불명의 흐릿한 행성" />
          </div>
          <Headline>다중우주에서<br />정체불명의 소비 행성이 관측됐어요</Headline>
          <SubCopy>9번의 스캔으로 이 행성 — 당신의 소비 기질 좌표를 확인합니다.</SubCopy>
          <BtnRow>
            <PrimaryBtn onClick={() => setStage('scan')}>관측 시작</PrimaryBtn>
          </BtnRow>
        </Stage>
      )}

      {stage === 'scan' && (
        <Stage key={qIndex}>
          <div css={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            {AXIS_ORDER.map(axis => (
              <AxisRing key={axis} axis={axis} answered={answeredIn(axis)} active={question.axis === axis} />
            ))}
          </div>
          <MonoTag>
            SCAN {scanAxisNo}/3 · {AXES[question.axis].name} · {qIndex + 1}/9
          </MonoTag>
          <Headline css={{ minHeight: '2.9em', display: 'flex', alignItems: 'center' }}>{question.t}</Headline>
          <div css={{ display: 'grid', gap: 10, width: '100%', maxWidth: 430, marginTop: 6 }}>
            <ChoiceBtn onClick={() => choose('A')}><ChoiceKey>A</ChoiceKey>{question.A}</ChoiceBtn>
            <ChoiceBtn onClick={() => choose('B')}><ChoiceKey>B</ChoiceKey>{question.B}</ChoiceBtn>
          </div>
        </Stage>
      )}

      {stage === 'reveal' && type && (
        <Stage>
          <MonoTag>COORDINATE CONDENSING</MonoTag>
          <div css={{ margin: '24px 0 18px', animation: `${pulse} 1.1s ease-in-out infinite` }}>
            <PlanetOrb pal={type.pal} ink={type.ink} mood={type.mood} size={150} condensing floating={false} ariaLabel="행성 응결 중" />
          </div>
          <SubCopy>행성 좌표 응결 중…</SubCopy>
        </Stage>
      )}

      {stage === 'result' && type && (
        <Stage>
          <MonoTag>PLANET FOUND · TYPE {result.code}</MonoTag>
          <div css={{ margin: '14px 0 10px' }}>
            <PlanetOrb pal={type.pal} ink={type.ink} mood={type.mood} size={145} ariaLabel={`${type.name} 행성`} />
          </div>
          <SubCopy>당신의 소비 행성은</SubCopy>
          <Headline css={{ margin: '3px 0 6px', color: type.pal[0], fontSize: 'clamp(21px, 2.8vw, 26px)' }}>{type.name}</Headline>
          <SubCopy>{type.def}</SubCopy>

          <div css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 8,
            width: '100%',
            margin: '18px 0 12px',
            '@media (max-width: 520px)': { gridTemplateColumns: '1fr', gap: 18 }
          }}>
            {AXIS_ORDER.map(axis => (
              <BipolarGauge key={axis} axis={axis} score={result.axisScores[axis]} />
            ))}
          </div>

          <Panel>
            <div css={{ fontSize: 12, fontWeight: 900, color: 'rgba(236,235,240,.5)', marginBottom: 5 }}>이 행성의 지갑이 열리는 순간</div>
            <div css={{ fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>{type.open}</div>
            <div css={{ fontSize: 12, fontWeight: 900, color: 'rgba(236,235,240,.5)', margin: '16px 0 5px' }}>관측자의 제안</div>
            <div css={{ fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>{type.tip}</div>
          </Panel>

          <BtnRow>
            <PrimaryBtn onClick={() => { setNotice(''); setStage('warp'); }}>
              {warp?.stable ? '내 궤도 확인하기' : '가장 가까운 평행우주로 항해 →'}
            </PrimaryBtn>
            <GhostBtn onClick={() => setNotice('공유 카드 이미지는 준비 중이에요 (TODO: SVG→PNG export)')}>행성 카드 공유</GhostBtn>
            <GhostBtn onClick={restart}>다시 관측</GhostBtn>
          </BtnRow>
          {notice && <SubCopy css={{ marginTop: 12, fontSize: 12 }}>{notice}</SubCopy>}
          <Disclaimer>이 관측은 재미로 보는 콘텐츠예요 · 임상적 진단이 아닙니다</Disclaimer>
        </Stage>
      )}

      {stage === 'warp' && type && warp && (
        warp.stable ? (
          <Stage>
            <MonoTag>ORBIT STABLE</MonoTag>
            <div css={{ margin: '28px 0 20px' }}>
            <PlanetOrb pal={type.pal} ink={type.ink} mood={type.mood} size={185} ariaLabel={`${type.name} 행성`} />
            </div>
            <Headline>이미 가장 안정된 궤도예요 🌱</Headline>
            <SubCopy>세 축 모두 고요하게 돌고 있어요.<br />지금의 리듬을 그대로 지켜주세요 — 관측소가 계속 지켜볼게요.</SubCopy>
            <BtnRow>
              <GhostBtn onClick={() => setStage('result')}>내 행성으로</GhostBtn>
            </BtnRow>
          </Stage>
        ) : (
          <Stage>
            <MonoTag>WARP ROUTE · {result.code} → {warp.destCode}</MonoTag>
            <div css={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2.5vw, 20px)', margin: '26px 0 18px' }}>
              <PlanetOrb pal={type.pal} ink={type.ink} mood={type.mood} size={78} floating={false} ariaLabel={`현재 행성 ${type.name}`} />
              <svg viewBox="0 0 90 24" width="clamp(56px, 12vw, 90px)" aria-hidden="true">
                <path d="M4 12 H74" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" strokeDasharray="3 6" strokeLinecap="round" />
                <path d="M72 5 L84 12 L72 19" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <PlanetOrb pal={warp.destType.pal} ink={warp.destType.ink} mood={warp.destType.mood} size={160} ariaLabel={`목적지 행성 ${warp.destType.name}`} />
            </div>
            <SubCopy>가장 가까운 평행우주 — <b css={{ color: warp.destType.pal[0] }}>{warp.destType.name}</b></SubCopy>
            <Headline css={{ fontSize: 'clamp(17px, 2.4vw, 21px)', maxWidth: 480 }}>
              네 {AXES[warp.axis].name} 궤도를 {AXES[warp.axis].pole1} → {AXES[warp.axis].pole0}로 틀면,<br />
              {bridge[warp.axis].act} 이 우주에 도착해요.
            </Headline>
            <div css={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
              <span css={pillStyle}>한 달 −{bridge[warp.axis].save.toLocaleString('ko-KR')}원</span>
              <span css={pillStyle}>목표 {bridge[warp.axis].days}일 당겨짐</span>
            </div>

            {warp.candidates.length > 1 && (
              <div css={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                <span css={{ fontSize: 12, color: 'rgba(236,235,240,.5)', fontWeight: 800 }}>다른 항로</span>
                {warp.candidates.map(axis => (
                  <button
                    key={axis}
                    onClick={() => setRouteAxis(axis)}
                    css={{
                      ...chipStyle,
                      ...(axis === warp.axis && { background: 'rgba(255,255,255,.9)', color: '#141220', borderColor: 'transparent' })
                    }}
                  >
                    {AXES[axis].name}
                  </button>
                ))}
              </div>
            )}

            <BtnRow>
              <PrimaryBtn onClick={() => setNotice('이 항로가 다중우주 지도에 목표로 기록됐어요 ✦ (데모)')}>이 항로로 항해하기</PrimaryBtn>
              <GhostBtn onClick={() => { setNotice(''); setStage('result'); }}>내 행성으로</GhostBtn>
            </BtnRow>
            {notice && <SubCopy css={{ marginTop: 12, fontSize: 12 }}>{notice}</SubCopy>}
            <Disclaimer>항해하면 다중우주 지도에 목표로 찍히고, 실천할수록 다음 관측 때 좌표가 이동해요.</Disclaimer>
          </Stage>
        )
      )}
    </Observatory>
  );
}

const pillStyle = {
  borderRadius: 999,
  padding: '7px 14px',
  fontSize: 13,
  fontWeight: 900,
  background: 'rgba(130, 226, 194, .14)',
  color: '#82E2C2',
  border: '1px solid rgba(130, 226, 194, .3)'
};

const chipStyle = {
  appearance: 'none',
  cursor: 'pointer',
  borderRadius: 999,
  padding: '6px 13px',
  fontSize: 12,
  fontWeight: 900,
  color: '#ECEBF0',
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.2)'
};
