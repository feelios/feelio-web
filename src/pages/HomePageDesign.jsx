/** @jsxImportSource @emotion/react */
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { EmotionBlob } from '../components/common/EmotionBlob.jsx';
import { EmptyEmotionBlob } from '../components/common/EmptyEmotionBlob.jsx';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { getEmotion } from '../data/emotions.js';
import { money, percent } from '../utils/format.js';
import { useCalendarSummaryQuery, useEmotionSummaryQuery } from '../hooks/queries/useSummary.js';
import { useGoalsQuery } from '../hooks/queries/useGoals.js';
import { useBudgetStore } from '../stores/budgetStore.js';
import { HomeSummarySkeleton } from '../components/common/Skeleton.jsx';

const Grid = styled.div`
  width: 100%;
  min-height: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: clamp(620px, 52vw, 840px) minmax(0, 1fr);
  gap: 100px;
  align-items: stretch;

  @media (max-width: 1180px) {
    grid-template-columns: clamp(540px, 50vw, 740px) minmax(0, 1fr);
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap: 9px;
    height: auto;
    min-height: auto;
    overflow: visible;
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
    padding-top: 64px;
    margin-top: 0;
    order: 1;
  }
`;

const BlobHalo = styled.div`
  position: relative;
  width: clamp(380px, 34vw, 500px);
  height: clamp(380px, 34vw, 500px);
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
    width: clamp(252px, 62vw, 336px);
    height: clamp(252px, 62vw, 336px);
    overflow: visible;
  }
`;

const Ridge = styled(GlassCard)`
  min-height: 0;
  overflow: hidden;
  padding: ${({ expanded }) => expanded ? 'clamp(18px, 1.6vw, 22px) clamp(20px, 1.8vw, 26px) 0' : '22px'};
  border-radius: 26px;
  cursor: pointer;
  transition: padding 0.3s ease;

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
  max-width: none;
  justify-self: stretch;
  display: grid;
  grid-template-rows: auto 1fr 1fr;
  gap: clamp(10px, 1.1vw, 13px);
  padding-top: clamp(8px, 1.4vh, 16px);

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
    padding: 0 8px;
    cursor: default;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  @media (max-width: 980px) {
    order: 5;
  }
`;

const MonthBar = styled.div`
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

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
  position: relative;
  aspect-ratio: 1;
  min-width: 0;
  border-radius: 43%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 오늘(미선택): 숫자 아래 은은한 점 */
  ${({ today, selected, empty }) => (today && !selected && !empty) ? `
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 14%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: currentColor;
      opacity: .6;
    }
  ` : ''}
  border: ${({ empty }) => empty ? '1px solid transparent' : '1px solid var(--line)'};
  background: ${({ empty, color, strong, dark }) => {
    if (empty) return 'transparent';
    if (!color) return 'linear-gradient(150deg, rgba(255,255,255,.26), transparent)';
    const alpha1 = strong ? (dark ? '9C' : 'B4') : (dark ? '60' : '7C');
    const alpha2 = dark ? '12' : '26';
    const highlight = dark ? '.12' : '.34';
    return `radial-gradient(circle at 40% 24%, rgba(255,255,255,${highlight}), transparent 44%), linear-gradient(150deg, ${color}${alpha1}, ${color}${alpha2})`;
  }};
  color: ${({ empty, color, dark }) => {
    if (empty) return 'transparent';
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
  box-shadow: ${({ empty, selected, dark }) => {
    if (empty) return 'none';
    // 선택: 연 그레이 링 / 오늘: 숫자 아래 점(dot, ::after)
    const selectedRing = selected ? `, 0 0 0 2px ${dark ? 'rgba(235,235,242,.5)' : '#B4B4BF'}` : '';
    const todayRing = '';
    return dark
      ? `inset 0 1px 1px rgba(255,255,255,.16), inset 0 0 14px rgba(255,255,255,.03), 0 8px 20px -16px rgba(0,0,0,.55)${selectedRing}${todayRing}`
      : `inset 0 1px 1.5px rgba(255,255,255,.5), inset 0 -8px 20px rgba(70,55,44,.045), 0 12px 26px -22px rgba(70,55,44,.36)${selectedRing}${todayRing}`;
  }};
`;

const Signal = styled(GlassCard)`
  width: 100%;
  min-height: 0;
  padding: clamp(13px, 1.3vw, 17px) clamp(18px, 1.6vw, 22px);
  border-radius: 24px;

  @media (max-width: 980px) {
    order: 2;
    margin-top: 14px;
    padding: 20px 20px 18px;
  }
`;

