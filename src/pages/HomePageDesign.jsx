/** @jsxImportSource @emotion/react */
import { useId, useMemo, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { EmotionBlob } from '../components/common/EmotionBlob.jsx';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { getEmotion } from '../data/emotions.js';
import { money, percent } from '../utils/format.js';
import { useCalendarSummaryQuery, useEmotionSummaryQuery } from '../hooks/queries/useSummary.js';
import { HomeSummarySkeleton } from '../components/common/Skeleton.jsx';
import { useFeelioStore } from '../stores/useFeelioStore.js';

const Grid = styled.div`
  width: min(100%, 1420px);
  min-height: clamp(680px, calc(100dvh - 92px), 820px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(370px, .76fr);
  gap: clamp(8px, 1vw, 16px);
  align-items: stretch;
  padding-bottom: clamp(20px, 4vh, 40px);

  @media (max-width: 1180px) {
    grid-template-columns: minmax(0, 1fr) minmax(350px, .76fr);
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap: 19px;
    min-height: auto;
    display: flex;
    flex-direction: column;
    padding-bottom: 30px;
  }
`;

const Left = styled.div`
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(280px, 1fr) auto;
  gap: clamp(14px, 1.4vw, 18px);

  @media (max-width: 980px) {
    display: contents;
  }
`;

const Stage = styled.div`
  min-height: 0;
  display: grid;
  place-items: center;
  text-align: center;

  @media (max-width: 980px) {
    align-content: start;
    padding-top: 0;
    margin-top: -10px;
    order: 1;
  }
`;

const BlobHalo = styled.div`
  position: relative;
  width: clamp(330px, 30vw, 430px);
  height: clamp(330px, 30vw, 430px);
  display: grid;
  place-items: center;

  &::before {
    content: "";
    position: absolute;
    inset: 5%;
    border-radius: 50%;
    background: radial-gradient(circle, ${({ color }) => color}, transparent 62%);
    filter: blur(clamp(36px, 3vw, 48px));
    opacity: .56;
  }

  @media (max-width: 980px) {
    width: clamp(260px, 55vw, 360px);
    height: clamp(260px, 55vw, 360px);
  }
`;

const Ridge = styled(GlassCard)`
  min-height: 0;
  overflow: hidden;
  padding: ${({ expanded }) => expanded ? 'clamp(18px, 1.6vw, 22px) clamp(20px, 1.8vw, 26px) 0' : '22px'};
  border-radius: 26px;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (min-width: 981px) {
    cursor: default;
    padding: 16px clamp(16px, 1.5vw, 26px) 0;
  }

  @media (max-width: 980px) {
    order: 3;
  }
`;

const AccordionSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ expanded }) => expanded ? '14px' : '0'};
  font-size: 14.5px;
  font-weight: 900;
  
  @media (min-width: 981px) {
    cursor: default;
    padding-bottom: 14px; /* 데스크탑에선 항상 펼쳐진 상태 기준 여백 */
  }
`;

const Right = styled.div`
  min-height: 0;
  width: 100%;
  max-width: clamp(370px, 29vw, 420px);
  justify-self: start;
  display: grid;
  grid-template-rows: auto auto clamp(142px, 17vh, 168px);
  gap: clamp(12px, 1.4vw, 16px);
  padding-top: clamp(14px, 3vh, 34px);

  @media (max-width: 980px) {
    padding-top: 0;
    display: contents;
  }
