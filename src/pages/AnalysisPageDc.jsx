/** @jsxImportSource @emotion/react */
import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { ChallengeFlag } from '../components/analysis/ChallengeFlag.jsx';
import { EmotionBlob } from '../components/common/EmotionBlob.jsx';
import { getEmotion, emotions } from '../data/emotions.js';
import { useMonthlyAnalysisQuery, useAiReportQuery, useAiInsightsQuery, useMonthlyTrendQuery, usePatternQuery } from '../hooks/queries/useAnalysis.js';
import { useBudgetStore } from '../stores/budgetStore.js';

const Page = styled.div`
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 820px) {
    padding-top: 22px;
  }
`;

const InsightRail = styled(GlassCard)`
  min-height: 66px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  overflow: hidden;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const InsightItem = styled.div`
  min-height: 46px;
  padding: 6px 16px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
  border-right: 1px solid var(--line);

  &:last-of-type {
    border-right: 0;
  }

  @media (max-width: 820px) {
    &:nth-of-type(2) {
      border-right: 0;
    }

    &:nth-of-type(n + 3) {
      border-top: 1px solid var(--line);
    }
  }
`;
const RiskSignal = styled.span`
  width: 52px;
  height: 24px;
  padding: 5px 6px;
  display: inline-grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  justify-items: center;
  gap: 5px;
  border-radius: 7px;
  background: rgba(25, 25, 34, .78);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10), 0 8px 18px -16px rgba(0, 0, 0, .55);

  i {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    display: block;
    opacity: .34;
  }

  i.green {
    background: #83C9B0;
  }

  i.yellow {
    background: #F2C766;
  }

  i.red {
    background: #E87573;
  }

  i.active {
    opacity: 1;
    box-shadow: 0 0 16px ${({ glow = '#E87573' }) => glow}bd, 0 0 0 3px ${({ glow = '#E87573' }) => glow}29;
  }
`;

// 소비 위험도 3단계. 색은 감정 팔레트와 같은 값을 쓴다(평온·뿌듯함·화남).
const RISK_LEVELS = {
  GREEN: { lamp: 'green', color: '#83C9B0', value: '안전', note: '여유 있어' },
  YELLOW: { lamp: 'yellow', color: '#F2C766', value: '주의', note: '조금 빨라' },
  RED: { lamp: 'red', color: '#E87573', value: '위험', note: '많이 썼어' }
};

// 서버는 지배 감정이 없는 예산 항목에 '보통'을 채워 보낸다(AnalysisService).
// 감정 8종에 없는 값이라 EmotionBlob에 그대로 넘기면 '평온'으로 폴백돼 없는 감정을 보여주게 된다.
const NO_EMOTION = '보통';

// 챌린지 칸은 위험 루트와 type이 같아('default') label로 가른다.
// 서버(AiQuickInsightAssembler)가 이 label 4종을 고정으로 맞춰 보낸다.
const CHALLENGE_LABEL = 'AI 맞춤 챌린지';

// 위험도 값이 없으면 null → 신호등 세 칸 모두 꺼진 상태로 둔다. 임의로 한 칸을 켜지 않는다.
// 서버(AiQuickInsightAssembler)는 등급을 위험도 항목의 value에 한글로 담아 보낸다.
// '예산 미설정'은 등급이 아니라 판정 불가라 매핑하지 않는다 → 세 칸 모두 꺼짐.
const RISK_WORDS = { 위험: 'RED', 주의: 'YELLOW', 안전: 'GREEN' };

function resolveRisk(raw) {
  const text = String(raw ?? '').trim();
  return RISK_LEVELS[text.toUpperCase()] ?? RISK_LEVELS[RISK_WORDS[text]] ?? null;
}

const Duo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(GlassCard)`
  padding: 24px;
