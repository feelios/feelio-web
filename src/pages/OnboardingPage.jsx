/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { EmotionBlob } from '../components/common/EmotionBlob.jsx';
import SegmentDatePicker from '../components/common/SegmentDatePicker.jsx';
import { money } from '../utils/format.js';
import { useUpdateMeMutation, useCompleteOnboardingMutation } from '../hooks/queries/useUsers.js';
import { useCreateGoalMutation } from '../hooks/queries/useGoals.js';

const Page = styled.main`
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;

  @media (max-width: 560px) {
    padding: 0;
    align-items: flex-start;
  }
`;

const Panel = styled(GlassCard)`
  width: min(560px, 100%);
  min-height: min(576px, 90dvh);
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 5vw, 34px) clamp(20px, 6vw, 38px) clamp(24px, 5vw, 30px);

  @media (max-width: 560px) {
    min-height: 100dvh;
    border-radius: 0;
    border: 0;
    box-shadow: none;
    padding: 32px 24px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

const BigNum = styled.div`
  font-size: clamp(60px, 17vw, 84px);
  font-weight: 900;
  line-height: .82;
  letter-spacing: -.05em;
  color: var(--ink);
  opacity: .13;
  font-variant-numeric: tabular-nums;
`;

const StepChip = styled.div`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .08em;
  color: var(--sub);
  margin-top: 8px;
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  h2 { margin: 0; font-size: clamp(24px, 7vw, 30px); font-weight: 900; letter-spacing: -.03em; line-height: 1.18; }
  p { margin: 6px 0 12px; color: var(--sub); line-height: 1.6; }
`;

const Choice = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 16px;
  border: 1px solid ${({ active }) => active ? 'var(--ink)' : 'var(--line)'};
  background: ${({ active }) => active ? 'var(--card-strong)' : 'var(--card)'};
  padding: 13px;
  margin-top: 8px;
  text-align: left;
  cursor: pointer;
  font-weight: ${({ active }) => active ? 800 : 500};
`;

const fadeInGoal = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: none; }
`;

const CustomWrap = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 16px;
  border: 1px solid var(--ink);
  background: var(--card-strong);
  padding: 13px;
  margin-top: 8px;
  animation: ${fadeInGoal} .22s ease;
`;

const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 16px;

  button {
    margin-top: 0;
    justify-content: center;
  }
`;

const GoalLead = styled.div`
  margin-top: 16px;
  padding: 15px 0;
  border-top: 1.5px solid var(--ink);
  border-bottom: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 4px;

  .k { font-size: 12px; font-weight: 800; letter-spacing: .06em; color: var(--sub); }
  .v { font-size: clamp(23px, 7vw, 28px); font-weight: 900; letter-spacing: -.02em; word-break: keep-all; }
`;

const SummaryList = styled.div`
  margin-top: 2px;

  .row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--line);
    font-size: 14px;
  }
  .row span { color: var(--sub); }
  .row strong { text-align: right; font-weight: 800; }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 32px;

  button {
    border: 0;
    border-radius: 14px;
    padding: 15px 28px;
    font-weight: 800;
    cursor: pointer;
    font-size: 15px;
    opacity: ${({ disabled }) => disabled ? 0.5 : 1};
    pointer-events: ${({ disabled }) => disabled ? 'none' : 'auto'};
  }

  @media (max-width: 560px) {
    margin-top: auto;
    button {
      flex: 1;
      padding: 16px;
    }
  }
