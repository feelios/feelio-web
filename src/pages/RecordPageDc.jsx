/** @jsxImportSource @emotion/react */
import { useState, useEffect, Fragment } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { EmotionBlob } from '../components/common/EmotionBlob.jsx';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { getEmotion } from '../data/emotions.js';
import { useMetadata } from '../hooks/queries/useMetadata.js';
import { useCreateTransactionMutation } from '../hooks/queries/useTransactions.js';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryOrderMutation
} from '../hooks/queries/useCategories.js';
import DatePickerDc from '../components/common/DatePickerDc.jsx';
import { useGoalsQuery } from '../hooks/queries/useGoals.js';
import { Fragment } from 'react';

const Page = styled.div`
  width: 100%;
  min-height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 820px) {
    justify-content: flex-start;
    padding-top: 26px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, .92fr);
  gap: 18px;
  align-items: stretch;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const MainPanel = styled(GlassCard)`
  position: relative;
  overflow: hidden;
  min-height: 610px;
  padding: clamp(22px, 3vw, 34px);

  @media (max-width: 920px) {
    min-height: auto;
  }
`;

const FaintBlob = styled.div`
  position: absolute;
  width: 360px;
  height: 360px;
  right: -110px;
  top: -120px;
  border-radius: 50%;
  background: radial-gradient(circle, ${({ color }) => color ? `${color}44` : 'transparent'}, transparent 68%);
  filter: blur(24px);
  pointer-events: none;
`;

const TypeTabs = styled.div`
  position: relative;
  width: 220px;
  display: flex;
  padding: 4px;
  border-radius: 14px;
  background: var(--line);
`;

const TypeTab = styled.button`
  flex: 1;
  border: 0;
  border-radius: 12px;
  padding: 11px;
  background: ${({ active }) => active ? 'var(--card-strong)' : 'transparent'};
  color: ${({ active }) => active ? 'var(--text)' : 'var(--sub)'};
  font-weight: 800;
  cursor: pointer;
`;

const AmountBox = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 92px;
  border-radius: 24px;
  padding: 0 20px;
  background: var(--card);
  border: 1px solid var(--line);
`;

const AmountInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  text-align: right;
  font-family: var(--font-display);
  font-size: clamp(42px, 7vw, 70px);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--line);
  margin: clamp(20px, 3vw, 28px) 0;
`;

const BlobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(78px, 1fr));
  gap: 14px 10px;
  margin-top: 12px;

  @media (max-width: 560px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px 4px;
    margin-top: 6px;
  }
`;

const BlobChoice = styled.button`
  height: 148px;
  border: 0;
  background: transparent;
  color: ${({ active }) => active ? 'var(--text)' : 'var(--sub)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  gap: 4px;
  font-weight: ${({ active }) => active ? 900 : 700};
  cursor: pointer;
  filter: ${({ dim }) => dim ? 'saturate(.55) opacity(.45)' : 'none'};

  @media (max-width: 560px) {
    height: 96px;
    gap: 2px;
  }
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SideCard = styled(GlassCard)`
  padding: 22px;
  display: flex;
  flex-direction: column;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// 편집(순서 변경) 모드 티내기 — 살짝 흔들리는 지글 애니메이션
const wiggle = keyframes`
  0%, 100% { transform: rotate(-1.1deg); }
  50% { transform: rotate(1.1deg); }
`;

// 드래그 정렬 중 삽입 위치를 보여주는 세로 인디케이터
const DropLine = styled.div`
  align-self: stretch;
  width: 3px;
  min-height: 30px;
  border-radius: 2px;
  background: var(--text);
  opacity: .85;
  transition: opacity .1s ease;
`;

const Chip = styled.button`
  border: 1.5px solid ${({ active, color }) => active ? (color || 'var(--ink)') : 'var(--line)'};
  border-radius: 999px;
  padding: 10px 16px;
  background: ${({ active, color }) => active ? (color ? `${color}26` : 'var(--card-strong)') : 'transparent'};
  color: ${({ active }) => active ? 'var(--text)' : 'var(--sub)'};
  font-weight: 800;
  cursor: pointer;
`;

const SaveButton = styled.button`
  border: 0;
  border-radius: 18px;
  padding: 18px;
  background: ${({ disabled, accent }) => disabled ? 'var(--line)' : (accent || 'var(--ink)')};
  color: ${({ disabled }) => disabled ? 'var(--sub)' : '#fff'};
  font-size: 15px;
  font-weight: 900;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  transition: background 0.2s;
`;

