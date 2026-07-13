/** @jsxImportSource @emotion/react */
import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Modal } from '../common/Modal.jsx';
import { EmotionBlob } from '../common/EmotionBlob.jsx';
import { auroras } from '../../data/aurorasDc.js';
import { money, percent } from '../../utils/format.js';
// 1. 사용자 설정 및 회원 탈퇴 관련 쿼리/뮤테이션 (위쪽 브랜치 변경 사항)
import { useUpdateSettingsMutation, useWithdrawMutation } from '../../hooks/queries/useUsers.js';

// 2. 목표 관리 컴포넌트 및 쿼리/뮤테이션 (main 브랜치 변경 사항)
import GoalForm from './GoalForm.jsx';
import {
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useGoalsQuery,
  useToggleMainGoalMutation,
  useUpdateGoalMutation,
} from '../../hooks/queries/useGoals.js';

const Screen = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  padding: 24px 28px 26px;
`;

const MainScreen = styled(Screen)`
  padding-top: 28px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
`;

const Avatar = styled.span`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg,#FF8A62,#F2C766);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 24px;
  flex-shrink: 0;
`;

const Close = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: var(--line);
  cursor: pointer;
  font-size: 16px;
  color: var(--sub);
`;

const GoalBanner = styled.div`
  background: linear-gradient(105deg,#83C9B026,#76A7E81a);
  border-radius: 18px;
  padding: 16px 18px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MenuRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 12px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
  color: var(--text);
  font-family: inherit;
  text-align: left;

  &:hover {
    background: rgba(255,255,255,.14);
  }

  strong {
    font-size: 14.5px;
    font-weight: 700;
    flex: 1;
  }

  span {
    color: var(--sub);
    font-size: 13px;
  }
`;

const Logout = styled.button`
  width: 100%;
  margin-top: 16px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 13px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: var(--sub);
`;

const BackHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: var(--sub);
  }

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    flex: 1;
  }
`;

const PillButton = styled.button`
  background: var(--ink);
  color: var(--on-ink);
  border: none;
  border-radius: 999px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

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

const GoalCard = styled.div`
  background: var(--card-strong);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
`;

const SmallAction = styled.button`
  flex: 1;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 9px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  color: ${({ danger }) => danger ? '#E87573' : 'var(--text)'};
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid var(--line);
`;

const Switch = styled.button`
  width: 46px;
  height: 27px;
  border: 0;
  border-radius: 99px;
  background: ${({ active }) => active ? 'var(--ink)' : 'var(--line)'};
  position: relative;
  cursor: pointer;

  span {
    position: absolute;
    top: 3px;
    left: ${({ active }) => active ? '22px' : '3px'};
    width: 21px;
    height: 21px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,.2);
    transition: left .2s;
  }
`;

const DataAction = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  color: var(--text);
  font-family: inherit;
  font-weight: 700;

  span:last-of-type {
    font-size: 12.5px;
    color: var(--sub);
  }