`;

const durationMonths = {
  '3개월': 3,
  '6개월': 6,
  '1년': 12,
  '2년': 24,
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addMonthsFromToday = (months) => {
  const today = new Date();
  const dueDate = new Date(today.getFullYear(), today.getMonth() + months, 1);
  const lastDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
  dueDate.setDate(Math.min(today.getDate(), lastDay));
  return formatLocalDate(dueDate);
};

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [goal, setGoal] = useState('제주도 여행');
  const [customGoal, setCustomGoal] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [amount, setAmount] = useState(2000000);
  const [duration, setDuration] = useState('1년');
  const [customDuration, setCustomDuration] = useState('');
  const [current, setCurrent] = useState(0);
  const [totalAsset, setTotalAsset] = useState(0);

  const updateMeMutation = useUpdateMeMutation();
  const createGoalMutation = useCreateGoalMutation();
  const completeOnboardingMutation = useCompleteOnboardingMutation();

  const goals = ['제주도 여행', '비상금 마련', '이사 준비', '콘서트 비용', '나만의 목표'];
  const durations = ['3개월', '6개월', '1년', '2년', '기타'];

  const isNicknameValid = nickname.trim().length >= 1 && nickname.trim().length <= 8;
  const CUSTOM_GOAL = '나만의 목표';
  const isCustomGoalValid = customGoal.trim().length >= 1 && customGoal.trim().length <= 15;
  const effectiveGoal = isCustom ? customGoal.trim() : goal;
  const isGoalValid = !isCustom || isCustomGoalValid;

  const getDueDate = () => {
    if (duration === '기타') return customDuration.slice(0, 10);
    return addMonthsFromToday(durationMonths[duration]);
  };

  const handleNext = async () => {
    if (step === 0 && !isNicknameValid) return;
    if (step === 1 && !isGoalValid) return;

    if (step >= 6) {
      const dueDate = getDueDate();
      if (!dueDate || dueDate < formatLocalDate(new Date())) {
        alert('마감 날짜는 오늘 이후로 설정해 주세요.');
        return;
      }

      try {
        await updateMeMutation.mutateAsync({ nickname: nickname.trim(), totalAsset });

        await createGoalMutation.mutateAsync({
          name: effectiveGoal,
          targetAmount: amount,
          initialAmount: current,
          dueDate,
          isMain: true
        });

        await completeOnboardingMutation.mutateAsync(totalAsset);
        
        onComplete();
      } catch (err) {
        console.error('[onboarding] submit failed:', err);
        alert('온보딩 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
      return;
    }
    setStep(prev => prev + 1);
  };

  const isPending = updateMeMutation.isPending || createGoalMutation.isPending || completeOnboardingMutation.isPending;
  const stepEmotion = ['설렘', '신남', '평온', '평온', '뿌듯함', '평온', '뿌듯함'][step] || '평온';

  return (
    <Page>
      <Panel strong>
        <Header>
          <div>
            <BigNum>{String(step + 1).padStart(2, '0')}</BigNum>
            <StepChip>STEP {step + 1} / 7</StepChip>
          </div>
          <div css={{ width: 52, height: 54, flexShrink: 0 }}>
            <EmotionBlob emotion={stepEmotion} size={52} interactive={false} />
          </div>
        </Header>
        <Body>
          {step === 0 && (
            <div>
              <h2>반갑습니다! 사용하실 닉네임을 알려주세요.</h2>
              <p>1자에서 8자 사이로 입력해 주세요.</p>
              <input 
                type="text"
                value={nickname} 
                onChange={event => setNickname(event.target.value)} 
                placeholder="예) 서연"
                maxLength={8}
                css={{ 
                  width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent', 
                  padding: 12, textAlign: 'center', fontSize: 'clamp(32px, 8vw, 42px)', fontWeight: 800, color: 'var(--text)', outline: 'none'
                }} 
                autoFocus
              />
              {!isNicknameValid && nickname.length > 0 && (
                <p css={{ color: '#E87573', textAlign: 'center', marginTop: 12 }}>닉네임은 1자에서 8자 사이여야 합니다.</p>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2>어떤 목표를 이루고 싶나요?</h2>
              <p>가장 가까운 목표 하나만 골라주세요.</p>
              {goals.map(item => {
                if (item === CUSTOM_GOAL) {
                  return isCustom ? (
                    <CustomWrap key={item}>
                      <input
                        type="text"
                        value={customGoal}
                        onChange={event => setCustomGoal(event.target.value)}
                        onKeyDown={event => { if (event.key === 'Enter' && isCustomGoalValid) handleNext(); }}
                        placeholder="목표를 직접 입력해 주세요"
                        maxLength={15}
                        autoFocus
                        css={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none', fontSize: 15, fontWeight: 800, color: 'var(--text)', padding: 0 }}
                      />
                      <span css={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: isCustomGoalValid ? 'var(--sub)' : '#E87573' }}>{customGoal.trim().length}/15</span>
                    </CustomWrap>
                  ) : (
                    <Choice key={item} active={false} onClick={() => setIsCustom(true)}>
                      <strong>나만의 목표</strong>
                    </Choice>
                  );
                }
                return (
                  <Choice key={item} active={!isCustom && goal === item} onClick={() => { setIsCustom(false); setGoal(item); }}>
                    <strong>{item}</strong>
                  </Choice>
                );
              })}
              {isCustom && !isCustomGoalValid && customGoal.length > 0 && (
                <p css={{ color: '#E87573', fontSize: 13, margin: '10px 0 0' }}>목표명은 1자에서 15자 사이로 입력해 주세요.</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2>얼마를 모으고 싶나요?</h2>
              <p>대략적인 금액이어도 충분해요.</p>
              <input 
                inputMode="numeric"
                value={amount ? Number(amount).toLocaleString() : ''} 
                onChange={event => setAmount(Number(event.target.value.replace(/\D/g, '')) || 0)} 
                css={{ 
                  width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent', 
                  padding: 12, textAlign: 'center', fontSize: 'clamp(32px, 8vw, 42px)', fontWeight: 800, color: 'var(--text)', outline: 'none'
                }} 
              />
              <ChoiceGrid>
                {[1000000, 2000000, 3000000, 5000000].map(v => (
                  <Choice key={v} active={amount === v} onClick={() => setAmount(v)}>
                    {money(v)}
                  </Choice>
                ))}
              </ChoiceGrid>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2>언제까지 이루고 싶나요?</h2>
              <p>목표의 속도를 잡기 위한 기준이에요.</p>
              {durations.map(item => (
                <Choice key={item} active={duration === item} onClick={() => setDuration(item)}>
                  {item}
                </Choice>
              ))}
              {duration === '기타' && (
                <SegmentDatePicker
                  value={customDuration}
                  onChange={setCustomDuration}
                  disabled={isPending}
                />
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2>여기까지 모아온 것들</h2>
              <p>목표를 향해 쌓은 만큼을 담아주세요.</p>
              <input
                inputMode="numeric"
                value={current ? Number(current).toLocaleString() : ''}
                onChange={event => setCurrent(Number(event.target.value.replace(/\D/g, '')) || 0)}
                placeholder="0"
                css={{
                  display: 'block', width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent',
                  padding: '12px 0', textAlign: 'center', fontSize: 'clamp(32px, 8vw, 42px)', margin: '18px 0 8px', fontWeight: 800, color: 'var(--text)', outline: 'none'
                }}
              />
              <div css={{ textAlign: 'center', color: 'var(--sub)', fontSize: 13, fontWeight: 700 }}>
                목표 {money(amount)}의 {amount > 0 ? Math.min(100, Math.round((current / amount) * 100)) : 0}%를 모았어요
              </div>
              <input type="range" min="0" max={amount || 100000} value={current} onChange={event => setCurrent(Number(event.target.value))} css={{ width: '100%', accentColor: 'var(--ink)', cursor: 'pointer', margin: '20px 0 4px' }} />
              <ChoiceGrid>
                {[0, 0.25, 0.5, 0.75].map(ratio => {
                  const value = Math.round((amount || 0) * ratio);
                  return (
                    <Choice key={ratio} active={current === value} onClick={() => setCurrent(value)}>
                      {ratio === 0 ? '아직 없어요' : `${Math.round(ratio * 100)}%`}
                    </Choice>
                  );
                })}
              </ChoiceGrid>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2>지금 내 곁의 자산</h2>
              <p>목표와 별개로, 지금 가진 자산이에요.</p>
              <input
                inputMode="numeric"
                value={totalAsset ? Number(totalAsset).toLocaleString() : ''}
                onChange={event => setTotalAsset(Number(event.target.value.replace(/\D/g, '')) || 0)}
                placeholder="예) 5,000,000"
                css={{
                  width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent',
                  padding: 12, textAlign: 'center', fontSize: 'clamp(32px, 8vw, 42px)', fontWeight: 800, color: 'var(--text)', outline: 'none'
                }}
              />
              <ChoiceGrid>
                {[1000000, 3000000, 5000000, 10000000].map(v => (
                  <Choice key={v} active={totalAsset === v} onClick={() => setTotalAsset(v)}>
                    {money(v)}
                  </Choice>
                ))}
              </ChoiceGrid>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2>이 정도면 충분해요</h2>
              <p>이제 소비 흐름을 목표에 맞춰 분석해볼게요.</p>
              <GoalLead>
                <span className="k">내 목표</span>
                <span className="v">{effectiveGoal}</span>
              </GoalLead>
              <SummaryList>
                {[
                  ['기간', duration === '기타' ? (customDuration.slice(0, 10) || '설정안함') : duration],
                  ['목표 금액', money(amount)],
                  ['모은 돈', money(current)],
                  ['남은 금액', money(amount - current)],
                  ['현재 자산', money(totalAsset)],
                  ['닉네임', nickname]
                ].map(([k, v]) => (
                  <div key={k} className="row"><span>{k}</span><strong>{v}</strong></div>
                ))}
              </SummaryList>
            </div>
          )}
        </Body>
        <Footer>
          {step > 0 && <button type="button" onClick={() => setStep(prev => prev - 1)} disabled={isPending} css={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--line)' }}>이전</button>}
          <button type="button" onClick={handleNext} disabled={(step === 0 && !isNicknameValid) || (step === 1 && !isGoalValid) || isPending} css={{ background: 'var(--ink)', color: 'var(--on-ink)' }}>
            {isPending ? '처리 중...' : (step >= 6 ? '시작하기' : '다음')}
          </button>
        </Footer>
      </Panel>
    </Page>
  );
}
