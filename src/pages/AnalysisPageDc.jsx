/** @jsxImportSource @emotion/react */
import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { RotateCw } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { ChallengeFlag } from '../components/analysis/ChallengeFlag.jsx';
import { RiskRouteIcon } from '../components/analysis/RiskRouteIcon.jsx';
import { FactBomberIcon } from '../components/analysis/FactBomberIcon.jsx';
import { EmotionBlob } from '../components/common/EmotionBlob.jsx';
import { getEmotion, emotions } from '../data/emotions.js';
import { useMonthlyAnalysisQuery, useAiReportQuery, useAiInsightsQuery, useMonthlyTrendQuery, usePatternQuery, useBudgetStatusQuery } from '../hooks/queries/useAnalysis.js';
import { monthAnchorDate } from '../utils/date.js';

/**
 * 분석 문구를 문장 단위 문단으로 끊는다.
 * 마침표·물음표·느낌표 뒤의 공백에서만 자른다. 서버가 이미 줄바꿈을 넣어 보내면 그것도 존중한다.
 * 문장이 하나뿐이어도 그대로 한 문단이 되므로 옛 문구에도 안전하다.
 */
/**
 * 값이 0인 항목은 목록에서 감춘다.
 *
 * 감정 탭은 8개 감정을 항상 다 그려서, 기록이 없는 '스트레스 0% · 화남 0% · 무덤덤 0%' 가
 * 실제 소비가 있는 줄만큼 자리를 차지했다. 목록이 데이터가 아니라 감정 사전처럼 읽힌다.
 *
 * 전부 0이면 그 달에 기록이 없다는 뜻이라 거를 게 아니라 보여줄 게 없는 것이므로,
 * 빈 목록 대신 원본을 그대로 둔다(카드가 통째로 비어 보이는 것보다 낫다).
 */
function visibleSegments(segments) {
  const filtered = segments.filter(seg => seg.percent > 0);
  return filtered.length > 0 ? filtered : segments;
}