const bubblePop = keyframes`
  0% { transform: scale(1); }
  28% { transform: scale(1.13) translateY(-3px); }
  55% { transform: scale(.95) translateY(0); }
  100% { transform: scale(1); }
`;

const BubbleStack = styled.div`
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 9px;
  margin-left: -34px;

  @media (max-width: 980px) {
    align-items: center;
    gap: 7px;
    margin-left: 0;
    margin-bottom: -20px;
  }
`;

const Bubble = styled.div`
  padding: 10px 16px;
  border-radius: 20px;
  white-space: nowrap;
  background: linear-gradient(180deg, rgba(255, 255, 255, .92), rgba(255, 255, 255, .66));
  border: 1px solid rgba(255, 255, 255, .9);
  color: #3A2F26;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.3;
  text-align: center;
  box-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 1), inset 0 -3px 7px rgba(150, 120, 90, .12);
  backdrop-filter: blur(16px) saturate(1.25);
  -webkit-backdrop-filter: blur(16px) saturate(1.25);
  cursor: default;
  transition: transform .24s cubic-bezier(.34, 1.6, .64, 1);

  &:hover { transform: translateY(-3px) scale(1.045); }
  &:active { transform: scale(1.08, .9); }

  @media (max-width: 980px) {
    font-size: 11.5px;
    padding: 8px 13px;
    border-radius: 17px;
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

const Deck = styled.div`
  min-height: 0;
  min-width: 0;
  max-width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;

  @media (max-width: 980px) {
    order: 4;
  }
`;

const DeckTrack = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 4px 0;
  scrollbar-width: none;
  cursor: grab;

  &:active { cursor: grabbing; }
  &::-webkit-scrollbar { display: none; }
`;

const DeckCell = styled.div`
  flex: 0 0 100%;
  scroll-snap-align: center;
`;

const DeckCard = styled(GlassCard)`
  height: 100%;
  min-height: 140px;
  padding: 28px 22px 14px;
  border-radius: 24px;
  cursor: ${({ tappable }) => tappable ? 'pointer' : 'default'};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const DeckDots = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 14px;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
`;

const DeckSep = styled.span`
  width: 1px;
  height: 10px;
  background: var(--line);
  margin: 0 3px;
`;

const DeckDot = styled.button`
  width: ${({ active }) => active ? 20 : 7}px;
  height: 7px;
  border-radius: 999px;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: ${({ active, first }) => active ? (first ? '#3E9578' : 'var(--ink)') : 'var(--line)'};
  transition: width .25s ease, background .25s ease;
`;

