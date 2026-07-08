/** @jsxImportSource @emotion/react */
import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { EmotionBlob } from '../components/common/EmotionBlob.jsx';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { getEmotion } from '../data/emotions.js';
import { useMetadata } from '../hooks/queries/useMetadata.js';
import { useCreateTransactionMutation } from '../hooks/queries/useTransactions.js';

const emotions = ['신남', '설렘', '뿌듯함', '스트레스', '외로움', '화남', '평온', '무덤덤'];
const defaultIncomeCategories = ['월급', '금융소득', '용돈', '더치페이', '환급금'];
const defaultExpenseCategories = ['식비', '배달', '마트/편의점', '패션/미용', '주거/통신', '문화/취미', '구독료', '생활용품', '사회생활', '보험', '세금', '차량/교통', '저축'];
const defaultSituations = ['퇴근 후', '혼자 있음', '친구와', '보상', '습관', '이동 중', '아침', '밤'];

function categoriesForType(categories, type) {
  const transactionType = type.toUpperCase();
  return Array.isArray(categories)
    ? categories.filter(category => !category?.type || category.type === transactionType)
    : (type === 'income' ? categories?.income ?? [] : categories?.expense ?? []);
}

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
  const [customExpenseCategories, setCustomExpenseCategories] = useState(defaultExpenseCategories);
  const [customIncomeCategories, setCustomIncomeCategories] = useState(defaultIncomeCategories);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [customSituations, setCustomSituations] = useState(defaultSituations);
  const [isEditingSituation, setIsEditingSituation] = useState(false);
  const [addingTag, setAddingTag] = useState(null);
  const [addingText, setAddingText] = useState('');

  const { data } = useMetadata();
  const mutation = useCreateTransactionMutation();

  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: null,
    emotion: null,
    situation: [],
    memo: '',
    date: '2026-07-01T21:30'
  });

  const customCategories = form.type === 'income' ? customIncomeCategories : customExpenseCategories;
  const setCustomCategories = form.type === 'income' ? setCustomIncomeCategories : setCustomExpenseCategories;
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
      if (customCategories.includes(name)) { alert('이미 있는 카테고리입니다.'); return; }
      setCustomCategories([...customCategories, name.slice(0, 5)]);
    } else if (addingTag === 'situation') {
      if (customSituations.includes(name)) { alert('이미 있는 태그입니다.'); return; }
      setCustomSituations([...customSituations, name.slice(0, 5)]);
    }
    setAddingTag(null);
  };

  const handleRemoveCategory = (cat) => {
    setCustomCategories(customCategories.filter(c => c !== cat));
    if (form.category === cat) setField('category', null);
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
      setCustomCategories(newCats);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const handleDropSituation = () => {
    if (dragItemRef.current === null || dragOverItemRef.current === null) return;
    if (dragItemRef.current !== dragOverItemRef.current) {
      const newSits = [...customSituations];
      const [dragItem] = newSits.splice(dragItemRef.current, 1);
      newSits.splice(dragOverItemRef.current, 0, dragItem);
      setCustomSituations(newSits);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };



  const handleRemoveSituation = (sit) => {
    setCustomSituations(customSituations.filter(s => s !== sit));
    if (form.situation.includes(sit)) {
      setForm(prev => ({ ...prev, situation: prev.situation.filter(item => item !== sit) }));
    }
  };

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleSituation = (value) => setForm(prev => ({
    ...prev,
    situation: prev.situation.includes(value)
      ? prev.situation.filter(item => item !== value)
      : [...prev.situation, value]
  }));

  const save = () => {
    if (!canSave || mutation.isPending) return;

    // 카테고리와 감정의 ID를 찾아서 서버로 전송
    const catList = categoriesForType(data?.categories, form.type);
    const matchedCat = catList?.find(c => c.name === form.category);
    
    if (!matchedCat) {
      actions.showToast('카테고리 정보를 확인할 수 없습니다.');
      return;
    }

    const matchedEmotion = data?.emotions?.find(e => e.name === form.emotion);
    if (!matchedEmotion) {
      actions.showToast('감정 정보를 확인할 수 없습니다.');
      return;
    }

    mutation.mutate({
      type: form.type.toUpperCase(),
      amount: Number(form.amount),
      categoryId: matchedCat.categoryId,
      emotionId: matchedEmotion.emotionId,
      situationIds: [], // 과거 버전 호환성을 위해 빈 배열 전송
      memo: form.memo || null,
      occurredAt: new Date(form.date).toISOString()
    }, {
      onSuccess: () => {
        // 백엔드 저장 성공 시 프론트엔드 로컬 상태도 업데이트 (이전 UI 호환성)
        actions.addTransaction({
          type: form.type,
          amount: Number(form.amount),
          category: form.category,
          emotion: form.emotion,
          situation: form.situation[0] || '기록',
          memo: form.memo || '감정 기록',
          date: form.date
        });
        actions.showToast('기록 저장됨');
        onSaved?.(form.date);
        setForm(prev => ({ ...prev, amount: '', category: null, emotion: null, situation: [], memo: '' }));
      },
      onError: (error) => {
        actions.showToast(error.response?.data?.error?.message || '기록 저장에 실패했습니다.');
      }
    });
  };

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
              {emotions.map(name => {
                const active = form.emotion === name;
                return (
                  <BlobChoice key={name} active={active} dim={form.emotion && !active} onClick={() => setField('emotion', active ? null : name)}>
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
              {customCategories.filter(c => c !== '저축').map((item) => {
                const index = customCategories.indexOf(item);
                return isEditingCategory ? (
                  <Chip 
                    key={item} color={selected.color} active 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDropCategory}
                    onDragOver={(e) => e.preventDefault()}
                    css={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
                  >
                    <span>{item}</span>
                    <span onClick={() => handleRemoveCategory(item)} css={{ cursor: 'pointer', color: '#E87573', fontWeight: 900, marginLeft: 4 }}>×</span>
                  </Chip>
                ) : (
                  <Chip key={item} color={selected.color} active={form.category === item} onClick={() => setField('category', form.category === item ? null : item)}>{item}</Chip>
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

            {customCategories.includes('저축') && (
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
                      onDragStart={(e) => handleDragStart(e, customCategories.indexOf('저축'))}
                      onDragEnter={() => handleDragEnter(customCategories.indexOf('저축'))}
                      onDragEnd={handleDropCategory}
                      onDragOver={(e) => e.preventDefault()}
                      css={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
                    >
                      <span>저축</span>
                      <span onClick={() => handleRemoveCategory('저축')} css={{ cursor: 'pointer', color: '#E87573', fontWeight: 900, marginLeft: 4 }}>×</span>
                    </Chip>
                  ) : (
                    <Chip color={selected.color} active={form.category === '저축'} onClick={() => setField('category', form.category === '저축' ? null : '저축')}>저축</Chip>
                  )}
                </div>
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
