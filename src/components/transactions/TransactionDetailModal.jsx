/** @jsxImportSource @emotion/react */
import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Modal } from '../common/Modal.jsx';
import { EmotionBlob } from '../common/EmotionBlob.jsx';
import { getEmotion } from '../../data/emotions.js';
import { money, signedMoney } from '../../utils/format.js';
import { useUpdateTransactionMutation, useDeleteTransactionMutation } from '../../hooks/queries/useTransactions.js';
import { useMetadata } from '../../hooks/queries/useMetadata.js';
import { categoriesForType } from '../../utils/transactionCategories.js';

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
  background: ${({ primary, danger, disabled }) => disabled ? 'var(--card-strong)' : primary ? 'var(--ink)' : danger ? '#E87573' : 'var(--card)'};
  color: ${({ primary, danger, disabled }) => disabled ? 'var(--text)' : primary ? 'var(--on-ink)' : danger ? '#fff' : '#E87573'};
  font-size: 14.5px;
  font-weight: 900;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? .78 : 1};
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
  const updateMutation = useUpdateTransactionMutation();
  const deleteMutation = useDeleteTransactionMutation();
  const { data: metadata } = useMetadata();

  // API 응답에서 category/emotion은 객체 형태 — 표시용 name 추출
  const categoryName = transaction.category?.name ?? transaction.category;
  const emotionName = transaction.emotion?.name ?? transaction.emotion;
  const situationNames = Array.isArray(transaction.situations)
    ? transaction.situations.map(s => s.name ?? s).join(', ')
    : (transaction.situation ?? '');
  const occurredAt = transaction.occurredAt ?? transaction.date ?? '';

  const [mode, setMode] = useState('detail');
  const [form, setForm] = useState({
    amount: String(transaction.amount),
    category: categoryName,
    emotion: emotionName,
    memo: transaction.memo ?? '',
    date: occurredAt.slice(0, 16)
  });

  const isIncome = transaction.type === 'INCOME' || transaction.type === 'income';
  const transactionId = transaction.transactionId ?? transaction.id;

  const rows = useMemo(() => [
    ['구분', isIncome ? '수입' : '지출'],
    ['카테고리', categoryName],
    ['감정', emotionName],
    ['상황', situationNames],
    ['메모', transaction.memo],
    ['날짜', dateLabel(occurredAt)]
  ], [categoryName, emotionName, isIncome, occurredAt, situationNames, transaction.memo]);

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const save = () => {
    if (isBusy) return;
    // API 계약서 §6: PUT /transactions/{transactionId} — src/api 경유 호출
    // 수정 시 situationIds는 UI에서 선택하지 않으므로 기존값 유지(빈 배열)
    const transactionType = isIncome ? 'INCOME' : 'EXPENSE';
    const matchedCategory = categoriesForType(metadata?.categories, transactionType).find(category => category.name === form.category);
    const matchedEmotion = metadata?.emotions?.find(emotion => emotion.name === form.emotion);
    const categoryId = form.category === categoryName
      ? transaction.category?.categoryId ?? matchedCategory?.categoryId
      : matchedCategory?.categoryId;
    const emotionId = form.emotion === emotionName
      ? transaction.emotion?.emotionId ?? matchedEmotion?.emotionId
      : matchedEmotion?.emotionId;
    const normalizedAmount = form.amount.replace(/[^\d]/g, '');
    const parsedAmount = Number(normalizedAmount);

    if (!normalizedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      actions?.showToast('유효한 금액을 입력해주세요.');
      return;
    }

    if (!categoryId) {
      actions?.showToast('카테고리 정보를 확인할 수 없습니다.');
      return;
    }
    if (!emotionId) {
      actions?.showToast('감정 정보를 확인할 수 없습니다.');
      return;
    }

    updateMutation.mutate({ transactionId, data: {
      type: transactionType,
      amount: parsedAmount,
      categoryId,
      emotionId,
      situationIds: (transaction.situations ?? []).map(s => s.situationId ?? s),
      memo: form.memo || null,
      occurredAt: new Date(form.date).toISOString()
    }}, {
      onSuccess: () => {
        actions?.showToast('기록 수정됨');
        setMode('detail');
        onClose();
      },
      onError: (err) => {
        actions?.showToast(err.response?.data?.error?.message || '수정에 실패했어요.');
      }
    });
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
            <Button type="button" primary onClick={() => setMode('edit')} disabled={isBusy}>수정</Button>
            <Button type="button" onClick={() => {
              if (isBusy) return;
              // API 계약서 §6: DELETE /transactions/{transactionId}
              deleteMutation.mutate(transactionId, {
                onSuccess: () => {
                  actions?.showToast('기록 삭제됨');
                  onClose();
                },
                onError: (err) => {
                  actions?.showToast(err.response?.data?.error?.message || '삭제에 실패했어요.');
                }
              });
            }} disabled={isBusy}>삭제</Button>
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
          <Field css={{ marginBottom: 16 }}>메모<input value={form.memo} onChange={event => setField('memo', event.target.value)} /></Field>
          <Field css={{ marginBottom: 22 }}>날짜<input type="datetime-local" value={form.date} onChange={event => setField('date', event.target.value)} /></Field>
          <Button type="button" primary onClick={save} disabled={isBusy}>저장</Button>
        </Wrap>
      )}
    </Modal>
  );
}
