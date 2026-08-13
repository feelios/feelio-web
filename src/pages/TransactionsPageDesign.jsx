/** @jsxImportSource @emotion/react */
import { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { money, signedMoney } from '../utils/format.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useTransactionsQuery, useBulkDeleteTransactionsMutation, useUpdateTransactionMutation } from '../hooks/queries/useTransactions.js';
import { useCategoriesQuery } from '../hooks/queries/useCategories.js';
import { mergeEmotions, getEmotion } from '../constants/metadata.js';
import { useMetadata } from '../hooks/queries/useMetadata.js';
import { TransactionListSkeleton } from '../components/common/Skeleton.jsx';
import SelectDc from '../components/common/SelectDc.jsx';

const Wrap = styled.div`
  width: 100%;
  margin: 0;

  @media (max-width: 820px) {
    padding-top: 22px;
  }
`;

const MonthLine = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;

  strong {
    padding: 0 4px;
    font-size: 22px;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: -.03em;
  }

  @media (max-width: 820px) {
    gap: 2px;
    strong { font-size: 19px; padding: 0 2px; }
  }
`;

const MonthButton = styled.button`
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--sub);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background .15s ease, color .15s ease;

  svg { width: 18px; height: 18px; }

  &:hover {
    background: var(--card-strong);
    color: var(--ink);
  }

  @media (max-width: 820px) {
    width: 24px;
    height: 24px;
    svg { width: 16px; height: 16px; }
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin: 0 0 14px;
  padding: 11px 12px 12px 14px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--card);
`;

const ToolbarControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const MonthTabRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px 10px;
  width: 100%;
  flex-wrap: wrap;
`;

const ViewTabs = styled.div`
  display: flex;
  padding: 3px;
  border-radius: 12px;
  background: var(--card);
  border: 1px solid var(--line);
`;

const ViewTab = styled.button`
  border: 0;
  border-radius: 9px;
  padding: 7px 15px;
  background: ${({ active }) => active ? 'var(--ink)' : 'transparent'};
  color: ${({ active }) => active ? 'var(--on-ink)' : 'var(--sub)'};
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;

  @media (max-width: 820px) {
    padding: 6px 11px;
    font-size: 12.5px;
  }
`;

const Search = styled.div`
  flex: 1;
  min-width: 180px;
  position: relative;

  input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--card);
    color: var(--text);
    outline: 0;
    padding: 10px 14px 10px 34px;
    font-size: 13.5px;
    font-family: inherit;
  }

  svg {
    position: absolute;
    left: 12px;
    top: 11px;
  }
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(130px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card);

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    gap: 8px;
  }
`;

const FilterButton = styled.button`
  border: 1px solid ${({ active }) => active ? 'var(--ink)' : 'var(--line)'};
  border-radius: 999px;
  background: ${({ active }) => active ? 'var(--ink)' : 'var(--card-strong)'};
  color: ${({ active }) => active ? 'var(--on-ink)' : 'var(--text)'};
  padding: 10px 17px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
`;

const Group = styled.div`
  margin-top: 22px;
`;

/**
 * 목록 맨 위 합계 줄.
 *
 * 처음엔 툴바처럼 테두리·배경을 준 카드로 만들었는데, 이미 카드가 층층이 쌓인 화면에
 * 블록이 하나 더 얹힌 꼴이라 무거웠다. 배경과 테두리를 걷어내고 아래 실선만 남겨,
 * 목록의 머리글처럼 읽히게 한다. 좌우 padding 은 아래 날짜 헤더(0 4px)와 맞춘다.
 */
/**
 * 목록 맨 위 합계.
 *
 * 아래 거래 묶음도 전부 GlassCard 라, 같은 --card 면 카드가 하나 더 쌓인 것처럼만 보이고
 * '합계'로 읽히지 않았다. 한 단계 진한 표면(--card-strong)과 또렷한 테두리(--card-border)를 써서
 * 리스트보다 위 층에 놓고, 숫자도 행 금액(14px)의 1.4배로 키워 위계를 만든다.
 */
/**
 * 목록 맨 위 합계.
 *
 * 카드로 감싸면 아래 거래 묶음(GlassCard)들 위에 블록이 하나 더 쌓인 꼴이라 무거웠다.
 * 배경·테두리를 걷어내고 아래 실선만 남긴다. 대신 금액을 행 금액(14px)보다 키워
 * 리스트의 한 줄이 아니라 합계로 읽히게 한다.
 */
