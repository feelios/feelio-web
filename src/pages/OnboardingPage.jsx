/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { money } from '../utils/format.js';

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

const Progress = styled.div`
  height: 6px;
  border-radius: 999px;
  background: var(--line);
  overflow: hidden;

  span {
    display: block;
    height: 100%;
    width: ${({ value }) => value}%;
    background: var(--ink);
    border-radius: inherit;
    transition: width .35s ease;
  }
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;

  h2 { margin: 0; font-size: clamp(22px, 6vw, 25px); letter-spacing: -.02em; }
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
  }

  @media (max-width: 560px) {
    margin-top: auto;
    button {
      flex: 1;
      padding: 16px;
    }
  }
`;

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('제주도 여행');
  const [amount, setAmount] = useState(2000000);
  const [duration, setDuration] = useState('1년');
  const [customDuration, setCustomDuration] = useState('');
  const [current, setCurrent] = useState(0);
  
  const goals = ['제주도 여행', '비상금 마련', '이사 준비', '콘서트 비용', '나만의 목표'];
  const durations = ['3개월', '6개월', '1년', '2년', '기타'];

  function next() {
    if (step >= 4) {
      const finalDuration = duration === '기타' ? customDuration : duration;
      onComplete({ name: goal, target: amount, current, duration: finalDuration });
      return;
    }
    setStep(prev => prev + 1);
  }

  return (
    <Page>
      <Panel strong>
        <div>
          <div css={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'var(--sub)', fontSize: 12, fontWeight: 800 }}>
            <span>초기 설정</span><span>{step + 1} / 5</span>
          </div>
          <Progress value={(step + 1) * 20}><span /></Progress>
        </div>
        <Body>
          {step === 0 && (
            <div>
              <h2>어떤 목표를 이루고 싶나요?</h2>
              <p>가장 가까운 목표 하나만 골라주세요.</p>
              {goals.map(item => (
                <Choice key={item} active={goal === item} onClick={() => setGoal(item)}>
                  <strong>{item}</strong>
                </Choice>
              ))}
            </div>
          )}

          {step === 1 && (
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

          {step === 2 && (
            <div>
              <h2>언제까지 이루고 싶나요?</h2>
              <p>목표의 속도를 잡기 위한 기준이에요.</p>
              {durations.map(item => (
                <Choice key={item} active={duration === item} onClick={() => setDuration(item)}>
                  {item}
                </Choice>
              ))}
              {duration === '기타' && (
                <input
                  type="text"
                  placeholder="예) 내년 여름까지, 3년 뒤"
                  value={customDuration}
                  onChange={e => setCustomDuration(e.target.value)}
                  css={{
                    width: '100%',
                    border: '1.5px solid var(--ink)',
                    borderRadius: 12,
                    background: 'transparent',
                    padding: 16,
                    marginTop: 12,
                    fontSize: 15,
                    color: 'var(--text)',
                    outline: 'none',
                    fontWeight: 600
                  }}
                  autoFocus
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2>지금 어느 정도 모았나요?</h2>
              <p>현재 위치를 알려주면 남은 흐름을 계산해요.</p>
              <input 
                inputMode="numeric"
                value={current ? Number(current).toLocaleString() : ''} 
                onChange={event => setCurrent(Number(event.target.value.replace(/\D/g, '')) || 0)} 
                css={{ 
                  display: 'block', width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent', 
                  padding: '12px 0', textAlign: 'center', fontSize: 'clamp(32px, 8vw, 42px)', margin: '18px 0', fontWeight: 800, color: 'var(--text)', outline: 'none'
                }} 
              />
              <input type="range" min="0" max={amount || 100000} value={current} onChange={event => setCurrent(Number(event.target.value))} css={{ width: '100%', accentColor: 'var(--ink)', cursor: 'pointer' }} />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2>이 정도면 충분해요</h2>
              <p>이제 소비 흐름을 목표에 맞춰 분석해볼게요.</p>
              {[
                ['목표', goal], 
                ['기간', duration === '기타' ? (customDuration || '설정안함') : duration],
                ['목표 금액', money(amount)], 
                ['현재 금액', money(current)], 
                ['남은 금액', money(amount - current)]
              ].map(([k, v]) => (
                <div key={k} css={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
                  <span css={{ color: 'var(--sub)' }}>{k}</span>
                  <strong css={{ textAlign: 'right' }}>{v}</strong>
                </div>
              ))}
            </div>
          )}
        </Body>
        <Footer>
          {step > 0 && <button type="button" onClick={() => setStep(prev => prev - 1)} css={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--line)' }}>이전</button>}
          <button type="button" onClick={next} css={{ background: 'var(--ink)', color: 'var(--on-ink)' }}>{step >= 4 ? '시작하기' : '다음'}</button>
        </Footer>
      </Panel>
    </Page>
  );
}
