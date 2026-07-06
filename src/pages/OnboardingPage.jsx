/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import styled from '@emotion/styled';
import { GlassCard } from '../components/common/GlassCard.jsx';
import { money } from '../utils/format.js';

const Page = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 36px 20px;
`;

const Panel = styled(GlassCard)`
  width: min(560px, 100%);
  min-height: min(576px, 90vh);
  display: flex;
  flex-direction: column;
  padding: 34px 38px 30px;
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
  display: grid;
  align-content: center;
  gap: 18px;

  h2 { margin: 0; font-size: 25px; letter-spacing: -.02em; }
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
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  button {
    border: 0;
    border-radius: 14px;
    padding: 13px 28px;
    font-weight: 800;
    cursor: pointer;
  }
`;

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('제주도 여행');
  const [amount, setAmount] = useState(2000000);
  const [current, setCurrent] = useState(0);
  const goals = ['제주도 여행', '비상금 마련', '이사 준비', '콘서트 비용', '나만의 목표'];

  function next() {
    if (step >= 4) {
      onComplete({ name: goal, target: amount, current });
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
          {step === 0 && <div><h2>어떤 목표를 이루고 싶나요?</h2><p>가장 가까운 목표 하나만 골라주세요.</p>{goals.map(item => <Choice key={item} active={goal === item} onClick={() => setGoal(item)}><strong>{item}</strong></Choice>)}</div>}
          {step === 1 && <div><h2>얼마를 모으고 싶나요?</h2><p>대략적인 금액이어도 충분해요.</p><input value={amount} onChange={event => setAmount(Number(event.target.value) || 0)} css={{ width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent', padding: 12, textAlign: 'center', fontSize: 42, fontWeight: 800 }} /><div css={{ display: 'flex', gap: 10, marginTop: 16 }}>{[1000000, 2000000, 3000000, 5000000].map(v => <Choice key={v} active={amount === v} onClick={() => setAmount(v)}>{money(v)}</Choice>)}</div></div>}
          {step === 2 && <div><h2>언제까지 이루고 싶나요?</h2><p>목표의 속도를 잡기 위한 기준이에요.</p>{['3개월', '6개월', '1년', '2년'].map(item => <Choice key={item}>{item}</Choice>)}</div>}
          {step === 3 && <div><h2>지금 어느 정도 모았나요?</h2><p>현재 위치를 알려주면 남은 흐름을 계산해요.</p><strong css={{ display: 'block', textAlign: 'center', fontSize: 42, margin: '18px 0' }}>{money(current)}</strong><input type="range" min="0" max={amount} value={current} onChange={event => setCurrent(Number(event.target.value))} css={{ width: '100%', accentColor: 'var(--ink)' }} /></div>}
          {step === 4 && <div><h2>이 정도면 충분해요</h2><p>이제 소비 흐름을 목표에 맞춰 분석해볼게요.</p>{[['목표', goal], ['목표 금액', money(amount)], ['현재 금액', money(current)], ['남은 금액', money(amount - current)]].map(([k, v]) => <div key={k} css={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--line)' }}><span css={{ color: 'var(--sub)' }}>{k}</span><strong>{v}</strong></div>)}</div>}
        </Body>
        <Footer>
          {step > 0 && <button type="button" onClick={() => setStep(prev => prev - 1)} css={{ background: 'var(--card)', color: 'var(--text)' }}>이전</button>}
          <button type="button" onClick={next} css={{ background: 'var(--ink)', color: 'var(--on-ink)' }}>{step >= 4 ? '시작하기' : '다음'}</button>
        </Footer>
      </Panel>
    </Page>
  );
}
