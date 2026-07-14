/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Modal } from '../common/Modal.jsx';
import { EmotionBlob } from '../common/EmotionBlob.jsx';
import { money, signedMoney } from '../../utils/format.js';
import { useMetadata } from '../../hooks/queries/useMetadata.js';
import { useTransactionDetailQuery, useUpdateTransactionMutation, useDeleteTransactionMutation } from '../../hooks/queries/useTransactions.js';
import { useCategoriesQuery } from '../../hooks/queries/useCategories.js';
import DatePickerDc from '../common/DatePickerDc.jsx';

const Wrap = styled.div`
  padding: 26px 28px;
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
`;

const EmotionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  margin-top: 6px;
  margin-bottom: 16px;
`;

const EmotionChoice = styled.button`
  border: 1px solid ${({ active, color }) => active ? color : 'transparent'};
  border-radius: 12px;
  padding: 6px 0;
  background: ${({ active, color }) => active ? `${color}33` : 'transparent'};
  cursor: pointer;
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

  const [mode, setMode] = useState('detail');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [form, setForm] = useState({
    amount: String(transaction?.amount || 0),
    categoryId: transaction?.category?.categoryId || '',
    emotionId: transaction?.emotion?.emotionId || '',
    memo: transaction?.memo || '',
    date: transaction?.occurredAt ? transaction.occurredAt.slice(0, 16) : ''
  });

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

  return (
    <Modal onClose={onClose}>
      {mode === 'detail' ? (
        <Wrap>
          <Head>
            <h2>거래 상세</h2>
            <Close type="button" onClick={onClose}>✕</Close>
          </Head>
          <Hero>
            <div css={{ width: 76, height: 76, margin: '0 auto 8px', display: 'grid', placeItems: 'center' }}>
              <EmotionBlob emotion={transaction.emotion?.name || '평온'} size={76} interactive={false} />
            </div>
            <Amount income={isIncome}>{signedMoney(transaction)}</Amount>
          </Hero>
          <DetailBox>{rows.map(([label, value]) => <Row key={label}><span>{label}</span><b>{value}</b></Row>)}</DetailBox>
          <Actions>
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
            <Field>카테고리
              <select value={form.categoryId} onChange={event => setField('categoryId', event.target.value)}>
                <option value="" disabled>선택</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>
            </Field>
          </FieldGrid>
          <div css={{ marginBottom: 16 }}>
            <div css={{ color: 'var(--sub)', fontSize: 12, fontWeight: 900 }}>감정</div>
            <EmotionGrid>
              {emotions.map(item => {
                return (
                  <EmotionChoice 
                    key={item.emotionId} 
                    type="button" 
                    active={Number(form.emotionId) === item.emotionId} 
                    color={item.color} 
                    onClick={() => setField('emotionId', item.emotionId)}
                  >
                    <EmotionBlob emotion={item.name} size={34} interactive={false} />
                  </EmotionChoice>
                );
              })}
            </EmotionGrid>
          </div>
          <Field css={{ marginBottom: 16 }}>메모<input value={form.memo} onChange={event => setField('memo', event.target.value)} /></Field>
          <Field css={{ position: 'relative', marginBottom: 22 }}>날짜
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
          <Button type="button" primary onClick={save} disabled={updateTx.isPending}>저장</Button>
        </Wrap>
      )}
    </Modal>
  );
}
