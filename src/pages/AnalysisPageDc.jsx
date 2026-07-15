/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { getEmotion, emotions } from '../data/emotions.js';
import { useMonthlyAnalysisQuery, useAiInsightsQuery, useMonthlyTrendQuery, useBudgetStatusQuery, usePatternQuery } from '../hooks/queries/useAnalysis.js';

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
    box-shadow: 0 0 16px rgba(232, 117, 115, .74), 0 0 0 3px rgba(232, 117, 115, .16);
  }
`;

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

  const { data: analysis } = useMonthlyAnalysisQuery(globalDate.getFullYear(), globalDate.getMonth() + 1);
  const { data: insightsData } = useAiInsightsQuery();
  const { data: trendData } = useMonthlyTrendQuery();
  const { data: budgetData } = useBudgetStatusQuery();
  const { data: patternData } = usePatternQuery();

  const monthly = trendData?.monthlyData ?? [];

  const aiQuickInsights = insightsData?.aiQuickInsights?.length > 0 ? insightsData.aiQuickInsights : [
    { label: '위험 루트', value: '-', note: '-', color: 'var(--sub)', type: 'default' },
    { label: '팩트 리포트', value: '-', note: '-', color: '#E87573', type: 'fact' },
    { label: '소비 위험도', value: '-', note: '-', color: '#E87573', type: 'risk' },
    { label: 'AI 맞춤 챌린지', value: '-', note: '-', color: 'var(--sub)', type: 'default' }
  ];
  
  const emotionCardsData = insightsData?.emotionCards ?? [];
  const evidence = patternData?.evidence ?? [];
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
      color: emo.color
    };
  }).sort((a, b) => {
    if (b.percent !== a.percent) return b.percent - a.percent;
    return b.amount - a.amount;
  });
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

  // 감정소비 카드: 앞면(감정·비율·금액·색)은 §9 byEmotion 상위 3건, 뒷면 문구만 정적 카피(emotionCardsData).
  const emotionCards = emotionSegments.slice(0, 3).map((item, index) => ({
    emotion: item.name,
    percent: item.percent,
    amount: item.amount,
    color: item.color,
    title: emotionCardsData[index]?.title ?? '',
    desc: emotionCardsData[index]?.desc ?? ''
  }));
  const activeChart = chartConfig[activeChartTab];
  const serverBudgetItems = budgetData?.budgetItems ?? [];
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
        {aiQuickInsights.map(item => (
          <InsightItem key={item.label}>
            {item.type === 'risk' ? (
              <RiskSignal aria-hidden="true">
                <i className="green" />
                <i className="yellow" />
                <i className="red active" />
              </RiskSignal>
            ) : (
              <span css={{
                width: item.type === 'fact' ? 10 : 8,
                height: item.type === 'fact' ? 40 : 34,
                borderRadius: 99,
                background: item.color,
                opacity: item.type === 'fact' ? 1 : (isDark ? 0.86 : 0.72),
                boxShadow: item.type === 'fact' ? '0 0 0 4px rgba(232,117,115,.12)' : `0 10px 22px -14px ${item.color}`
              }} />
            )}
            <div css={{ minWidth: 0 }}>
              <div css={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span css={{ color: 'var(--sub)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}>{item.label}</span>
                <span css={{ color: item.type === 'fact' ? '#E87573' : item.color, fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}>{item.note}</span>
              </div>
              <div css={{
                marginTop: 3,
                color: item.type === 'fact' ? '#E87573' : 'var(--text)',
                fontSize: item.type === 'fact' ? 14 : 13,
                fontWeight: item.type === 'fact' ? 950 : 900,
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>{item.value}</div>
            </div>
          </InsightItem>
        ))}
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

              <div css={{ display: 'grid', gap: 12 }}>{budgetItems.map(item => {
                const displayProgress = item.isMeasuring ? 0 : Math.min(item.progress, 100);
                const statusText = item.isMeasuring ? '측정중' : item.isOver ? '초과' : item.progress >= 90 ? '주의' : '안정';
                const statusColor = item.isMeasuring ? 'var(--sub)' : item.isOver ? '#E87573' : 'var(--sub)';

                return <div key={item.name} css={{ display: 'grid', gridTemplateColumns: 'minmax(76px, .52fr) 1fr minmax(82px, auto)', alignItems: 'center', gap: 12 }}>
                  <div css={{ minWidth: 0 }}>
                    <b css={{ display: 'block', fontSize: 13, color: 'var(--text)' }}>{item.name}</b>
                    <span css={{ display: 'inline-block', marginTop: 3, color: 'var(--sub)', fontSize: 10, fontWeight: 850 }}>{item.emotion}</span>
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
            flex: 1
          }}>
            {emotionCards.map(insight => {
               const isFlipped = flippedCards[insight.emotion];
               return (
                 <div
                   key={insight.emotion}
                   css={{ flex: 1, perspective: 1200, minHeight: 180, cursor: 'pointer' }}
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
                       '@media (max-width: 820px)': { padding: '16px 12px' }
                     }}>
                       <span css={{ fontSize: 'clamp(13px, 3vw, 16px)', color: 'var(--sub)', fontWeight: 800 }}>{insight.emotion}</span>
                       <b css={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 5.5vw, 36px)', color: 'var(--text)', lineHeight: 1 }}>{insight.percent}%</b>
                       <span css={{ fontSize: 'clamp(11px, 2.5vw, 14px)', color: insight.color, fontWeight: 900 }}>{insight.amount}</span>
                     </div>
                     
                     <div css={{
                       position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                       transform: 'rotateY(180deg)',
                       padding: '24px 20px', borderRadius: 16,
                       border: `1.5px solid ${insight.color}`, 
                       background: insight.color + '15',
                       display: 'flex', flexDirection: 'column', justifyContent: 'center',
                       boxShadow: `0 8px 24px ${insight.color}20`,
                       '@media (max-width: 820px)': { padding: '16px 10px' }
                     }}>
                       <div css={{ fontSize: 'clamp(12px, 3.2vw, 16px)', fontWeight: 900, marginBottom: 'clamp(6px, 2vw, 12px)', color: 'var(--text)', wordBreak: 'keep-all', lineHeight: 1.3 }}>{insight.title}</div>
                       <div css={{ fontSize: 'clamp(10px, 2.5vw, 13px)', color: 'var(--sub)', lineHeight: 1.45, wordBreak: 'keep-all' }}>{insight.desc}</div>
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
