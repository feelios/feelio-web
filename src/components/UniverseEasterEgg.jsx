import { useMemo } from 'react';
import UniversePlanet from './UniversePlanet';
import { UNIVERSE_TONES } from './universePalette';

const STRESS = UNIVERSE_TONES.stress;
const CALM = UNIVERSE_TONES.calm;

const COLORS = {
  current: { accent: STRESS.accent, surface: 'rgba(94, 69, 174, .12)' },
  reduced: { accent: CALM.accent, surface: 'rgba(70, 155, 126, .10)' },
};

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '-';
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toLocaleString('ko-KR')}원` : '-';
}

/**
 * 도달까지 걸리는 시간.
 *
 * 개월은 올림이라 한 달 안쪽에서 두 시나리오가 같은 값이 된다. 0.90개월과 0.84개월이
 * 둘 다 "1개월" 이 되어, 매달 더 모으는 쪽이 같은 시점에 닿는 것처럼 보였다.
 * 그 구간에서는 서버가 함께 주는 일수(daysToGoal)로 바꿔 차이를 드러낸다.
 */
function formatDuration(scenario) {
  const months = scenario?.monthsToGoal;
  if (months === null || months === undefined || months === '') return '도달 불가';
  const days = scenario?.daysToGoal;
  if (Number(months) <= 1 && Number.isFinite(Number(days)) && Number(days) > 0) {
    return `${Number(days).toLocaleString('ko-KR')}일`;
  }
  return Number.isFinite(Number(months)) ? `${Number(months).toLocaleString('ko-KR')}개월` : '도달 불가';
}

function formatDate(value) {
  return value ? String(value).replaceAll('-', '.') : '예상일 없음';
}

function formatCompactMoney(value) {
  if (value === null || value === undefined || value === '') return '-';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '-';
  const tenThousands = amount / 10000;
  return `${Number.isInteger(tenThousands) ? tenThousands : tenThousands.toFixed(1)}만원`;
}

function formatCompactDate(value) {
  if (!value) return '예상일 없음';
  const parts = String(value).split('-');
  if (parts.length < 2) return String(value);
  return `${parts[0].slice(-2)}.${parts[1]}`;
}

function ScenarioCard({ scenario, variant, compact = false }) {
  const color = COLORS[variant];
  if (compact) {
    return (
      <section style={{ width: '100%', minHeight: 78, padding: '13px 15px', border: 0, borderRadius: 16, background: color.surface, backdropFilter: 'blur(16px) saturate(118%)', WebkitBackdropFilter: 'blur(16px) saturate(118%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 12px 28px rgba(0,0,0,.18)', color: '#F4F2F8', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 72, flexShrink: 0, color: color.accent, fontSize: 12, fontWeight: 750, lineHeight: 1.35, textAlign: 'left' }}>{scenario?.title || '시나리오'}</div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,.11)', flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1.15fr', gap: 3 }}>
          <Metric label="월 저축" value={formatCompactMoney(scenario?.monthlySaving)} compact color={color.accent} />
          <Metric label="도달까지" value={formatDuration(scenario)} compact color={color.accent} />
          <Metric label="예상 달성" value={formatCompactDate(scenario?.estimatedAchieveDate)} compact color={color.accent} />
        </div>
      </section>
    );
  }
  return (
    <section style={{
      width: 456,
      minHeight: 118,
      padding: '14px 18px',
      border: 0,
      borderRadius: variant === 'current' ? '28px 0 0 28px' : '0 28px 28px 0',
      background: color.surface,
      backdropFilter: 'blur(11px) saturate(138%) brightness(1.06)',
      WebkitBackdropFilter: 'blur(11px) saturate(138%) brightness(1.06)',
      boxShadow: variant === 'current'
        ? 'inset 0 1px 0 rgba(255,255,255,.15), inset 0 -1px 0 rgba(255,255,255,.025), 0 14px 32px rgba(0,0,0,.12)'
        : 'inset 1px 0 0 rgba(255,255,255,.12), inset 0 1px 0 rgba(255,255,255,.15), inset 0 -1px 0 rgba(255,255,255,.025), 0 14px 32px rgba(0,0,0,.12)',
      color: '#F4F2F8',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color.accent, boxShadow: `0 0 10px ${color.accent}` }} />
        <div style={{ color: '#F1EFF5', fontSize: 14, fontWeight: 720, lineHeight: 1.3 }}>{scenario?.title || '시나리오'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.08fr .92fr', gap: 18, alignItems: 'end', marginTop: 11 }}>
        <div>
          <div style={{ color: '#8F8B99', fontSize: 10.5, marginBottom: 5 }}>목표 도달까지</div>
          <div style={{ color: color.accent, fontSize: 27, fontWeight: 800, lineHeight: 1, letterSpacing: '-.035em', textShadow: `0 0 20px ${color.accent}33` }}>{formatDuration(scenario)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <span style={{ color: '#777482', fontSize: 10 }}>월 저축액</span>
            <span style={{ color: '#D8D5DE', fontSize: 13, fontWeight: 700 }}>{formatMoney(scenario?.monthlySaving)}</span>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <span style={{ color: '#777482', fontSize: 10 }}>예상 달성</span>
            <span style={{ color: '#D8D5DE', fontSize: 13, fontWeight: 700 }}>{formatDate(scenario?.estimatedAchieveDate)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, compact, color, divided }) {
  return (
    <div style={{ minWidth: 0, textAlign: 'center', borderRight: divided ? '1px solid rgba(255,255,255,.13)' : 'none' }}>
      <div style={{ color: '#888593', fontSize: compact ? 9 : 10, marginBottom: 4 }}>{label}</div>
      <div style={{ color, fontSize: compact ? 12 : 18, fontWeight: 750, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: `0 0 18px ${color}55` }}>{value}</div>
    </div>
  );
}

function WellGrid({ mobile = false, revealProgress = 100 }) {
  const geometry = useMemo(() => {
    const width = mobile ? 390 : 1160;
    const height = mobile ? 285 : 470;
    const cx = width / 2;
    const cy = mobile ? 205 : 220;
    const flatten = mobile ? .32 : .34;
    const wellRadius = mobile ? 68 : 145;
    const depth = mobile ? 92 : 285;
    const radii = [];
    for (let radius = mobile ? 25 : 58; radius <= (mobile ? 220 : 530); radius += mobile ? 20 : 43) radii.push(radius);
    const project = (radius, angle) => [
      cx + radius * Math.cos(angle),
      cy + radius * Math.sin(angle) * flatten + depth / (1 + (radius / wellRadius) ** 2),
    ];
    const rings = radii.map((radius) => {
      let path = '';
      for (let index = 0; index <= 72; index += 1) {
        const point = project(radius, (index / 72) * Math.PI * 2);
        path += `${index ? 'L' : 'M'}${point[0].toFixed(1)},${point[1].toFixed(1)}`;
      }
      return `${path}Z`;
    });
    const meridians = Array.from({ length: mobile ? 16 : 22 }, (_, rayIndex) => {
      const angle = (rayIndex / (mobile ? 16 : 22)) * Math.PI * 2;
      return radii.map((radius, index) => {
        const point = project(radius, angle);
        return `${index ? 'L' : 'M'}${point[0].toFixed(1)},${point[1].toFixed(1)}`;
      }).join('');
    });
    return { width, height, cx, cy, rings, meridians };
  }, [mobile]);

  const dashOffset = Math.max(0, 100 - revealProgress) * 5;
  const originY = mobile ? 250 : 405;
  const leftPlanet = mobile ? [88, 190] : [285, 170];
  const rightPlanet = mobile ? [302, 190] : [875, 170];
  const arc = (point) => `M${geometry.cx},${originY} Q${(geometry.cx + point[0]) / 2},${mobile ? 105 : 205} ${point[0]},${point[1]}`;
  return (
    <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`egg-grid-${mobile ? 'm' : 'd'}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={STRESS.accent} stopOpacity=".35" />
          <stop offset=".5" stopColor="#7E88B8" stopOpacity=".4" />
          <stop offset="1" stopColor={CALM.accent} stopOpacity=".35" />
        </linearGradient>
        <radialGradient id={`egg-origin-${mobile ? 'm' : 'd'}`}><stop offset="0" stopColor="#FFFFFF" /><stop offset=".35" stopColor="#D9D3FA" /><stop offset="1" stopColor="#8176BA" /></radialGradient>
        <filter id={`egg-glow-${mobile ? 'm' : 'd'}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={mobile ? 3 : 5} /></filter>
      </defs>
      <g fill="none" stroke={`url(#egg-grid-${mobile ? 'm' : 'd'})`} strokeWidth="1">
        {geometry.meridians.map((path, index) => <path key={`m-${index}`} d={path} opacity=".42" />)}
        {geometry.rings.map((path, index) => <path key={`r-${index}`} d={path} opacity={.25 + index * .025} />)}
      </g>
      <path id={`egg-route-left-${mobile ? 'm' : 'd'}`} d={arc(leftPlanet)} fill="none" stroke={STRESS.accent} strokeWidth={mobile ? 1.8 : 2.3} strokeDasharray="7 7" strokeDashoffset={dashOffset}>
        <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="2.2s" repeatCount="indefinite" />
      </path>
      <path id={`egg-route-right-${mobile ? 'm' : 'd'}`} d={arc(rightPlanet)} fill="none" stroke={CALM.accent} strokeWidth={mobile ? 1.8 : 2.3} strokeDasharray="7 7" strokeDashoffset={dashOffset}>
        <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="2.2s" repeatCount="indefinite" />
      </path>
      {[.18, .38, .58, .78].map((portion, index) => <circle key={`ld-${index}`} cx={geometry.cx + (leftPlanet[0] - geometry.cx) * portion} cy={originY + (leftPlanet[1] - originY) * portion - Math.sin(portion * Math.PI) * (mobile ? 34 : 66)} r={mobile ? 3 : 4} fill={STRESS.streaks[0]} filter={`url(#egg-glow-${mobile ? 'm' : 'd'})`} />)}
      {[.18, .38, .58, .78].map((portion, index) => <circle key={`rd-${index}`} cx={geometry.cx + (rightPlanet[0] - geometry.cx) * portion} cy={originY + (rightPlanet[1] - originY) * portion - Math.sin(portion * Math.PI) * (mobile ? 34 : 66)} r={mobile ? 3 : 4} fill={CALM.streaks[0]} filter={`url(#egg-glow-${mobile ? 'm' : 'd'})`} />)}
      <RouteShip routeId={`egg-route-left-${mobile ? 'm' : 'd'}`} color={STRESS.accent} mobile={mobile} />
      <RouteShip routeId={`egg-route-right-${mobile ? 'm' : 'd'}`} color={CALM.accent} mobile={mobile} delay="1.2s" />
    </svg>
  );
}