function AssetGoalDeck({ totalAsset, goals, onRoute, onSaveToGoal }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const savedTotal = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const cards = [{ type: 'asset' }, ...goals.map((g) => ({ type: 'goal', goal: g }))];

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, k) => {
      const mid = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < bestDist) { bestDist = dist; best = k; }
    });
    setActive((prev) => (prev === best ? prev : best));
  };

  const goTo = (k) => {
    const el = trackRef.current;
    const child = el?.children[k];
    if (child) el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2, behavior: 'smooth' });
  };

  // 마우스 드래그로도 넘길 수 있게 (터치는 네이티브 스크롤 사용)
  const dragRef = useRef({ down: false, startX: 0, startScroll: 0, moved: false });
  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse') return;
    if (event.target.closest('button')) return; // 카드 안 버튼(저금하기 등) 클릭은 드래그로 가로채지 않음
    const el = trackRef.current;
    dragRef.current = { down: true, startX: event.clientX, startScroll: el.scrollLeft, moved: false };
    el.style.scrollSnapType = 'none';
    el.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event) => {
    const state = dragRef.current;
    if (!state.down) return;
    const dx = event.clientX - state.startX;
    if (Math.abs(dx) > 4) state.moved = true;
    trackRef.current.scrollLeft = state.startScroll - dx;
  };
  const onPointerUp = () => {
    if (!dragRef.current.down) return;
    dragRef.current.down = false;
    const el = trackRef.current;
    el.style.scrollSnapType = '';
  };

  return (
    <Deck>
      <DeckTrack
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {cards.map((card) => (
          <DeckCell key={card.type === 'goal' ? `g${card.goal.goalId}` : 'asset'}>
            {card.type === 'asset' ? (
              <DeckCard>
                <div css={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span css={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#83C9B033', color: '#3E9578', flex: '0 0 auto' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><rect x="3" y="6" width="18" height="13" rx="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 10h18" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span css={{ fontSize: 12, fontWeight: 800, color: 'var(--sub)' }}>총자산</span>
                </div>
                <div css={{ fontSize: 32, fontWeight: 900, letterSpacing: '-.035em', lineHeight: 1.05, marginTop: 10 }}>{money(totalAsset)}</div>
                <div css={{ color: 'var(--sub)', fontSize: 12.5, fontWeight: 700, marginTop: 7 }}>목표와 별개인 나의 자산이에요</div>
                {goals.length > 0 && (
                  <div css={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, fontWeight: 800, color: 'var(--sub)' }}>
                    <span css={{ width: 6, height: 6, borderRadius: '50%', background: '#83C9B0', flex: '0 0 auto' }} />
                    목표 {goals.length}곳에 {money(savedTotal)} 모으는 중
                  </div>
                )}
              </DeckCard>
            ) : (
              <DeckCard tappable onClick={() => { if (!dragRef.current.moved) onRoute('universe'); }}>
                <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div css={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#83C9B0" strokeWidth="1.9"><circle cx="12" cy="12" r="4.5" /><ellipse cx="12" cy="12" rx="10" ry="3.6" transform="rotate(-25 12 12)" /></svg>
                    <span css={{ fontSize: 14, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.goal.name}</span>
                    {card.goal.isMain && <span css={{ flex: '0 0 auto', fontSize: 10, fontWeight: 800, color: '#3E9578', background: '#83C9B033', padding: '2px 7px', borderRadius: 99 }}>대표</span>}
                  </div>
                  <span css={{ color: '#3E9578', fontSize: 12.5, fontWeight: 900, flex: '0 0 auto' }}>{percent(card.goal.currentAmount, card.goal.targetAmount)}%</span>
                </div>
                <Bar value={percent(card.goal.currentAmount, card.goal.targetAmount)}><span /></Bar>
                <div css={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 10, color: 'var(--sub)', fontSize: 12 }}>
                  <span>{money(card.goal.currentAmount)} / {money(card.goal.targetAmount)}</span>
                  <span>{money(Math.max(0, card.goal.targetAmount - card.goal.currentAmount))} 남음</span>
                </div>
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); onSaveToGoal?.(card.goal.goalId); }}
                  css={{
                    marginTop: 12, border: 0, borderRadius: 12, background: '#83C9B0', color: '#fff',
                    fontSize: 12.5, fontWeight: 800, padding: '10px 0', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                    transition: 'background 0.15s ease, transform 0.1s ease',
                    '&:hover': { background: '#6FB89D' },
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  저금하기
                </button>
              </DeckCard>
            )}
          </DeckCell>
        ))}
      </DeckTrack>
      {cards.length > 1 && (
        <DeckDots>
          {cards.flatMap((card, i) => {
            const dot = (
              <DeckDot
                key={card.type === 'goal' ? `d${card.goal.goalId}` : 'dasset'}
                first={i === 0}
                active={i === active}
                onClick={() => goTo(i)}
                aria-label={`${i + 1}번째 카드`}
              />
            );
            return i === 1 ? [<DeckSep key="sep" />, dot] : [dot];
          })}
        </DeckDots>
      )}
    </Deck>
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
    const prevCount = prev ? prev.count : 0;
    const currCount = curr.count;
    
    if (prevCount === 0 && currCount > 0) {
      signals.push({ name: curr.name, rate: 100, delta: '▲ 100%' });
    } else if (prevCount > 0) {
      const rate = Math.round(((currCount - prevCount) / prevCount) * 100);
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
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const lead = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const empty = Array.from({ length: lead }, (_, index) => ({ id: `empty-${index}`, empty: true }));
  const days = Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const emotion = txMap.get(key);
    return { id: `day-${day}`, day, emotion, strong: Boolean(emotion), today: isCurrentMonth && day === now.getDate() };
  });
  const cells = [...empty, ...days];
  // 마지막 주까지만 채워 달마다 5~6주로 높이 가변 (항상 6주 고정 X)
  const filled = Math.ceil(cells.length / 7) * 7;
  const trailing = Array.from(
    { length: Math.max(0, filled - cells.length) },
    (_, index) => ({ id: `trailing-${index}`, empty: true })
  );
  return [...cells, ...trailing];
}

function ridgePath(cx, width, height, base = 172) {
  return `M ${(cx - width).toFixed(1)} ${base} C ${(cx - width * .42).toFixed(1)} ${base} ${(cx - width * .32).toFixed(1)} ${(base - height).toFixed(1)} ${cx.toFixed(1)} ${(base - height).toFixed(1)} C ${(cx + width * .32).toFixed(1)} ${(base - height).toFixed(1)} ${(cx + width * .42).toFixed(1)} ${base} ${(cx + width).toFixed(1)} ${base} Z`;
}