`;

const Calendar = styled(GlassCard)`
  width: 100%;
  max-width: none;
  padding: ${({ expanded }) => expanded ? '18px 20px 22px' : '22px'};
  cursor: pointer;
  transition: all 0.3s ease;

  @media (min-width: 981px) {
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 0;
    cursor: default;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  @media (max-width: 980px) {
    max-width: none;
    margin: 0 auto;
    order: 2;
  }
`;

const MonthBar = styled.div`
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  strong {
    text-align: center;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 0;
  }
`;

const MonthButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--sub);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 18px;
  line-height: 1;
`;

const Week = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: clamp(3px, .36vw, 5px);
  margin-bottom: clamp(4px, .6vw, 7px);
  color: var(--sub);
  font-size: clamp(10px, .8vw, 11.5px);
  text-align: center;
`;

const PebbleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: clamp(3px, .36vw, 5px);
`;

const Pebble = styled.button`
  aspect-ratio: 1;
  min-width: 0;
  border-radius: 43%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: ${({ empty, selected, today, dark }) => {
    if (empty) return '1px solid transparent';
    return (selected || today) ? `1.5px solid rgba(255,255,255,${dark ? '.68' : '.96'})` : '1px solid var(--line)';
  }};
  background: ${({ empty, color, strong, dark, today }) => {
    if (empty) return 'transparent';
    if (!color) {
      if (today) return dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)';
      return 'linear-gradient(150deg, rgba(255,255,255,.26), transparent)';
    }
    const alpha1 = strong ? (dark ? '9C' : 'B4') : (dark ? '60' : '7C');
    const alpha2 = dark ? '12' : '26';
    const highlight = dark ? '.12' : '.34';
    return `radial-gradient(circle at 40% 24%, rgba(255,255,255,${highlight}), transparent 44%), linear-gradient(150deg, ${color}${alpha1}, ${color}${alpha2})`;
  }};
  color: ${({ empty, color, today, dark }) => {
    if (empty) return 'transparent';
    if (today && !color) return dark ? '#ffffff' : '#000000'; // 오늘 날짜 엄청 찐하게
    return color ? (dark ? '#F3F1F8' : '#fff') : 'var(--sub)';
  }};
  font-size: clamp(11px, .9vw, 13px);
  font-weight: ${({ selected, today }) => {
    if (today) return 900;
    if (selected) return 800;
    return 700;
  }};
  cursor: ${({ empty }) => empty ? 'default' : 'pointer'};
  pointer-events: ${({ empty }) => empty ? 'none' : 'auto'};
  backdrop-filter: ${({ empty }) => empty ? 'none' : 'blur(16px) saturate(1.35)'};
  -webkit-backdrop-filter: ${({ empty }) => empty ? 'none' : 'blur(16px) saturate(1.35)'};
  box-shadow: ${({ empty, selected, today, dark }) => {
    if (empty) return 'none';
    const selectedRing = selected ? `, 0 0 0 3.5px #A1A6B4, 0 0 14px rgba(161,166,180,0.8)` : '';
    const todayRing = (!selected && today) ? `, 0 0 0 2.5px rgba(161,166,180,0.45)` : '';
    return dark
      ? `inset 0 1px 1px rgba(255,255,255,.16), inset 0 0 14px rgba(255,255,255,.03), 0 8px 20px -16px rgba(0,0,0,.55)${selectedRing}${todayRing}`
      : `inset 0 1px 1.5px rgba(255,255,255,.5), inset 0 -8px 20px rgba(70,55,44,.045), 0 12px 26px -22px rgba(70,55,44,.36)${selectedRing}${todayRing}`;
  }};
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: clamp(7px, .8vw, 10px);

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--sub);
    font-size: clamp(10.5px, .8vw, 11.5px);
  }

  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
`;

const Signal = styled(GlassCard)`
  width: 100%;
  min-height: 0;
  padding: clamp(13px, 1.3vw, 17px) clamp(18px, 1.6vw, 22px);
  border-radius: 24px;

  @media (max-width: 980px) {
    order: 5;
  }
`;

const Goal = styled(GlassCard)`
  min-height: 0;
  padding: clamp(16px, 1.6vw, 22px);
  border-radius: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 980px) {
    order: 4;
  }
`;

const Bar = styled.div`
  height: 9px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--line);

  span {
    display: block;
    width: ${({ value }) => value}%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #F2A65E, #F28AB7);
  }
