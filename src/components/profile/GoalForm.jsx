/** @jsxImportSource @emotion/react */

import styled from '@emotion/styled';
import SegmentDatePicker from '../common/SegmentDatePicker.jsx';

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

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0 16px;
`;

const ToggleText = styled.div`
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
`;

const ToggleDesc = styled.div`
  font-size: 12px;
  color: var(--sub);
  margin-top: 2px;
`;

const Switch = styled.button`
  flex: 0 0 auto;
  width: 46px;
  height: 27px;
  border: 0;
  border-radius: 99px;
  background: ${({ active }) => (active ? 'var(--ink)' : 'var(--line)')};
  position: relative;
  cursor: pointer;

  &:disabled {
    cursor: default;
    opacity: 0.55;
  }

  span {
    position: absolute;
    top: 3px;
    left: ${({ active }) => (active ? '22px' : '3px')};
    width: 21px;
    height: 21px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: left 0.2s;
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  margin-top: auto;
  background: linear-gradient(135deg, color-mix(in srgb, var(--ink) 90%, white), var(--ink));
  color: var(--on-ink);
  border: none;
  border-radius: 14px;
  padding: 15px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
`;

// 입력값을 3자리 콤마 문자열로 포맷 (숫자/문자열 모두 허용)
const formatComma = (value) => {
  if (value === '' || value == null) return '';
  const digits = String(value).replace(/[^0-9]/g, '');
  return digits === '' ? '' : Number(digits).toLocaleString('ko-KR');
};

export default function GoalForm({ goalForm, setGoalForm, onSubmit, disabled, mainLocked = false }) {
  const updateField = (key) => (event) => {
    setGoalForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  // 금액 필드: 콤마 등 숫자 외 문자를 제거하고 순수 숫자 문자열로 저장
  const updateAmount = (key) => (event) => {
    const digits = event.target.value.replace(/[^0-9]/g, '');
    setGoalForm((prev) => ({ ...prev, [key]: digits }));
  };

  const isMain = mainLocked ? true : Boolean(goalForm.isMain);

  const toggleMain = () => {
    if (mainLocked) return;
    setGoalForm((prev) => ({ ...prev, isMain: !prev.isMain }));
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
        type="text"
        inputMode="numeric"
        placeholder="예: 3,000,000"
        value={formatComma(goalForm.target)}
        onChange={updateAmount('target')}
      />
      <FieldLabel>현재 모은 돈 (원)</FieldLabel>
      <Field
        type="text"
        inputMode="numeric"
        placeholder="예: 500,000"
        value={formatComma(goalForm.current)}
        onChange={updateAmount('current')}
      />
      <FieldLabel>마감 날짜</FieldLabel>
      <SegmentDatePicker
        value={goalForm.period}
        onChange={(newDate) => {
          setGoalForm((prev) => ({ ...prev, period: newDate }));
        }}
        disabled={disabled}
      />
      <ToggleRow>
        <div>
          <ToggleText>대표 목표로 설정하기</ToggleText>
          <ToggleDesc>
            {mainLocked ? '지금은 유일한 목표라 자동으로 대표 목표예요' : '홈·평행우주에 대표 목표로 표시돼요'}
          </ToggleDesc>
        </div>
        <Switch type="button" active={isMain} disabled={disabled || mainLocked} onClick={toggleMain}>
          <span />
        </Switch>
      </ToggleRow>
      <PrimaryButton type="button" disabled={disabled} onClick={onSubmit}>
        저장
      </PrimaryButton>
    </>
  );
}
