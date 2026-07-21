/** @jsxImportSource @emotion/react */
import { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { getEmotion } from '../data/emotions.js';
import { money, signedMoney } from '../utils/format.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useTransactionsQuery, useBulkDeleteTransactionsMutation, useUpdateTransactionMutation } from '../hooks/queries/useTransactions.js';
import { useMetadata } from '../hooks/queries/useMetadata.js';
import { TransactionListSkeleton } from '../components/common/Skeleton.jsx';
import DatePickerDc from '../components/common/DatePickerDc.jsx';
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
  grid-template-columns: repeat(5, minmax(140px, 1fr));
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
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    & > *:nth-of-type(1), & > *:nth-of-type(2) {
      grid-column: span 3;
    }
    & > *:nth-of-type(3), & > *:nth-of-type(4), & > *:nth-of-type(5) {
      grid-column: span 2;
    }
  }
`;

const SelectBox = styled.label`
  display: grid;
  gap: 6px;
  color: var(--sub);
  font-size: 11.5px;
  font-weight: 900;

  select,
  input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--line);
    border-radius: 13px;
    background: var(--card);
    color: var(--text);
    padding: 10px 12px;
    font-family: inherit;
    font-weight: 800;
    outline: 0;
  }
`;

const DatePickerShell = styled.div`
  position: relative;
  min-height: 41px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--card);
  color: var(--text);
  padding: 10px 36px 10px 12px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    right: 15px;
    top: 50%;
    width: 7px;
    height: 7px;
    border-right: 2px solid var(--sub);
    border-bottom: 2px solid var(--sub);
    transform: translateY(-65%) rotate(45deg);
    pointer-events: none;
  }
`;

const SelectLike = styled.div`
  position: relative;
  display: grid;
  gap: 6px;
  color: var(--sub);
  font-size: 11.5px;
  font-weight: 900;
`;

const SelectButton = styled.button`
  width: 100%;
  min-height: 41px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--card);
  color: var(--text);
  padding: 10px 36px 10px 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  text-align: left;
  cursor: pointer;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 15px;
    top: 50%;
    width: 7px;
    height: 7px;
    border-right: 2px solid var(--sub);
    border-bottom: 2px solid var(--sub);
    transform: translateY(-65%) rotate(45deg);
  }
`;

const SelectMenu = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  z-index: 20;
  display: grid;
  gap: 6px;
  max-height: 230px;
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--card-strong);
  box-shadow: 0 18px 45px rgba(60, 50, 35, .14);
  backdrop-filter: blur(18px);
`;

const SelectOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  background: ${({ active }) => active ? 'rgba(158,150,238,.16)' : 'transparent'};
  color: var(--text);
  padding: 9px 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 900;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, .14);
  }

  span {
    width: 16px;
    height: 16px;
    border-radius: 6px;
    border: 1px solid ${({ active }) => active ? 'rgba(158,150,238,.8)' : 'var(--line)'};
    background: ${({ active }) => active ? 'rgba(158,150,238,.28)' : 'var(--card)'};
    display: grid;
    place-items: center;
    color: ${({ active }) => active ? 'var(--text)' : 'transparent'};
    font-size: 11px;
    flex: 0 0 auto;
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

  &:last-child {
    border-bottom: 0;
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
  color: #fff;
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

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

export default function TransactionsPageDesign({ onSelect, globalDate, setGlobalDate }) {
  const { data: metaData } = useMetadata();
  const categories = metaData?.categories || [];
  const emotions = metaData?.emotions || [];

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
  const [openSelect, setOpenSelect] = useState('');
  const [isMonthDayPickerOpen, setIsMonthDayPickerOpen] = useState(false);

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

  const monthDayPickerValue = `${year}-${padDatePart(month === 'all' ? today.getMonth() + 1 : month)}-${padDatePart(day || 1)}`;

  const handleYearPicker = (value) => {
    if (!value) return;
    setYear(String(new Date(value).getFullYear()));
  };

  const handleMonthDayPicker = (value) => {
    if (!value) return;
    const nextDate = new Date(value);
    setMonth(String(nextDate.getMonth() + 1));
    setDay(String(nextDate.getDate()));
  };

  const toggleFilter = (value, selected, setSelected) => {
    setSelected(selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value]);
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
        <SelectBox>
          월-일
          <DatePickerShell onClick={() => setIsMonthDayPickerOpen(true)}>
            {month}월{day ? ` ${day}일` : ''}
            {isMonthDayPickerOpen && (
              <DatePickerDc
                value={monthDayPickerValue}
                onChange={(newDate) => { handleMonthDayPicker(newDate); }}
                onClose={() => setIsMonthDayPickerOpen(false)}
                scale={0.85}
                placement="bottom"
              />
            )}
          </DatePickerShell>
        </SelectBox>
        <SelectLike>
          정렬
          <SelectButton type="button" onClick={() => setOpenSelect(openSelect === 'sort' ? '' : 'sort')}>
            {sortOptions.find(([key]) => key === sort)?.[1]}
          </SelectButton>
          {openSelect === 'sort' && (
            <SelectMenu>
              {sortOptions.map(([key, label]) => (
                <SelectOption
                  key={key}
                  type="button"
                  active={sort === key}
                  onClick={() => {
                    setSort(key);
                    setOpenSelect('');
                  }}
                >
                  {label}
                  <span>✓</span>
                </SelectOption>
              ))}
            </SelectMenu>
          )}
        </SelectLike>
        <SelectLike>
          카테고리 상세
          <SelectButton type="button" onClick={() => setOpenSelect(openSelect === 'category' ? '' : 'category')}>
            {categoryFilters.length ? `${categoryFilters.length}개 선택` : '전체 카테고리'}
          </SelectButton>
          {openSelect === 'category' && (
            <SelectMenu>
              <SelectOption type="button" active={!categoryFilters.length} onClick={() => setCategoryFilters([])}>
                전체 카테고리
                <span>✓</span>
              </SelectOption>
              {categories.map(item => (
                <SelectOption
                  key={item.categoryId}
                  type="button"
                  active={categoryFilters.includes(item.categoryId)}
                  onClick={() => toggleFilter(item.categoryId, categoryFilters, setCategoryFilters)}
                >
                  {item.name}
                  <span>✓</span>
                </SelectOption>
              ))}
            </SelectMenu>
          )}
        </SelectLike>
        <SelectLike>
          감정 상세
          <SelectButton type="button" onClick={() => setOpenSelect(openSelect === 'emotion' ? '' : 'emotion')}>
            {emotionFilters.length ? `${emotionFilters.length}개 선택` : '전체 감정'}
          </SelectButton>
          {openSelect === 'emotion' && (
            <SelectMenu>
              <SelectOption type="button" active={!emotionFilters.length} onClick={() => setEmotionFilters([])}>
                전체 감정
                <span>✓</span>
              </SelectOption>
              {emotions.map(item => (
                <SelectOption
                  key={item.emotionId}
                  type="button"
                  active={emotionFilters.includes(item.emotionId)}
                  onClick={() => toggleFilter(item.emotionId, emotionFilters, setEmotionFilters)}
                >
                  {item.name}
                  <span>✓</span>
                </SelectOption>
              ))}
            </SelectMenu>
          )}
        </SelectLike>
      </ControlGrid>}

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
                  <b css={{ fontFamily: 'var(--font-display)', color: item.type === 'INCOME' ? '#3E9578' : 'var(--text)' }}>{signedMoney(item)}</b>
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