const SummaryBar = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 16px;
  padding: 0 4px 12px;
  border-bottom: 1px solid var(--line);
`;

const SummaryLabel = styled.strong`
  color: var(--sub);
  font-size: 11.5px;
  font-weight: 900;
  letter-spacing: .02em;
  white-space: nowrap;
`;

const SummaryTotals = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px 18px;
  min-width: 0;
`;

const SummaryCell = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;

  span {
    color: var(--sub);
    font-size: 11.5px;
    font-weight: 800;
    flex-shrink: 0;
  }

  b {
    font-size: 17px;
    font-weight: 950;
    letter-spacing: -.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Row = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ selecting }) => selecting ? '24px 42px minmax(0, 1fr) max-content' : '42px minmax(0, 1fr) max-content'};
  align-items: center;
  gap: 14px;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: ${({ isChecked }) => isChecked ? 'var(--card-strong)' : 'transparent'};
  padding: 15px 18px;
  text-align: left;
  cursor: pointer;
  transition: background .12s ease;

  &:first-of-type {
    border-top-left-radius: 26px;
    border-top-right-radius: 26px;
  }

  &:last-of-type {
    border-bottom: 0;
    border-bottom-left-radius: 26px;
    border-bottom-right-radius: 26px;
  }
`;

const Check = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 7px;
  border: 2px solid ${({ isChecked }) => isChecked ? 'var(--accent)' : 'var(--line)'};
  background: ${({ isChecked }) => isChecked ? 'var(--accent)' : 'transparent'};
  display: grid;
  place-items: center;
  color: var(--text);
  font-size: 12px;
  flex: 0 0 auto;
`;

const SelectBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 55;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  background: var(--card-strong);
  box-shadow: var(--shadow);
  backdrop-filter: blur(28px);

  @media (max-width: 820px) {
    left: 12px;
    right: 12px;
    transform: none;
    bottom: calc(84px + env(safe-area-inset-bottom));
    justify-content: space-between;
    gap: 8px;
  }
`;

const BarText = styled.span`
  font-size: 13px;
  font-weight: 900;
  color: var(--text);
  white-space: nowrap;
`;

const BarGhost = styled.button`
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--card);
  color: var(--text);
  padding: 8px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
`;

const BarDanger = styled.button`
  border: 0;
  border-radius: 10px;
  background: #E87573;
  color: #fff;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: .5;
    cursor: default;
  }
