/** @jsxImportSource @emotion/react */
import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { getEmotion } from '../data/emotions.js';
import { money, signedMoney } from '../utils/format.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useTransactionsQuery } from '../hooks/queries/useTransactions.js';
import { useMetadata } from '../hooks/queries/useMetadata.js';
import { TransactionListSkeleton } from '../components/common/Skeleton.jsx';
import DatePickerDc from '../components/common/DatePickerDc.jsx';
import SelectDc from '../components/common/SelectDc.jsx';

const Wrap = styled.div`
  width: 100%;
  margin: 0;
`;

const PageHeader = styled.div`
  margin-bottom: 16px;
`;

const MonthLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 6px 2px 4px;

  strong {
    min-width: 168px;
    padding: 11px 24px;
    border-radius: 999px;
    border: 1px solid var(--card-border);
    background:
      radial-gradient(120px 60px at 28% 0%, rgba(158,150,238,.18), transparent 68%),
      radial-gradient(120px 70px at 78% 100%, rgba(130,226,194,.16), transparent 70%),
      var(--card-strong);
    box-shadow: 0 12px 34px rgba(70, 58, 42, .08);
    backdrop-filter: blur(18px);
    font-size: 20px;
    line-height: 1.2;
    letter-spacing: 0;
    text-align: center;
  }
`;

const MonthButton = styled.button`
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--card-strong);
  color: var(--text);
  display: grid;
  place-items: center;
  font-family: inherit;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  backdrop-filter: blur(18px);
  transition: transform .16s ease, background .16s ease, border-color .16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: var(--card-border);
    background: var(--card);
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 0 0 14px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--card);
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

const NativeDateInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
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
  grid-template-columns: 42px minmax(0, 1fr) max-content;
  align-items: center;
  gap: 14px;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  padding: 15px 18px;
  text-align: left;
  cursor: pointer;

  &:last-child {
    border-bottom: 0;
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

export default function TransactionsPageDesign({ onSelect }) {
  const { data: metaData } = useMetadata();
  const categories = metaData?.categories || [];
  const emotions = metaData?.emotions || [];

  const [view, setView] = useState('일별');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const today = new Date();
  const [year, setYear] = useState(String(today.getFullYear()));
  const [month, setMonth] = useState(String(today.getMonth() + 1));
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

  const moveMonth = (offset) => {
    const base = new Date(Number(year), month === 'all' ? today.getMonth() : Number(month) - 1, 1);
    base.setMonth(base.getMonth() + offset);
    setYear(String(base.getFullYear()));
    setMonth(String(base.getMonth() + 1));
    setDay('');
  };

  const yearPickerValue = `${year}-01-01`;
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

  return (
    <Wrap>
      <PageHeader>
        <MonthLine>
          <MonthButton type="button" onClick={() => moveMonth(-1)} aria-label="이전달">&lt;</MonthButton>
          <strong>{monthTitle(year, month)}</strong>
          <MonthButton type="button" onClick={() => moveMonth(1)} aria-label="다음달">&gt;</MonthButton>
        </MonthLine>
      </PageHeader>

      <Toolbar>
        <ViewTabs>
          {viewTabs.map(item => <ViewTab key={item} active={view === item} onClick={() => setView(item)}>{item}</ViewTab>)}
        </ViewTabs>
        <Search>
          <input placeholder="메모·카테고리 검색" value={query} onChange={event => setQuery(event.target.value)} />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sub)" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        </Search>
        <FilterButton type="button" active={filtersOpen} onClick={() => setFiltersOpen(prev => !prev)}>
          필터
        </FilterButton>
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
              return (
                <Row key={item.transactionId} onClick={() => onSelect(item)}>
                  <span css={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: emo.light }}><i css={{ width: 15, height: 15, borderRadius: '50%', background: emo.color }} /></span>
                  <span css={{ minWidth: 0 }}><strong>{item.category?.name}</strong><small css={{ display: 'block', color: 'var(--sub)', marginTop: 3 }}>{item.emotion?.name}{item.memo ? ` · ${item.memo}` : ''}</small></span>
                  <b css={{ fontFamily: 'var(--font-display)', color: item.type === 'INCOME' ? '#3E9578' : 'var(--text)' }}>{signedMoney(item)}</b>
                </Row>
              );
            })}
          </GlassCard>
        </Group>
      ))}
    </Wrap>
  );
}