`;

const BarTrack = styled.div`
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--line);
`;

export default function AnalysisPageDc({ state, globalDate, setGlobalDate }) {
  const isDark = state?.mode === 'dark';
  const [flippedCards, setFlippedCards] = useState({});
  const [activeChartTab, setActiveChartTab] = useState('emotion');
  const [patternFlipped, setPatternFlipped] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState(null);

  const { data: analysis } = useMonthlyAnalysisQuery(globalDate.getFullYear(), globalDate.getMonth() + 1);
  const { data: insightsData, isLoading: isInsightsLoading } = useAiInsightsQuery(globalDate.getFullYear(), globalDate.getMonth() + 1);
  const { data: reportData } = useAiReportQuery(globalDate.getFullYear(), globalDate.getMonth() + 1);
  const { data: trendData } = useMonthlyTrendQuery();
  // 예산 현황은 전역 스토어(BudgetSync가 동기화)를 구독한다 (#145)
  const serverBudgetItems = useBudgetStore((s) => s.budgetItems);
  const { data: patternData } = usePatternQuery();

  const monthly = trendData?.monthlyData ?? [];

  const riskItem = insightsData?.aiQuickInsights?.find(item => item.type === 'risk');
  const risk = resolveRisk(riskItem?.level ?? riskItem?.value);

  const aiQuickInsights = (insightsData?.aiQuickInsights?.length > 0 ? insightsData.aiQuickInsights : [
    { label: '위험 루트', value: '-', note: '-', color: 'var(--sub)', type: 'default' },
    { label: '팩트 리포트', value: '-', note: '-', color: '#E87573', type: 'fact' },
    { label: '소비 위험도', type: 'risk' },
    { label: 'AI 맞춤 챌린지', value: '-', note: '-', color: 'var(--sub)', type: 'default' }
  ]).map(item => {
    if (item.type === 'risk') {
      return {
        ...item,
        color: risk?.color ?? 'var(--sub)',
        value: item.value ?? risk?.value ?? '-',
        note: item.note ?? risk?.note ?? '-'
      };
    }
    if (item.type === 'fact' && reportData?.ai?.fact) {
      return {
        ...item,
        value: reportData.ai.fact
      };
    }
    // 챌린지는 위험 루트와 type이 같아 label로 가른다(CHALLENGE_LABEL 주석 참고).
    // ai-report의 ChallengeService 문구를 우선 쓰고, 없으면 ai-insights 값을 그대로 둔다 (F13-8).
    if (item.label === CHALLENGE_LABEL && reportData?.ai?.challenge) {
      return {
        ...item,
        value: reportData.ai.challenge
      };
    }
    return item;
  });

  const emotionCardsData = insightsData?.emotionCards ?? [];
  const rawEvidence = patternData?.evidence ?? [];
  const evidence = rawEvidence.map(ev => {
    const dateObj = new Date(ev.occurredAt);
    const dateStr = `${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;
    return {
      date: dateStr,
      category: ev.category?.name ?? '기타',
      emotion: ev.emotion?.name ?? '평온',
      amount: ev.amount
    };
  });
  const pattern = patternData?.pattern ?? null;
  const hasPattern = pattern != null && pattern.count > 0;

  // §9(/analysis/monthly) 결정론적 집계 → 화면 뷰모델. 데이터 없으면 빈 배열/0으로 안전 처리.
  const byAmountDesc = (a, b) => b.amount - a.amount;
  const buildSegments = (items) => {
    const list = items ?? [];
    const total = list.reduce((sum, item) => sum + item.amount, 0);
    return list.slice(0, 4).map(item => ({
      name: item.name ?? item.label,
      percent: total ? Math.round((item.amount / total) * 100) : 0,
      amount: `${item.amount.toLocaleString()}원`,
      color: item.color
    }));
  };
  const categorySegments = buildSegments([...(analysis?.byCategory ?? [])].sort(byAmountDesc));
  const emotionTotalCount = (analysis?.byEmotion ?? []).reduce((sum, item) => sum + item.count, 0);
  const emotionSegments = emotions.map(emo => {
    const found = (analysis?.byEmotion ?? []).find(item => (item.name ?? item.label) === emo.name);
    const count = found ? found.count : 0;
    const amount = found ? found.amount : 0;
    return {
      name: emo.name,
      percent: emotionTotalCount ? Math.round((count / emotionTotalCount) * 100) : 0,
      amount: `${amount.toLocaleString()}원`,
      color: emo.color,
      _amount: amount  // 정렬 전용 숫자값, 외부에 노출되지 않음
    };
  }).sort((a, b) => {
    if (b.percent !== a.percent) return b.percent - a.percent;
    return b._amount - a._amount;
  }).map(({ _amount, ...rest }) => rest);
  const timeSegments = buildSegments([...(analysis?.byTimeSlot ?? [])].sort(byAmountDesc));

  const chartConfig = {
    category: {
      label: categorySegments[0]?.name ?? '—', percent: categorySegments[0]?.percent ?? 0,
      color: 'var(--text)', helper: '가장 많이 쓴 곳',
      focus: categorySegments[0] ? `${categorySegments[0].name} 소비가 예산 흐름을 가장 크게 만들었어요` : '이번 달 지출 데이터가 아직 없어요',
      segments: categorySegments
    },
    time: {
      label: timeSegments[0]?.name ?? '—', percent: timeSegments[0]?.percent ?? 0,
      color: 'var(--text)', helper: '가장 몰린 시간',
      focus: timeSegments[0] ? `${timeSegments[0].name} 시간대 소비가 반복되고 있어요` : '이번 달 지출 데이터가 아직 없어요',
      segments: timeSegments
    },
    emotion: {
      label: emotionSegments[0]?.name ?? '—', percent: emotionSegments[0]?.percent ?? 0,
      color: emotionSegments[0]?.color ?? '#A68BEA', helper: '핵심 소비 감정',
      focus: emotionSegments[0] ? `${emotionSegments[0].name}이(가) 이번 달 소비를 가장 많이 끌고 갔어요` : '이번 달 지출 데이터가 아직 없어요',
      segments: emotionSegments
    }
  };

  const emotionCardsMap = useMemo(() => {
    const map = {};
    for (const card of emotionCardsData) {
      if (card.emotion) {
        map[card.emotion] = card;
      }
    }
    return map;
  }, [emotionCardsData]);

  // 감정소비 카드: 앞면(감정·비율·금액·색)은 §9 byEmotion 상위 3건, 뒷면 문구만 정적 카피(emotionCardsData).
  const emotionCards = emotionSegments.slice(0, 3).map((item) => {
    const matchingData = emotionCardsMap[item.name] || {};
    return {
      emotion: item.name,
      percent: item.percent,
      amount: item.amount,
      color: item.color,
      title: matchingData.title ?? '',
      desc: matchingData.desc ?? ''
    };
  });
  const activeChart = chartConfig[activeChartTab];
  const budgetItems = serverBudgetItems
    .map(data => {
      const emo = getEmotion(data.emotion);
      const budget = data.budget;
      const isMeasuring = budget === 0;
      const progress = isMeasuring ? 0 : (data.currentAmount / budget) * 100;
      return { ...data, emo, budget, amount: data.currentAmount, progress, isOver: progress > 100, isMeasuring };
    })
    .sort((a, b) => {
      if (a.isMeasuring && !b.isMeasuring) return 1;
      if (!a.isMeasuring && b.isMeasuring) return -1;
      return Number(b.isOver) - Number(a.isOver) || b.progress - a.progress;
    });
  const overBudgetItem = budgetItems.find(item => item.isOver);
  const validBudgetItems = budgetItems.filter(item => !item.isMeasuring);
  const budgetAverage = validBudgetItems.length > 0
    ? Math.round(validBudgetItems.reduce((sum, item) => sum + item.progress, 0) / validBudgetItems.length)
    : 0;
  // 급박도순(초과 → 진행률순) 정렬된 목록에서 상위 5개만 노출 (#145)
  const topBudgetItems = budgetItems.slice(0, 5);
  const hiddenBudgetCount = budgetItems.length - topBudgetItems.length;

  const renderTabs = (isMobile) => (
    <div css={{ 
      display: isMobile ? 'none' : 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: 6, 
      marginTop: isMobile ? 12 : 6, 
      width: isMobile ? '100%' : 'auto',
      '@media (max-width: 820px)': { display: isMobile ? 'grid' : 'none' }
    }}>
      {[
        { id: 'emotion', text: '감정' },
        { id: 'category', text: '사용처' },
        { id: 'time', text: '시간대' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveChartTab(tab.id)}
          css={{
            height: 36, padding: '0 10px', fontSize: 12, fontWeight: 900, borderRadius: 10, cursor: 'pointer', textAlign: 'center',
            background: activeChartTab === tab.id ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.04)',
            color: activeChartTab === tab.id ? 'var(--text)' : 'var(--sub)',
            border: activeChartTab === tab.id ? '1px solid rgba(255,255,255,.24)' : '1px solid var(--line)',
            transition: 'all 0.2s ease'
          }}
        >
          {tab.text}
        </button>
      ))}
    </div>
  );

  const toggleFlip = (emotion) => {
    setFlippedCards(prev => ({ ...prev, [emotion]: !prev[emotion] }));
  };

  return (
    <Page>
      <InsightRail>
        {aiQuickInsights.map(item => {
          const isExpanded = expandedInsight === item.label;
          return (
          <InsightItem 
            key={item.label}
            onClick={() => {
              if (window.innerWidth <= 820) {
                setExpandedInsight(isExpanded ? null : item.label);
              }
            }}
            css={{
              cursor: 'pointer',
              alignItems: isExpanded ? 'flex-start' : 'center',
              paddingTop: isExpanded ? 12 : 6,
              paddingBottom: isExpanded ? 12 : 6,
              transition: 'all 0.2s ease',
              '@media (min-width: 821px)': { cursor: 'default', alignItems: 'center', paddingTop: 6, paddingBottom: 6 }
            }}
          >
            {item.type === 'risk' ? (
              <RiskSignal glow={risk?.color} role="img" aria-label={`소비 위험도 ${risk?.value ?? '측정중'}`} css={{ marginTop: isExpanded ? 2 : 0, '@media (min-width: 821px)': { marginTop: 0 } }}>
                {['green', 'yellow', 'red'].map(lamp => (
                  <i key={lamp} className={lamp === risk?.lamp ? `${lamp} active` : lamp} />
                ))}
              </RiskSignal>
            ) : item.label === CHALLENGE_LABEL ? (
              <ChallengeFlag expanded={isExpanded} />
            ) : (
              <span css={{
                width: item.type === 'fact' ? 10 : 8,
                height: item.type === 'fact' ? 40 : 34,
                borderRadius: 99,
                background: item.color,
                opacity: item.type === 'fact' ? 1 : (isDark ? 0.86 : 0.72),
                boxShadow: item.type === 'fact' ? '0 0 0 4px rgba(232,117,115,.12)' : `0 10px 22px -14px ${item.color}`,
                marginTop: isExpanded ? 2 : 0,
                '@media (min-width: 821px)': { marginTop: 0 }
              }} />
            )}
            <div css={{ minWidth: 0 }}>
              <div css={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, width: '100%' }}>
                <span css={{ color: 'var(--sub)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0 }}>{item.label}</span>
                {isInsightsLoading
                  ? <Skeleton w="44px" h={11} radius={5} />
                  : <span css={{
                      color: item.type === 'fact' ? '#E87573' : item.color,
                      fontSize: 11,
                      fontWeight: 900,
                      whiteSpace: isExpanded ? 'normal' : 'nowrap',
                      overflow: isExpanded ? 'visible' : 'hidden',
                      textOverflow: isExpanded ? 'clip' : 'ellipsis',
                      textAlign: 'right',
                      wordBreak: isExpanded ? 'keep-all' : 'normal',
                      minWidth: 0,
                      display: isExpanded ? 'inline' : 'none',
                      '@media (min-width: 821px)': { display: 'inline' }
                    }}>{item.note}</span>}
                {/* 접힘/펼침 표시 — 모바일에서만 (데스크톱은 늘 펼친 상태라 표시할 게 없다) */}
                <svg
                  aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  css={{
                    flex: '0 0 auto', marginLeft: 'auto', alignSelf: 'center',
                    color: 'var(--sub)', opacity: .5,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform .24s ease',
                    '@media (min-width: 821px)': { display: 'none' }
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {/* 0fr → 1fr 로 높이를 부드럽게 여닫는다. 데스크톱은 항상 열린 상태 */}
              <div css={{
                display: 'grid',
                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                transition: 'grid-template-rows .24s ease',
                '@media (min-width: 821px)': { gridTemplateRows: '1fr' }
              }}>
                <div css={{ minHeight: 0, overflow: 'hidden' }}>
                  {isInsightsLoading ? (
                    <Skeleton w="82%" h={item.type === 'fact' ? 17 : 16} radius={6} css={{ marginTop: 4 }} />
                  ) : (
                  <div css={{
                    marginTop: 3,
                    color: item.type === 'fact' ? '#E87573' : 'var(--text)',
                    fontSize: item.type === 'fact' ? 14 : 13,
                    fontWeight: item.type === 'fact' ? 950 : 900,
                    lineHeight: 1.35,
                    overflow: 'visible',
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                    overflowWrap: 'anywhere',
                    '@media (min-width: 821px)': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'normal',
                      overflowWrap: 'normal'
                    }
                  }}>{item.value}</div>
                  )}
                </div>
              </div>
            </div>
          </InsightItem>
        )})}
      </InsightRail>
      <Duo>
        <Card>
          <div css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
            <div>
              <h3 css={{ margin: '0 0 5px', fontSize: 16, fontWeight: 900 }}>목표 예산 현황</h3>
              <p css={{ margin: 0, color: 'var(--sub)', fontSize: 12, lineHeight: 1.5 }}>지금 바로 조정해야 할 예산부터 보여줘요</p>
            </div>
            <div css={{ textAlign: 'right', flexShrink: 0 }}>
              <div css={{ color: overBudgetItem ? '#E87573' : 'var(--text)', fontSize: 18, fontWeight: 950, lineHeight: 1 }}>
                {validBudgetItems.length > 0 ? `${budgetAverage}%` : '측정중'}
              </div>
              <div css={{ color: 'var(--sub)', fontSize: 11, fontWeight: 800, marginTop: 4 }}>평균 사용률</div>
            </div>
          </div>

          {budgetItems.length > 0 ? (
            <>
              {overBudgetItem && (
                <div css={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 18,
                  padding: '14px 0',
                  borderTop: '1px solid var(--line)',
                  borderBottom: '1px solid var(--line)'
                }}>
                  <div css={{ minWidth: 0 }}>
                    <div css={{ color: '#E87573', fontSize: 11, fontWeight: 950, marginBottom: 5 }}>초과</div>
                    <div css={{ color: 'var(--text)', fontSize: 20, fontWeight: 950, lineHeight: 1.15 }}>{overBudgetItem.name} {Math.round(overBudgetItem.progress)}%</div>
                    <div css={{ color: 'var(--sub)', fontSize: 12, fontWeight: 750, marginTop: 6 }}>{overBudgetItem.emotion} 소비가 목표보다 빨라요</div>
                  </div>
                  <div css={{ textAlign: 'right', flexShrink: 0 }}>
                    <div css={{ color: '#E87573', fontSize: 20, fontWeight: 950 }}>{overBudgetItem.amount.toLocaleString()}원</div>
                    <div css={{ color: 'var(--sub)', fontSize: 11, fontWeight: 800, marginTop: 5 }}>목표 {overBudgetItem.budget.toLocaleString()}원</div>
                  </div>
                </div>
              )}

              <div css={{ display: 'grid', gap: 12 }}>{topBudgetItems.map(item => {
                const displayProgress = item.isMeasuring ? 0 : Math.min(item.progress, 100);
                const statusText = item.isMeasuring ? '측정중' : item.isOver ? '초과' : item.progress >= 90 ? '주의' : '안정';
                const statusColor = item.isMeasuring ? 'var(--sub)' : item.isOver ? '#E87573' : 'var(--sub)';

                return <div key={item.name} css={{ display: 'grid', gridTemplateColumns: 'minmax(118px, .52fr) 1fr minmax(82px, auto)', alignItems: 'center', gap: 12 }}>
                  {/* 감정은 이름 대신 말랑이로 보여준다 (F15-3). 감정 값이 없으면 아무것도 그리지 않는다. */}
                  <div css={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                    {item.emotion && item.emotion !== NO_EMOTION && (
                      <span
                        title={item.emotion}
                        aria-label={item.emotion}
                        role="img"
                        css={{ flex: '0 0 auto', display: 'grid', placeItems: 'center', width: 50, height: 50 }}
                      >
                        <EmotionBlob emotion={item.emotion} size={50} interactive={false} />
                      </span>
                    )}
                    <b css={{
                      minWidth: 0,
                      fontSize: 13,
                      color: 'var(--text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{item.name}</b>
                  </div>

                  <div css={{ display: 'grid', gap: 5 }}>
                    <BarTrack css={{ height: 7, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(31,32,54,0.08)' }}>
                      <div css={{
                        width: `${displayProgress}%`,
                        height: '100%',
                        borderRadius: 99,
                        background: item.isOver ? '#E87573' : 'var(--text)',
                        opacity: item.isOver ? 0.95 : 0.28,
                        transition: 'width 0.35s ease'
                      }} />
                    </BarTrack>
                    <div css={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sub)', fontSize: 10, fontWeight: 800 }}>
                      <span>{item.isMeasuring ? '-' : `${Math.round(item.progress)}%`}</span>
                      <span css={{ color: statusColor }}>{statusText}</span>
                    </div>
                  </div>

                  <div css={{ textAlign: 'right' }}>
                    <div css={{ color: item.isOver ? '#E87573' : 'var(--text)', fontSize: 13, fontWeight: 950 }}>{item.amount.toLocaleString()}원</div>
                    <div css={{ color: 'var(--sub)', fontSize: 10, fontWeight: 800, marginTop: 4 }}>
                      {item.isMeasuring ? '예산 설정중' : `목표 ${item.budget.toLocaleString()}원`}
                    </div>
                  </div>
                </div>;
              })}</div>
              {hiddenBudgetCount > 0 && (
                <div css={{ marginTop: 14, textAlign: 'center', color: 'var(--sub)', fontSize: 11, fontWeight: 800 }}>
                  급한 예산 5개만 보여줬어요 · 그 외 {hiddenBudgetCount}개
                </div>
              )}
            </>
          ) : (
            <div css={{ padding: '32px 0', textAlign: 'center', color: 'var(--sub)', fontSize: 13, fontWeight: 700, lineHeight: 1.6 }}>
              예산을 분석할 이전 달 데이터가 부족해요.<br/>꾸준히 기록하면 정확한 예산 코칭을 받을 수 있어요!
            </div>
          )}
        </Card>

        <Card css={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
            <div>
              <h3 css={{ margin: '0 0 5px', fontSize: 16, fontWeight: 900 }}>나의 소비 코어</h3>
              <p css={{ margin: 0, color: 'var(--sub)', fontSize: 12 }}>이번 달 소비를 끌고 간 원인이에요</p>
            </div>
            <span css={{ color: activeChart.color, fontSize: 12, fontWeight: 950 }}>{activeChart.helper}</span>
          </div>

          {renderTabs(true)}

          <div css={{
            display: 'grid',
            gridTemplateColumns: 'minmax(230px, .85fr) 1fr',
            flex: 1, 
            gap: 24, 
            alignItems: 'center',
            '@media (max-width: 820px)': { gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'center', marginTop: 18 }
          }}>
            <div css={{ display: 'grid', justifyItems: 'center', gap: 12, '@media (max-width: 820px)': { gap: 5 } }}>
              <div css={{ fontFamily: 'var(--font-display)', color: activeChart.color, fontSize: 'clamp(46px, 8vw, 56px)', fontWeight: 950, lineHeight: .95, '@media (max-width: 820px)': { fontSize: 56 } }}>{activeChart.percent}%</div>
              <div css={{ color: 'var(--text)', fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 950 }}>{activeChart.label}</div>
              <div css={{ maxWidth: 230, color: 'var(--sub)', fontSize: 12, fontWeight: 750, lineHeight: 1.55, textAlign: 'center', '@media (max-width: 820px)': { display: 'none' } }}>{activeChart.focus}</div>
              <div css={{ width: 'min(100%, 220px)', marginTop: 4, '@media (max-width: 820px)': { display: 'none' } }}>
                <BarTrack css={{ height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(31,32,54,0.08)' }}>
                  <div css={{ width: `${activeChart.percent}%`, height: '100%', borderRadius: 99, background: activeChart.color, opacity: .86 }} />
                </BarTrack>
              </div>
            </div>

            <div css={{ display: 'grid', gap: 14, '@media (max-width: 820px)': { maxWidth: 165, width: '100%', justifySelf: 'end' } }}>
              <div css={{ display: 'grid', gap: 9 }}>
                {activeChart.segments.map((seg, index) => {
                  const isPrimary = index === 0;
                  return <div key={seg.name} css={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 9 }}>
                    <span css={{ width: isPrimary ? 10 : 8, height: isPrimary ? 10 : 8, borderRadius: '50%', background: activeChartTab === 'emotion' ? seg.color : 'var(--text)', opacity: activeChartTab === 'emotion' ? (isPrimary ? 1 : .5) : (isPrimary ? .6 : .22) }} />
                    <span css={{ color: isPrimary ? 'var(--text)' : 'var(--sub)', fontSize: isPrimary ? 14 : 12, fontWeight: isPrimary ? 950 : 850 }}>{seg.name}</span>
                    <span css={{ color: isPrimary && activeChartTab === 'emotion' ? seg.color : 'var(--sub)', fontSize: isPrimary ? 14 : 12, fontWeight: 950 }}>{activeChartTab === 'category' ? seg.amount : `${seg.percent}%`}</span>
                  </div>;
                })}
              </div>
              {renderTabs(false)}
            </div>
          </div>
          <div css={{ display: 'none', '@media (max-width: 820px)': { display: 'flex' }, alignItems: 'center', gap: 8, marginTop: 15, paddingTop: 13, borderTop: '1px solid var(--line)' }}>
            <span css={{ width: 6, height: 6, borderRadius: '50%', background: activeChart.color, flexShrink: 0 }} />
            <span css={{ color: 'var(--text)', fontSize: 12.5, fontWeight: 800, lineHeight: 1.5 }}>{activeChart.focus}</span>
          </div>
        </Card>
      </Duo>

      <Duo>
        <Card>
          <div css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <div>
              <h3 css={{ margin: '0 0 5px', fontSize: 16, fontWeight: 900 }}>월별 지출 추이</h3>
              <p css={{ margin: 0, color: 'var(--sub)', fontSize: 12 }}>최근 7개월 흐름만 담백하게 보여줘요</p>
            </div>
            <div css={{ textAlign: 'right', flexShrink: 0 }}>
              <div css={{ color: 'var(--text)', fontSize: 18, fontWeight: 950 }}>{monthly.length > 0 ? `${(trendData?.currentTotalAmount ?? 0).toLocaleString()}원` : '- 원'}</div>
              <div css={{ color: 'var(--sub)', fontSize: 11, fontWeight: 850, marginTop: 4 }}>
                {monthly.length > 0 ? `전월 대비 ${trendData?.comparedToLastMonth > 0 ? '+' : ''}${trendData?.comparedToLastMonth ?? 0}%` : '데이터 수집 중'}
              </div>
            </div>
          </div>
          
          {monthly.length > 0 ? (
            <div css={{ display: 'grid', gap: 12 }}>
              <div css={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 150 }}>{monthly.map((item) => {
                const match = item.label.match(/(\d+)월/);
                const itemMonth = match ? parseInt(match[1], 10) - 1 : -1;
                const current = itemMonth === globalDate.getMonth();
                const maxAmount = Math.max(...monthly.map(m => m.amount)) || 1;
                const heightPercent = Math.max((item.amount / maxAmount) * 100, 5);
                return <div
                  key={item.label}
                  css={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                  onClick={() => {
                    if (match) {
                      let y = new Date().getFullYear();
                      if (itemMonth > new Date().getMonth()) {
                        y -= 1;
                      }
                      setGlobalDate(new Date(y, itemMonth, 1));
                    }
                  }}
                >
                  <span css={{ color: current ? 'var(--text)' : 'var(--sub)', fontSize: 10, fontWeight: current ? 900 : 750, marginBottom: 6, opacity: current ? 1 : 0.58 }}>{(item.amount / 10000).toFixed(1)}만</span>
                  <div css={{ width: '100%', height: `${heightPercent}%`, minHeight: 8, borderRadius: 8, background: current ? 'var(--text)' : 'var(--line)', opacity: current ? 0.86 : 0.72 }} />
                  <span css={{ color: current ? 'var(--text)' : 'var(--sub)', fontSize: 11, fontWeight: current ? 900 : 650, marginTop: 7 }}>{item.label}</span>
                </div>;
              })}</div>
              <div css={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--line)', color: 'var(--sub)', fontSize: 12, fontWeight: 800 }}>
                <span>{trendData?.trendMessage ?? ''}</span>
                <span css={{ color: 'var(--text)', fontWeight: 950 }}>{trendData?.comparedToLastMonth > 0 ? '지출 증가' : '안정 구간'}</span>
              </div>
            </div>
          ) : (
            <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--sub)', fontSize: 13, fontWeight: 700, lineHeight: 1.6, textAlign: 'center' }}>
              차트를 그리기 위한 소비 기록이 부족해요.<br/>기록이 쌓이면 멋진 추이 그래프를 보여드릴게요!
            </div>
          )}
        </Card>
        <Card css={{ display: 'flex', flexDirection: 'column' }}>
          <div css={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}><span css={{ width: 24, height: 24, borderRadius: 8, background: 'var(--ink)', color: 'var(--on-ink)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900 }}>AI</span><b css={{ fontSize: 16 }}>감정소비 분석</b></div>
          <p css={{ color: 'var(--sub)', fontSize: 12, marginBottom: 20 }}>이번 달 지출에 가장 큰 영향을 미친 감정들이에요.</p>
          
          <div css={{
            display: 'flex',
            gap: 12,
            flex: 1,
            '@media (max-width: 820px)': {
              flexDirection: 'column',
              width: '100%'
            }
          }}>
            {emotionCards.map(insight => {
               const isFlipped = flippedCards[insight.emotion];
               return (
                 <div
                   key={insight.emotion}
                   css={{ 
                     flex: 1, 
                     perspective: 1200, 
                     minHeight: 170, 
                     cursor: 'pointer',
                     '@media (max-width: 820px)': { width: '100%', minHeight: 150 }
                   }}
                   onClick={() => toggleFlip(insight.emotion)}
                 >
                   <div css={{
                     width: '100%', height: '100%', position: 'relative',
                     transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                     transformStyle: 'preserve-3d',
                     transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                   }}>
                     <div css={{
                       position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                       padding: '24px 20px', borderRadius: 16, 
                       border: `1px solid ${insight.color + '40'}`, 
                       background: 'var(--card)',
                       display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 3,
                       boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                       '@media (max-width: 820px)': { 
                         display: 'grid',
                         gridTemplateColumns: '1fr auto',
                         gridTemplateAreas: '"percent emotion" "percent amount"',
                         alignItems: 'center',
                         padding: '16px 20px',
                         gap: 2,
                         border: `1px solid ${insight.color + '60'}`,
                         background: `linear-gradient(135deg, var(--card) 40%, ${insight.color + '1A'})`
                       }
                     }}>
                       <span css={{ 
                         fontSize: 'clamp(13px, 3vw, 16px)', color: 'var(--sub)', fontWeight: 800,
                         '@media (max-width: 820px)': { gridArea: 'emotion', justifySelf: 'end', color: 'var(--text)', marginBottom: 2, fontSize: 18 }
                       }}>{insight.emotion}</span>
                       <b css={{ 
                         fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 5.5vw, 36px)', color: 'var(--text)', lineHeight: 1,
                         '@media (max-width: 820px)': { gridArea: 'percent', fontSize: 'clamp(36px, 8vw, 44px)', color: 'var(--text)' }
                       }}>{insight.percent}%</b>
                       <span css={{ 
                         fontSize: 'clamp(11px, 2.5vw, 14px)', color: insight.color, fontWeight: 900,
                         '@media (max-width: 820px)': { gridArea: 'amount', justifySelf: 'end', color: insight.color, fontWeight: 900, fontSize: 16 }
                       }}>{insight.amount}</span>
                     </div>
                     
                     <div css={{
                       position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                       transform: 'rotateY(180deg)',
                       padding: '24px 20px', borderRadius: 16,
                       border: `1.5px solid ${insight.color}`, 
                       background: insight.color + '15',
                       display: 'flex', flexDirection: 'column', 
                       justifyContent: 'flex-start',
                       boxShadow: `0 8px 24px ${insight.color}20`,
                       overflowY: 'auto',
                       scrollbarWidth: 'none',
                       '&::-webkit-scrollbar': { display: 'none' },
                       '@media (max-width: 820px)': { 
                         padding: '16px 14px',
                       }
                     }}>
                       {isInsightsLoading ? (
                         <div css={{ display: 'grid', gap: 7, width: '100%', margin: 'auto 0' }} aria-hidden="true">
                           <Skeleton w="72%" h={15} radius={6} />
                           <Skeleton w="100%" h={13} radius={6} />
                           <Skeleton w="88%" h={13} radius={6} />
                         </div>
                       ) : insight.amount === '0원' ? (
                         <div css={{ fontSize: 'clamp(13px, 3.5vw, 15px)', color: 'var(--sub)', lineHeight: 1.5, wordBreak: 'keep-all', overflowWrap: 'break-word', width: '100%', margin: 'auto 0' }}>
                           아직 이 감정으로 소비한 내역이 없어요.
                         </div>
                       ) : !insight.title ? (
                         <div css={{ fontSize: 'clamp(13px, 3.5vw, 15px)', color: 'var(--sub)', lineHeight: 1.5, wordBreak: 'keep-all', overflowWrap: 'break-word', width: '100%', margin: 'auto 0' }}>
                           일시적인 오류로 분석을 불러오지 못했어요.
                         </div>
                       ) : (
                         <div css={{ width: '100%', margin: 'auto 0' }}>
                           <div css={{ fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: 900, marginBottom: 'clamp(6px, 2vw, 10px)', color: 'var(--text)', wordBreak: 'keep-all', overflowWrap: 'break-word', lineHeight: 1.35 }}>{insight.title}</div>
                           <div css={{ fontSize: 'clamp(12px, 3.2vw, 14px)', color: 'var(--text)', opacity: 0.9, lineHeight: 1.5, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{insight.desc}</div>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               )
            })}
          </div>
        </Card>
      </Duo>

      <Card 
        css={{ 
          display: 'flex', flexDirection: 'column', minHeight: 390,
          '@media (max-width: 820px)': { perspective: 1200, cursor: 'pointer', padding: 0 }
        }}
        onClick={() => {
          if (window.innerWidth <= 820) {
            setPatternFlipped(!patternFlipped);
          }
        }}
      >
        <div css={{ 
          display: 'grid', gridTemplateColumns: 'minmax(280px, .9fr) 1fr', gap: 34, alignItems: 'stretch',
          '@media (max-width: 820px)': {
            display: 'block',
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: patternFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }
        }}>
          <div css={{ 
            display: 'flex', flexDirection: 'column', minWidth: 0,
            '@media (max-width: 820px)': {
              backfaceVisibility: 'hidden',
              padding: 24,
              minHeight: 390
            }
          }}>
            <div css={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
              <span css={{ width: 24, height: 24, borderRadius: 8, background: 'var(--ink)', color: 'var(--on-ink)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900 }}>AI</span>
              <b css={{ fontSize: 16 }}>반복되는 감정소비 패턴</b>
            </div>
            <p css={{ color: 'var(--sub)', fontSize: 12, margin: '0 0 28px', fontWeight: 700 }}>이번 달 가장 자주 반복된 조합이에요</p>

            <div css={{ display: 'grid', gap: 18, marginTop: 8 }}>
              <div css={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 18, alignItems: 'center' }}>
                <div css={{ color: 'var(--text)', fontSize: 52, fontWeight: 950, lineHeight: 1 }}>
                  {hasPattern ? pattern.count : 0}
                </div>
                <div>
                  <div css={{ color: 'var(--sub)', fontSize: 12, fontWeight: 850, marginBottom: 5 }}>반복 횟수</div>
                  <div css={{ color: 'var(--text)', fontSize: 19, fontWeight: 950 }}>
                    {hasPattern ? pattern.title : '아직 발견된 패턴이 없어요'}
                  </div>
                </div>
              </div>

              <div css={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 10, alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                <span css={{ minWidth: 0, opacity: hasPattern ? 1 : 0.4 }}>
                  <span css={{ display: 'block', color: hasPattern ? '#A68BEA' : 'var(--sub)', fontSize: 11, fontWeight: 950, marginBottom: 4 }}>감정</span>
                  <b css={{ color: 'var(--text)', fontSize: 15 }}>{hasPattern ? pattern.emotion : '?'}</b>
                </span>
                <span css={{ color: 'var(--sub)', fontWeight: 900, opacity: hasPattern ? 1 : 0.4 }}>→</span>
                <span css={{ minWidth: 0, opacity: hasPattern ? 1 : 0.4 }}>
                  <span css={{ display: 'block', color: 'var(--sub)', fontSize: 11, fontWeight: 900, marginBottom: 4 }}>사용처</span>
                  <b css={{ color: 'var(--text)', fontSize: 15 }}>{hasPattern ? pattern.category : '?'}</b>
                </span>
                <span css={{ color: 'var(--sub)', fontWeight: 900, opacity: hasPattern ? 1 : 0.4 }}>→</span>
                <span css={{ minWidth: 0, opacity: hasPattern ? 1 : 0.4 }}>
                  <span css={{ display: 'block', color: 'var(--sub)', fontSize: 11, fontWeight: 900, marginBottom: 4 }}>시간</span>
                  <b css={{ color: 'var(--text)', fontSize: 15 }}>{hasPattern ? pattern.time : '?'}</b>
                </span>
              </div>

              <p css={{ margin: 0, color: 'var(--sub)', fontSize: 13, fontWeight: 750, lineHeight: 1.65 }}>
                {hasPattern 
                  ? pattern.desc 
                  : '꾸준히 소비 내역을 기록해 주시면, 숨겨진 소비 패턴을 감지해 AI가 분석해 줘요.'}
              </p>
            </div>
            
            <div css={{ display: 'none', '@media (max-width: 820px)': { display: 'block', textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--sub)', fontWeight: 800 } }}>
              터치하여 소비 내역 보기 ↺
            </div>
          </div>

          <div css={{ 
            display: 'flex', flexDirection: 'column', minHeight: 0, borderLeft: '1px solid var(--line)', paddingLeft: 28,
            '@media (max-width: 820px)': {
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              padding: 24,
              borderLeft: 'none',
              background: 'var(--card)',
              borderRadius: 26,
              overflow: 'hidden'
            }
          }}>
            <div css={{ display: 'grid', gridTemplateColumns: '84px 1fr auto', gap: 14, padding: '0 0 12px', fontSize: 11, color: 'var(--sub)', fontWeight: 900, borderBottom: '1px solid var(--line)' }}>
              <span>날짜</span><span>내역</span><span>금액</span>
            </div>
            <div css={{ overflowY: 'auto', flex: 1, paddingBottom: 16 }}>
              {evidence.map((ev, idx) => {
                const emo = getEmotion(ev.emotion);
                return <div key={`${ev.date}-${idx}`} css={{ display: 'grid', gridTemplateColumns: '84px 1fr auto', gap: 14, alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--line)' }}>
                  <span css={{ color: 'var(--sub)', fontSize: 12, fontWeight: 800 }}>{ev.date}</span>
                  <div css={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <span css={{ width: 7, height: 7, borderRadius: '50%', background: emo.color, flexShrink: 0 }} />
                    <b css={{ color: 'var(--text)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.category}</b>
                    <span css={{ display: 'none', '@media (min-width: 901px)': { display: 'inline' }, color: emo.text || emo.color, fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{ev.emotion}</span>
                  </div>
                  <b css={{ color: 'var(--text)' }}>-{Number(ev.amount).toLocaleString()}원</b>
                </div>;
              })}
            </div>
            
            <div css={{ display: 'none', '@media (max-width: 820px)': { display: 'block', textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--sub)', fontWeight: 800 } }}>
              돌아가기 ↺
            </div>
          </div>
        </div>
      </Card>
    </Page>
  );
}