function RouteShip({ routeId, color, mobile, delay = '0s' }) {
  const scale = mobile ? .62 : 1;
  return (
    <g transform={`scale(${scale})`} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
      <ellipse cx="0" cy="4" rx="12" ry="4.5" fill="#D9D5E6" />
      <ellipse cx="0" cy="1" rx="7" ry="5.5" fill={color} />
      <ellipse cx="-2" cy="-1" rx="3.5" ry="2.4" fill="#F5F3FA" opacity=".9" />
      <circle cx="-7" cy="4" r="1.2" fill="#FFFFFF" />
      <circle cx="0" cy="5" r="1.2" fill="#FFFFFF" />
      <circle cx="7" cy="4" r="1.2" fill="#FFFFFF" />
      <animateMotion dur="2.8s" begin={delay} repeatCount="1" fill="freeze" rotate="auto" calcMode="spline" keyTimes="0;1" keySplines=".32 .05 .24 1">
        <mpath href={`#${routeId}`} />
      </animateMotion>
    </g>
  );
}

function DesktopLayout({ current, reduced, revealProgress }) {
  return (
    <>
      <header style={{ position: 'absolute', top: 52, left: '50%', zIndex: 6, width: 460, transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: '-20px -36px -28px', zIndex: -1, background: 'radial-gradient(ellipse at center, rgba(14,15,27,.98) 0%, rgba(14,15,27,.88) 48%, rgba(14,15,27,0) 76%)', pointerEvents: 'none' }} />
        {/* 글자에 걸려 있던 보라→민트 그라디언트를 뺀다. 두 우주의 색을 제목에 섞어 놓으면
            어느 쪽 이야기인지 흐려지고, 아래 비교표의 색 구분과도 경쟁한다. */}
        <div style={{ fontSize: 27, lineHeight: 1.25, fontWeight: 800, letterSpacing: '-.025em', color: '#EEF0FF' }}>두 미래가 펼쳐졌어요</div>
        <div style={{ display: 'inline-flex', marginTop: 12, padding: '7px 19px', borderRadius: 999, background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.1)', color: '#B9B6C3', fontSize: 12.5 }}>두 미래를 비교해 보세요</div>
      </header>
      <div style={{ position: 'absolute', inset: '80px 0 118px' }}><WellGrid revealProgress={revealProgress} /></div>
      <PlanetStage side="left" tone="stress" />
      <PlanetStage side="right" tone="calm" />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 94, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
          <ScenarioCard scenario={current} variant="current" />
          <ScenarioCard scenario={reduced} variant="reduced" />
        </div>
      </div>
      <ConsoleBar />
    </>
  );
}

function PlanetStage({ side, tone }) {
  const left = side === 'left';
  const glow = left ? 'rgba(138,111,224,.52)' : 'rgba(95,201,168,.52)';
  const size = 128;
  return (
    <div style={{ position: 'absolute', left: left ? 221 : 811, top: 186, zIndex: 4, width: size, height: size }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 210, height: 210, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle,${glow},transparent 62%)`, filter: 'blur(10px)', animation: 'universe-egg-glow 4s ease-in-out infinite' }} />
      <UniversePlanet tone={tone} size={size} />
    </div>
  );
}

function ConsoleBar({ compact = false }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: compact ? 42 : 74, zIndex: 3, borderTop: '1px solid rgba(255,255,255,.07)', background: 'linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: compact ? '0 26px' : '0 80px' }}>
      <ConsoleLights color={STRESS.accent} />
      <div style={{ width: compact ? 34 : 52, height: compact ? 34 : 52, borderRadius: '50%', border: '1px solid rgba(255,255,255,.13)', background: '#11131C', boxShadow: 'inset 0 5px 12px rgba(0,0,0,.7)', display: 'flex', justifyContent: 'center', paddingTop: compact ? 7 : 10 }}><span style={{ width: 2, height: compact ? 9 : 13, background: STRESS.accent, boxShadow: `0 0 7px ${STRESS.accent}` }} /></div>
      <ConsoleLights color={CALM.accent} reverse />
    </div>
  );
}

function ConsoleLights({ color, reverse = false }) {
  return <div style={{ display: 'flex', flexDirection: reverse ? 'row-reverse' : 'row', alignItems: 'center', gap: 15 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} /><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,.2)' }} /><span style={{ width: 42, height: 16, borderRadius: 999, border: '1px solid rgba(255,255,255,.12)', background: '#0D0F16', padding: 2 }}><span style={{ display: 'block', marginLeft: reverse ? 25 : 0, width: 10, height: 10, borderRadius: '50%', background: color }} /></span></div>;
}

function MobileLayout({ goalName, current, reduced, revealProgress, short }) {
  const planetSize = short ? 64 : 86;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: short ? '12px 13px 48px' : '18px 16px 52px', boxSizing: 'border-box' }}>
      <div style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.14)', color: '#E7E3EC', fontSize: 10, fontWeight: 700 }}>{goalName || '나만의 목표'}</div>
      <div style={{ maxWidth: 230, textAlign: 'center', fontSize: short ? 18 : 21, lineHeight: 1.22, fontWeight: 800, marginTop: short ? 7 : 12, color: '#EEF0FF' }}>두 미래가<br />펼쳐졌어요</div>
      {!short && <div style={{ padding: '7px 14px', borderRadius: 999, background: 'rgba(255,255,255,.045)', border: '1px solid rgba(255,255,255,.1)', color: '#AAA6B3', fontSize: 10, marginTop: 9 }}>✦ 두 미래를 비교해 보세요</div>}
      <div style={{ position: 'relative', width: '100%', flex: '1 1 210px', minHeight: short ? 118 : 135, maxHeight: short ? 150 : 230, marginTop: short ? 0 : 5 }}>
        <WellGrid mobile revealProgress={revealProgress} />
        {/* 폴백은 데이터가 없을 때만 쓰인다. '설렘 소비를 줄이면'이 남아 있었는데
            기준이 감정에서 카테고리로 바뀐 뒤로는 나올 수 없는 문구다.
            무슨 항목을 줄이는지는 데이터가 있어야 알 수 있으니 중립적으로 둔다. */}
        <MobilePlanet side="left" tone="stress" size={planetSize} label={current?.title || '지금처럼 쓴다면'} />
        <MobilePlanet side="right" tone="calm" size={planetSize} label={reduced?.title || '소비를 줄이면'} />
      </div>
      <div style={{ width: '100%', maxWidth: 430, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: short ? 7 : 10, marginTop: short ? 5 : 10 }}>
        <ScenarioCard scenario={current} variant="current" compact />
        <ScenarioCard scenario={reduced} variant="reduced" compact />
      </div>
      <ConsoleBar compact />
    </div>
  );
}

function MobilePlanet({ side, tone, size, label }) {
  const left = side === 'left';
  const color = left ? 'rgba(138,111,224,.5)' : 'rgba(95,201,168,.5)';
  return (
    <div style={{ position: 'absolute', left: left ? '12%' : 'auto', right: left ? 'auto' : '12%', top: size <= 64 ? 78 : 96, width: size, height: size }}>
      <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: `radial-gradient(circle,${color},transparent 64%)`, filter: 'blur(7px)' }} />
      <UniversePlanet tone={tone} size={size} />
      <div style={{ position: 'absolute', top: size + 5, left: '50%', transform: 'translateX(-50%)', width: 92, color: '#EEEAF3', fontSize: 10, lineHeight: 1.3, fontWeight: 700, textAlign: 'center', wordBreak: 'keep-all' }}>{label}</div>
    </div>
  );
}

export default function UniverseEasterEgg({ goalName, current, reduced, revealProgress = 100, isMobile = false, isShortMobile = false }) {
  return (
    <div role="status" aria-label="평행우주 시나리오 비교" style={{ position: 'absolute', inset: 0, zIndex: 30, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 38%, #17182A 0%, #0D0E19 54%, #070810 100%)', fontFamily: 'Pretendard, system-ui, -apple-system, sans-serif', animation: 'universe-egg-arrive .35s ease-out' }}>
      <style>{`
        @keyframes universe-egg-arrive { from { opacity: 0; transform: scale(.985); } to { opacity: 1; transform: scale(1); } }
        @keyframes universe-egg-glow { 0%,100% { opacity:.62; transform:translate(-50%,-50%) scale(.96); } 50% { opacity:1; transform:translate(-50%,-50%) scale(1.08); } }
        @media (prefers-reduced-motion: reduce) { [role="status"] { animation: none !important; } }
      `}</style>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: .55, backgroundImage: `radial-gradient(circle at 11% 19%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 78% 14%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 89% 58%, ${STRESS.accent} 0 1px, transparent 1.5px), radial-gradient(circle at 18% 68%, ${CALM.accent} 0 1px, transparent 1.5px)` }} />
      {isMobile
        ? <MobileLayout goalName={goalName} current={current} reduced={reduced} revealProgress={revealProgress} short={isShortMobile} />
        : <DesktopLayout goalName={goalName} current={current} reduced={reduced} revealProgress={revealProgress} />}
    </div>
  );
}