export default function HomePageDesign({ state, onRoute, selectedDate, onSelectDate, onSaveToGoal }) {
  const [fallbackDate] = useState(() => new Date());
  const selected = selectedDate || fallbackDate;
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const lastClickTimeRef = useRef({});
  const [isRidgeExpanded, setIsRidgeExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 980);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 980);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  // 데스크톱: 12초마다 3개가 물결처럼 / 모바일: 4.5초마다 말풍선 1개 순환
  const [budgetWave, setBudgetWave] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setBudgetWave(w => w + 1), isMobile ? 4500 : 12000);
    return () => clearInterval(timer);
  }, [isMobile]);
  // 말랑이 드래그(늘리기)에 말풍선도 함께 밀리도록
  const [blobDrag, setBlobDrag] = useState({ dx: 0, dy: 0, isDragging: false });
  const handleBlobDrag = useCallback((d) => setBlobDrag(d), []);
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
  const { data: goalsData, isLoading: isGoalsLoading } = useGoalsQuery();

  const isSummaryLoading = isCalendarLoading || isEmotionLoading || isGoalsLoading;
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

  // 서버 상태(['goals'])를 직접 구독 → 설정에서 대표목표(isMain) 변경 시 홈/우주 동시 실시간 반영
  const goals = goalsData?.goals || [];
  const totalAsset = state.user?.totalAsset ?? 0;

  // 전역 예산 스토어 구독 → 소진율/상태로 말랑이 말풍선 문구 (F7-10 · #145)
  // 계산·동기화는 BudgetSync가 담당하고, 여기선 파생 상태만 읽는다.
  const budgetProgress = useBudgetStore((s) => s.progress);
  const budgetState = useBudgetStore((s) => s.state);
  const budgetPhrases = {
    measuring: ['아직 예산을 재는 중이야 🌱', '며칠만 더 기록하면 시작할게!', '천천히, 같이 흐름을 만들자', '기록이 쌓일수록 똑똑해져 ✨', '오늘의 소비도 기록해줄래?'],
    ontrack: [`예산 ${budgetProgress}%, 잘 가고 있어 👀`, '이대로면 목표가 쑥쑥 자라', '지금처럼만 해도 충분해!', '오늘도 잘 지켜냈네, 멋져', '작은 절약이 쌓이는 중 🌱'],
    surplus: [`예산 ${budgetProgress}%밖에 안 썼어 ✨`, '아낀 만큼 목표에 더 담을까?', '이번 달은 여유가 생겼어!', '알뜰함 만렙이네 👏', '남는 돈은 미래의 나에게 🎁'],
    over: [`앗, 예산을 ${budgetProgress}%나 썼어 😥`, '이대로면 저축이 잠깐 멈춰', '저금하기로 목표 채워줄래?', '조금만 아껴보자, 할 수 있어', '다음 주엔 살짝 브레이크 🛑'],
  }[budgetState];

  // 기록이 아직 없는 첫 사용(빈 상태): 분석 문구 대신 서비스 사용을 돕는 유도 문구
  const emptyPhrases = [
    '반가워! 나는 말랑이야 🫧',
    '오늘 쓴 돈을 기록해볼래?',
    '감정이랑 같이 적으면 내가 읽어줄게',
    '기록이 쌓이면 소비 흐름이 보여 ✨',
    '아래 달력에서 날짜를 골라 시작해봐',
    '가볍게 한 건부터, 천천히 같이 하자',
  ];
  const bubblePhrases = showEmptyBlob ? emptyPhrases : budgetPhrases;

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

  const renderCalendarBody = (onAfterSelect) => (
    <>
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
          return <Pebble key={item.id} color={color} strong={item.strong} selected={dateKey === selectedDayKey} today={item.today} dark={dark} onClick={event => { selectDay(item.day, dateKey, event.timeStamp); onAfterSelect?.(); }}>{item.day}</Pebble>;
        })}
      </PebbleGrid>
    </>
  );

  return (
    <Grid>
      <Left>
        {isSummaryLoading ? <HomeSummarySkeleton /> : <>
        <Stage>
          <div>
            <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'center', '@media (max-width: 980px)': { flexDirection: 'column-reverse' } }}>
              <BlobHalo color={topMeta.color}>
                <div css={{ position: 'relative', display: 'grid', placeItems: 'center', overflow: 'visible', width: isMobile ? 272 : 'clamp(320px, 28vw, 400px)', height: isMobile ? 280 : 'clamp(360px, 31vw, 372px)' }}>
                  {!showEmptyBlob
                    ? <EmotionBlob emotion={displayEmotion} size={isMobile ? 264 : 410} onDragChange={handleBlobDrag} />
                    : <EmptyEmotionBlob size={isMobile ? 264 : 410} dark={dark} />}
                </div>
              </BlobHalo>
              <BubbleStack css={{ transform: `translate(${blobDrag.dx * (isMobile ? 0.4 : 0.5)}px, ${blobDrag.dy * (isMobile ? 0.4 : 0.5)}px)`, transition: blobDrag.isDragging ? 'none' : 'transform .4s cubic-bezier(.34, 1.4, .64, 1)', '@media (max-width: 980px)': { marginBottom: showEmptyBlob ? 20 : -20 } }}>
                {isMobile ? (
                  <Bubble key={budgetWave} css={{ animation: `${bubblePop} 0.5s cubic-bezier(.5, 1.5, .5, 1) backwards` }}>
                    {bubblePhrases[budgetWave % bubblePhrases.length]}
                  </Bubble>
                ) : (
                  [0, 1, 2].map((i) => {
                    const phrase = bubblePhrases[(budgetWave + i) % bubblePhrases.length];
                    return (
                      <Bubble key={`${budgetWave}-${i}`} css={{ animation: `${bubblePop} 0.5s cubic-bezier(.5, 1.5, .5, 1) ${i * 0.22}s backwards` }}>
                        {phrase}
                      </Bubble>
                    );
                  })
                )}
              </BubbleStack>
            </div>
            <div css={{ fontSize: 12, color: 'var(--sub)', fontWeight: 800, marginTop: isMobile ? 4 : -24 }}>
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
              <div css={{ display: 'grid', gridTemplateRows: isRidgeExpanded ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '@media (min-width: 981px)': { gridTemplateRows: '1fr' } }}>
               <div css={{ overflow: 'hidden', minHeight: 0 }}>
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
          <AccordionSummary expanded={isCalendarExpanded} css={{ '@media (min-width: 981px)': { display: 'none' } }}>
            <div css={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#76A7E8" strokeWidth="1.9"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" /><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" /><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>{monthLabel} 캘린더</span>
            </div>
            <span css={{ color: 'var(--sub)', fontSize: 16, '@media (min-width: 981px)': { display: 'none' } }}>{isCalendarExpanded ? '▴' : '▾'}</span>
          </AccordionSummary>
          <div onClick={e => e.stopPropagation()} css={{ cursor: 'default', display: 'grid', gridTemplateRows: isCalendarExpanded ? '1fr' : '0fr', transition: 'grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1)', '@media (min-width: 981px)': { gridTemplateRows: 'auto' } }}>
            <div css={{ overflow: 'hidden', minHeight: 0, '@media (min-width: 981px)': { overflow: 'visible' } }}>
              {renderCalendarBody()}
            </div>
          </div>
        </Calendar>

        <AssetGoalDeck totalAsset={totalAsset} goals={goals} onRoute={onRoute} onSaveToGoal={onSaveToGoal} />

        <Signal>
          <div css={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
            <b css={{ width: 25, height: 25, borderRadius: 9, background: 'var(--ink)', color: 'var(--on-ink)', display: 'grid', placeItems: 'center', fontSize: 10 }}>AI</b>
            <span css={{ color: 'var(--sub)', fontSize: 11.5, fontWeight: 800 }}>이번 달 감정 신호</span>
          </div>
          {hasMonthlyTransactions ? (
            <>
              <div css={{ fontSize: isMobile ? 18 : 14.5, fontWeight: 900, lineHeight: isMobile ? 1.42 : 1.35 }}>
                {signals.length > 0 && signals[0].rate > 0
                  ? (isMobile ? `이번 달은 ${signals[0].name} 소비가 조금 늘었어. 괜찮아, 같이 들여다보자.` : `이번 달은 ${signals[0].name} 소비가 조금 늘고 있어요.`)
                  : (isMobile ? '감정 소비가 안정적으로 관리되고 있어. 이대로도 충분해.' : '감정 소비가 안정적으로 관리되고 있어요.')}
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
              <div css={{ fontSize: isMobile ? 17 : 14.5, fontWeight: 900, lineHeight: 1.35 }}>{isMobile ? '아직 기록된 소비가 없어.' : '아직 기록된 소비가 없어요.'}</div>
              <div css={{ color: 'var(--sub)', fontSize: 12.5, lineHeight: 1.55, paddingTop: 8, borderTop: '1px solid var(--line)', marginTop: 8 }}>{isMobile ? '첫 기록을 남기면 감정 신호가 여기서 천천히 보이기 시작할 거야.' : '첫 기록을 남기면 감정 신호가 여기에서 천천히 보이기 시작해요.'}</div>
            </>
          )}
        </Signal>
      </Right>
    </Grid>
  );
}
