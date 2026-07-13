/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';

const FieldLabel = styled.label`
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--sub);
  margin-bottom: 6px;
`;

const Field = styled.input`
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 14px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 13px 15px;
  font-size: 15px;
  color: var(--text);
  outline: none;
  font-family: inherit;

  &:disabled {
    background: var(--line);
    color: var(--sub);
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  background: var(--ink);
  color: var(--on-ink);
  border: none;
  border-radius: 14px;
  padding: 15px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`;

export default function GoalForm({ goalForm, setGoalForm, onSubmit, disabled }) {
  const updateField = (key) => (event) => {
    const value = key === 'target' || key === 'current'
      ? Number(event.target.value) || 0
      : event.target.value;

    setGoalForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <FieldLabel>목표 이름</FieldLabel>
      <Field
        placeholder="예: 맥북 프로 구매"
        value={goalForm.name}
        onChange={updateField('name')}
      />
      <FieldLabel>목표 금액 (원)</FieldLabel>
      <Field
        type="number"
        placeholder="예: 3000000"
        value={goalForm.target || ''}
        onChange={updateField('target')}
      />
      <FieldLabel>현재 모은 돈 (원)</FieldLabel>
      <Field
        type="number"
        placeholder="예: 500000"
        value={goalForm.current || ''}
        onChange={updateField('current')}
      />
      <FieldLabel>마감 날짜</FieldLabel>
      <Field
        type="date"
        value={goalForm.period}
        onChange={updateField('period')}
      />
      <PrimaryButton type="button" disabled={disabled} onClick={onSubmit}>
        저장
      </PrimaryButton>
    </>
  );
}