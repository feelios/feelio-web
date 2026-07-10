/** @jsxImportSource @emotion/react */
import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
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

const Page = styled.div`
  width: min(100%, 1080px);
  margin: 0 auto;
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
  background: radial-gradient(circle, ${({ color }) => color}44, transparent 68%);
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

const Chip = styled.button`
  border: 1.5px solid ${({ active, color }) => active ? color : 'var(--line)'};
  border-radius: 999px;
  padding: 10px 16px;
  background: ${({ active, color }) => active ? `${color}26` : 'transparent'};
  color: ${({ active }) => active ? 'var(--text)' : 'var(--sub)'};
  font-weight: 800;
  cursor: pointer;
`;

const SaveButton = styled.button`
  border: 0;
  border-radius: 18px;
  padding: 18px;
  background: ${({ disabled }) => disabled ? 'var(--line)' : 'var(--ink)'};
  color: ${({ disabled }) => disabled ? 'var(--sub)' : 'var(--on-ink)'};
  font-size: 15px;
  font-weight: 900;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
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

export default function RecordPageDc({ actions, onSaved }) {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [addingTag, setAddingTag] = useState(null);
  const [addingText, setAddingText] = useState('');

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: null,
    emotion: null,
    situation: [],
    memo: '',
    date: '2026-07-01T21:30'
  });

  const { data: metaData } = useMetadata();
  const emotions = metaData?.emotions || [];

  const { data: categoryData } = useCategoriesQuery(form.type.toUpperCase());
  const customCategories = categoryData?.categories || [];

  const createCategoryMutation = useCreateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const updateCategoryOrderMutation = useUpdateCategoryOrderMutation();
  const mutation = useCreateTransactionMutation();

  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 560);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 560);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const selected = getEmotion(form.emotion || '스트레스');
  const canSave = form.amount && form.emotion && form.category;

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
    dragItemRef.current = index;
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (index) => {
    dragOverItemRef.current = index;
  };

  const handleDropCategory = () => {
    if (dragItemRef.current === null || dragOverItemRef.current === null) return;
    if (dragItemRef.current !== dragOverItemRef.current) {
      const newCats = [...customCategories];
      const [dragItem] = newCats.splice(dragItemRef.current, 1);
      newCats.splice(dragOverItemRef.current, 0, dragItem);
      
      const orders = newCats.map((c, idx) => ({ categoryId: c.categoryId, isCustom: c.isCustom, sortOrder: idx + 1 }));
      updateCategoryOrderMutation.mutate({ type: form.type.toUpperCase(), orders });
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

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

    mutation.mutate({
      type: form.type.toUpperCase(),
      amount: Number(form.amount),
      categoryId: matchedCat.categoryId,
      emotionId: matchedEmotion.emotionId,
      situationIds: [],
      memo: form.memo || null,
      occurredAt: new Date(form.date).toISOString()
    }, {
      onSuccess: () => {
        actions.showToast('기록 저장됨');
        onSaved?.(form.date);
        setForm(prev => ({ ...prev, amount: '', category: null, emotion: null, situation: [], memo: '' }));
      },
      onError: (error) => {
        actions.showToast(error.response?.data?.error?.message || '기록 저장에 실패했습니다.');
      }
    });
  };

  const hasSaving = customCategories.some(c => c.name === '저축');
  const savingCatIndex = customCategories.findIndex(c => c.name === '저축');
  const savingCat = customCategories[savingCatIndex];

  return (
    <Page>
      <Grid>
        <MainPanel strong>
          <FaintBlob color={selected.color} />
          <TypeTabs>
            <TypeTab active={form.type === 'expense'} onClick={() => setForm(prev => prev.type === 'expense' ? prev : { ...prev, type: 'expense', category: null })}>지출</TypeTab>
            <TypeTab active={form.type === 'income'} onClick={() => setForm(prev => prev.type === 'income' ? prev : { ...prev, type: 'income', category: null })}>수입</TypeTab>
          </TypeTabs>

          <div css={{ position: 'relative', marginTop: 'clamp(18px, 3vw, 28px)' }}>
            <div css={{ fontSize: 13, color: 'var(--text)', fontWeight: 900, marginBottom: 11 }}>
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
            <div css={{ fontSize: 12, color: 'var(--sub)', marginTop: 9 }}>숫자만 입력하면 돼요</div>
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
              <h3 css={{ margin: 0, fontSize: 13 }}>어디에 썼어요 <span css={{ color: 'var(--sub)', fontWeight: 600 }}>· 필수</span></h3>
              <button type="button" onClick={() => setIsEditingCategory(!isEditingCategory)} css={{ background: 'transparent', border: 0, color: isEditingCategory ? 'var(--text)' : 'var(--sub)', cursor: 'pointer', fontSize: 16 }}>✎</button>
            </div>
            <ChipRow>
              {customCategories.filter(c => c.name !== '저축').map((item, index) => {
                return isEditingCategory ? (
                  <Chip 
                    key={item.categoryId} color={selected.color} active 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDropCategory}
                    onDragOver={(e) => e.preventDefault()}
                    css={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
                  >
                    <span>{item.name}</span>
                    {item.isCustom && <span onClick={() => handleRemoveCategory(item)} css={{ cursor: 'pointer', color: '#E87573', fontWeight: 900, marginLeft: 4 }}>×</span>}
                  </Chip>
                ) : (
                  <Chip key={item.categoryId} color={selected.color} active={form.category === item.name} onClick={() => setField('category', form.category === item.name ? null : item.name)}>{item.name}</Chip>
                );
              })}
              {!isEditingCategory && addingTag !== 'category' && <Chip color={selected.color} onClick={() => startAdding('category')}>+</Chip>}
              {addingTag === 'category' && (
                <form onSubmit={handleAddSubmit} css={{ display: 'inline-block', margin: 0 }}>
                  <AddingInput
                    autoFocus
                    value={addingText}
                    onChange={e => setAddingText(e.target.value)}
                    onBlur={handleAddSubmit}
                    maxLength={5}
                    placeholder="입력..."
                    color={selected.color}
                  />
                </form>
              )}
            </ChipRow>

            {hasSaving ? (
              <div css={{ marginTop: 'auto', paddingTop: 24 }}>
                <div css={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span css={{ color: '#8a837a', fontSize: 11, fontWeight: 800 }}>적금</span>
                  {form.category === '저축' && (
                    <span css={{ 
                      color: '#76A7E8', 
                      fontSize: 11, 
                      fontWeight: 700, 
                      animation: 'fadeIn 0.3s ease-out forwards',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateX(-5px)' },
                        to: { opacity: 1, transform: 'translateX(0)' }
                      }
                    }}>
                      👉 미래의 나에게 든든한 선물을 하셨네요! 멋져요 ✨
                    </span>
                  )}
                </div>
                <div css={{ height: 1, background: 'var(--line)', marginBottom: 14 }} />
                <div css={{ display: 'flex' }}>
                  {isEditingCategory ? (
                    <Chip 
                      color={selected.color} active 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, savingCatIndex)}
                      onDragEnter={() => handleDragEnter(savingCatIndex)}
                      onDragEnd={handleDropCategory}
                      onDragOver={(e) => e.preventDefault()}
                      css={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
                    >
                      <span>저축</span>
                      {savingCat?.isCustom && <span onClick={() => handleRemoveCategory(savingCat)} css={{ cursor: 'pointer', color: '#E87573', fontWeight: 900, marginLeft: 4 }}>×</span>}
                    </Chip>
                  ) : (
                    <Chip color={selected.color} active={form.category === '저축'} onClick={() => setField('category', form.category === '저축' ? null : '저축')}>저축</Chip>
                  )}
                </div>
              </div>
            ) : (
              form.type === 'expense' && (
                <div css={{ marginTop: 'auto', paddingTop: 24 }}>
                  <div css={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span css={{ color: '#8a837a', fontSize: 11, fontWeight: 800 }}>적금</span>
                  </div>
                  <div css={{ height: 1, background: 'var(--line)', marginBottom: 14 }} />
                  <div css={{ display: 'flex' }}>
                    <Chip color={selected.color} onClick={() => createCategoryMutation.mutate({ name: '저축', type: 'EXPENSE' })}>+ 저축 카테고리 추가하기</Chip>
                  </div>
                </div>
              )
            )}
          </SideCard>

          <SideCard>
            <textarea
              value={form.memo}
              onChange={event => setField('memo', event.target.value)}
              placeholder="한 줄 메모 - 그 순간, 왜 그 마음이었을까요?"
              css={{ marginTop: 14, minHeight: 76, resize: 'none', width: '100%', boxSizing: 'border-box', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 13, padding: '12px 15px', color: 'var(--text)', outline: 0, fontFamily: 'inherit' }}
            />
            <label css={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', fontSize: 12.5, color: 'var(--sub)' }}>
              <input type="datetime-local" value={form.date} onChange={event => setField('date', event.target.value)} css={{ background: 'transparent', border: 0, color: 'var(--sub)', outline: 0, fontFamily: 'inherit' }} />
              <span css={{ color: selected.color, fontWeight: 900 }}>· 지금</span>
            </label>
          </SideCard>

          <SaveButton disabled={!canSave} onClick={save}>
            {canSave ? '감정 기록 저장하기' : '금액·감정·카테고리를 골라주세요'}
          </SaveButton>
        </Side>
      </Grid>
    </Page>
  );
}