function toParagraphs(text) {
  return String(text ?? '')
    .split(/\n+|(?<=[.!?])\s+/)
    .map(line => line.trim())
    .filter(Boolean);
}

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
    /* 칸 폭이 곧 글자 폭이다. 좌우 여백과 열 간격을 줄여 라벨·등급이 들어갈 자리를 만든다. */
    padding-left: 12px;
    padding-right: 12px;
    column-gap: 8px;

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

  /* 모바일에서 이 신호등만 52px 이었다. 다른 칸 아이콘은 19px 이라 위험도 칸만
     글자 쓸 폭이 33px 좁았고, 그래서 등급('안전')이 잘려 나갔다.
     등급을 글자로도 보여주게 된 뒤로는 이만큼 클 이유도 없다. */
  @media (max-width: 820px) {
    width: 37px;
    height: 20px;
    padding: 4px 5px;
    gap: 3px;

    i {
      width: 7px;
      height: 7px;
    }

    i.active {
      box-shadow: 0 0 11px ${({ glow = '#E87573' }) => glow}bd, 0 0 0 2px ${({ glow = '#E87573' }) => glow}29;
    }
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

// 위험 루트도 type 이 'default' 라 챌린지와 마찬가지로 label 로 가른다.
const RISK_ROUTE_LABEL = '위험 루트';

// 위험도 값이 없으면 null → 신호등 세 칸 모두 꺼진 상태로 둔다. 임의로 한 칸을 켜지 않는다.
// 서버(AiQuickInsightAssembler)는 등급을 위험도 항목의 value에 한글로 담아 보낸다.
// '예산 미설정'은 등급이 아니라 판정 불가라 매핑하지 않는다 → 세 칸 모두 꺼짐.
const RISK_WORDS = { 위험: 'RED', 주의: 'YELLOW', 안전: 'GREEN' };

/**
 * 예산 소진율 색 구간. 소비 위험도 신호등과 같은 기준·같은 팔레트를 쓴다 —
 * 같은 화면에서 같은 숫자를 놓고 두 곳이 다른 색을 켜면 안 된다.
 *
 * 경계는 서버 판정(SpendStatus.of)과 같은 값이다: 70 미만 안전 · 70~90 주의 · 90 이상 위험.
 * 서버 등급을 그대로 받아 쓰지 않고 여기서 다시 계산하는 이유는, 화면에 찍히는 숫자가
 * 프론트에서 구한 budgetAverage 라서다. 색은 자기 옆에 적힌 숫자를 따라야 한다.
 */
function budgetRateLevel(rate) {
  if (rate >= 90) return RISK_LEVELS.RED;
  if (rate >= 70) return RISK_LEVELS.YELLOW;
  return RISK_LEVELS.GREEN;
}

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
  // 칸마다 따로 여닫는다. 하나를 열 때 다른 하나가 닫히면, 두 개를 나란히 놓고
  // 비교하려던 사용자가 방금 연 것을 다시 열어야 한다. 닫는 건 사용자가 정한다.
  const [expandedInsights, setExpandedInsights] = useState({});

  const { data: analysis } = useMonthlyAnalysisQuery(globalDate.getFullYear(), globalDate.getMonth() + 1);
  const { data: insightsData, isLoading: isInsightsLoading } = useAiInsightsQuery(globalDate.getFullYear(), globalDate.getMonth() + 1);
  const { data: reportData } = useAiReportQuery(globalDate.getFullYear(), globalDate.getMonth() + 1);
  const { data: trendData } = useMonthlyTrendQuery();
  // 전역 예산 상태 대신 선택된 달의 예산 현황을 동적으로 패칭한다 (#284)
  const { data: budgetData } = useBudgetStatusQuery(globalDate.getFullYear(), globalDate.getMonth() + 1);
  const serverBudgetItems = budgetData?.budgetItems ?? [];
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
      count,
      amountValue: amount
    };
  }).sort((a, b) => {
    // 정렬 기준은 "어떤 기분으로 자주 소비했나" — 건수가 1순위다.
    // percent 로 비교하면 반올림 때문에 건수가 다른데도 동률이 되어(예: 300건 중 7건과 8건이 모두 2%)
    // 금액으로 뒤집힌다. 3건짜리 감정이 1건짜리에게 밀리면 안 되므로 원시 건수로 비교한다.
    // 금액은 건수가 같을 때만 본다 (#280).
    if (b.count !== a.count) return b.count - a.count;
    return b.amountValue - a.amountValue;
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

  // 탭마다 목록 줄 수가 달라(감정 8줄 / 사용처·시간대 4줄) 전환할 때마다 카드 높이가 튄다.
  // 가장 긴 탭에 맞춰 빈 줄로 자리를 잡아 높이를 고정한다. px 을 박지 않으므로
  // 글자 크기나 항목 수가 바뀌어도 따라간다 (#280).
  // 0% 를 감춘 뒤의 줄 수로 센다. 원본 길이로 재면 감정 탭이 늘 8줄로 잡혀 빈 공간이 남는다.
  const activeSegments = visibleSegments(activeChart.segments);
  const segmentRowCount = Math.max(
    visibleSegments(chartConfig.emotion.segments).length,
    visibleSegments(chartConfig.category.segments).length,
    visibleSegments(chartConfig.time.segments).length
  );
  const segmentPlaceholders = Math.max(0, segmentRowCount - activeSegments.length);
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
  /**
   * 소진율은 '카테고리별 진행률의 평균'이 아니라 '총액 대비'로 낸다.
   *
   * 산술평균은 2만원짜리 카테고리와 30만원짜리 카테고리를 같은 무게로 세서, 같은 화면의
   * 소비 위험도(총지출÷총예산)와 다른 숫자가 나왔다 — 한쪽은 36%, 한쪽은 44%.
   * 정의를 위험도와 맞추고, 근거가 되는 총예산 금액도 함께 보여준다.
   */
  const budgetTotal = validBudgetItems.reduce((sum, item) => sum + item.budget, 0);
  const budgetSpent = validBudgetItems.reduce((sum, item) => sum + item.amount, 0);
  const budgetAverage = budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0;
  // '측정중'은 아직 판정할 수 없는 상태라 구간 색을 입히지 않는다 (아래 항목별 '측정중'과 같은 색).
  const budgetRateColor = validBudgetItems.length > 0 ? budgetRateLevel(budgetAverage).color : 'var(--sub)';
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
          const isExpanded = !!expandedInsights[item.label];
          const isRisk = item.type === 'risk';
          // 칸의 기본 구성은 [라벨 옆 = note] [본문 = value] 다.
          // 소비 위험도만 모바일에서 뒤집는다 — 등급(안전·주의·위험)이 라벨 옆, 예산 소진율이 본문.
          // 데스크톱 위험도는 기존 배치를 그대로 두므로 본문은 아래에서 브레이크포인트로 가른다.
          const headline = isRisk ? item.value : item.note;
          // 팩트 리포트는 본문이 이미 금액을 말해 '이번 달 N원'이 중복이고,
          // 챌린지의 '이번 주'는 모든 챌린지가 이번 주라 아무것도 알려주지 않는다.
          const showHeadline = item.type !== 'fact' && item.label !== CHALLENGE_LABEL;
          // 본문 문구 손질. 서버 문자열은 그대로 두고 읽는 리듬만 바꾼다.
          // - 위험 루트: 가운뎃점을 화살표로. 시간 → 감정 → 사용처로 이어지는 '경로'라
          //   방향이 보여야 한다(아래 반복 패턴 카드도 같은 화살표를 쓴다).
          // - 팩트 리포트: 첫 쉼표에서 줄을 바꾼다. 모바일은 pre-line 으로 그 줄바꿈이 살고,
          //   데스크톱은 nowrap 이라 공백으로 접혀 한 줄 그대로다.
          const bodyText = item.label === RISK_ROUTE_LABEL
            ? String(item.value ?? '').replace(/\s*·\s*/g, ' → ')
            : item.type === 'fact'
              ? String(item.value ?? '').replace(/,\s*/, ',\n')
              : item.value;
          return (
          <InsightItem
            key={item.label}
            onClick={() => {
              if (window.innerWidth <= 820) {
                setExpandedInsights(prev => ({ ...prev, [item.label]: !prev[item.label] }));
              }
            }}
            css={{
              cursor: 'pointer',
              // 펼침 여부로 정렬 방식을 바꾸면 라벨이 크게 튀어 오른다(옆 칸이 펼쳐져 칸이
              // 높을 때 특히). 정렬은 어느 상태에서나 같게 두고, 내용 묶음만 칸 가운데에 놓는다.
              //
              // alignItems 는 행 안에서의 정렬이라 아이콘과 라벨 줄이 서로 세로 가운데로 맞물린다.
              // 라벨 줄 높이는 펼쳐도 그대로라 이 값은 튀는 것과 무관하다.
              alignItems: 'center',
              alignContent: 'center',
              paddingTop: 12,
              paddingBottom: 12,
              transition: 'all 0.2s ease',
              '@media (min-width: 821px)': { cursor: 'default', alignItems: 'center', alignContent: 'normal', paddingTop: 6, paddingBottom: 6 }
            }}
          >
            {item.type === 'risk' ? (
              <RiskSignal glow={risk?.color} role="img" aria-label={`소비 위험도 ${risk?.value ?? '측정중'}`}>
                {['green', 'yellow', 'red'].map(lamp => (
                  <i key={lamp} className={lamp === risk?.lamp ? `${lamp} active` : lamp} />
                ))}
              </RiskSignal>
            ) : item.label === CHALLENGE_LABEL ? (
              <ChallengeFlag />
            ) : item.type === 'fact' ? (
              <FactBomberIcon color={item.color} />
            ) : (
              <RiskRouteIcon />
            )}
            {/* 데스크톱은 [라벨+본문] 옆에 note 를 두고 세로 중앙에 맞춘다.
                note 를 라벨 줄 안에 두면 baseline 에 묶여 위로 붙어 보인다 (#280). */}
            {/* 모바일에서는 이 두 겹의 래퍼를 display:contents 로 없앤다.
                래퍼가 아이콘 오른쪽 열에 갇혀 있으면 본문도 그 좁은 열에 갇힌다.
                위험도 칸은 신호등이 52px(다른 아이콘은 19px)라 글자 폭이 33px 더 좁아,
                거기서만 '예산의 60% 사용'이 두 줄로 접혔다. 래퍼를 없애면 라벨 줄과 본문이
                InsightItem 의 직접 자식이 되어, 본문이 아이콘 아래까지 한 줄로 쓸 수 있다. */}
            <div css={{
              display: 'contents',
              minWidth: 0,
              '@media (min-width: 821px)': { display: 'flex', alignItems: 'center', gap: 12 }
            }}>
              <div css={{ display: 'contents', minWidth: 0, '@media (min-width: 821px)': { display: 'block', flex: 1, minWidth: 0 } }}>
              {/* 모바일은 칸이 좁아 gap 10 이면 등급('안전')이 잘려 나간다. 6 으로 줄인다. */}
              <div css={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, width: '100%', '@media (min-width: 821px)': { gap: 10 } }}>
                {/* 자리가 모자라면 줄어드는 쪽은 라벨이다. 좁은 기기에서 둘 중 하나가
                    잘려야 한다면, 아이콘이 이미 무슨 칸인지 말해 주는 라벨보다
                    등급('안전')이 살아남아야 한다. */}
                <span css={{
                  color: 'var(--sub)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap',
                  minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
                  '@media (min-width: 821px)': { flexShrink: 0, overflow: 'visible' }
                }}>{item.label}</span>
                {showHeadline && (isInsightsLoading
                  ? <Skeleton w="44px" h={11} radius={5} />
                  : <span css={{
                      color: item.color,
                      // 라벨과 나란히 한 줄에 들어가야 한다. 키우면 '소비 위험도'와 꺾쇠 사이가
                      // 꽉 차 보여서 다른 칸의 note 와 같은 11px 로 둔다.
                      fontSize: 11,
                      fontWeight: 950,
                      whiteSpace: isExpanded ? 'normal' : 'nowrap',
                      overflow: isExpanded ? 'visible' : 'hidden',
                      textOverflow: isExpanded ? 'clip' : 'ellipsis',
                      textAlign: 'right',
                      wordBreak: isExpanded ? 'keep-all' : 'normal',
                      minWidth: 0,
                      flexShrink: 0,
                      // 위험도 등급은 접혀 있을 때도 보인다 — 펼치지 않고 확인하려고 보는 값이다.
                      display: (isRisk || isExpanded) ? 'inline' : 'none',
                      // 데스크톱에서는 아래쪽 전용 note 가 대신 나온다(세로 중앙 정렬 때문).
                      '@media (min-width: 821px)': { display: 'none' }
                    }}>{headline}</span>)}
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

              {/* 0fr → 1fr 로 높이를 부드럽게 여닫는다. 데스크톱은 항상 열린 상태.
                  모바일에서는 위 래퍼가 display:contents 라 이 블록이 InsightItem 의 직접
                  자식이 된다. 두 열을 다 걸치게 해 아이콘 아래 폭까지 본문이 쓴다. */}
              <div css={{
                display: 'grid',
                gridColumn: '1 / -1',
                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                transition: 'grid-template-rows .24s ease',
                '@media (min-width: 821px)': { gridColumn: 'auto', gridTemplateRows: '1fr' }
              }}>
                <div css={{ minHeight: 0, overflow: 'hidden' }}>
                  {isInsightsLoading ? (
                    <Skeleton w="82%" h={item.type === 'fact' ? 17 : 16} radius={6} css={{ marginTop: 4 }} />
                  ) : (
                  <div css={{
                    marginTop: 3,
                    color: item.type === 'fact' ? '#E87573' : 'var(--text)',
                    // 팩트 리포트는 모바일에서 두세 줄로 접혀 덩치가 커진다.
                    // 네 칸 중 한 칸만 크게 외치는 꼴이라 모바일에서만 낮춘다(데스크톱은 한 줄이라 그대로).
                    // 위험도도 note 가 '아직 303,600원 남았어요' 처럼 길어져 같은 처지가 됐다.
                    fontSize: (item.type === 'fact' || isRisk) ? 12.5 : 13,
                    fontWeight: item.type === 'fact' ? 900 : 900,
                    lineHeight: 1.35,
                    overflow: 'visible',
                    // 팩트 리포트만 위에서 넣은 줄바꿈을 살린다.
                    whiteSpace: item.type === 'fact' ? 'pre-line' : 'normal',
                    wordBreak: 'keep-all',
                    overflowWrap: 'anywhere',
                    '@media (min-width: 821px)': {
                      fontSize: item.type === 'fact' ? 14 : 13,
                      fontWeight: item.type === 'fact' ? 950 : 900,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'normal',
                      overflowWrap: 'normal'
                    }
                  }}>
                    {isRisk ? (
                      <>
                        <span css={{ '@media (min-width: 821px)': { display: 'none' } }}>{item.note}</span>
                        {/* 색 규칙은 모바일과 같게 맞춘다 — 초록은 '안전'이라는 판정에 붙고,
                            소진율은 판정이 아니라 수치라 기본색이다. 자리만 좌우가 다를 뿐이다. */}
                        <span css={{ display: 'none', '@media (min-width: 821px)': { display: 'inline', color: item.color } }}>{item.value}</span>
                      </>
                    ) : bodyText}
                  </div>
                  )}
                </div>
              </div>
              </div>

              {/* 데스크톱 전용 note. 라벨 줄이 아니라 항목 전체를 기준으로 세로 중앙에 놓인다 (#280).
                  - 팩트 리포트: 본문이 이미 금액을 말해줘 '이번 달 N원'이 중복이라 감춘다
                  - AI 맞춤 챌린지: 모든 챌린지가 이번 주라 '이번 주'는 아무것도 구분해 주지 않는다
                  - 위험 루트(건수) · 소비 위험도(예산 소진율): 본문만으로 알 수 없는 수치라 키운다 */}
              {!isInsightsLoading && showHeadline && (
                <span css={{
                  display: 'none',
                  '@media (min-width: 821px)': {
                    display: 'block',
                    flexShrink: 0,
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    // 위험도 칸에서 초록을 가져가는 건 등급('안전')이다. 여기 오는 소진율은 기본색.
                    color: isRisk ? 'var(--text)' : item.color,
                    // 위험도 note 가 소진율(짧음)에서 남은 금액(김)으로 바뀌어 nowrap 으로는 13.5 가 넘쳤다.
                    fontSize: isRisk ? 12 : (item.label === RISK_ROUTE_LABEL ? 13.5 : 11),
                    fontWeight: (isRisk || item.label === RISK_ROUTE_LABEL) ? 950 : 900
                  }
                }}>{item.note}</span>
              )}
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
            {/* stretch 라야 두 칸이 같은 높이가 되고, 그래야 사이 구분선도 위아래가 꽉 찬다.
                flex-end 는 아래만 맞춰서 글자 크기가 다르면 윗변이 어긋나 보였다. */}
            <div css={{ flexShrink: 0, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end', '@media (min-width: 821px)': { gap: 26 } }}>
              {/*
                데스크톱 전용 총 예산 칸.
                제목과 소진율 사이가 넓게 비어 있는데 총 예산은 오른쪽 구석에 10.5px 로 눌려
                셋 중 가장 안 읽혔다. 소진율의 분모라 이게 안 보이면 40%가 무엇의 40%인지 알 수 없다.
                비어 있던 가로 공간으로 꺼내 소진율과 나란한 두 번째 지표로 세운다.
                모바일은 폭이 없어 아래 한 줄짜리를 그대로 쓴다 — 그래서 마크업이 둘로 갈린다.
              */}
              {validBudgetItems.length > 0 && (
                <div css={{ display: 'none', '@media (min-width: 821px)': { display: 'block', textAlign: 'right', paddingRight: 26, borderRight: '1px solid var(--line)' } }}>
                  <div css={{ color: 'var(--sub)', fontSize: 11.5, fontWeight: 800, marginBottom: 7, lineHeight: 1.2 }}>총 예산</div>
                  {/* 옆 소진율과 같은 크기·같은 lineHeight 라야 두 숫자의 윗변·아랫변이 나란히 선다.
                      강조는 크기가 아니라 색이 가져간다(소진율만 신호등 색). */}
                  <div css={{ color: 'var(--text)', fontSize: 24, fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap' }}>
                    {budgetTotal.toLocaleString()}원
                  </div>
                </div>
              )}

              <div css={{ textAlign: 'right' }}>
                {/* 옆 '총 예산' 칸과 같은 꼴로 맞춘다 — 라벨이 위, 숫자가 아래.
                    두 지표가 서로 다른 순서면 나란히 놓았을 때 한 쌍으로 안 읽힌다. */}
                <div css={{ color: 'var(--sub)', fontSize: 11, fontWeight: 800, marginBottom: 4, lineHeight: 1.2, '@media (min-width: 821px)': { fontSize: 11.5, marginBottom: 7 } }}>예산 소진율</div>
                {/* 색은 소진율 자체가 정한다. 예전엔 overBudgetItem 이 빨강을 정해서, 총액 40%처럼
                    여유로운 달에도 카테고리 하나가 초과하면 '많이 썼다'로 읽혔다.
                    초과 사실은 바로 아래 '초과' 블록이 이미 말해준다. */}
                <div css={{ color: budgetRateColor, fontSize: 18, fontWeight: 950, lineHeight: 1, '@media (min-width: 821px)': { fontSize: 24 } }}>
                  {validBudgetItems.length > 0 ? `${budgetAverage}%` : '측정중'}
                </div>
                {validBudgetItems.length > 0 && (
                  <div css={{ color: 'var(--sub)', fontSize: 10.5, fontWeight: 700, marginTop: 3, whiteSpace: 'nowrap', '@media (min-width: 821px)': { display: 'none' } }}>
                    총 예산 {budgetTotal.toLocaleString()}원
                  </div>
                )}
              </div>
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

        {/* 높이는 옆 '목표 예산 현황' 카드와 같이 간다(Duo 기본 stretch).
            남는 높이는 안쪽 그리드의 alignItems: center 가 위아래로 나눠 갖는다. */}
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
            /* 왼쪽 지표 묶음이 오른쪽(목록+탭)보다 짧다. 위를 맞추면 왼쪽 아래가 비어 기울어 보여서,
               짧은 쪽을 긴 쪽의 세로 가운데에 건다. */
            alignItems: 'center',
            '@media (max-width: 820px)': { gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'center', marginTop: 18 }
          }}>
            {/* 바깥은 가운데 정렬, 안쪽 묶음은 왼쪽 정렬.
                묶음 전체가 하나의 덩어리로 칼럼 가운데에 걸리고, 라벨→숫자→막대→설명은
                묶음 안에서 왼쪽 축을 공유한다. 둘 다 필요해서 한 겹을 더 둔다. */}
            <div css={{ display: 'grid', justifyItems: 'center' }}>
            <div css={{ display: 'grid', justifyItems: 'start', gap: 10, '@media (max-width: 820px)': { gap: 5 } }}>
              {/* 감정(사용처·시간대)이 퍼센트 위로 온다 — 무엇의 40%인지 먼저 말해줘야 숫자가 읽힌다.
                  같은 화면 예산 헤더도 라벨이 위, 숫자가 아래라 규칙이 일관된다. */}
              {/* 라벨과 숫자는 같은 것을 가리키므로 색도 같이 간다(감정 탭이면 감정색).
                  사용처·시간대 탭은 activeChart.color 가 var(--text) 라 기존과 동일하다. */}
              <div css={{ color: activeChart.color, fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 950 }}>{activeChart.label}</div>
              <div css={{ fontFamily: 'var(--font-display)', color: activeChart.color, fontSize: 'clamp(46px, 8vw, 56px)', fontWeight: 950, lineHeight: .95, '@media (max-width: 820px)': { fontSize: 56 } }}>{activeChart.percent}%</div>
              {/* 막대는 숫자 바로 아래에 붙는다 — 같은 값을 말하는 둘이라 한 덩어리로 묶이고,
                  설명 문구는 그 묶음을 풀어주는 말이라 맨 뒤로 간다. */}
              <div css={{ width: 'min(100%, 220px)', '@media (max-width: 820px)': { display: 'none' } }}>
                <BarTrack css={{ height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(31,32,54,0.08)' }}>
                  <div css={{ width: `${activeChart.percent}%`, height: '100%', borderRadius: 99, background: activeChart.color, opacity: .86 }} />
                </BarTrack>
              </div>
              <div css={{ maxWidth: 230, color: 'var(--sub)', fontSize: 12, fontWeight: 750, lineHeight: 1.55, textAlign: 'left', wordBreak: 'keep-all', '@media (max-width: 820px)': { display: 'none' } }}>{activeChart.focus}</div>
            </div>
            </div>

            <div css={{ display: 'grid', gap: 14, '@media (max-width: 820px)': { maxWidth: 165, width: '100%', justifySelf: 'end' } }}>
              <div css={{ display: 'grid', gap: 9 }}>
                {activeSegments.map((seg, index) => {
                  const isPrimary = index === 0;
                  return <div key={seg.name} css={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 9 }}>
                    <span css={{ width: isPrimary ? 10 : 8, height: isPrimary ? 10 : 8, borderRadius: '50%', background: activeChartTab === 'emotion' ? seg.color : 'var(--text)', opacity: activeChartTab === 'emotion' ? (isPrimary ? 1 : .5) : (isPrimary ? .6 : .22) }} />
                    <span css={{ color: isPrimary ? 'var(--text)' : 'var(--sub)', fontSize: isPrimary ? 14 : 12, fontWeight: isPrimary ? 950 : 850 }}>{seg.name}</span>
                    <span css={{ color: isPrimary && activeChartTab === 'emotion' ? seg.color : 'var(--sub)', fontSize: isPrimary ? 14 : 12, fontWeight: 950 }}>{activeChartTab === 'category' ? seg.amount : `${seg.percent}%`}</span>
                  </div>;
                })}
                {Array.from({ length: segmentPlaceholders }, (_, index) => (
                  <div key={`segment-placeholder-${index}`} aria-hidden="true" css={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 9, visibility: 'hidden' }}>
                    <span css={{ width: 8, height: 8, borderRadius: '50%' }} />
                    <span css={{ fontSize: 12, fontWeight: 850 }}>&nbsp;</span>
                    <span css={{ fontSize: 12, fontWeight: 950 }}>&nbsp;</span>
                  </div>
                ))}
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
                      setGlobalDate(monthAnchorDate(y, itemMonth));
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
          <p css={{ color: 'var(--sub)', fontSize: 12, marginBottom: 20 }}>
            이번 달 지출에 가장 큰 영향을 미친 감정들이에요. 카드를 누르면 말랑이의 분석을 볼 수 있어요.
          </p>
          
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
                       // 데스크톱은 카드 폭에 비해 왼쪽에 쏠려 있어 허전했다. 가운데로 모은다 (#310).
                       display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                       textAlign: 'center',
                       boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                       // 힌트는 absolute 로 얹고, 아래 여백으로 자리를 비워 겹치지 않게 한다.
                       // 모바일은 grid-template-areas 로 배치가 고정돼 있어 자식을 흐름에 넣으면
                       // 칸이 어긋난다. 앞면 자체가 inset:0 의 absolute 라 그것이 기준이 된다.
                       paddingBottom: 34,
                       overflow: 'hidden',
                       '@media (max-width: 820px)': {
                         display: 'grid',
                         // 두 열 다 auto 로 두고 justifyContent 로 좌우 끝에 붙인다.
                         // 어느 한쪽이 1fr 이면 그 열이 남는 폭을 먹어 정렬이 그쪽에 끌려간다.
                         gridTemplateColumns: 'auto auto',
                         gridTemplateAreas: '"percent emotion" "percent amount"',
                         alignItems: 'center',
                         // 행 높이를 안 잡아두면 두 행이 카드 높이에 맞춰 늘어나
                         // 감정명은 위로, 금액은 아래로 벌어진다. 내용만큼만 쓰고 가운데로 모은다.
                         alignContent: 'center',
                         justifyContent: 'space-between',
                         // 힌트가 왼쪽 상단으로 갔으니 자리를 위쪽에 비워 준다.
                         padding: '30px 18px 16px',
                         columnGap: 14,
                         rowGap: 1,
                         border: `1px solid ${insight.color + '60'}`,
                         background: `linear-gradient(135deg, var(--card) 40%, ${insight.color + '1A'})`
                       }
                     }}>
                       {/*
                         셋이 비슷한 무게로 경쟁해 시선 둘 데가 없었다. 위계를 나눈다 (#310).
                         감정명은 색점 하나 붙인 작은 라벨, 퍼센트가 주인공, 금액은 구분선 아래 각주.
                         모바일은 카드가 넓고 낮아 세로로 못 쌓는다. 퍼센트를 왼쪽에 두고
                         감정명·금액을 그 오른쪽에 두 줄로 붙여 한 덩어리로 읽히게 한다.
                       */}
                       <span css={{ 
                         display: 'flex', alignItems: 'center', gap: 5,
                         // 퍼센트 위 왼쪽에 붙인다. 가운데 정렬 흐름에서 이것만 왼쪽으로 뺀다.
                         alignSelf: 'flex-start',
                         fontSize: 12, color: 'var(--sub)', fontWeight: 700, letterSpacing: '.02em',
                         // 퍼센트 바로 옆에 왼쪽 정렬로 붙인다. 오른쪽 끝으로 밀어두면
                         // 퍼센트와 짝으로 안 읽힌다. 아래 금액과는 행 경계에서 맞물리게
                         // alignSelf 로 서로를 향해 붙인다(감정명 end, 금액 start).
                         '@media (max-width: 820px)': { gridArea: 'emotion', alignSelf: 'end', justifySelf: 'start', color: 'var(--text)', marginBottom: 0, fontSize: 17, fontWeight: 800, letterSpacing: 0, lineHeight: 1.2, gap: 6 }
                       }}>
                         {/* 감정명 앞 색점은 데스크톱과 같이 모바일에도 둔다. 글자가 커진 만큼 점도 키운다. */}
                         <i css={{
                           width: 6, height: 6, borderRadius: '50%', background: insight.color, flex: '0 0 auto',
                           '@media (max-width: 820px)': { width: 7, height: 7 }
                         }} />
                         {insight.emotion}
                       </span>
                       <b css={{ 
                         fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 6.5vw, 46px)', color: insight.color,
                         lineHeight: 1, letterSpacing: '-.03em', margin: '10px 0 12px',
                         '@media (max-width: 820px)': { gridArea: 'percent', fontSize: 'clamp(36px, 8vw, 44px)', color: insight.color, margin: 0, letterSpacing: 0 }
                       }}>{insight.percent}%</b>
                       <span css={{ 
                         paddingTop: 11, borderTop: '1px solid var(--line)', width: 'min(120px, 70%)',
                         fontSize: 13, color: 'var(--sub)', fontWeight: 700,
                         // 들여쓰지 않는다. 색점과 금액의 왼쪽 끝이 한 선에 서야 한다.
                         '@media (max-width: 820px)': { gridArea: 'amount', alignSelf: 'start', justifySelf: 'start', width: 'auto', paddingTop: 0, borderTop: 0, color: insight.color, fontWeight: 900, fontSize: 15, lineHeight: 1.2 }
                       }}>{insight.amount}</span>

                       {/* 뒤집힌다는 단서. 뒤집힌 뒤에는 숨겨 뒷면 문구를 가리지 않는다. */}
                       <span
                         aria-hidden="true"
                         css={{
                           position: 'absolute',
                           left: 0,
                           right: 0,
                           bottom: 12,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           gap: 4,
                           color: 'var(--sub)',
                           fontSize: 10.5,
                           fontWeight: 800,
                           opacity: .75,
                           pointerEvents: 'none',
                           // 모바일은 왼쪽 상단. 가운데 아래에 두면 카드 한가운데의
                           // 퍼센트·감정명 덩어리와 정렬축이 겹쳐 셋이 따로 논다.
                           '@media (max-width: 820px)': { top: 11, bottom: 'auto', left: 16, right: 'auto', justifyContent: 'flex-start', fontSize: 10 }
                         }}
                       >
                         <RotateCw size={11} strokeWidth={2.6} />
                         분석 보기
                       </span>
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
                  {/* 감정만 보라색이라 사용처·시간과 위계가 달라 보였다. 셋 다 같은 라벨 색으로 맞춘다 (#280). */}
                  <span css={{ display: 'block', color: 'var(--sub)', fontSize: 11, fontWeight: 900, marginBottom: 4 }}>감정</span>
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

              {/* 관찰·해석·처방 세 문장이 한 덩어리로 붙어 나와 눈이 쉴 곳이 없었다.
                  문장마다 문단으로 끊는다. 문장 수는 모델이 정하므로 개수를 가정하지 않는다. */}
              <div css={{ display: 'grid', gap: 10 }}>
                {(hasPattern
                  ? toParagraphs(pattern.desc)
                  : ['꾸준히 소비 내역을 기록해 주시면, 숨겨진 소비 패턴을 감지해 AI가 분석해 줘요.']
                ).map((line, idx) => (
                  <p key={idx} css={{ margin: 0, color: 'var(--sub)', fontSize: 13, fontWeight: 750, lineHeight: 1.65, wordBreak: 'keep-all' }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
            
            <div css={{ display: 'none', '@media (max-width: 820px)': { display: 'block', textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--sub)', fontWeight: 800 } }}>
              터치하여 소비 내역 보기 ↺
            </div>
          </div>

          <div css={{
            position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0, borderLeft: '1px solid var(--line)',
            '@media (max-width: 820px)': {
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              padding: 24,
              borderLeft: 'none',
              background: 'var(--card)',
              borderRadius: 24,
              overflow: 'hidden'
            }
          }}>
            {/*
              데스크톱에서 이 속을 absolute 로 띄우는 이유:
              2단 그리드의 행 높이는 두 칼럼 중 큰 쪽으로 정해진다. 리스트가 정상 흐름에 있으면
              행 높이를 자기가 밀어올려서 넘칠 일이 없고, 그래서 스크롤이 영영 안 생긴다.
              예전엔 maxHeight 240 으로 눌렀는데, 카드가 더 커도 거기서 잘려 '절반에서 멈추는' 문제가 됐다.
              absolute 는 행 높이 계산에 참여하지 않으므로, 행 높이는 왼쪽 칼럼이 정하고
              리스트는 그 높이를 채운 뒤 넘칠 때만 스크롤된다 — 모바일 뒷면과 같은 규칙이 된다.
            */}
            <div css={{
              display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1,
              '@media (min-width: 821px)': { position: 'absolute', inset: 0, paddingLeft: 28 }
            }}>
              <div css={{ display: 'grid', gridTemplateColumns: '84px 1fr auto', gap: 14, padding: '0 0 12px', fontSize: 11, color: 'var(--sub)', fontWeight: 900, borderBottom: '1px solid var(--line)' }}>
                <span>날짜</span><span>내역</span><span>금액</span>
              </div>
              <div css={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingBottom: 16, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
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
            </div>

            {/* 모바일 전용. 위 묶음(flex:1) 아래에 남아야 하므로 그 바깥에 둔다. */}
            <div css={{ display: 'none', '@media (max-width: 820px)': { display: 'block', textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--sub)', fontWeight: 800 } }}>
              돌아가기 ↺
            </div>
          </div>
        </div>
      </Card>
    </Page>
  );
}
