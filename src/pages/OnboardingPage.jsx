/** @jsxImportSource @emotion/react */
import { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { GlassCard } from '../components/common/GlassCard.jsx';
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

/*
 * 높이는 min-height 가 아니라 height 로 못박는다.
 *
 * min-height 는 말 그대로 하한이라, 목록이 긴 단계(목표 5개·요약 6줄)에서는 패널이
 * 그만큼 늘어났다. 단계를 넘길 때마다 카드가 커졌다 작아졌다 하고 '다음' 버튼 위치까지 움직였다.
 *
 * 값은 가장 긴 단계(7단계 요약: 목표 헤드 + 6줄)가 잘리지 않는 높이로 잡는다.
 * 예전 576px 은 그보다 낮아서, 고정하면 긴 단계가 스크롤에 갇혔다.
 * 화면이 그보다 낮으면 92dvh 가 이기고, 그때만 Body 가 안에서 스크롤한다.
 */
const Panel = styled(GlassCard)`
  width: min(560px, 100%);
  height: min(680px, 92dvh);
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 5vw, 34px) clamp(20px, 6vw, 38px) clamp(24px, 5vw, 30px);

  @media (max-width: 560px) {
    height: 100dvh;
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
  /* 막대와 본문 사이를 벌린다. 붙어 있으면 마지막 단계(7/7, 채움 100%)에서
     막대가 제목 위에 그은 줄처럼 보여, 아래 구분선과 함께 줄이 두 개로 읽혔다. */
  margin-bottom: 18px;
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

/* 'STEP 1 / 7' 글자만으로는 얼마나 남았는지가 안 잡힌다. 큰 숫자 아래에 막대를 두고
   카운트는 그 옆에 작게 붙인다. */
const Progress = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 12px;

  .track {
    flex: 1;
    height: 5px;
    border-radius: 999px;
    background: var(--line);
    overflow: hidden;
  }

  .fill {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: var(--ink);
    /* 100% 로 채워졌을 때 진한 실선이 되면 구분선처럼 보인다. 톤을 낮춰 둔다. */
    opacity: .5;
    transition: width .35s cubic-bezier(.4, 0, .2, 1);
  }

  .count {
    flex-shrink: 0;
    font-size: 11.5px;
    font-weight: 900;
    letter-spacing: .06em;
    color: var(--sub);
    font-variant-numeric: tabular-nums;
  }
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

/*
 * 선택 표시는 그림자가 아니라 유리 자체로 한다.
 *
 * 바깥 그림자를 쓰면 유리판이 아니라 종이 카드가 떠 있는 것처럼 보였다.
 * 여기서는 셋 다 투명한 유리로 두고, 선택된 칸만 '두꺼운 유리'가 된다 —
 * 흰 막이 진해지고, 윗변 하이라이트가 밝아지고, 블러가 세져 뒤가 더 뭉개진다.
 * 안쪽 광택(inset)만 쓰므로 판 밖으로 그림자가 새지 않는다.
 */
/*
 * 프로필 모달의 glassGhost 와 같은 재질을 쓴다 — 흰 막 그라디언트 + 윗변 하이라이트 + 블러.
 * 값을 임의로 다시 정하지 않고 그 화면과 맞춰야 앱 전체가 같은 유리로 읽힌다.
 *
 * 선택된 칸은 같은 재질을 '두껍게' 받는다(흰 막 .20→.34, 하이라이트 .3→.55).
 * 다만 라이트모드는 판 자체가 밝아 흰 막만으로는 구분이 뭉개지므로, ink 링을 얇게 얹어
 * 무엇이 골라졌는지 확실히 한다 — 테두리 색을 바꾸는 것과 달리 링은 유리감을 깨지 않는다.
 */
const Choice = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  background: ${({ active }) => active
    ? 'linear-gradient(135deg, rgba(255,255,255,.74), rgba(255,255,255,.36))'
    : 'linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.03))'};
  /* 선택 신호는 '유리의 두께' 하나로만 낸다 — 테두리도 링도 쓰지 않는다.
     고른 칸은 두껍게 언 유리처럼 뿌옇고 윗변이 환하게 빛나고,
     나머지는 거의 비어 있는 얇은 유리로 남는다. 그 차이가 곧 선택 표시다.
     바깥으로 나가는 그림자도 쓰지 않는다 — Body 가 스크롤 컨테이너라 좌우가 잘린다. */
  box-shadow: ${({ active }) => active
    ? 'inset 0 1px 0 rgba(255,255,255,.95), inset 0 -10px 22px rgba(255,255,255,.28), inset 0 -1px 0 rgba(40,32,24,.07)'
    : 'inset 0 1px 0 rgba(255,255,255,.26)'};
  backdrop-filter: blur(14px) saturate(1.3);
  -webkit-backdrop-filter: blur(14px) saturate(1.3);
  padding: 13px;
  margin-top: 8px;
  text-align: left;
  cursor: pointer;
  color: ${({ active }) => active ? 'var(--text)' : 'var(--sub)'};
  font-weight: ${({ active }) => active ? 800 : 500};
  transition: background .18s ease, box-shadow .18s ease, color .18s ease;

  /* 호버는 선택보다 약하게. 반대면 마우스를 올렸을 때만 반응하는 것처럼 보인다. */
  &:hover {
    background: ${({ active }) => active
      ? 'linear-gradient(135deg, rgba(255,255,255,.78), rgba(255,255,255,.4))'
      : 'linear-gradient(135deg, rgba(255,255,255,.26), rgba(255,255,255,.08))'};
  }
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
    transition: filter .18s ease, box-shadow .18s ease, transform .14s ease;
  }

  /* 두 버튼의 배경이 서로 달라서(ink / card) 색을 따로 지정하는 대신 밝기로 반응시킨다.
     어느 쪽이든 '한 단계 밝아진다'로 읽히고, 나중에 색이 바뀌어도 따라간다.
     비활성 상태에도 그대로 건다 — 버튼이 거기 있다는 건 알려주고,
     못 누른다는 건 커서(not-allowed)가 말한다. */
  button:hover {
    filter: brightness(1.08);
    box-shadow: 0 8px 18px -10px rgba(40, 32, 24, .45);
  }

  button:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: none;
  }

  button:disabled {
    opacity: .45;
    cursor: not-allowed;
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

  // 제출 잠금. isPending 은 렌더를 거쳐야 반영돼서, 제출이 끝났는데 화면이 아직
  // 안 넘어간 사이에 다시 눌리면 목표가 또 만들어진다. ref 는 즉시 걸린다.
  const submittingRef = useRef(false);

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

  /**
   * 입력칸에서 엔터를 치면 '다음'을 누른 것과 같게 한다.
   * 값을 다 적고도 마우스로 버튼을 찾아가야 해서 흐름이 끊겼다.
   * handleNext 가 이미 단계별 유효성(닉네임·목표)을 스스로 검사하므로 여기선 조합 중인
   * 한글만 걸러낸다 — IME 조합 확정용 엔터에 단계가 넘어가면 글자가 잘린다.
   */
  const handleEnterKey = (event) => {
    if (event.key !== 'Enter' || event.nativeEvent?.isComposing) return;
    event.preventDefault();
    handleNext();
  };

  const getDueDate = () => {
    if (duration === '기타') return customDuration.slice(0, 10);
    return addMonthsFromToday(durationMonths[duration]);
  };

  const handleNext = async () => {
    if (step === 0 && !isNicknameValid) return;
    if (step === 1 && !isGoalValid) return;

    if (step >= 6) {
      if (submittingRef.current) return;

      const dueDate = getDueDate();
      if (!dueDate || dueDate < formatLocalDate(new Date())) {
        alert('마감 날짜는 오늘 이후로 설정해 주세요.');
        return;
      }

      submittingRef.current = true;
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
        // 실패했을 때만 잠금을 푼다. 성공 뒤엔 화면이 넘어갈 때까지 잠근 채로 둔다.
        submittingRef.current = false;
        console.error('[onboarding] submit failed:', err);
        alert('온보딩 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
      return;
    }
    setStep(prev => prev + 1);
  };

  const isPending = updateMeMutation.isPending || createGoalMutation.isPending || completeOnboardingMutation.isPending;
  const progressPercent = ((step + 1) / 7) * 100;
  // 슬라이더 채움과 그 아래 '몇 %를 모았어요' 문구가 같은 값을 써야 서로 어긋나지 않는다.
  const currentPercent = amount > 0 ? Math.min(100, Math.round((current / amount) * 100)) : 0;

  return (
    <Page>
      <Panel strong>
        <Header>
          <div css={{ flex: 1, minWidth: 0 }}>
            <BigNum>{String(step + 1).padStart(2, '0')}</BigNum>
            <Progress>
              <span className="track">
                <span className="fill" style={{ width: `${progressPercent}%` }} />
              </span>
              <span className="count">{step + 1} / 7</span>
            </Progress>
          </div>
        </Header>
        <Body>
          {step === 0 && (
            <div>
              <h2>반갑습니다!<br />사용하실 닉네임을 알려주세요.</h2>
              <p>1자에서 8자 사이로 입력해 주세요.</p>
              <input 
                type="text"
                value={nickname} 
                onChange={event => setNickname(event.target.value)} 
                onKeyDown={handleEnterKey}
                placeholder="예) 서연"
                maxLength={8}
                css={{ 
                  width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent',
                  padding: 12, textAlign: 'center', fontSize: 'clamp(32px, 8vw, 42px)', fontWeight: 800, color: 'var(--text)', outline: 'none',
                  transition: 'border-color .18s ease',
                  '&:hover': { borderBottomColor: 'var(--sub)' },
                  '&:focus': { borderBottomColor: 'var(--ink)' }
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
                        onKeyDown={handleEnterKey}
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
                onKeyDown={handleEnterKey}
                value={amount ? Number(amount).toLocaleString() : ''} 
                onChange={event => setAmount(Number(event.target.value.replace(/\D/g, '')) || 0)} 
                css={{ 
                  width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent',
                  padding: 12, textAlign: 'center', fontSize: 'clamp(32px, 8vw, 42px)', fontWeight: 800, color: 'var(--text)', outline: 'none',
                  transition: 'border-color .18s ease',
                  '&:hover': { borderBottomColor: 'var(--sub)' },
                  '&:focus': { borderBottomColor: 'var(--ink)' }
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
                onKeyDown={handleEnterKey}
                value={current ? Number(current).toLocaleString() : ''}
                onChange={event => setCurrent(Number(event.target.value.replace(/\D/g, '')) || 0)}
                placeholder="0"
                css={{
                  display: 'block', width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent',
                  padding: '12px 0', textAlign: 'center', fontSize: 'clamp(32px, 8vw, 42px)', margin: '18px 0 8px', fontWeight: 800, color: 'var(--text)', outline: 'none',
                  transition: 'border-color .18s ease',
                  '&:hover': { borderBottomColor: 'var(--sub)' },
                  '&:focus': { borderBottomColor: 'var(--ink)' }
                }}
              />
              <div css={{ textAlign: 'center', color: 'var(--sub)', fontSize: 13, fontWeight: 700 }}>
                목표 {money(amount)}의 {currentPercent}%를 모았어요
              </div>
              {/*
                accentColor 만 주면 브라우저 기본 슬라이더 모양이 그대로 나온다 —
                두꺼운 막대에 납작한 손잡이라 이 화면의 유리 결과 따로 놀았다.
                트랙은 진행 막대와 같은 6px 알약으로 맞추고(채움은 그라디언트로 그린다),
                손잡이는 유리 구슬로 만든다. -webkit- 과 -moz- 가 의사요소를 따로 쓰므로
                같은 값을 양쪽에 적어야 크롬·파이어폭스가 같이 보인다.
              */}
              <input
                type="range"
                min="0"
                max={amount || 100000}
                value={current}
                onChange={event => setCurrent(Number(event.target.value))}
                css={{
                  width: '100%',
                  height: 22,
                  margin: '20px 0 4px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  outline: 'none',

                  '&::-webkit-slider-runnable-track': {
                    height: 6,
                    borderRadius: 999,
                    background: `linear-gradient(to right, var(--ink) ${currentPercent}%, var(--line) ${currentPercent}%)`
                  },
                  '&::-webkit-slider-thumb': {
                    WebkitAppearance: 'none',
                    width: 20,
                    height: 20,
                    marginTop: -7,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--ink) 82%, white), var(--ink))',
                    border: '2px solid rgba(255,255,255,.9)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 2px 8px -1px rgba(40,32,24,.40)',
                    transition: 'transform .14s ease, box-shadow .18s ease'
                  },
                  '&:hover::-webkit-slider-thumb': {
                    transform: 'scale(1.14)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 4px 13px -2px rgba(40,32,24,.5)'
                  },
                  '&:active::-webkit-slider-thumb': { transform: 'scale(1.04)' },

                  '&::-moz-range-track': { height: 6, borderRadius: 999, background: 'var(--line)' },
                  '&::-moz-range-progress': { height: 6, borderRadius: 999, background: 'var(--ink)' },
                  '&::-moz-range-thumb': {
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--ink) 82%, white), var(--ink))',
                    border: '2px solid rgba(255,255,255,.9)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 2px 8px -1px rgba(40,32,24,.40)',
                    transition: 'transform .14s ease'
                  },
                  '&:hover::-moz-range-thumb': { transform: 'scale(1.14)' }
                }}
              />
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
                onKeyDown={handleEnterKey}
                value={totalAsset ? Number(totalAsset).toLocaleString() : ''}
                onChange={event => setTotalAsset(Number(event.target.value.replace(/\D/g, '')) || 0)}
                placeholder="예) 5,000,000"
                css={{
                  width: '100%', border: 0, borderBottom: '2px solid var(--line)', background: 'transparent',
                  padding: 12, textAlign: 'center', fontSize: 'clamp(32px, 8vw, 42px)', fontWeight: 800, color: 'var(--text)', outline: 'none',
                  transition: 'border-color .18s ease',
                  '&:hover': { borderBottomColor: 'var(--sub)' },
                  '&:focus': { borderBottomColor: 'var(--ink)' }
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