`;

function cleanName(name) {
  if (!name || name.length > 8) return '서연';
  if (/[\uFFFD?]/.test(name) || name.includes('\uC496') || name.includes('\uBF30')) return '서연';
  return name;
}

const EMPTY_GOALS = [];

function Back({ title, children }) {
  return (
    <BackHeader>
      {children}
      <h2>{title}</h2>
    </BackHeader>
  );
}

export default function ProfileModalDc({ state, actions, onClose }) {
  const [view, setView] = useState('profile');
  const [nickname, setNickname] = useState(cleanName(state.user.nickname));
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalForm, setGoalForm] = useState({ name: '', target: '', current: '', period: '' });
  const [noti, setNoti] = useState({ record: true, weekly: true, goal: false });
  // 1. 회원 탈퇴 및 설정 변경 관련 (위쪽 기능 유지)
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const updateSettingsMutation = useUpdateSettingsMutation();
  const withdrawMutation = useWithdrawMutation();

  // 2. 목표 데이터 가져오기 및 뮤테이션 (main의 발전된 구조 채택)
  const { data: goalsData, isError: isGoalsError, isLoading: isGoalsLoading } = useGoalsQuery();
  const createGoalMutation = useCreateGoalMutation();
  const updateGoalMutation = useUpdateGoalMutation();
  const deleteGoalMutation = useDeleteGoalMutation();
  const toggleMainGoalMutation = useToggleMainGoalMutation();
  
  const goals = goalsData?.goals ?? EMPTY_GOALS;
  
  // 3. 메인 목표 설정 로직 및 퍼센트 계산
  const goal = useMemo(
    () => goals.find(item => item.isMain) || goals[0] || { name: '제주도 여행', currentAmount: 0, targetAmount: 1 },
    [goals],
  );
  const goalPct = percent(goal.currentAmount, goal.targetAmount);
  const provider = state.user.provider || 'Google';
  const email = state.user.email || 'seoyeon@feelio.app';
  const visibleAurora = auroras.find(item => item.id === state.aurora) || auroras[0];

  const menu = [
    ['profileEdit', '프로필 수정', nickname],
    ['goals', '목표 관리', `${goals.length}개`],
    ['noti', '알림 설정', ''],
    ['aurora', '화면 · 오로라', visibleAurora.name],
    ['data', '데이터 관리', ''],
    ['account', '계정 관리', '']
  ];

  const isGoalMutationPending = createGoalMutation.isPending
    || updateGoalMutation.isPending
    || deleteGoalMutation.isPending
    || toggleMainGoalMutation.isPending;

  const toGoalPayload = (form, isMain) => ({
    name: form.name.trim(),
    targetAmount: Number(form.target),
    currentAmount: Number(form.current) || 0,
    dueDate: form.period || undefined,
    isMain,
  });

  async function saveGoal() {
    if (!goalForm.name.trim() || Number(goalForm.target) <= 0) return;

    try {
      if (editingGoalId === null) {
        await createGoalMutation.mutateAsync(toGoalPayload(goalForm, goals.length === 0));
      } else {
        const editingGoal = goals.find(item => item.goalId === editingGoalId);
        await updateGoalMutation.mutateAsync({
          goalId: editingGoalId,
          data: toGoalPayload(goalForm, editingGoal?.isMain ?? false),
        });
      }
      actions.showToast(editingGoalId === null ? '목표가 추가되었어요' : '목표가 수정되었어요');
      setView('goals');
    } catch {
      actions.showToast('목표 저장에 실패했어요. 다시 시도해 주세요.');
    }
  }

  async function toggleMainGoal(item) {
    if (item.isMain) return;

    try {
      await toggleMainGoalMutation.mutateAsync({
        goalId: item.goalId,
        data: {
          name: item.name,
          targetAmount: item.targetAmount,
          currentAmount: item.currentAmount,
          startDate: item.startDate,
          dueDate: item.dueDate,
          isMain: true,
        },
      });
      actions.showToast('대표 목표로 변경되었어요');
    } catch {
      actions.showToast('대표 목표 설정에 실패했어요. 다시 시도해 주세요.');
    }
  }

  async function deleteGoal(goalId) {
    if (goals.length <= 1) {
      actions.showToast('최소 하나의 목표는 남겨두어야 합니다.');
      return;
    }

    try {
      await deleteGoalMutation.mutateAsync(goalId);
      actions.showToast('목표가 삭제되었어요');
    } catch {
      actions.showToast('목표 삭제에 실패했어요. 다시 시도해 주세요.');
    }
  }

  function saveProfile() {
    actions.updateUser({ nickname });
    setView('profile');
  }

  function saveAndBack() {
    setView('profile');
  }

  async function handleThemeToggle() {
    const nextMode = state.mode === 'dark' ? 'light' : 'dark';
    actions.syncSettings({ mode: nextMode, aurora: state.aurora });

    try {
      const updated = await updateSettingsMutation.mutateAsync({
        themeMode: nextMode.toUpperCase(),
        auroraTheme: state.aurora
      });
      actions.syncSettings({
        mode: updated?.themeMode || nextMode,
        aurora: updated?.auroraTheme || state.aurora
      });
    } catch (error) {
      console.error('Failed to update theme settings', error);
    }
  }

  async function handleAuroraSelect(auroraId) {
    actions.syncSettings({ mode: state.mode, aurora: auroraId });

    try {
      const updated = await updateSettingsMutation.mutateAsync({
        themeMode: state.mode.toUpperCase(),
        auroraTheme: auroraId
      });
      actions.syncSettings({
        mode: updated?.themeMode || state.mode,
        aurora: updated?.auroraTheme || auroraId
      });
    } catch (error) {
      console.error('Failed to update aurora settings', error);
    }
  }

  async function handleWithdraw() {
    if (!window.confirm('정말로 탈퇴하시겠어요? 모든 데이터가 사라집니다.')) return;
    if (isWithdrawing) return;

    setIsWithdrawing(true);
    try {
      await withdrawMutation.mutateAsync({ reason: '사용 빈도 낮음' });
      actions.clearAccount();
      onClose();
    } catch (error) {
      console.error('Failed to withdraw account', error);
      actions.showToast('탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsWithdrawing(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      width="min(460px, calc(100vw - 40px))"
      maxHeight="min(720px, calc(100dvh - 40px))"
      overflow="auto"
    >
      {view === 'profile' && (
        <MainScreen>
          <Header>
            <Avatar>{nickname.slice(0, 1)}</Avatar>
            <div css={{ flex: 1 }}>
              <div css={{ fontSize: 19, fontWeight: 700 }}>{nickname}</div>
              <div css={{ fontSize: 13, color: 'var(--sub)' }}>{email} · {provider} 계정</div>
            </div>
            <Close type="button" onClick={onClose}>×</Close>
          </Header>

          <GoalBanner>
            <div>
              <div css={{ fontSize: 12, color: 'var(--sub)', fontWeight: 700 }}>대표 목표</div>
              <div css={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{goal.name} · {goalPct}%</div>
            </div>
            <div css={{ width: 44, height: 44 }}>
              <EmotionBlob emotion="뿌듯함" size={44} interactive={false} />
            </div>
          </GoalBanner>

          <MenuList>
            {menu.map(([key, label, hint]) => (
              <MenuRow key={key} type="button" onClick={() => setView(key)}>
                <strong>{label}</strong>
                <span>{hint}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sub)" strokeWidth="2"><path d="m9 6 6 6-6 6" /></svg>
              </MenuRow>
            ))}
          </MenuList>
          <Logout type="button" onClick={actions.logout}>로그아웃</Logout>
        </MainScreen>
      )}

      {view === 'profileEdit' && (
        <Screen>
          <Back title="프로필 수정"><button type="button" onClick={() => setView('profile')}>‹</button></Back>
          <div css={{ textAlign: 'center', marginBottom: 20 }}>
            <div css={{ width: 96, height: 96, margin: '0 auto' }}><EmotionBlob emotion="설렘" size={96} interactive={false} /></div>
            <div css={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 6 }}>말랑이를 눌러 대표 감정을 바꿔보세요</div>
          </div>
          <FieldLabel>닉네임</FieldLabel>
          <Field value={nickname} onChange={event => setNickname(event.target.value)} />
          <FieldLabel>이메일</FieldLabel>
          <Field value={email} disabled />
          <PrimaryButton type="button" onClick={saveProfile}>저장</PrimaryButton>
        </Screen>
      )}

      {view === 'goals' && (
        <Screen>
          <Back title="목표 관리">
            <button type="button" onClick={() => setView('profile')}>‹</button>
            <PillButton type="button" onClick={() => {
              setGoalForm({ name: '', target: '', current: '', period: '' });
              setEditingGoalId(null);
              setView('goalEdit');
            }}>+ 추가</PillButton>
          </Back>
          <div css={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isGoalsLoading && <GoalCard>목표를 불러오는 중이에요.</GoalCard>}
            {isGoalsError && <GoalCard>목표를 불러오지 못했어요. 다시 시도해 주세요.</GoalCard>}
            {!isGoalsLoading && !isGoalsError && goals.map(item => {
              const pct = percent(item.currentAmount, item.targetAmount);
              return (
                <GoalCard 
                  key={item.goalId}
                  onClick={() => toggleMainGoal(item)}
                  css={{ cursor: item.isMain || isGoalMutationPending ? 'default' : 'pointer', transition: 'background 0.2s', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}
                >
                  <div css={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span css={{ fontSize: 15, fontWeight: 700 }}>{item.name}</span>
                    {item.isMain && <span css={{ fontSize: 10.5, fontWeight: 700, color: '#3E9578', background: '#83C9B033', padding: '2px 8px', borderRadius: 99 }}>대표</span>}
                  </div>
                  <div css={{ height: 8, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                    <div css={{ width: `${Math.min(100, pct)}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#FF9F6E,#F28AB7)' }} />
                  </div>
                  <div css={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--sub)', marginTop: 7 }}>
                    <span>{money(item.currentAmount)} / {money(item.targetAmount)}</span>
                    <span>{pct}%</span>
                  </div>
                  {item.dueDate && <div css={{ fontSize: 12, color: 'var(--sub)', marginTop: 6, fontWeight: 700 }}>마감 날짜: {item.dueDate}</div>}
                  <div css={{ display: 'flex', gap: 8, marginTop: 12 }} onClick={e => e.stopPropagation()}>
                    <SmallAction type="button" onClick={() => {
                      setGoalForm({ name: item.name, target: item.targetAmount, current: item.currentAmount, period: item.dueDate || '' });
                      setEditingGoalId(item.goalId);
                      setView('goalEdit');
                    }}>수정</SmallAction>
                    <SmallAction type="button" danger disabled={isGoalMutationPending} onClick={() => deleteGoal(item.goalId)}>삭제</SmallAction>
                  </div>
                </GoalCard>
              );
            })}
          </div>
        </Screen>
      )}

      {view === 'goalEdit' && (
        <Screen>
          <Back title={editingGoalId === null ? "새 목표 추가" : "목표 수정"}>
            <button type="button" onClick={() => setView('goals')}>‹</button>
          </Back>
          <GoalForm
            goalForm={goalForm}
            setGoalForm={setGoalForm}
            onSubmit={saveGoal}
            disabled={isGoalMutationPending}
          />
        </Screen>
      )}

      {view === 'noti' && (
        <Screen>
          <Back title="알림 설정"><button type="button" onClick={() => setView('profile')}>‹</button></Back>
          {[
            ['record', '기록 리마인더', '하루 끝에 소비 감정을 남기도록 알려줘요'],
            ['weekly', '주간 리포트', '매주 감정 소비 흐름을 요약해요'],
            ['goal', '목표 근접 알림', '목표가 가까워지면 부드럽게 알려줘요']
          ].map(([key, name, desc]) => (
            <ToggleRow key={key}>
              <div><div css={{ fontSize: 14.5, fontWeight: 700 }}>{name}</div><div css={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{desc}</div></div>
              <Switch type="button" active={noti[key]} onClick={() => setNoti(prev => ({ ...prev, [key]: !prev[key] }))}><span /></Switch>
            </ToggleRow>
          ))}
          <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0' }}>
            <div css={{ fontSize: 14.5, fontWeight: 700 }}>알림 시간</div>
            <input type="time" defaultValue="21:00" css={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '8px 12px', fontSize: 14, color: 'var(--text)', outline: 'none' }} />
          </div>
        </Screen>
      )}

      {view === 'aurora' && (
        <Screen>
          <Back title="화면 설정"><button type="button" onClick={() => setView('profile')}>‹</button></Back>
          <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 18px', borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
            <div><div css={{ fontSize: 14.5, fontWeight: 700 }}>다크 모드</div><div css={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>어두운 무광 글래스로 전환해요</div></div>
            <Switch type="button" active={state.mode === 'dark'} onClick={handleThemeToggle}><span /></Switch>
          </div>
          <div css={{ fontSize: 12.5, color: 'var(--sub)', marginBottom: 14 }}>오로라 색상 · 배경에 흐르게 할 감정의 오로라</div>
          <div css={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {auroras.map(item => (
              <button key={item.id} type="button" onClick={() => handleAuroraSelect(item.id)} css={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 15px', borderRadius: 16, border: (state.aurora === item.id || visibleAurora.id === item.id) ? '2px solid var(--ink)' : '2px solid var(--line)', background: 'var(--card)', color: 'var(--text)', cursor: 'pointer' }}>
                <span css={{ display: 'flex', alignItems: 'center' }}>{item.colors.map((color, index) => <i key={color} css={{ width: 20, height: 20, borderRadius: '50%', background: color, marginLeft: index === 0 ? 0 : -7 }} />)}</span>
                <span css={{ flex: 1, textAlign: 'right', fontSize: 14, fontWeight: 700 }}>{item.name}</span>
              </button>
            ))}
          </div>
        </Screen>
      )}

      {view === 'data' && (
        <Screen>
          <Back title="데이터 관리"><button type="button" onClick={() => setView('profile')}>‹</button></Back>
          <DataAction type="button" onClick={saveAndBack}><span>데이터 백업</span><span>클라우드에 저장</span></DataAction>
          <DataAction type="button" onClick={saveAndBack}><span>데이터 내보내기</span><span>CSV · Excel</span></DataAction>
        </Screen>
      )}

      {view === 'account' && (
        <Screen>
          <Back title="계정 관리"><button type="button" onClick={() => setView('profile')}>‹</button></Back>
          <div css={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '16px 18px', marginBottom: 10 }}><div css={{ fontSize: 12, color: 'var(--sub)', fontWeight: 700 }}>이메일</div><div css={{ fontSize: 14.5, fontWeight: 700, marginTop: 3 }}>{email}</div></div>
          <div css={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '16px 18px', marginBottom: 22 }}><div css={{ fontSize: 12, color: 'var(--sub)', fontWeight: 700 }}>가입 방식</div><div css={{ fontSize: 14.5, fontWeight: 700, marginTop: 3 }}>{provider} OAuth2</div></div>
          <button type="button" onClick={actions.logout} css={{ width: '100%', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 14, fontSize: 14.5, fontWeight: 700, cursor: 'pointer', color: 'var(--text)', marginBottom: 10 }}>로그아웃</button>
          <button type="button" onClick={handleWithdraw} disabled={isWithdrawing} css={{ width: '100%', background: 'none', border: 'none', padding: 12, fontSize: 13.5, fontWeight: 700, cursor: isWithdrawing ? 'wait' : 'pointer', color: '#E87573', textDecoration: 'underline', textUnderlineOffset: 3, opacity: isWithdrawing ? 0.7 : 1 }}>회원탈퇴</button>
        </Screen>
      )}
    </Modal>
  );
}