const AddingInput = styled.input`
  width: 64px;
  box-sizing: border-box;
  background: transparent;
  border: 1.5px solid ${({ color }) => color};
  color: var(--text);
  border-radius: 999px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 800;
  outline: none;
  font-family: inherit;
  text-align: center;
  transition: all 0.2s;

  &:focus {
    width: 84px;
    background: ${({ color }) => color}26;
  }
`;

const SAVING_MESSAGES = [
  '🎁 미래의 나에게 주는 선물이에요',
  '🌱 오늘의 저축이 내일의 나를 키워요',
  '✨ 미래의 내가 고마워할 선택이에요',
  '💪 꾸준함이 최고예요, 잘하고 있어요',
  '☁️ 든든하게 차곡차곡 쌓이고 있어요',
  '💛 나를 아끼는 방법 중 하나예요',
  '🏝️ 목표에 한 걸음 더 가까워졌어요',
];

export default function RecordPageDc({ actions, onSaved, prefill, onConsumePrefill }) {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [addingTag, setAddingTag] = useState(null);
  const [addingText, setAddingText] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerInitialMode, setDatePickerInitialMode] = useState('date');

  const getInitialDate = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now - tzOffset).toISOString().slice(0, 16);
  };

  const [form, setForm] = useState(() => ({
    type: 'expense',
    amount: '',
    category: prefill?.goalId != null ? '저축' : null,
    emotion: null,
    situation: [],
    memo: '',
    savingsType: prefill?.goalId != null ? '목표' : null,
    goalId: prefill?.goalId ?? null,
    date: getInitialDate()
  }));

  useEffect(() => {
    if (prefill?.goalId != null) onConsumePrefill?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: metaData } = useMetadata();
  const emotions = metaData?.emotions || [];

  const { data: goalsData } = useGoalsQuery();
  const goals = goalsData?.goals || [];

  const savingMessage = (() => {
    if (form.savingsType === '적금') return SAVING_MESSAGES[0];
    const goalIndex = goals.findIndex(g => g.goalId === form.goalId);
    const idx = (form.goalId != null && goalIndex >= 0) ? goalIndex + 2 : 1;
    return SAVING_MESSAGES[idx % SAVING_MESSAGES.length];
  })();

  const { data: categoryData } = useCategoriesQuery(form.type.toUpperCase());
  const customCategories = categoryData?.categories || [];

  const createCategoryMutation = useCreateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const updateCategoryOrderMutation = useUpdateCategoryOrderMutation();
  const mutation = useCreateTransactionMutation();

  const [dragIndex, setDragIndex] = useState(null);   // 드래그 중인 카테고리(표시 리스트 기준)
  const [dropIndex, setDropIndex] = useState(null);   // 삽입될 위치(표시 리스트 기준, 0~length)

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 560);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 560);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const selected = getEmotion(form.emotion || '스트레스');
  const accent = form.emotion ? (selected.blob?.[1] || selected.color) : null;
  const canSave = (form.amount && form.emotion && form.category);

  const startAdding = (type) => {
    setAddingTag(type);
    setAddingText('');
  };

  const handleAddSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const name = addingText.trim();
    if (!name) {
      setAddingTag(null);
      return;
    }

    if (addingTag === 'category') {
      if (customCategories.some(c => c.name === name)) { alert('이미 있는 카테고리입니다.'); return; }
      createCategoryMutation.mutate({ name: name.slice(0, 5), type: form.type.toUpperCase() });
    }
    setAddingTag(null);
  };

  const handleRemoveCategory = (cat) => {
    if (!cat.isCustom) return;
    deleteCategoryMutation.mutate({ categoryId: cat.categoryId, type: form.type.toUpperCase() });
    if (form.category === cat.name) setField('category', null);
  };

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  };

  // 칩 위에서 마우스 X로 앞/뒤 삽입 위치 판정 → 인디케이터 갱신
  const handleDragOverChip = (e, index) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientX > rect.left + rect.width / 2;
    setDropIndex(after ? index + 1 : index);
  };

  const handleDropCategory = () => {
    const displayed = customCategories.filter(c => c.name !== '저축' && c.name !== '정산금');
    if (dragIndex !== null && dropIndex !== null) {
      const item = displayed[dragIndex];
      const fromReal = item ? customCategories.indexOf(item) : -1;
      const target = displayed[dropIndex];                 // 삽입 지점의 현재 항목(끝이면 undefined)
      const toReal = target ? customCategories.indexOf(target) : customCategories.length;
      // 제자리(자기 앞/뒤)면 무시
      if (item && fromReal !== -1 && toReal !== fromReal && toReal !== fromReal + 1) {
        const next = [...customCategories];
        next.splice(fromReal, 1);
        next.splice(toReal > fromReal ? toReal - 1 : toReal, 0, item);
        const orders = next.map((c, idx) => ({ categoryId: c.categoryId, isCustom: c.isCustom, sortOrder: idx + 1 }));
        updateCategoryOrderMutation.mutate({ type: form.type.toUpperCase(), orders });
      }
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const selectSaving = (type) => setForm(prev => {
    const isActive = prev.category === '저축' && prev.savingsType === type;
    if (isActive) return { ...prev, category: null, savingsType: null, goalId: null };
    return { ...prev, category: '저축', savingsType: type, goalId: type === '목표' ? goals[0]?.goalId : null };
  });

  const save = () => {
    if (!canSave || mutation.isPending) return;

    const matchedCat = customCategories.find(c => c.name === form.category);
    if (!matchedCat) {
      actions.showToast('카테고리 정보를 확인할 수 없습니다.');
      return;
    }

    const matchedEmotion = emotions.find(e => e.name === form.emotion);
    if (!matchedEmotion) {
      actions.showToast('감정 정보를 확인할 수 없습니다.');
      return;
    }

    const isGoalSaving = form.category === '저축' && form.savingsType === '목표';
    if (isGoalSaving && !form.goalId) {
      actions.showToast('어떤 목표에 저축할지 선택해주세요.');
      return;
    }

    const payload = {
      type: form.type.toUpperCase(),
      amount: Number(form.amount),
      categoryId: matchedCat.categoryId,
      emotionId: matchedEmotion.emotionId,
      situationIds: [],
      memo: form.memo || null,
      goalId: isGoalSaving ? form.goalId : undefined,
      occurredAt: new Date(form.date).toISOString()
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        actions.showToast('기록 저장됨');
        onSaved?.(form.date);
        setForm(prev => ({ ...prev, amount: '', category: null, emotion: null, situation: [], memo: '', savingsType: null, goalId: null }));
      },
      onError: (error) => {
        actions.showToast(error.response?.data?.error?.message || '기록 저장에 실패했습니다.');
      }
    });
  };

  const savingCatIndex = customCategories.findIndex(c => c.name === '저축');
  const savingCat = customCategories[savingCatIndex];
  const displayedCategories = customCategories.filter(c => c.name !== '저축' && c.name !== '정산금');

  return (
    <Page>
      <Grid>
        <MainPanel strong>
          <FaintBlob color={accent} />
          <div css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TypeTabs>
              <TypeTab active={form.type === 'expense'} onClick={() => setForm(prev => prev.type === 'expense' ? prev : { ...prev, type: 'expense', category: null })}>지출</TypeTab>
              <TypeTab active={form.type === 'income'} onClick={() => setForm(prev => prev.type === 'income' ? prev : { ...prev, type: 'income', category: null })}>수입</TypeTab>
            </TypeTabs>
          </div>

          <div css={{ position: 'relative', marginTop: 'clamp(18px, 3vw, 28px)' }}>
            <div css={{ fontSize: 13, color: 'var(--text)', fontWeight: 900, marginBottom: 11, '@media (max-width: 820px)': { fontSize: 18 } }}>
              {form.type === 'expense' ? '얼마나 썼어요?' : '얼마가 들어왔어요?'}
            </div>
            <AmountBox>
              <span css={{ fontSize: 26, fontWeight: 900, color: 'var(--sub)' }}>₩</span>
              <AmountInput
                inputMode="numeric"
                placeholder="0"
                value={form.amount ? Number(form.amount).toLocaleString() : ''}
                onChange={event => setField('amount', event.target.value.replace(/\D/g, ''))}
              />
              <span css={{ fontSize: 20, fontWeight: 900, color: 'var(--sub)' }}>원</span>
            </AmountBox>
            <div css={{ fontSize: 11.5, color: 'var(--sub)' }}>시간 단위로 수정할 수 있어요</div>
          </div>

          <Divider />

          <section css={{ position: 'relative' }}>
            <div css={{ fontSize: 15, fontWeight: 900 }}>
              이 소비, 어떤 기분이었어요?
              {form.emotion && <span css={{ color: selected.color }}> · {form.emotion}</span>}
            </div>
            <BlobGrid>
              {emotions.map(emotionItem => {
                const name = emotionItem.name;
                const active = form.emotion === name;
                return (
                  <BlobChoice key={emotionItem.emotionId} active={active} dim={form.emotion && !active} onClick={() => setField('emotion', active ? null : name)}>
                    <EmotionBlob emotion={name} size={isMobile ? (active ? 74 : 60) : (active ? 122 : 92)} interactive={false} />
                    <span css={{ fontSize: isMobile ? 12 : 14 }}>{name}</span>
                  </BlobChoice>
                );
              })}
            </BlobGrid>
          </section>
        </MainPanel>

        <Side css={{ flex: 1 }}>
          <SideCard css={{ flex: 1 }}>
            <div css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
              <h3 css={{ margin: 0, fontSize: 13 }}>{form.type === 'income' ? '어떤 수입인가요' : '어디에 썼어요'}</h3>
              <button type="button" onClick={() => setIsEditingCategory(!isEditingCategory)} css={{ background: 'transparent', border: 0, color: isEditingCategory ? 'var(--text)' : 'var(--sub)', cursor: 'pointer', fontSize: 16 }}>✎</button>
            </div>
            <ChipRow>
              {displayedCategories.filter(c => c.name !== '저축').map((item, index, filteredArray) => (
                <Fragment key={item.categoryId}>
                  {isEditingCategory && dragIndex !== null && dropIndex === index && <DropLine />}
                  {isEditingCategory ? (
                    <Chip
                      color={accent}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOverChip(e, index)}
                      onDragEnd={handleDropCategory}
                      css={{ 
                        display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'grab', 
                        opacity: dragIndex === index ? 0.4 : 1, transition: 'opacity .15s', 
                        animation: dragIndex === index ? 'none' : `${wiggle} .5s ease-in-out infinite`, 
                        animationDelay: `${(index % 2) * 0.13}s`, 
                        '@media (prefers-reduced-motion: reduce)': { animation: 'none' }, 
                        '&:active': { cursor: 'grabbing' } 
                      }}
                    >
                      <span>{item.name}</span>
                      {item.isCustom && (
                        <span onClick={() => handleRemoveCategory(item)} css={{ cursor: 'pointer', color: '#E87573', fontWeight: 900, marginLeft: 4 }}>×</span>
                      )}
                    </Chip>
                  ) : (
                    <Chip color={accent} active={form.category === item.name} onClick={() => setField('category', form.category === item.name ? null : item.name)}>
                      {item.name}
                    </Chip>
                  )}
                </Fragment>
              ))}
              {isEditingCategory && dragIndex !== null && dropIndex === displayedCategories.filter(c => c.name !== '저축').length && <DropLine />}
              {!isEditingCategory && addingTag !== 'category' && <Chip color={accent} onClick={() => startAdding('category')}>+</Chip>}
              {addingTag === 'category' && (
                <form onSubmit={handleAddSubmit} css={{ display: 'inline-block', margin: 0 }}>
                  <AddingInput
                    autoFocus
                    value={addingText}
                    onChange={e => setAddingText(e.target.value)}
                    onBlur={handleAddSubmit}
                    maxLength={5}
                    placeholder="입력..."
                    color={accent || '#B0AAA2'}
                  />
                </form>
              )}
            </ChipRow>

            {form.type === 'expense' && (
              <div css={{ marginTop: 'auto', paddingTop: 24 }}>
                <div css={{ height: 1, background: 'var(--line)', marginBottom: 14 }} />
                <h3 css={{ margin: '0 0 13px', fontSize: 13 }}>저축 <span css={{ color: 'var(--sub)', fontWeight: 600 }}>· 선택</span></h3>
                {isEditingCategory ? (
                  <div css={{ display: 'flex' }}>
                    <Chip
                      color={accent}
                      css={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <span>저축</span>
                      {savingCat?.isCustom && <span onClick={() => handleRemoveCategory(savingCat)} css={{ cursor: 'pointer', color: '#E87573', fontWeight: 900, marginLeft: 4 }}>×</span>}
                    </Chip>
                  </div>
                ) : (
                  <>
                    <ChipRow>
                      <Chip 
                        color={accent} 
                        active={form.category === '저축' && form.savingsType === '적금'} 
                        onClick={() => selectSaving('적금')}
                      >
                        적금
                      </Chip>
                      <Chip 
                        color={accent} 
                        active={form.category === '저축' && form.savingsType === '목표'} 
                        onClick={() => selectSaving('목표')}
                      >
                        목표
                      </Chip>
                    </ChipRow>

                    {form.category === '저축' && form.savingsType === '목표' && (
                      <div css={{ marginTop: 14 }}>
                        <div css={{ fontSize: 11.5, color: 'var(--sub)', fontWeight: 800, marginBottom: 9 }}>어떤 목표에 저축할까요?</div>
                        {goals.length > 0 ? (
                          <ChipRow>
                            {goals.map(g => (
                              <Chip key={g.goalId} color={accent} active={form.goalId === g.goalId} onClick={() => setField('goalId', g.goalId)}>{g.name}</Chip>
                            ))}
                          </ChipRow>
                        ) : (
                          <div css={{ fontSize: 12, color: 'var(--sub)', fontWeight: 700 }}>먼저 목표를 만들면 연결할 수 있어요.</div>
                        )}
                      </div>
                    )}

                    {form.category === '저축' && (
                      <div css={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 11.5, fontWeight: 700, color: 'var(--sub)' }}>
                        {savingMessage}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </SideCard>

          <SideCard>
            <textarea
              value={form.memo}
              onChange={event => setField('memo', event.target.value)}
              placeholder="한 줄 메모 - 그 순간, 왜 그 마음이었을까요?"
              css={{ marginTop: 14, minHeight: 76, resize: 'none', width: '100%', boxSizing: 'border-box', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 13, padding: '12px 15px', color: 'var(--text)', outline: 0, fontFamily: 'inherit' }}
            />
            <label css={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
              <div css={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', padding: 4, borderRadius: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setField('date', getInitialDate())}
                  css={{ 
                    padding: '6px 14px', borderRadius: 10, border: 0, 
                    background: form.date === getInitialDate() || new Date(form.date).toDateString() === new Date().toDateString() ? (accent || 'var(--ink)') : 'transparent',
                    color: form.date === getInitialDate() || new Date(form.date).toDateString() === new Date().toDateString() ? '#fff' : 'var(--sub)', 
                    fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  지금
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsDatePickerOpen(true)}
                  css={{ 
                    padding: '6px 14px', borderRadius: 10, border: 0, 
                    background: new Date(form.date).toDateString() !== new Date().toDateString() ? (accent || 'var(--ink)') : 'transparent',
                    color: new Date(form.date).toDateString() !== new Date().toDateString() ? '#fff' : 'var(--sub)', 
                    fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  과거
                </button>
              </div>

              <div css={{ display: 'flex', gap: 6, color: 'var(--sub)', fontSize: 13, fontWeight: 600 }}>
                <button type="button" onClick={() => { setDatePickerInitialMode('date'); setIsDatePickerOpen(true); }} css={{ background: 'transparent', border: 0, padding: 0, color: 'inherit', outline: 0, fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer', textAlign: 'right', fontWeight: 'inherit', transition: 'color 0.2s', '&:hover': { color: 'var(--text)' } }}>
                  {form.date.split('T')[0]}
                </button>
                <button type="button" onClick={() => { setDatePickerInitialMode('time'); setIsDatePickerOpen(true); }} css={{ background: 'transparent', border: 0, padding: 0, color: 'inherit', outline: 0, fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer', textAlign: 'right', fontWeight: 'inherit', transition: 'color 0.2s', '&:hover': { color: 'var(--text)' } }}>
                  {form.date.split('T')[1].slice(0, 5)}
                </button>
              </div>
              
              {isDatePickerOpen && (
                <DatePickerDc
                  value={form.date}
                  onChange={(newDate) => setField('date', newDate)}
                  onClose={() => setIsDatePickerOpen(false)}
                  initialTimePanelOpen={datePickerInitialMode === 'time'}
                />
              )}
            </label>
          </SideCard>

          <SaveButton disabled={!canSave} onClick={save} accent={accent}>
            {canSave ? '감정 기록 저장하기' : '금액·감정·카테고리를 골라주세요'}
          </SaveButton>
        </Side>
      </Grid>
    </Page>
  );
}
