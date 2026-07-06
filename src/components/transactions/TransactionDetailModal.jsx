/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { Modal } from '../common/Modal.jsx';
import { EmotionBlob } from '../common/EmotionBlob.jsx';
import { getEmotion } from '../../data/emotions.js';
import { money, signedMoney } from '../../utils/format.js';

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

const emotions = ['신남', '설렘', '뿌듯함', '스트레스', '외로움', '화남', '평온', '무덤덤'];

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

export default function TransactionDetailModal({ transaction, actions, onClose }) {
  const [mode, setMode] = useState('detail');
  const [form, setForm] = useState({
    amount: String(transaction.amount),
    category: transaction.category,
    emotion: transaction.emotion,
    situation: transaction.situation,
    memo: transaction.memo,
    date: transaction.date.slice(0, 16)
  });

  const isIncome = transaction.type === 'income';
  const emo = getEmotion(mode === 'edit' ? form.emotion : transaction.emotion);
  const rows = [
    ['구분', isIncome ? '수입' : '지출'],
    ['카테고리', transaction.category],
    ['감정', transaction.emotion],
    ['상황', transaction.situation],
    ['메모', transaction.memo],
    ['날짜', dateLabel(transaction.date)]
  ];

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const save = () => {
    actions.updateTransaction(transaction.id, {
      amount: Number(form.amount.replace(/\D/g, '')) || transaction.amount,
      category: form.category,
      emotion: form.emotion,
      situation: form.situation,
      memo: form.memo,
      date: form.date
    });
    setMode('detail');
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
              <EmotionBlob emotion={transaction.emotion} size={76} interactive={false} />
            </div>
            <Amount income={isIncome}>{signedMoney(transaction)}</Amount>
          </Hero>
          <DetailBox>{rows.map(([label, value]) => <Row key={label}><span>{label}</span><b>{value}</b></Row>)}</DetailBox>
          <Actions>
            <Button type="button" primary onClick={() => setMode('edit')}>수정</Button>
            <Button type="button" onClick={() => { actions.removeTransaction(transaction.id); onClose(); }}>삭제</Button>
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
            <Field>카테고리<input value={form.category} onChange={event => setField('category', event.target.value)} /></Field>
          </FieldGrid>
          <div css={{ marginBottom: 16 }}>
            <div css={{ color: 'var(--sub)', fontSize: 12, fontWeight: 900 }}>감정</div>
            <EmotionGrid>
              {emotions.map(name => {
                const item = getEmotion(name);
                return <EmotionChoice key={name} type="button" active={form.emotion === name} color={item.color} onClick={() => setField('emotion', name)}><EmotionBlob emotion={name} size={34} interactive={false} /></EmotionChoice>;
              })}
            </EmotionGrid>
          </div>
          <Field css={{ marginBottom: 16 }}>상황<input value={form.situation} onChange={event => setField('situation', event.target.value)} /></Field>
          <Field css={{ marginBottom: 16 }}>메모<input value={form.memo} onChange={event => setField('memo', event.target.value)} /></Field>
          <Field css={{ marginBottom: 22 }}>날짜<input type="datetime-local" value={form.date} onChange={event => setField('date', event.target.value)} /></Field>
          <Button type="button" primary onClick={save}>저장</Button>
        </Wrap>
      )}
    </Modal>
  );
}