`;

const emptyBlobShape =
  'M100 38C148 38 174 76 172 120C171 146 158 162 150 162C141 162 139 172 126 172C116 172 114 162 100 162C86 162 84 172 74 172C61 172 59 162 50 162C42 162 29 146 28 120C26 76 52 38 100 38Z';

function EmptyEmotionBlob({ size = 260, dark = false }) {
  const id = `empty-${useId().replace(/:/g, '')}`;
  const width = size;
  const height = size * 1.2;
  const bodyHeight = size * 1.025;
  const colors = dark
    ? { fill: '#ffffff', o0: 0.17, o1: 0.07, o2: 0.02, stroke: 'rgba(255,255,255,.30)', sheen: 0.42, eye: '#8A85A3', mark: '#9B8CFF' }
    : { fill: '#7A7896', o0: 0.20, o1: 0.10, o2: 0.03, stroke: 'rgba(70,70,105,.32)', sheen: 0.55, eye: '#6C6785', mark: '#7C6BE0' };

  return (
    <div css={{
      width,
      height,
      position: 'relative',
      animation: 'es-float 5s ease-in-out infinite',
      '@keyframes es-float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      '@keyframes es-breathe': { '0%,100%': { transform: 'scale(1,1)' }, '50%': { transform: 'scale(1.03,.97)' } },
      '@keyframes es-tilt': { '0%,100%': { transform: 'rotate(-4deg)' }, '50%': { transform: 'rotate(4deg)' } },
      '@keyframes es-look': { '0%,16%,92%,100%': { transform: 'translate(0,0)' }, '30%,46%': { transform: 'translate(-5px,-2px)' }, '60%,78%': { transform: 'translate(5px,-1px)' } },
      '@keyframes es-qpulse': { '0%,100%': { transform: 'translateX(-50%) scale(1) translateY(0)', opacity: .5 }, '50%': { transform: 'translateX(-50%) scale(1.18) translateY(-3px)', opacity: 1 } },
      '@media (prefers-reduced-motion: reduce)': { '*': { animation: 'none !important' } }
    }}>
      <div css={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', animation: 'es-qpulse 1.8s ease-in-out infinite' }}>
        <svg width={size * .32} height={size * .32} viewBox="0 0 40 40">
          <text x="20" y="31" textAnchor="middle" fontSize="36" fontWeight="800" fill={colors.mark} fontFamily="system-ui,-apple-system,sans-serif">?</text>
        </svg>
      </div>
      <div css={{ position: 'absolute', bottom: 0, left: 0, width, height: bodyHeight, animation: 'es-tilt 4.5s ease-in-out infinite', transformOrigin: '50% 90%' }}>
        <div css={{ position: 'absolute', inset: 0, animation: 'es-breathe 4s ease-in-out infinite', transformOrigin: '50% 88%' }}>
          <svg width={width} height={bodyHeight} viewBox="0 0 200 205" css={{ position: 'absolute', inset: 0 }}>
            <defs>
              <radialGradient id={`${id}-glass`} cx="50%" cy="45%" r="66%">
                <stop offset="0%" stopColor={colors.fill} stopOpacity={colors.o0} />
                <stop offset="60%" stopColor={colors.fill} stopOpacity={colors.o1} />
                <stop offset="100%" stopColor={colors.fill} stopOpacity={colors.o2} />
              </radialGradient>
              <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={colors.sheen} />
                <stop offset="32%" stopColor="#ffffff" stopOpacity={colors.sheen * .19} />
                <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <clipPath id={`${id}-clip`}><path d={emptyBlobShape} /></clipPath>
              <filter id={`${id}-wobble`} x="-45%" y="-45%" width="190%" height="190%">
                <feTurbulence type="fractalNoise" baseFrequency="0.011 0.0126" numOctaves="2" seed="7" result="noise">
                  <animate attributeName="baseFrequency" dur="14s" repeatCount="indefinite" values="0.011 0.0126; 0.014 0.016; 0.011 0.0126" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                <feGaussianBlur in="displaced" stdDeviation="1.4" />
              </filter>
            </defs>
            <g filter={`url(#${id}-wobble)`}>
              <path d={emptyBlobShape} fill={`url(#${id}-glass)`} stroke={colors.stroke} strokeWidth="1.6" />
              <g clipPath={`url(#${id}-clip)`}><rect x="0" y="0" width="200" height="205" fill={`url(#${id}-sheen)`} /></g>
            </g>
            <g css={{ animation: 'es-look 3.6s ease-in-out infinite' }}>
              <circle cx="86" cy="108" r="4.2" fill={colors.eye} />
              <circle cx="114" cy="108" r="4.2" fill={colors.eye} />
            </g>
            <path d="M96 122 Q100 125 104 122" stroke={colors.eye} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function EmptyRidge({ dark = false }) {
  const mist = useMemo(() => [{ x: 150, w: 230, h: 28 }, { x: 360, w: 250, h: 34 }, { x: 480, w: 220, h: 24 }], []);
  const width = 600;
  const height = 120;
  const base = height + 4;
  const path = (cx, w, h) => `M ${cx - w} ${base} C ${cx - w * .4} ${base} ${cx - w * .3} ${base - h} ${cx} ${base - h} C ${cx + w * .3} ${base - h} ${cx + w * .4} ${base} ${cx + w} ${base} Z`;
  const mistColor = dark ? '#6b6f9a' : '#9ba5c9';
  const lineColor = dark ? 'rgba(255,255,255,.14)' : 'rgba(70,70,105,.16)';
  const dotColor = dark ? '#9b8cff' : '#7C6BE0';

  return (
    <>
      <div css={{ fontSize: 14.5, fontWeight: 900 }}>감정 능선</div>
      <div css={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>이번 달 감정이 흘러온 결</div>
      <div css={{
        height: 150,
        position: 'relative',
        margin: '6px -22px 0',
        '@keyframes es-mist': { '0%,100%': { transform: 'translateX(0)' }, '50%': { transform: 'translateX(-10px)' } },
        '@keyframes es-twinkle': { '0%,100%': { opacity: .25, transform: 'translateY(0)' }, '50%': { opacity: .75, transform: 'translateY(-4px)' } }
      }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" css={{ display: 'block', position: 'absolute', inset: 0 }}>
          <defs>
            <filter id="empty-ridge-soft" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="12" /></filter>
            <linearGradient id="empty-ridge-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fff" stopOpacity="0" />
              <stop offset="9%" stopColor="#fff" stopOpacity="1" />
              <stop offset="91%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="empty-ridge-mask"><rect width={width} height={base + 4} fill="url(#empty-ridge-fade)" /></mask>
          </defs>
          <g mask="url(#empty-ridge-mask)">
            <g css={{ animation: 'es-mist 9s ease-in-out infinite' }}>
              {mist.map((item, index) => <path key={index} d={path(item.x, item.w, item.h)} fill={mistColor} opacity={dark ? .2 : .24} filter="url(#empty-ridge-soft)" css={{ mixBlendMode: dark ? 'screen' : 'multiply' }} />)}
            </g>
            <line x1="20" y1={base} x2={width - 20} y2={base} stroke={lineColor} strokeWidth="1.5" strokeDasharray="2 9" strokeLinecap="round" />
            {[{ x: 170, y: 78, r: 2.4, d: '6s' }, { x: 300, y: 62, r: 3, d: '7.5s' }, { x: 300, y: 96, r: 1.8, d: '5s' }, { x: 430, y: 84, r: 2.2, d: '6.8s' }].map((star, index) => (
              <circle key={index} cx={star.x} cy={star.y} r={star.r} fill={dotColor} opacity=".5" css={{ animation: `es-twinkle ${star.d} ease-in-out infinite`, mixBlendMode: dark ? 'screen' : 'multiply' }} />
            ))}
          </g>
        </svg>
      </div>
      <div css={{ fontSize: 12.5, color: 'var(--sub)', padding: '8px 0 14px' }}>첫 소비에 기분을 붙이면 감정 능선이 솟아나기 시작해요</div>
    </>
  );
}

const defaultRidgeData = [['화남', 8], ['평온', 15], ['외로움', 38], ['스트레스', 22], ['신남', 12], ['무덤덤', 5]];
const ridgeEmotions = ['화남', '평온', '외로움', '스트레스', '신남', '무덤덤'];

function getEmotionRidgeData(emotions) {
  if (!emotions || emotions.length === 0) return defaultRidgeData;
  const maxCount = Math.max(...emotions.map(e => e.count), 1);
  return ridgeEmotions.map(name => {
    const item = emotions.find(e => e.name === name);
    const count = item ? item.count : 0;
    return [name, Math.max(5, Math.round((count / maxCount) * 38))];
  });
}

function getEmotionSignals(emotions, prevMonth) {
  const signals = [];
  emotions.forEach(curr => {
    const prev = prevMonth.find(e => e.name === curr.name);
    const prevAmount = prev ? prev.amount : 0;
    const currAmount = curr.amount;
    
    if (prevAmount === 0 && currAmount > 0) {
      signals.push({ name: curr.name, rate: 100, delta: '▲ 100%' });
    } else if (prevAmount > 0) {
      const rate = Math.round(((currAmount - prevAmount) / prevAmount) * 100);
      if (rate !== 0) {
        signals.push({ name: curr.name, rate, delta: rate > 0 ? `▲ ${rate}%` : `▼ ${Math.abs(rate)}%` });
      }
    }
  });
  
  return signals.sort((a, b) => Math.abs(b.rate) - Math.abs(a.rate)).slice(0, 3);
}

function getCalendarCells(daysData, visibleMonth) {
  const txMap = new Map();
  daysData.forEach(item => {
    let dateStr = item.date;
    if (Array.isArray(item.date)) {
      // Spring Boot LocalDate array format: [2026, 7, 1]
      dateStr = `${item.date[0]}-${String(item.date[1]).padStart(2, '0')}-${String(item.date[2]).padStart(2, '0')}`;
    } else if (typeof item.date === 'string') {
      dateStr = item.date.slice(0, 10);
    }
    txMap.set(dateStr, item.dominantEmotion?.name);
  });
  
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const lead = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const empty = Array.from({ length: lead }, (_, index) => ({ id: `empty-${index}`, empty: true }));
  const days = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const emotion = txMap.get(key);
    return { id: `day-${day}`, day, emotion, strong: Boolean(emotion), today: year === 2026 && month === 6 && day === 1 };
  });
  const cells = [...empty, ...days];
  const trailing = Array.from(
    { length: Math.max(0, 42 - cells.length) },
    (_, index) => ({ id: `trailing-${index}`, empty: true })
  );
  return [...cells, ...trailing];
}

function ridgePath(cx, width, height, base = 172) {
  return `M ${(cx - width).toFixed(1)} ${base} C ${(cx - width * .42).toFixed(1)} ${base} ${(cx - width * .32).toFixed(1)} ${(base - height).toFixed(1)} ${cx.toFixed(1)} ${(base - height).toFixed(1)} C ${(cx + width * .32).toFixed(1)} ${(base - height).toFixed(1)} ${(cx + width * .42).toFixed(1)} ${base} ${(cx + width).toFixed(1)} ${base} Z`;
}

export default function HomePageDesign({ state, onRoute, selectedDate, onSelectDate }) {
  const [fallbackDate] = useState(() => new Date(2026, 6, 1));
  const selected = selectedDate || fallbackDate;
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const lastClickTimeRef = useRef({});
  const [isRidgeExpanded, setIsRidgeExpanded] = useState(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    if (visibleMonth.getFullYear() !== selected.getFullYear() || visibleMonth.getMonth() !== selected.getMonth()) {
      setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }

  // Fetch calendar summary data from API
  const { data: calendarData, isLoading: isCalendarLoading } = useCalendarSummaryQuery(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1);
  const serverDays = calendarData?.days || [];

  // Fetch emotion summary data from API
  const { data: emotionData, isLoading: isEmotionLoading } = useEmotionSummaryQuery(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1);
  const isSummaryLoading = isCalendarLoading || isEmotionLoading;
  const serverEmotions = emotionData?.emotions || [];
  const serverPrevEmotions = emotionData?.prevMonth || [];

  const hasMonthlyTransactions = serverEmotions.length > 0;
  const hasEnoughRidgeData = serverEmotions.length >= 5;
  
  const selectedDayKey = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`;
  
  // 1. 선택한 날짜에 기록이 있는지?
  const selectedDayEmotion = serverDays.find(d => {
    let dStr = d.date;
    if (Array.isArray(d.date)) dStr = `${d.date[0]}-${String(d.date[1]).padStart(2, '0')}-${String(d.date[2]).padStart(2, '0')}`;
    else if (typeof d.date === 'string') dStr = d.date.slice(0, 10);
    return dStr === selectedDayKey;
  })?.dominantEmotion?.name;
  
  // 2. 이번 달에 기록이 있는지?
  const hasAnyEmotionsThisMonth = serverDays.length > 0;
  let topMonthEmotion = null;
  if (hasAnyEmotionsThisMonth) {
    const counts = serverDays.reduce((acc, d) => {
      const name = d.dominantEmotion?.name;
      if (name) acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    topMonthEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  }

  // 3. 우선순위에 따라 렌더링할 감정 결정
  const displayEmotion = selectedDayEmotion || topMonthEmotion || null;
  const showEmptyBlob = displayEmotion === null;
  const dark = state.mode === 'dark';
  const topMeta = showEmptyBlob ? { color: dark ? '#9B8CFF' : '#7C6BE0' } : getEmotion(displayEmotion);

  const goals = useStore((store) => store.state.goals || []);
  const primaryGoal = goals.find(g => g.isMain) || goals[0];
  const goal = primaryGoal ? {
    name: primaryGoal.name,
    current: primaryGoal.current ?? primaryGoal.currentAmount ?? 0,
    target: primaryGoal.target ?? primaryGoal.targetAmount ?? 1
  } : { name: '등록된 목표 없음', current: 0, target: 1 };
  
  const goalPct = percent(goal.current, goal.target);
  const days = getCalendarCells(serverDays, visibleMonth);
  const ridgeData = hasEnoughRidgeData ? getEmotionRidgeData(serverEmotions) : defaultRidgeData;
  const ridgePeak = ridgeData.reduce((max, item) => item[1] > max[1] ? item : max, ridgeData[0]);
  const slot = 560 / ridgeData.length;
  const signals = getEmotionSignals(serverEmotions, serverPrevEmotions);
  const monthLabel = `${visibleMonth.getFullYear()}년 ${visibleMonth.getMonth() + 1}월`;
  const moveMonth = (step) => setVisibleMonth(prev => {
    const next = new Date(prev.getFullYear(), prev.getMonth() + step, 1);
    onSelectDate?.(next);
    return next;
  });

  const selectDay = (day, dateKey, now) => {
    const lastClick = lastClickTimeRef.current[dateKey] || 0;

    if (dateKey === selectedDayKey || now - lastClick < 600) {
      onRoute?.('transactions');
    } else {
      lastClickTimeRef.current[dateKey] = now;
      onSelectDate?.(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
    }
  };

  return (
    <Grid>
      <Left>
        {isSummaryLoading ? <HomeSummarySkeleton /> : <>
        <Stage>
          <div>
            <BlobHalo color={topMeta.color}>
              <div css={{ position: 'relative', display: 'grid', placeItems: 'center', width: 'clamp(260px, 22vw, 320px)', height: !showEmptyBlob ? 'clamp(230px, 20vw, 290px)' : 'clamp(310px, 26vw, 360px)' }}>
                {!showEmptyBlob
                  ? <EmotionBlob emotion={displayEmotion} size={300} />
                  : <EmptyEmotionBlob size={280} dark={dark} />}
              </div>
            </BlobHalo>
            <div css={{ fontSize: 12, color: 'var(--sub)', fontWeight: 800, marginTop: 12 }}>
              {showEmptyBlob ? '아직 감정을 기다리는 중' : selectedDayEmotion ? '선택한 날에 가장 오래 머문 마음' : '선택한 날에는 감정 기록이 없어요'}
            </div>
            <div css={{ fontSize: 24, color: !showEmptyBlob ? topMeta.color : (dark ? '#9B8CFF' : '#7C6BE0'), fontWeight: 900, letterSpacing: '-.02em', marginTop: 2 }}>
              {!showEmptyBlob ? `${displayEmotion} 말랑이` : '감정 말랑이'}
            </div>
          </div>
        </Stage>

        <Ridge expanded={isRidgeExpanded} onClick={() => setIsRidgeExpanded(!isRidgeExpanded)}>
          {hasEnoughRidgeData ? (
            <>
              <AccordionSummary expanded={isRidgeExpanded}>
                <div css={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A68BEA" strokeWidth="1.9"><path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span css={{ fontSize: 14.5, fontWeight: 900 }}>감정 능선</span>
                  <span css={{ fontSize: 12, color: 'var(--sub)', fontWeight: 500, marginLeft: 2 }}>이번 달 감정이 흘러온 결</span>
                </div>
                <div css={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!isRidgeExpanded && (
                    <span css={{ color: 'var(--sub)', fontSize: 12, fontWeight: 800, '@media (min-width: 981px)': { display: 'none' } }}>
                      가장 높은 감정: <b css={{ color: getEmotion(ridgePeak[0]).color }}>{ridgePeak[0]}</b>
                    </span>
                  )}
                  <span css={{ color: 'var(--sub)', fontSize: 16, '@media (min-width: 981px)': { display: 'none' } }}>{isRidgeExpanded ? '▴' : '▾'}</span>
                </div>
              </AccordionSummary>
              <div css={{ display: isRidgeExpanded ? 'block' : 'none', '@media (min-width: 981px)': { display: 'block' } }}>
                <div css={{ height: 150, position: 'relative', margin: '0', overflow: 'hidden' }}>
                  <svg viewBox="0 0 600 170" width="100%" height="100%" preserveAspectRatio="none" css={{ display: 'block', position: 'absolute', inset: 0 }}>
                    <defs>
                      <linearGradient id="ridgeFadeDesign" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#fff" stopOpacity=".35" />
                        <stop offset="42%" stopColor="#fff" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                      </linearGradient>
                      <mask id="ridgeMaskDesign"><rect width="600" height="170" fill="url(#ridgeFadeDesign)" /></mask>
                    </defs>
                    <g mask="url(#ridgeMaskDesign)" filter="blur(2.5px)">
                      {ridgeData.map(([name, value], index) => {
                        const cx = 20 + slot * (index + .5);
                        const height = 34 + (value / 38) * 120;
                        return <path key={name} d={ridgePath(cx, slot * 1.15, height)} fill={getEmotion(name).color} opacity=".5" css={{ mixBlendMode: dark ? 'screen' : 'multiply' }} />;
                      })}
                    </g>
                  </svg>
                </div>
                <div css={{ fontSize: 12.5, color: 'var(--sub)', padding: '8px 22px 14px' }}>이번 달은 <b css={{ color: getEmotion(ridgePeak[0]).color }}>{ridgePeak[0]}</b>이 가장 높이 솟았어요</div>
              </div>
            </>
          ) : (
            <EmptyRidge dark={dark} />
          )}
        </Ridge>
        </>}
      </Left>

      <Right>
        <Calendar expanded={isCalendarExpanded} onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}>
          <AccordionSummary expanded={isCalendarExpanded}>
            <div css={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#76A7E8" strokeWidth="1.9"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" /><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" /><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>{monthLabel} 캘린더</span>
            </div>
            <span css={{ color: 'var(--sub)', fontSize: 16, '@media (min-width: 981px)': { display: 'none' } }}>{isCalendarExpanded ? '▴' : '▾'}</span>
          </AccordionSummary>
          <div onClick={e => e.stopPropagation()} css={{ cursor: 'default', display: isCalendarExpanded ? 'block' : 'none', '@media (min-width: 981px)': { display: 'block' } }}>
            <MonthBar>
              <MonthButton type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">‹</MonthButton>
              <strong>{monthLabel}</strong>
              <MonthButton type="button" onClick={() => moveMonth(1)} aria-label="다음 달">›</MonthButton>
            </MonthBar>
            <Week>{['일', '월', '화', '수', '목', '금', '토'].map(day => <span key={day}>{day}</span>)}</Week>
            <PebbleGrid>
              {days.map(item => {
                if (item.empty) return <Pebble key={item.id} empty disabled aria-hidden="true" />;
                const color = item.emotion ? getEmotion(item.emotion).color : undefined;
                const dateKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
                return <Pebble key={item.id} color={color} strong={item.strong} selected={dateKey === selectedDayKey} today={item.today} dark={dark} onClick={event => selectDay(item.day, dateKey, event.timeStamp)}>{item.day}</Pebble>;
              })}
            </PebbleGrid>
            <Legend>{['스트레스', '외로움', '평온', '뿌듯함'].map(name => <span key={name}><i style={{ background: getEmotion(name).color }} />{name}</span>)}</Legend>
          </div>
        </Calendar>

        <Goal onClick={() => onRoute('universe')}>
          <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div css={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#83C9B0" strokeWidth="1.9"><circle cx="12" cy="12" r="4.5" /><ellipse cx="12" cy="12" rx="10" ry="3.6" transform="rotate(-25 12 12)" /></svg>
              <span css={{ fontSize: 14, fontWeight: 900 }}>{goal.name}</span>
            </div>
            <span css={{ color: '#3E9578', fontSize: 12.5, fontWeight: 900 }}>{goalPct}%</span>
          </div>
          <Bar value={goalPct}><span /></Bar>
          <div css={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 10, color: 'var(--sub)', fontSize: 12 }}>
            <span>{money(goal.current)} / {money(goal.target)}</span>
            <span>{money(goal.target - goal.current)} 남음 →</span>
          </div>
        </Goal>

        <Signal>
          <div css={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <b css={{ width: 25, height: 25, borderRadius: 9, background: 'var(--ink)', color: 'var(--on-ink)', display: 'grid', placeItems: 'center', fontSize: 10 }}>AI</b>
            <span css={{ color: 'var(--sub)', fontSize: 11.5, fontWeight: 800 }}>이번 달 감정 신호</span>
          </div>
          {hasMonthlyTransactions ? (
            <>
              <div css={{ fontSize: 14.5, fontWeight: 900, lineHeight: 1.35 }}>
                {signals.length > 0 && signals[0].rate > 0 
                  ? `이번 달은 ${signals[0].name} 소비가 조금 늘고 있어요.` 
                  : '감정 소비가 안정적으로 관리되고 있어요.'}
              </div>
              <div css={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0 7px', borderTop: '1px solid var(--line)', marginTop: 8 }}>
                {signals.length > 0 ? (
                  signals.map(({ name, delta }) => (
                    <span key={name} css={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--sub)', fontSize: 11.5, fontWeight: 800 }}>
                      <i css={{ width: 7, height: 7, borderRadius: '50%', background: getEmotion(name).color }} />{name} {delta}
                    </span>
                  ))
                ) : (
                  <span css={{ color: 'var(--sub)', fontSize: 11.5, fontWeight: 800 }}>아직 뚜렷한 감정 소비 신호가 없습니다.</span>
                )}
              </div>
              <button type="button" onClick={() => onRoute('analysis')} css={{ border: 0, padding: 0, background: 'transparent', color: 'var(--sub)', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>분석 자세히 보기 →</button>
            </>
          ) : (
            <>
              <div css={{ fontSize: 14.5, fontWeight: 900, lineHeight: 1.35 }}>아직 기록된 소비가 없어요.</div>
              <div css={{ color: 'var(--sub)', fontSize: 12.5, lineHeight: 1.55, paddingTop: 8, borderTop: '1px solid var(--line)', marginTop: 8 }}>첫 기록을 남기면 감정 신호가 여기에서 천천히 보이기 시작해요.</div>
            </>
          )}
        </Signal>
      </Right>
    </Grid>
  );
}