`;

const viewTabs = ['일별', '월별', '감정별'];
const sortOptions = [
  ['date-desc', '날짜 최신순'],
  ['date-asc', '날짜 오래된순'],
  ['category-asc', '카테고리 가나다순'],
  ['category-desc', '카테고리 역순'],
  ['amount-desc', '금액 큰순'],
  ['amount-asc', '금액 작은순']
];

function toDate(item) {
  return new Date(item.occurredAt);
}

function groupLabel(item, view) {
  if (view === '감정별') return item.emotion?.name || '감정 없음';
  const date = toDate(item);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  if (view === '월별') return `${year}년 ${month}월`;
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

function groupKey(item, view) {
  if (view === '감정별') return item.emotion?.name || '';
  const date = toDate(item);
  if (view === '월별') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return item.occurredAt.split('T')[0];
}

function signedGroupTotal(items) {
  const total = items.reduce((sum, item) => sum + (item.type === 'INCOME' ? item.amount : -item.amount), 0);
  return `${total >= 0 ? '+' : '-'}${money(Math.abs(total))}`;
}

function monthTitle(year, month) {
  if (month === 'all') return `${year}년 전체`;
  return `${year}년 ${month}월`;
}

export default function TransactionsPageDesign({ onSelect, globalDate, setGlobalDate }) {
  const { data: expenseCat } = useCategoriesQuery('EXPENSE');
  const { data: incomeCat } = useCategoriesQuery('INCOME');
  
  const categories = useMemo(() => {
    return [...(expenseCat?.categories || []), ...(incomeCat?.categories || [])];
  }, [expenseCat, incomeCat]);
  // 필터 값으로 emotionId 를 서버에 보내므로 목록도 서버 기준이어야 한다 (#266).
  const { data: metaData } = useMetadata();
  const emotions = useMemo(() => mergeEmotions(metaData?.emotions), [metaData]);

  const [view, setView] = useState('일별');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const today = new Date();
  const [year, setYear] = useState(String(globalDate.getFullYear()));
  const [month, setMonth] = useState(String(globalDate.getMonth() + 1));
  const [day, setDay] = useState('');
  const [sort, setSort] = useState('date-desc');
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [emotionFilters, setEmotionFilters] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let y = currentYear - 6; y <= currentYear + 6; y++) {
      options.push({ value: String(y), label: `${y}년` });
    }
    return options;
  }, []);

  // Sync local changes back to globalDate
  useEffect(() => {
    if (month !== 'all') {
      setGlobalDate(new Date(Number(year), Number(month) - 1, 1));
    }
  }, [year, month, setGlobalDate]);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 820);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const apiParams = useMemo(() => ({
    year,
    month: month === 'all' ? undefined : month,
    day: day || undefined,
    emotionId: emotionFilters.length ? emotionFilters.join(',') : undefined,
    categoryId: categoryFilters.length ? categoryFilters.join(',') : undefined,
    query: debouncedQuery || undefined,
    sort: sort.replace('-', '_'),
  }), [year, month, day, emotionFilters, categoryFilters, debouncedQuery, sort]);

  const { data: txData, isLoading } = useTransactionsQuery(apiParams);
  const transactions = useMemo(() => txData?.transactions || [], [txData?.transactions]);

  // 다중 선택 삭제
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [confirming, setConfirming] = useState(false);
  const bulkDeleteMutation = useBulkDeleteTransactionsMutation();
  const updateMutation = useUpdateTransactionMutation();
  const [merging, setMerging] = useState(false);

  const visibleIds = useMemo(() => transactions.map(t => t.transactionId), [transactions]);
  // 화면에 보이는 것만 유효 선택으로 간주 → 필터로 숨겨진 항목의 의도치 않은 삭제 방지
  const selectedVisibleIds = useMemo(() => visibleIds.filter(id => selectedIds.has(id)), [visibleIds, selectedIds]);
  const selectedCount = selectedVisibleIds.length;
  const allSelected = visibleIds.length > 0 && selectedCount === visibleIds.length;

  const selectedTransactions = useMemo(() => {
    return transactions.filter(t => selectedIds.has(t.transactionId));
  }, [transactions, selectedIds]);

  const canMerge = selectedCount === 2 && 
                   selectedTransactions.length === 2 && 
                   selectedTransactions[0].type !== selectedTransactions[1].type;

  const toggleSelectMode = () => {
    setSelectMode(prev => {
      const next = !prev;
      if (!next) { setSelectedIds(new Set()); setConfirming(false); }
      return next;
    });
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => (visibleIds.every(id => prev.has(id)) ? new Set() : new Set(visibleIds)));
  };

  const handleBulkDelete = async () => {
    if (!selectedCount) return;
    try {
      await bulkDeleteMutation.mutateAsync(selectedVisibleIds);
      setSelectMode(false);
      setSelectedIds(new Set());
    } finally {
      setConfirming(false);
    }
  };

  const handleBulkMerge = async () => {
    if (!canMerge) return;
    try {
      setMerging(true);
      const [t1, t2] = selectedTransactions;
      
      let larger, smaller;
      if (t1.amount > t2.amount) {
        larger = t1;
        smaller = t2;
      } else {
        larger = t2;
        smaller = t1;
      }

      const smallerName = smaller.memo || smaller.category?.name || '기타';
      const newMemo = larger.memo ? `${larger.memo} (정산: ${smallerName})` : `정산: ${smallerName}`;
      const finalAmount = Math.max(0, larger.amount - smaller.amount);

      await updateMutation.mutateAsync({
        transactionId: larger.transactionId,
        data: {
          type: larger.type,
          amount: finalAmount,
          categoryId: larger.category?.categoryId,
          emotionId: larger.emotion?.emotionId,
          memo: newMemo,
          occurredAt: larger.occurredAt
        }
      });

      await bulkDeleteMutation.mutateAsync([smaller.transactionId]);
      
      setSelectMode(false);
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setMerging(false);
    }
  };

  const moveMonth = (offset) => {
    const base = new Date(Number(year), month === 'all' ? today.getMonth() : Number(month) - 1, 1);
    base.setMonth(base.getMonth() + offset);
    setYear(String(base.getFullYear()));
    setMonth(String(base.getMonth() + 1));
    setDay('');
  };

  // 선택된 연·월의 실제 일수 (윤년 2월 반영) → 일 선택기 옵션을 동적으로 렌더 (#157)
  const daysInSelectedMonth = useMemo(() => {
    if (month === 'all') return 31;
    return new Date(Number(year), Number(month), 0).getDate();
  }, [year, month]);

  const monthOptions = useMemo(() => (
    [{ value: 'all', label: '전체' }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}월` }))]
  ), []);

  const dayOptions = useMemo(() => (
    [{ value: '', label: '전체' }, ...Array.from({ length: daysInSelectedMonth }, (_, i) => ({ value: String(i + 1), label: `${i + 1}일` }))]
  ), [daysInSelectedMonth]);

  const clampDay = (nextYear, nextMonth, currentDay) => {
    if (nextMonth === 'all' || !currentDay) return '';
    const dim = new Date(Number(nextYear), Number(nextMonth), 0).getDate();
    return Number(currentDay) > dim ? '' : currentDay;
  };

  const handleYearPicker = (value) => {
    if (!value) return;
    const nextYear = String(new Date(value).getFullYear());
    setYear(nextYear);
    setDay(clampDay(nextYear, month, day)); // 연 변경으로 2/29 등이 사라지면 일 초기화
  };

  const handleMonthChange = (value) => {
    setMonth(value);
    setDay(clampDay(year, value, day)); // 월 변경 시 일수 초과분·전체월이면 일 초기화
  };

  const handleDayChange = (value) => {
    setDay(value);
  };

  const groups = useMemo(() => {
    const map = transactions.reduce((acc, item) => {
      const label = groupLabel(item, view);
      const key = groupKey(item, view);

      if (!acc[label]) acc[label] = { key, items: [] };
      acc[label].items.push(item);
      return acc;
    }, {});

    return Object.entries(map)
      .sort((a, b) => {
        if (view === '감정별') return a[0].localeCompare(b[0], 'ko');
        return b[1].key.localeCompare(a[1].key);
      })
      .map(([label, group]) => ({
        label,
        items: group.items
      }));
  }, [transactions, view]);

  /**
   * 목록 맨 위 합계. 필터는 서버가 걸어 transactions 로 내려주므로, 화면에 깔린 줄들과
   * 항상 같은 집합을 더한다 — 눈에 보이는 것과 합계가 어긋나지 않는다.
   */
  const totals = useMemo(() => transactions.reduce((acc, item) => {
    if (item.type === 'INCOME') acc.income += item.amount;
    else acc.expense += item.amount;
    return acc;
  }, { income: 0, expense: 0 }), [transactions]);

  const monthNav = (
    <MonthLine>
      <MonthButton type="button" onClick={() => moveMonth(-1)} aria-label="이전달">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      </MonthButton>
      <strong>{monthTitle(year, month)}</strong>
      <MonthButton type="button" onClick={() => moveMonth(1)} aria-label="다음달">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
      </MonthButton>
    </MonthLine>
  );

  const viewTabsEl = (
    <ViewTabs>
      {viewTabs.map(item => <ViewTab key={item} active={view === item} onClick={() => setView(item)}>{item}</ViewTab>)}
    </ViewTabs>
  );

  return (
    <Wrap>
      <Toolbar>
        {isMobile ? <MonthTabRow>{monthNav}{viewTabsEl}</MonthTabRow> : monthNav}
        <ToolbarControls>
          {!isMobile && viewTabsEl}
          <Search>
            <input placeholder="메모·카테고리 검색" value={query} onChange={event => setQuery(event.target.value)} />
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sub)" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </Search>
          <FilterButton type="button" active={filtersOpen} onClick={() => setFiltersOpen(prev => !prev)}>
            필터
          </FilterButton>
          <FilterButton type="button" active={selectMode} onClick={toggleSelectMode}>
            {selectMode ? '완료' : '선택'}
          </FilterButton>
        </ToolbarControls>
      </Toolbar>

      {filtersOpen && <ControlGrid>
        <SelectDc
          label="연도"
          options={yearOptions}
          value={year}
          onChange={(val) => { if (val) handleYearPicker(`${val}-01-01`); }}
        />
        <SelectDc
          label="월"
          options={monthOptions}
          value={month}
          onChange={(val) => handleMonthChange(val ?? 'all')}
        />
        <SelectDc
          label="일"
          options={dayOptions}
          value={day}
          onChange={(val) => handleDayChange(val ?? '')}
          disabled={month === 'all'}
        />
        <SelectDc
          label="정렬"
          options={sortOptions.map(([value, label]) => ({ value, label }))}
          value={sort}
          onChange={(val) => { if (val) setSort(val); }}
        />
        <SelectDc
          label="카테고리 상세"
          multiple
          placeholder="전체 카테고리"
          options={categories.map(item => ({ value: item.categoryId, label: item.name }))}
          value={categoryFilters}
          onChange={setCategoryFilters}
        />
        <SelectDc
          label="감정 상세"
          multiple
          placeholder="전체 감정"
          options={emotions.map(item => ({ value: item.emotionId, label: item.name }))}
          value={emotionFilters}
          onChange={setEmotionFilters}
        />
      </ControlGrid>}

      {!isLoading && groups.length > 0 && (
        <SummaryBar>
          <SummaryLabel>합계</SummaryLabel>
          <SummaryTotals>
            <SummaryCell>
              <span>총 지출</span>
              <b css={{ color: 'var(--text)' }}>-{money(totals.expense)}</b>
            </SummaryCell>
            <SummaryCell>
              <span>총 수입</span>
              <b css={{ color: '#3E9578' }}>+{money(totals.income)}</b>
            </SummaryCell>
          </SummaryTotals>
        </SummaryBar>
      )}

      {isLoading && <TransactionListSkeleton />}

      {!isLoading && groups.length === 0 && <div css={{ textAlign: 'center', padding: '40px', color: 'var(--sub)' }}>거래 내역이 없습니다.</div>}

      {!isLoading && groups.map(group => (
        <Group key={group.label}>
          <div css={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
            <strong>{group.label}</strong>
            <span css={{ color: 'var(--sub)', fontWeight: 800 }}>{signedGroupTotal(group.items)}</span>
          </div>
          <GlassCard padding={0}>
            {group.items.map(item => {
              const emo = getEmotion(item.emotion?.name || '평온');
              const checked = selectedIds.has(item.transactionId);
              return (
                <Row
                  key={item.transactionId}
                  selecting={selectMode}
                  isChecked={selectMode && checked}
                  onClick={() => selectMode ? toggleSelectOne(item.transactionId) : onSelect(item)}
                >
                  {selectMode && <Check isChecked={checked}>{checked ? '✓' : ''}</Check>}
                  <span css={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: emo.light }}><i css={{ width: 15, height: 15, borderRadius: '50%', background: emo.color }} /></span>
                  <span css={{ minWidth: 0 }}>
                    <strong css={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.category?.name}
                    </strong>
                    <small css={{ display: 'block', color: 'var(--sub)', marginTop: 3 }}>{item.emotion?.name}{item.memo ? ` · ${item.memo}` : ''}</small>
                  </span>
                  {/* --font-display 는 Fredoka 라 숫자만 다른 글꼴로 나온다(unicode-range).
                      바로 위 날짜 헤더 합계는 Pretendard 라 같은 금액이 두 글꼴로 보였다. Pretendard 로 맞춘다. */}
                  <b css={{ color: item.type === 'INCOME' ? '#3E9578' : 'var(--text)' }}>{signedMoney(item)}</b>
                </Row>
              );
            })}
          </GlassCard>
        </Group>
      ))}

      {selectMode && (
        <SelectBar>
          <BarGhost type="button" onClick={toggleSelectAll}>
            {allSelected ? '전체 해제' : '전체 선택'}
          </BarGhost>
          <BarText>{selectedCount}개 선택</BarText>
          {confirming ? (
            <>
              <BarText>삭제할까요?</BarText>
              <BarDanger type="button" disabled={bulkDeleteMutation.isPending} onClick={handleBulkDelete}>
                {bulkDeleteMutation.isPending ? '삭제 중…' : '삭제'}
              </BarDanger>
              <BarGhost type="button" onClick={() => setConfirming(false)}>취소</BarGhost>
            </>
          ) : (
            <>
              {canMerge && (
                <BarGhost type="button" disabled={merging || bulkDeleteMutation.isPending} onClick={handleBulkMerge} css={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                  {merging ? '합치는 중...' : '정산 합치기'}
                </BarGhost>
              )}
              <BarDanger type="button" disabled={!selectedCount || merging} onClick={() => setConfirming(true)}>삭제</BarDanger>
              <BarGhost type="button" onClick={toggleSelectMode} disabled={merging}>취소</BarGhost>
            </>
          )}
        </SelectBar>
      )}
    </Wrap>
  );
}
