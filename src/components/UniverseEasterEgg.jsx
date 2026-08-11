import { useMemo } from 'react';
import UniversePlanet from './UniversePlanet';

const COLORS = {
  current: { accent: '#A997F2', panel: 'rgba(104, 82, 177, .18)', border: 'rgba(169, 151, 242, .42)' },
  reduced: { accent: '#69D5B3', panel: 'rgba(42, 132, 109, .18)', border: 'rgba(105, 213, 179, .42)' },
};

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '-';
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toLocaleString('ko-KR')}원` : '-';
}

function formatMonths(value) {
  if (value === null || value === undefined || value === '') return '도달 불가';
  return Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('ko-KR')}개월` : '도달 불가';
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
      <section style={{ width: '100%', minHeight: 78, padding: '13px 15px', border: `1px solid ${color.border}`, borderRadius: 16, background: `linear-gradient(110deg, ${color.panel}, rgba(13,14,25,.9))`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06), 0 16px 35px rgba(0,0,0,.28)', color: '#F4F2F8', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 72, flexShrink: 0, color: color.accent, fontSize: 12, fontWeight: 750, lineHeight: 1.35, textAlign: 'left' }}>{scenario?.title || '시나리오'}</div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,.11)', flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1.15fr', gap: 3 }}>
          <Metric label="월 저축" value={formatCompactMoney(scenario?.monthlySaving)} compact color={color.accent} />
          <Metric label="도달까지" value={formatMonths(scenario?.monthsToGoal)} compact color={color.accent} />
          <Metric label="예상 달성" value={formatCompactDate(scenario?.estimatedAchieveDate)} compact color={color.accent} />
        </div>
      </section>
    );
  }
  return (
    <section style={{
      width: 420,
      minHeight: 132,
      padding: '16px 20px 14px',
      border: `1px solid ${color.border}`,
      borderRadius: 18,
      background: `linear-gradient(135deg, ${color.panel}, rgba(13, 14, 25, .88))`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.07), 0 20px 50px rgba(0,0,0,.35), 0 0 24px ${color.panel}`,
      color: '#F4F2F8',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: compact ? 'flex-start' : 'center', gap: 12 }}>
        <div style={{ color: color.accent, fontSize: 15, fontWeight: 750, lineHeight: 1.3 }}>{scenario?.title || '시나리오'}</div>
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,.11)', margin: '12px 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.15fr', gap: 0 }}>
        <Metric label="월 저축액" value={formatMoney(scenario?.monthlySaving)} color={color.accent} divided />
        <Metric label="도달까지" value={formatMonths(scenario?.monthsToGoal)} color={color.accent} divided />
        <Metric label="예상 달성" value={formatDate(scenario?.estimatedAchieveDate)} color={color.accent} />
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
  const leftPlanet = mobile ? [88, 78] : [285, 130];
  const rightPlanet = mobile ? [302, 78] : [875, 130];
  const arc = (point) => `M${geometry.cx},${originY} Q${(geometry.cx + point[0]) / 2},${mobile ? 105 : 205} ${point[0]},${point[1]}`;
  return (
    <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`egg-grid-${mobile ? 'm' : 'd'}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#A997F2" stopOpacity=".35" />
          <stop offset=".5" stopColor="#7E88B8" stopOpacity=".4" />
          <stop offset="1" stopColor="#69D5B3" stopOpacity=".35" />
        </linearGradient>
        <radialGradient id={`egg-origin-${mobile ? 'm' : 'd'}`}><stop offset="0" stopColor="#FFFFFF" /><stop offset=".35" stopColor="#D9D3FA" /><stop offset="1" stopColor="#8176BA" /></radialGradient>
        <filter id={`egg-glow-${mobile ? 'm' : 'd'}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={mobile ? 3 : 5} /></filter>
      </defs>
      <g fill="none" stroke={`url(#egg-grid-${mobile ? 'm' : 'd'})`} strokeWidth="1">
        {geometry.meridians.map((path, index) => <path key={`m-${index}`} d={path} opacity=".42" />)}
        {geometry.rings.map((path, index) => <path key={`r-${index}`} d={path} opacity={.25 + index * .025} />)}
      </g>
      <path id={`egg-route-left-${mobile ? 'm' : 'd'}`} d={arc(leftPlanet)} fill="none" stroke="#A997F2" strokeWidth={mobile ? 1.8 : 2.3} strokeDasharray="7 7" strokeDashoffset={dashOffset}>
        <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="2.2s" repeatCount="indefinite" />
      </path>
      <path id={`egg-route-right-${mobile ? 'm' : 'd'}`} d={arc(rightPlanet)} fill="none" stroke="#69D5B3" strokeWidth={mobile ? 1.8 : 2.3} strokeDasharray="7 7" strokeDashoffset={dashOffset}>
        <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="2.2s" repeatCount="indefinite" />
      </path>
      {[.18, .38, .58, .78].map((portion, index) => <circle key={`ld-${index}`} cx={geometry.cx + (leftPlanet[0] - geometry.cx) * portion} cy={originY + (leftPlanet[1] - originY) * portion - Math.sin(portion * Math.PI) * (mobile ? 34 : 66)} r={mobile ? 3 : 4} fill="#B9A8FF" filter={`url(#egg-glow-${mobile ? 'm' : 'd'})`} />)}
      {[.18, .38, .58, .78].map((portion, index) => <circle key={`rd-${index}`} cx={geometry.cx + (rightPlanet[0] - geometry.cx) * portion} cy={originY + (rightPlanet[1] - originY) * portion - Math.sin(portion * Math.PI) * (mobile ? 34 : 66)} r={mobile ? 3 : 4} fill="#75E2C2" filter={`url(#egg-glow-${mobile ? 'm' : 'd'})`} />)}
      <circle cx={geometry.cx} cy={originY} r={mobile ? 16 : 26} fill="#A997F2" opacity=".18" filter={`url(#egg-glow-${mobile ? 'm' : 'd'})`} />
      <circle cx={geometry.cx} cy={originY} r={mobile ? 7 : 12} fill={`url(#egg-origin-${mobile ? 'm' : 'd'})`} />
      <RouteShip routeId={`egg-route-left-${mobile ? 'm' : 'd'}`} color="#A997F2" mobile={mobile} />
      <RouteShip routeId={`egg-route-right-${mobile ? 'm' : 'd'}`} color="#69D5B3" mobile={mobile} delay="1.2s" />
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

function DesktopLayout({ goalName, current, reduced, revealProgress }) {
  return (
    <>
      <header style={{ position: 'absolute', top: 70, left: 0, right: 0, zIndex: 6, textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '.08em', background: 'linear-gradient(90deg,#B59AFF,#EEF0FF 48%,#82E2C2)', WebkitBackgroundClip: 'text', color: 'transparent', textShadow: '0 0 30px rgba(171,154,255,.12)' }}>두 미래가 펼쳐졌어요</div>
        <div style={{ display: 'inline-flex', marginTop: 16, padding: '9px 23px', borderRadius: 999, background: 'rgba(255,255,255,.045)', border: '1px solid rgba(255,255,255,.11)', color: '#C5C2CC', fontSize: 13 }}>두 미래를 비교해 보세요</div>
      </header>
      <div style={{ position: 'absolute', top: 24, right: 31, zIndex: 7, padding: '11px 22px', borderRadius: 13, background: 'rgba(9,11,18,.62)', border: '1px solid rgba(255,255,255,.24)', color: '#ECE9F2', fontSize: 15, fontWeight: 650 }}>
        {goalName || '나만의 목표'}
      </div>
      <div style={{ position: 'absolute', inset: '80px 0 118px' }}><WellGrid revealProgress={revealProgress} /></div>
      <PlanetStage side="left" tone="stress" />
      <PlanetStage side="right" tone="calm" />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 94, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 126 }}>
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
  const glow = left ? 'rgba(169,151,242,.58)' : 'rgba(105,213,179,.58)';
  const size = 128;
  return (
    <div style={{ position: 'absolute', left: left ? 221 : 811, top: 146, zIndex: 4, width: size, height: size }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 210, height: 210, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle,${glow},transparent 62%)`, filter: 'blur(10px)', animation: 'universe-egg-glow 4s ease-in-out infinite' }} />
      <UniversePlanet tone={tone} size={size} />
    </div>
  );
}

function ConsoleBar({ compact = false }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: compact ? 42 : 74, zIndex: 3, borderTop: '1px solid rgba(255,255,255,.07)', background: 'linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: compact ? '0 26px' : '0 80px' }}>
      <ConsoleLights color="#A997F2" />
      <div style={{ width: compact ? 34 : 52, height: compact ? 34 : 52, borderRadius: '50%', border: '1px solid rgba(255,255,255,.13)', background: '#11131C', boxShadow: 'inset 0 5px 12px rgba(0,0,0,.7)', display: 'flex', justifyContent: 'center', paddingTop: compact ? 7 : 10 }}><span style={{ width: 2, height: compact ? 9 : 13, background: '#A997F2', boxShadow: '0 0 7px #A997F2' }} /></div>
      <ConsoleLights color="#69D5B3" reverse />
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
      <div style={{ maxWidth: 230, textAlign: 'center', fontSize: short ? 18 : 21, lineHeight: 1.22, fontWeight: 800, marginTop: short ? 7 : 12, background: 'linear-gradient(90deg,#B59AFF,#EEF0FF 48%,#82E2C2)', WebkitBackgroundClip: 'text', color: 'transparent' }}>두 미래가<br />펼쳐졌어요</div>
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
  const color = left ? 'rgba(169,151,242,.55)' : 'rgba(105,213,179,.55)';
  return (
    <div style={{ position: 'absolute', left: left ? '12%' : 'auto', right: left ? 'auto' : '12%', top: 24, width: size, height: size }}>
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
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: .55, backgroundImage: 'radial-gradient(circle at 11% 19%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 78% 14%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 89% 58%, #A997F2 0 1px, transparent 1.5px), radial-gradient(circle at 18% 68%, #69D5B3 0 1px, transparent 1.5px)' }} />
      {isMobile
        ? <MobileLayout goalName={goalName} current={current} reduced={reduced} revealProgress={revealProgress} short={isShortMobile} />
        : <DesktopLayout goalName={goalName} current={current} reduced={reduced} revealProgress={revealProgress} />}
    </div>
  );
}
