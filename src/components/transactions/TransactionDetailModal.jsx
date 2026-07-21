/** @jsxImportSource @emotion/react */
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import styled from '@emotion/styled';
import { Modal } from '../common/Modal.jsx';
import { EmotionBlob } from '../common/EmotionBlob.jsx';
import { money, signedMoney } from '../../utils/format.js';
import { useMetadata } from '../../hooks/queries/useMetadata.js';
import { useTransactionDetailQuery, useUpdateTransactionMutation, useDeleteTransactionMutation, useMergeTransactionMutation } from '../../hooks/queries/useTransactions.js';
import { useCategoriesQuery } from '../../hooks/queries/useCategories.js';
import DatePickerDc from '../common/DatePickerDc.jsx';

const Wrap = styled.div`
  box-sizing: border-box;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 26px 28px;

  @media (max-width: 820px) {
    padding: 20px 18px;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
  }
`;

const Close = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 0;
  background: var(--line);
  color: var(--sub);
  cursor: pointer;
`;

const Hero = styled.div`
  text-align: center;
  padding: 8px 0 20px;
`;

const Amount = styled.div`
  margin-top: 8px;
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  color: ${({ income }) => income ? '#3E9578' : 'var(--text)'};
  font-variant-numeric: tabular-nums;

  @media (max-width: 820px) {
    font-size: 26px;
  }
`;

const DetailBox = styled.div`
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--line);

  &:last-child {
    border-bottom: 0;
  }

  span {
    color: var(--sub);
    font-size: 13.5px;
  }

  b {
    max-width: 62%;
    text-align: right;
    font-size: 13.5px;
    font-weight: 900;
    overflow-wrap: anywhere;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  flex: 1;
  border-radius: 14px;
  padding: 14px;
  border: ${({ danger, primary }) => primary || danger ? 0 : '1px solid var(--line)'};
  background: ${({ primary, danger }) => primary ? 'var(--ink)' : danger ? '#E87573' : 'var(--card)'};
  color: ${({ primary, danger }) => primary ? 'var(--on-ink)' : danger ? '#fff' : '#E87573'};
  font-size: 14.5px;
  font-weight: 900;
  cursor: pointer;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;

  @media (max-width: 820px) {
    margin-bottom: 12px;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 5px;
  color: var(--sub);
  font-size: 12px;
  font-weight: 900;

  input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 12px 14px;
    background: var(--card);
    color: var(--text);
    outline: 0;
    font-size: 15px;
    font-family: inherit;
  }

  @media (max-width: 820px) {
    input { padding: 9px 12px; font-size: 14px; }
  }
`;

const EmotionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  margin-top: 6px;
  margin-bottom: 16px;

  @media (max-width: 820px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 2px 4px;
    margin-top: 2px;
    margin-bottom: 2px;
  }
`;

const EmotionChoice = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  color: ${({ active }) => active ? 'var(--text)' : 'var(--sub)'};
  font-size: 10.5px;
  font-weight: ${({ active }) => active ? 900 : 700};
  filter: ${({ dim }) => dim ? 'saturate(.55) opacity(.4)' : 'none'};
  transition: filter .15s ease;
`;

const CatWrap = styled.div`
  position: relative;
  display: grid;
  gap: 5px;
  color: var(--sub);
  font-size: 12px;
  font-weight: 900;
`;

const CatTrigger = styled.button`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--card);
  color: var(--text);
  font-size: 15px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  svg { flex-shrink: 0; color: var(--sub); transition: transform .18s ease; }

  @media (max-width: 820px) {
    padding: 9px 12px;
    font-size: 14px;
  }
`;

const CatMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  background: var(--modal-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(24px) saturate(1.2);
  padding: 6px;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
`;

const CatItem = styled.button`
  width: 100%;
  text-align: left;
  border: 0;
  background: ${({ active }) => active ? 'var(--card-strong)' : 'transparent'};
  color: var(--text);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: ${({ active }) => active ? 900 : 700};
  cursor: pointer;

  &:hover { background: var(--card-strong); }
`;

function dateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}월 ${day}일 (${weekdays[date.getDay()]}) ${hour}:${minute}`;
}

export default function TransactionDetailModal({ transaction: initialTxn, onClose }) {
  const { data: metaData } = useMetadata();
  const emotions = metaData?.emotions || [];

  const { data: transaction } = useTransactionDetailQuery(initialTxn.transactionId, initialTxn);
  const { data: categoryData } = useCategoriesQuery(transaction?.type);
  const categories = categoryData?.categories || [];
  const updateTx = useUpdateTransactionMutation();
  const deleteTx = useDeleteTransactionMutation();
  const mergeTx = useMergeTransactionMutation();

  const [mode, setMode] = useState('detail');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [form, setForm] = useState({
    amount: String(transaction?.amount || 0),
    categoryId: transaction?.category?.categoryId || '',
    emotionId: transaction?.emotion?.emotionId || '',
    memo: transaction?.memo || '',
    date: transaction?.occurredAt ? transaction.occurredAt.slice(0, 16) : ''
  });
  const [emotionPicked, setEmotionPicked] = useState(false);

  useEffect(() => {
    if (transaction && mode === 'detail') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        amount: String(transaction.amount),
        categoryId: transaction.category?.categoryId || '',
        emotionId: transaction.emotion?.emotionId || '',
        memo: transaction.memo || '',
        date: transaction.occurredAt ? transaction.occurredAt.slice(0, 16) : ''
      });
    }
  }, [transaction, mode]);

  const wrapRef = useRef(null);
  const [lockedHeight, setLockedHeight] = useState(null);
  useLayoutEffect(() => {
    // 상세 화면일 때 실제 높이를 측정해 둔다 (이 높이를 '수정' 모드 기준으로 사용)
    if (mode === 'detail' && wrapRef.current) {
      const h = wrapRef.current.offsetHeight;
      setLockedHeight(prev => (prev === h ? prev : h));
    }
  }, [mode, transaction]);

  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);
  useEffect(() => {
    if (!catOpen) return;
    const onDown = (event) => {
      if (catRef.current && !catRef.current.contains(event.target)) setCatOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [catOpen]);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 820);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!transaction) return null;

  const isIncome = transaction.type === 'INCOME';
  const rows = [
    ['구분', isIncome ? '수입' : '지출'],
    ['카테고리', transaction.category?.name],
    ['감정', transaction.emotion?.name],
    ['메모', transaction.memo],
    ['날짜', dateLabel(transaction.occurredAt)]
  ];

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const save = async () => {
    await updateTx.mutateAsync({
      transactionId: transaction.transactionId,
      data: {
        type: transaction.type, // 기존 type 유지
        amount: Number(form.amount.replace(/\D/g, '')) || transaction.amount,
        categoryId: Number(form.categoryId),
        emotionId: Number(form.emotionId),
        memo: form.memo,
        occurredAt: form.date ? new Date(form.date).toISOString() : transaction.occurredAt
      }
    });
    setMode('detail');
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteTx.mutateAsync(transaction.transactionId);
      onClose();
    }
  };

  const handleMerge = async () => {
    const amount = Number(receivedAmount.replace(/\D/g, ''));
    if (!amount) return;
    await mergeTx.mutateAsync({ transactionId: transaction.transactionId, receivedAmount: amount });
    onClose();
  };

  return (
    <Modal onClose={onClose} height={mode === 'edit' && lockedHeight ? `${lockedHeight}px` : undefined}>
      {mode === 'detail' ? (
        <Wrap ref={wrapRef}>
          <Head>
            <h2>거래 상세</h2>
            <Close type="button" onClick={onClose}>✕</Close>
          </Head>
          <Hero>
            <div css={{ width: isMobile ? 60 : 76, height: isMobile ? 60 : 76, margin: '0 auto 6px', display: 'grid', placeItems: 'center' }}>
              <EmotionBlob emotion={transaction.emotion?.name || '평온'} size={isMobile ? 60 : 76} interactive={false} />
            </div>
            <Amount income={isIncome}>{signedMoney(transaction)}</Amount>
          </Hero>
          <DetailBox>{rows.map(([label, value]) => <Row key={label}><span>{label}</span><b>{value}</b></Row>)}</DetailBox>
          {transaction.type === 'EXPENSE' && (
            <div css={{ marginTop: 'auto', padding: 16, background: 'color-mix(in srgb, var(--bg-1) 95%, transparent)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: 16, border: '1px solid var(--line)', marginBottom: 16 }}>
              <div css={{ fontSize: 13, fontWeight: 900, marginBottom: 8, color: 'var(--text)' }}>정산받은 금액 입력 (더치페이)</div>
              <div css={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="예) 15000"
                  value={money(Number(receivedAmount.replace(/\D/g, '')) || 0) === '0' ? '' : money(Number(receivedAmount.replace(/\D/g, '')) || 0)}
                  onChange={e => setReceivedAmount(e.target.value.replace(/\D/g, ''))}
                  css={{ flex: 1, border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px', background: 'var(--card)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}
                />
                <Button type="button" primary onClick={handleMerge} disabled={!receivedAmount || mergeTx.isPending} css={{ flex: '0 0 auto', padding: '10px 16px' }}>차감</Button>
              </div>
            </div>
          )}
          <Actions css={{ marginTop: transaction.type === 'EXPENSE' ? 0 : 'auto' }}>
            <Button type="button" primary onClick={() => setMode('edit')}>수정</Button>
            <Button type="button" onClick={handleDelete}>삭제</Button>
          </Actions>
        </Wrap>
      ) : (
        <Wrap>
          <Head>
            <div css={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" onClick={() => setMode('detail')} css={{ border: 0, background: 'transparent', color: 'var(--sub)', fontSize: 22, cursor: 'pointer' }}>‹</button>
              <h2>거래 수정</h2>
            </div>
          </Head>
          <FieldGrid>
            <Field>금액<input value={money(Number(form.amount.replace(/\D/g, '')) || 0)} onChange={event => setField('amount', event.target.value.replace(/\D/g, ''))} /></Field>
            <CatWrap ref={catRef}>카테고리
              <CatTrigger type="button" onClick={() => setCatOpen(open => !open)}>
                <span>{categories.find(c => Number(c.categoryId) === Number(form.categoryId))?.name || '선택'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: catOpen ? 'rotate(180deg)' : 'none' }}><path d="M6 9l6 6 6-6" /></svg>
              </CatTrigger>
              {catOpen && (
                <CatMenu>
                  {categories.filter(c => c.type === transaction.type || !c.type).map(c => (
                    <CatItem
                      key={c.categoryId}
                      type="button"
                      active={Number(form.categoryId) === Number(c.categoryId)}
                      onClick={() => { setField('categoryId', c.categoryId); setCatOpen(false); }}
                    >
                      {c.name}
                    </CatItem>
                  ))}
                </CatMenu>
              )}
            </CatWrap>
          </FieldGrid>
          <div css={{ marginBottom: isMobile ? 4 : 16 }}>
            <div css={{ color: 'var(--sub)', fontSize: 12, fontWeight: 900 }}>감정</div>
            <EmotionGrid>
              {emotions.map(item => {
                return (
                  <EmotionChoice
                    key={item.emotionId}
                    type="button"
                    active={emotionPicked && Number(form.emotionId) === item.emotionId}
                    dim={emotionPicked && Number(form.emotionId) !== item.emotionId}
                    onClick={() => {
                      const isActive = Number(form.emotionId) === item.emotionId;
                      if (emotionPicked && isActive) setEmotionPicked(false);
                      else { setField('emotionId', item.emotionId); setEmotionPicked(true); }
                    }}
                  >
                    <EmotionBlob emotion={item.name} size={isMobile ? 34 : 34} interactive={false} />
                    <span>{item.name}</span>
                  </EmotionChoice>
                );
              })}
            </EmotionGrid>
          </div>
          <Field css={{ marginBottom: isMobile ? 6 : 16 }}>메모<input value={form.memo} onChange={event => setField('memo', event.target.value)} /></Field>
          <Field css={{ position: 'relative', marginBottom: isMobile ? 6 : 22 }}>날짜
            <button type="button" onClick={() => setIsDatePickerOpen(true)} css={{ border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', background: 'var(--card)', color: 'var(--text)', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>
              {form.date.replace('T', ' ')}
            </button>
            {isDatePickerOpen && (
              <DatePickerDc
                value={form.date}
                onChange={(newDate) => setField('date', newDate)}
                onClose={() => setIsDatePickerOpen(false)}
              />
            )}
          </Field>
          <Button type="button" primary onClick={save} disabled={updateTx.isPending} css={{ width: '100%', flex: '0 0 auto', marginTop: 'auto' }}>저장</Button>
        </Wrap>
      )}
    </Modal>
  );
}
