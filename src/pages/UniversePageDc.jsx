/** @jsxImportSource @emotion/react */
import { useState, useEffect, useRef, useMemo } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import UniversePlanet from '../components/UniversePlanet';
import SpaceBlob from '../components/SpaceBlob';
import UniverseConsole from '../components/UniverseConsole';
import UniverseEasterEgg from '../components/UniverseEasterEgg';

import { useGoalsQuery } from '../hooks/queries/useGoals';
import { useUniverseQuery } from '../hooks/queries/useUniverse';

const globalStyles = css`
  html, body {
    overflow: hidden !important;
  }
  @keyframes pu-twinkle{0%,100%{opacity:.2}50%{opacity:1}}
  @keyframes pu-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes pu-glow{0%,100%{opacity:.6}50%{opacity:1}}
  @keyframes pu-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes pu-resultin{from{opacity:0;transform:translate(-50%,-46%) scale(.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
  @keyframes pu-pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
  @keyframes pu-blink{0%,100%{opacity:.35}50%{opacity:1}}
  @keyframes pu-arrive{from{opacity:0}to{opacity:1}}
  @keyframes pu-recoil{0%{transform:translate(0,0) scale(1)}20%{transform:translate(-16px,11px) scale(1.02,.985)}100%{transform:translate(0,0) scale(1)}}
  @keyframes pu-fly-a{0%{transform:translate(580px,600px) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(330px,196px) scale(.32) rotate(-10deg);opacity:1}}
  @keyframes pu-fly-a-m{0%{transform:translate(50vw,85vh) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(22vw,40vh) scale(.32) rotate(-10deg);opacity:1}}
  @keyframes pu-fly-b{0%{transform:translate(580px,600px) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(830px,196px) scale(.32) rotate(10deg);opacity:1}}
  @keyframes pu-fly-b-m{0%{transform:translate(50vw,85vh) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(78vw,40vh) scale(.32) rotate(10deg);opacity:1}}
  /* 종점은 목적지 행성 좌표에 앵커링하고(아래 wrapper 의 left/top), 키프레임은 거기까지의
     오프셋만 그린다. 예전에는 끝점을 translate(948px,344px) / translate(80vw,15vh) 로 따로
     적어 뒀는데, 모바일은 컨테이너가 뷰포트보다 작아(하단 내비) vw·vh 가 컨테이너 % 와
     다른 지점을 가리켰다. 그래서 배가 행성 옆을 스쳐 갔다. */
  @keyframes pu-depart{0%{transform:translate(-618px,86px) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(0,0) scale(.22) rotate(16deg);opacity:1}}
  @keyframes pu-depart-m{0%{transform:translate(-55vw,55vh) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(0,0) scale(.22) rotate(16deg);opacity:1}}
  @keyframes pu-scan{0%{transform:scale(.4);opacity:.85}100%{transform:scale(3.2);opacity:0}}
  @keyframes pu-hover{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  @keyframes pu-selglow{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}
  @keyframes pu-welldraw{0%{opacity:0}100%{opacity:1}}
  @keyframes pu-eqfloat{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-6px);opacity:.85}}
  @keyframes pu-unfold {
    0% { transform: scaleY(0.005) scaleX(0); opacity: 0; }
    30% { transform: scaleY(0.005) scaleX(1); opacity: 1; }
    100% { transform: scaleY(1) scaleX(1); opacity: 1; }
  }
  @keyframes pu-flicker {
    0%, 10%, 20%, 30%, 100% { filter: brightness(1); }
    5%, 15%, 25% { filter: brightness(1.3) contrast(1.2); }
  }
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 1420px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PageWrapper = styled.div`
  position: relative;
  width: 1160px;
  height: 660px;
  border-radius: 28px;
  overflow: hidden;
  background: radial-gradient(135% 100% at 50% -10%,#23263e 0%,#14161f 44%,#0a0c14 100%);
  box-shadow: none;
  font-family: system-ui, -apple-system, sans-serif;
  animation: pu-unfold 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, pu-flicker 1.2s ease-out forwards;
`;

export default function UniversePageDc() {
  const { data: goalsData } = useGoalsQuery();
  const goalsList = goalsData?.goals || [];
  const mainGoal = goalsList.find(g => g.isMain) || goalsList[0] || null;

  // 하단 목표 리스트에서 고른 목표로 시뮬레이션 전환 (미선택 시 대표 목표)
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const activeGoalId = selectedGoalId ?? mainGoal?.goalId ?? null;

  const { data: universeData, isLoading: isUniverseLoading } = useUniverseQuery(activeGoalId);

  const U_DATA = useMemo(() => {
    if (!universeData) return null;
    
    const goal = universeData.goal;
    // 기준이 감정에서 카테고리로 바뀌었다(계약 §9 topCategory).
    // 감정은 왜 그게 뽑혔는지도, 무엇을 줄여야 하는지도 화면에서 설명되지 않았다.
    const topCategory = universeData.topCategory;
    const current = universeData.scenarios.find(s => s.key === 'CURRENT');
    const reduced = universeData.scenarios.find(s => s.key === 'REDUCED');

    const formatMoney = (val) => val.toLocaleString() + "원";

    /**
     * 개월은 올림이라 두 우주가 같은 값으로 뭉개진다 — 1.24개월과 1.18개월이 둘 다 "2개월"이다.
     * 그러면 두 칸이 똑같아 보여서 평행우주를 볼 이유가 사라진다.
     * 개월이 같은데 일수가 다르면 일수로 바꿔 차이를 드러낸다.
     * (한 달 안쪽은 원래부터 일수로 보여준다 — 그 규칙을 여기로 합쳤다.)
     */
    const monthsTie = current.monthsToGoal != null && reduced.monthsToGoal != null
      && current.monthsToGoal === reduced.monthsToGoal
      && current.daysToGoal !== reduced.daysToGoal;
    const showDays = (s) => s.daysToGoal > 0 && (s.monthsToGoal <= 1 || monthsTie);
    const durationOf = (s) => {
      if (s.monthsToGoal == null) return "도달 불가";
      return showDays(s) ? `${s.daysToGoal}일 예상` : `${s.monthsToGoal}개월 예상`;
    };

    const currentNote = `${goal.name} · ${durationOf(current)}`;

    const savedAmount = reduced.monthlySaving - current.monthlySaving;
    const monthsSaved = (current.monthsToGoal ?? 0) - (reduced.monthsToGoal ?? 0);
    const daysSaved = (current.daysToGoal ?? 0) - (reduced.daysToGoal ?? 0);

    // 얼마나 빨라지는지가 이 칸의 요점이다. 개월로 드러나면 개월, 한 달 안쪽이면 일,
    // 그래도 같으면(반올림으로 하루도 안 줄면) 매달 더 남는 금액으로 말한다.
    let reducedNote = `${goal.name} · `;
    if (reduced.monthsToGoal == null) {
      reducedNote += "도달 불가";
    } else if (monthsSaved > 0) {
      reducedNote += `${monthsSaved}개월 단축!`;
    } else if (daysSaved > 0) {
      reducedNote += `${daysSaved}일 단축!`;
    } else if (savedAmount > 0) {
      reducedNote += `매달 ${formatMoney(savedAmount)} 더`;
    } else {
      reducedNote += durationOf(reduced);
    }

    return {
      goalName: goal.name,
      current: {
        tag: "현재 우주",
        title: current.title,
        // 현재 우주는 이번 달 전체 소비를 보여준다. 특정 항목 금액을 보여주면
        // 그 아래 '목표까지 N개월'과 근거가 어긋난다 — 개월 수는 전체 지출로 계산된 값이다.
        metricLabel: "이번 달 소비",
        metric: `-${formatMoney(current.monthlyExpense)}`,
        accent: "#9E96EE",
        narratives: current.narrations || [ current.narration ],
        goalNote: currentNote,
        focusTag: null,
        // 항해 머리말용. 제목("지금처럼 쓴다면")은 ~면 으로 끝나는 조건절이라
        // "… 우주로 진입하고 있어요" 앞에 그대로 붙이면 말이 안 된다. 관형형을 따로 둔다.
        voyageLabel: "지금처럼 쓰는",
        universeDesc: "지금 소비 흐름을 그대로 이어간 미래예요.",
        monthlySaving: current.monthlySaving,
        monthsToGoal: current.monthsToGoal,
        estimatedAchieveDate: current.estimatedAchieveDate
      },
      reduced: {
        tag: "다른 우주",
        title: reduced.title,
        // 목표까지 두어 달이면 도달 시점 차이는 며칠뿐이라 두 우주가 같아 보인다.
        // 1년을 이어갔을 때의 격차는 같은 사실을 훨씬 크게 보여준다 — 축을 하나 더 준다.
        metricLabel: "1년이면",
        metric: `+${formatMoney(savedAmount * 12)}`,
        subMetricLabel: "매달",
        subMetric: `+${formatMoney(savedAmount)}`,
        accent: "#82E2C2",
        narratives: reduced.narrations || [ reduced.narration ],
        goalNote: reducedNote,
        // 줄이는 대상만 태그로 단다. 현재 우주에는 줄일 대상이 없어 태그가 없다.
        // 예전에는 여기에 "평온 · 뿌듯함"이 하드코딩돼 있었다 — 아무 데이터도 안 보는 값이었다.
        focusTag: topCategory ? topCategory.name : null,
        voyageLabel: topCategory ? `${topCategory.name} 소비를 줄인` : "덜 쓰는",
        universeDesc: topCategory
          ? `${topCategory.name} 지출을 ${Math.round(universeData.reductionRate * 100)}% 줄인 미래예요.`
          : "지출을 줄인 미래예요.",
        monthlySaving: reduced.monthlySaving,
        monthsToGoal: reduced.monthsToGoal,
        estimatedAchieveDate: reduced.estimatedAchieveDate
      }
    };
  }, [universeData]);

  const [phase, setPhase] = useState("idle");
  const [selected, setSelected] = useState("");
  // 항해 중 머리말이 가리킬 "목적지". 예전에는 직전 선택(from)을 썼는데,
  // 첫 항해에서는 직전 값이 비어 있어 어느 행성을 눌러도 REDUCED 로 표시됐다.
  const [heading, setHeading] = useState("");
  const [leverA, setLeverA] = useState(0.5);
  const [leverB, setLeverB] = useState(0.6);
  const [egg, setEgg] = useState(false);
  const [calc, setCalc] = useState(0);
  const [blobPoke, setBlobPoke] = useState(false);
  const [narrativeIndex, setNarrativeIndex] = useState(0);

  // 머리말 날짜. 데스크톱에 "2026년 7월 6일 월요일"이 문자열로 박혀 있어 어느 날 열어도
  // 그 날짜였다. 오늘로 만들어 두 화면이 같은 값을 쓰게 한다.
  const today = useMemo(
    () => new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
    []
  );

  const tRef = useRef(null);
  const stRef = useRef(null);
  const ivRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 980);
  const [isShortMobile, setIsShortMobile] = useState(window.innerHeight < 700);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 980);
      setIsShortMobile(window.innerHeight < 700);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const ob = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const scaleW = width / 1160;
        // 세로 높이 제약을 풀고, 무조건 가로 너비(1420px)에 맞춰 꽉 차게 스케일업 하도록 수정
        setScale(scaleW);
      }
    });
    if (containerRef.current) ob.observe(containerRef.current);
    return () => ob.disconnect();
  }, [U_DATA, mainGoal]);

  const reset = () => {
    if (tRef.current) clearTimeout(tRef.current);
    setPhase("idle"); setSelected(""); setHeading("");
  };

  // 하단 목표 선택 → 해당 goalId로 시뮬레이션 전환(항해 상태 초기화)
  const selectGoal = (goalId) => {
    if (goalId === activeGoalId) return;
    if (tRef.current) clearTimeout(tRef.current);
    setSelectedGoalId(goalId);
    setPhase("idle"); setSelected(""); setHeading("");
  };

  const select = (key) => {
    if (tRef.current) clearTimeout(tRef.current);
    setPhase("flying"); setSelected(key); setHeading(key); setNarrativeIndex(0);
    tRef.current = setTimeout(() => setPhase("result"), 1200);
  };

  const handleBlobClick = () => {
    if (blobPoke) return;
    setBlobPoke(true);
    setTimeout(() => setBlobPoke(false), 450);
    
    if (selected && U_DATA && U_DATA[selected]) {
      const u = U_DATA[selected];
      setNarrativeIndex(prev => (prev + 1) % u.narratives.length);
    }
  };

  // REC 노브 → CALC 이스터에그 애니메이션 (#162 원복)
  const ignite = () => {
    if (phase !== "idle") return;
    if (stRef.current) clearTimeout(stRef.current);
    if (ivRef.current) clearInterval(ivRef.current);
    setEgg(true); setCalc(0);
    ivRef.current = setInterval(() => {
      setCalc(c => {
        const nc = Math.min(100, c + 4);
        if (nc >= 100) { clearInterval(ivRef.current); ivRef.current = null; }
        return nc;
      });
    }, 55);
    stRef.current = setTimeout(() => { setEgg(false); }, 5200);
  };

  const depart = (key) => {
    if (phase === "departing") return;
    if (tRef.current) clearTimeout(tRef.current);
    // selected 는 애니메이션이 끝난 뒤에야 바뀐다. 머리말은 지금 향하는 쪽을 말해야 하므로 먼저 잡는다.
    setHeading(key);
    setPhase("departing");
    tRef.current = setTimeout(() => {
      setPhase("result"); setSelected(key);
    }, 1150);
  };

  const dragLever = (key, e) => {
    if (e.preventDefault) e.preventDefault();
    const startY = e.clientY != null ? e.clientY : (e.touches && e.touches[0].clientY);
    const startVal = key === 'leverA' ? leverA : leverB;
    const move = (ev) => {
      const cy = ev.clientY != null ? ev.clientY : (ev.touches && ev.touches[0].clientY);
      let v = startVal - (cy - startY) / 120;
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      if (key === 'leverA') setLeverA(v); else setLeverB(v);
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  useEffect(() => {
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
      if (stRef.current) clearTimeout(stRef.current);
      if (ivRef.current) clearInterval(ivRef.current);
    };
  }, []);

  if (!mainGoal) {
    return (
      <Container>
        <div style={{ color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h2 style={{ color: "#fff", marginBottom: 12, fontSize: 24 }}>설정된 목표가 없어요</h2>
          <p style={{ color: "#aaa" }}>목표를 먼저 추가하고 평행우주 시뮬레이션을 시작해 보세요!</p>
        </div>
      </Container>
    );
  }

  if (isUniverseLoading || !U_DATA) {
    return (
      <Container>
        <div style={{ color: "#fff", textAlign: "center" }}>
          <div style={{ animation: "pu-spin 2s linear infinite", display: "inline-block", fontSize: 32, marginBottom: 16 }}>💫</div>
          <p style={{ color: "#aaa", fontSize: 16 }}>평행우주 데이터를 탐색하는 중...</p>
        </div>
      </Container>
    );
  }

  const parked = phase !== "idle";
  const u = U_DATA[selected] || null;
  const otherKey = selected === "current" ? "reduced" : "current";
  const other = U_DATA[otherKey] || null;

  const orbitHeight = isShortMobile ? 60 : (isMobile ? 90 : 110);
  const pSize = isShortMobile ? 74 : (isMobile ? 100 : 150);
  const pTextOffset = isShortMobile ? 84 : (isMobile ? 105 : 170);

  return (
    <>
      <Global styles={globalStyles} />
      <Container ref={containerRef} style={isMobile ? { height: '100%', minHeight: 0, padding: '0', borderRadius: 24, boxShadow: 'none', overflow: 'hidden' } : {}}>
        <div style={isMobile ? { width: '100%', height: '100%' } : { transform: `scale(${scale})`, transformOrigin: "center center" }}>
          <PageWrapper style={isMobile ? { width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden', transform: 'none' } : {}}>

          <div style={{ position: "absolute", inset: 0, opacity: parked && phase !== "flying" ? 0 : 1, pointerEvents: phase === "idle" ? "auto" : "none", transition: "opacity .45s ease" }}>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
               <div style={{ position:"absolute",left:"6%",top:60,width:2,height:2,borderRadius:"50%",background:"#fff",animation:"pu-twinkle 3.2s ease-in-out infinite" }}></div>
               <div style={{ position:"absolute",left:"15%",top:130,width:2,height:2,borderRadius:"50%",background:"#fff",animation:"pu-twinkle 2.6s ease-in-out .4s infinite" }}></div>
               <div style={{ position:"absolute",left:"23%",top:70,width:1.5,height:1.5,borderRadius:"50%",background:"#fff",animation:"pu-twinkle 3.8s ease-in-out .8s infinite" }}></div>
               <div style={{ position:"absolute",left:"82%",top:64,width:2,height:2,borderRadius:"50%",background:"#fff",animation:"pu-twinkle 3.1s ease-in-out .5s infinite" }}></div>
            </div>

            {isMobile ? (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "absolute", inset: 0, zIndex: 3 }}>
                {/* 데스크톱과 같은 머리말 구성(날짜 + 평행우주)으로 맞춘다.
                    예전 제목 "미래는 지금 갈라지고 있어요"는 22px 두 줄이라 우측 상단 목표 칩
                    아래로 파고들어 글자가 겹쳤다. paddingRight 로 칩 자리를 비워 두 번 막는다. */}
                <div style={{ flexShrink: 0, padding: "24px 130px 24px 24px", zIndex: 10, display: "flex", flexDirection: "column", gap: 6, opacity: phase === "idle" ? 1 : 0, transition: "opacity .3s ease", pointerEvents: "none" }}>
                  <div style={{ font: "600 10px ui-monospace,Menlo,monospace", letterSpacing: ".1em", color: "#ECEBF0" }}>{today}</div>
                  <div style={{ font: "800 22px/1 system-ui", color: "#fff", letterSpacing: "-.02em" }}>평행우주 ☾</div>
                </div>

                {(phase === "flying" || phase === "departing") && (
                  <div style={{ position: "absolute", left: 24, top: 24, zIndex: 10, animation: "pu-welldraw .6s ease both" }}>
                    <div style={{ font: `600 10px ui-monospace,Menlo,monospace`, letterSpacing: ".1em", color: "#ECEBF0" }}>VOYAGE LOG</div>
                    <div style={{ font: `800 20px/1 system-ui`, color: "#fff", letterSpacing: "-.02em", marginTop: 6 }}>{heading === "current" ? U_DATA.current.voyageLabel : U_DATA.reduced.voyageLabel} 우주로<br/>진입하고 있어요</div>
                  </div>
                )}

                {/* 관측 화면에서는 머리말이 아예 없어 좌상단이 비어 보였다.
                    지금 어느 우주를 보고 있는지 여기서 말해 준다. */}
                {phase === "result" && selected && (
                  <div style={{ position: "absolute", left: 24, top: 24, zIndex: 10, maxWidth: "62%", animation: "pu-welldraw .6s ease both", pointerEvents: "none" }}>
                    <div style={{ font: `600 10px ui-monospace,Menlo,monospace`, letterSpacing: ".1em", color: "#ECEBF0", opacity: .75 }}>NOW OBSERVING</div>
                    <div style={{ font: `800 20px/1.15 system-ui`, color: "#fff", letterSpacing: "-.02em", marginTop: 6 }}>{U_DATA[selected].voyageLabel} 우주</div>
                    <div style={{ font: `400 11.5px/1.5 system-ui`, color: "#B9B4C7", marginTop: 6 }}>{U_DATA[selected].universeDesc}</div>
                  </div>
                )}

                <div style={{ flexGrow: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", inset: 0 }}>
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 3 }}>
                      <div style={{ position: "relative", width: "100%", maxWidth: 400, height: orbitHeight + 120, pointerEvents: "none", transformOrigin: selected === "current" ? "22% 50%" : "78% 50%", transition: "transform .6s cubic-bezier(.4,0,.2,1)", transform: phase === "flying" ? `scale(1.8)` : phase === "result" ? "scale(0) opacity(0)" : "scale(1)" }}>
                        {/* 궤도와 행성을 한 상자에 담아 같은 회전을 받게 한다.
                            예전에는 타원만 -8deg 로 돌리고 행성은 top: 50% ± orbitHeight/2 —
                            타원의 꼭짓점 — 에 박아 두 좌표계가 어긋났다. 그래서 행성이 궤도에서 떠 보였다.

                            이제 상자 = 타원이다. 중심에서 x 로 35% 떨어진 지점의 궤도 높이는
                            y = 50% ∓ 50% · √(1 − 0.7²) = 14.3% / 85.7% 이므로 그 자리에 놓으면
                            행성 중심이 정확히 궤도선 위에 앉는다. */}
                        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%) rotate(-8deg)", width: "82%", height: orbitHeight, pointerEvents: "none", zIndex: 3 }}>
                          <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(255,255,255,0.25)", borderRadius: "50%" }}></div>

                          {/* 상자가 기울어 있으니 행성은 반대로 되돌려 라벨이 수평을 유지하게 한다. */}
                          <div onClick={() => select("current")} style={{ position: "absolute", left: "15%", top: "14.3%", transform: "translate(-50%,-50%) rotate(8deg)", cursor: "pointer", zIndex: 4, pointerEvents: "auto" }}>
                            <div style={{ position: "relative", width: pSize, height: pSize }}>
                              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(158,150,238,.5),transparent 60%)", filter: "blur(16px)", animation: "pu-glow 4.4s ease-in-out infinite" }}></div>
                              <UniversePlanet tone="stress" size={pSize} />
                            </div>
                            <div style={{ position: "absolute", left: "50%", top: pTextOffset, transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center", opacity: parked ? 0 : 1, transition: "opacity .3s ease", pointerEvents: "none" }}>
                              <div style={{ font: "600 13px system-ui", color: "#ECEBF0" }}>지금처럼 소비한 나</div>
                            </div>
                          </div>

                          <div onClick={() => select("reduced")} style={{ position: "absolute", left: "85%", top: "85.7%", transform: "translate(-50%,-50%) rotate(8deg)", cursor: "pointer", zIndex: 4, pointerEvents: "auto" }}>
                            <div style={{ position: "relative", width: pSize, height: pSize }}>
                              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(130,226,194,.5),transparent 60%)", filter: "blur(16px)", animation: "pu-glow 4s ease-in-out .6s infinite" }}></div>
                              <UniversePlanet tone="calm" size={pSize} />
                            </div>
                            <div style={{ position: "absolute", left: "50%", top: pTextOffset, transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center", opacity: parked ? 0 : 1, transition: "opacity .3s ease", pointerEvents: "none" }}>
                              <div style={{ font: "600 13px system-ui", color: "#ECEBF0" }}>{U_DATA.reduced.focusTag ? `${U_DATA.reduced.focusTag} 줄인 나` : "덜 쓴 나"}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ flexShrink: 0, paddingBottom: isShortMobile ? 4 : 8, zIndex: 5, transform: parked ? "translateY(48px)" : "none", opacity: parked ? 0 : 1, pointerEvents: parked ? "none" : "auto", transition: "opacity .5s ease, transform .6s cubic-bezier(.5,.05,.2,1)" }}>
                  <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "100%", transform: isShortMobile ? 'scale(0.82)' : 'none', transformOrigin: 'bottom center' }}>
                      <UniverseConsole 
                        isMobile={true}
                        leverA={leverA} leverB={leverB} 
                        startLeverA={(e) => dragLever("leverA", e)} startLeverB={(e) => dragLever("leverB", e)}
                        ignite={ignite} recommending={egg} 
                        statusText={phase === "idle" ? (egg ? "CALC · 평행우주 연산 중" : "STANDBY · 목적지 선택 대기") : phase === "flying" ? "ENGAGED · 우주로 진입" : "ARRIVED · 관측 완료"}
                        selectCurrent={() => select("current")} selectReduced={() => select("reduced")}
                        leftOn={selected === "current"} rightOn={selected === "reduced"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ position: "absolute", left: 48, top: 48, zIndex: 10, display: "flex", flexDirection: "column", gap: 6, opacity: phase === "idle" ? 1 : 0, transition: "opacity .3s ease", pointerEvents: "none" }}>
                  <div style={{ font: "600 12px ui-monospace,Menlo,monospace", letterSpacing: ".1em", color: "#ECEBF0" }}>{today}</div>
                  <div style={{ font: "800 28px/1 system-ui", color: "#fff", letterSpacing: "-.02em" }}>평행우주 ☾</div>
                </div>

                {(phase === "flying" || phase === "departing") && (
                  <div style={{ position: "absolute", left: 48, top: 48, zIndex: 10, animation: "pu-welldraw .6s ease both" }}>
                    <div style={{ font: `600 12px ui-monospace,Menlo,monospace`, letterSpacing: ".1em", color: "#ECEBF0" }}>VOYAGE LOG</div>
                    <div style={{ font: `800 28px/1 system-ui`, color: "#fff", letterSpacing: "-.02em", marginTop: 6 }}>{heading === "current" ? U_DATA.current.voyageLabel : U_DATA.reduced.voyageLabel} 우주로<br/>진입하고 있어요</div>
                  </div>
                )}

                {phase === "result" && selected && (
                  <div style={{ position: "absolute", left: 48, top: 48, zIndex: 10, maxWidth: 360, animation: "pu-welldraw .6s ease both", pointerEvents: "none" }}>
                    <div style={{ font: `600 12px ui-monospace,Menlo,monospace`, letterSpacing: ".1em", color: "#ECEBF0", opacity: .75 }}>NOW OBSERVING</div>
                    <div style={{ font: `800 28px/1.12 system-ui`, color: "#fff", letterSpacing: "-.02em", marginTop: 6 }}>{U_DATA[selected].voyageLabel} 우주</div>
                    <div style={{ font: `400 13px/1.55 system-ui`, color: "#B9B4C7", marginTop: 8 }}>{U_DATA[selected].universeDesc}</div>
                  </div>
                )}

                <div style={{ position: "absolute", inset: 0, zIndex: 3, transformOrigin: selected === "current" ? "330px 196px" : "830px 196px", transition: "transform .6s cubic-bezier(.4,0,.2,1)", transform: phase === "flying" ? `scale(1.8)` : phase === "result" ? "scale(0) opacity(0)" : "scale(1)" }}>
                  {/* 라벨은 모바일에만 있었다. 데스크톱은 행성 둘이 색만 다른 구슬로 보여
                      어느 쪽이 무슨 우주인지 눌러봐야 알 수 있었다. 같은 라벨을 붙인다. */}
                  <div onClick={() => select("current")} style={{ position: "absolute", left: 330, top: 196, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 4, pointerEvents: "auto" }}>
                    <div style={{ position: "relative", width: 150, height: 150 }}>
                      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 232, height: 232, borderRadius: "50%", background: "radial-gradient(circle,rgba(158,150,238,.5),transparent 60%)", filter: "blur(16px)", animation: "pu-glow 4.4s ease-in-out infinite" }}></div>
                      <UniversePlanet tone="stress" size={150} />
                    </div>
                    <div style={{ position: "absolute", left: "50%", top: 168, transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center", pointerEvents: "none" }}>
                      <div style={{ font: "600 14px system-ui", color: "#ECEBF0" }}>지금처럼 소비한 나</div>
                    </div>
                  </div>

                  <div onClick={() => select("reduced")} style={{ position: "absolute", left: 830, top: 196, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 4, pointerEvents: "auto" }}>
                    <div style={{ position: "relative", width: 150, height: 150 }}>
                      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 232, height: 232, borderRadius: "50%", background: "radial-gradient(circle,rgba(130,226,194,.5),transparent 60%)", filter: "blur(16px)", animation: "pu-glow 4s ease-in-out .6s infinite" }}></div>
                      <UniversePlanet tone="calm" size={150} />
                    </div>
                    <div style={{ position: "absolute", left: "50%", top: 168, transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center", pointerEvents: "none" }}>
                      <div style={{ font: "600 14px system-ui", color: "#ECEBF0" }}>{U_DATA.reduced.focusTag ? `${U_DATA.reduced.focusTag} 줄인 나` : "덜 쓴 나"}</div>
                    </div>
                  </div>
                </div>

                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "auto", aspectRatio: "1160/300", zIndex: 5, transform: parked ? "translateY(48px)" : "none", opacity: parked ? 0 : 1, pointerEvents: parked ? "none" : "auto", transition: "opacity .5s ease, transform .6s cubic-bezier(.5,.05,.2,1)" }}>
                  <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
                    <div style={{ width: 1160, height: "auto", aspectRatio: "1160/300" }}>
                      <UniverseConsole 
                        isMobile={false}
                        leverA={leverA} leverB={leverB} 
                        startLeverA={(e) => dragLever("leverA", e)} startLeverB={(e) => dragLever("leverB", e)}
                        ignite={ignite} recommending={egg} 
                        statusText={phase === "idle" ? (egg ? "CALC · 평행우주 연산 중" : "STANDBY · 목적지 선택 대기") : phase === "flying" ? "ENGAGED · 우주로 진입" : "ARRIVED · 관측 완료"}
                        selectCurrent={() => select("current")} selectReduced={() => select("reduced")}
                        leftOn={selected === "current"} rightOn={selected === "reduced"}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {(phase === "flying" || phase === "departing") && (
            <div style={{ position: "absolute", left: phase === "departing" ? (isMobile ? "80%" : 948) : 0, top: phase === "departing" ? (isMobile ? "12%" : 344) : 0, zIndex: 20, animation: (phase === "departing" ? (isMobile ? "pu-depart-m" : "pu-depart") : (selected === "current" ? (isMobile ? "pu-fly-a-m" : "pu-fly-a") : (isMobile ? "pu-fly-b-m" : "pu-fly-b"))) + " 1.2s cubic-bezier(.42,.08,.5,1) forwards" }}>
              <div style={{ position: "relative", width: 120, height: 96, transform: "translate(-50%,-50%)" }}>
                <div style={{ position: "absolute", left: "50%", bottom: -4, transform: "translateX(-50%)", width: 74, height: 26, borderRadius: "50%", background: "radial-gradient(circle,rgba(130,226,194,.85),transparent 70%)", filter: "blur(6px)" }}></div>
                <div style={{ position: "absolute", left: "50%", bottom: 22, transform: "translateX(-50%)", width: 120, height: 34, borderRadius: "50%", background: "linear-gradient(180deg,#e9e6f4,#b6b1cf 52%,#918cae)", boxShadow: "0 8px 18px -8px rgba(0,0,0,.6),inset 0 2px 4px rgba(255,255,255,.5)" }}></div>
                <div style={{ position: "absolute", left: "50%", bottom: 30, transform: "translateX(-50%)", width: 96, height: 7, borderRadius: "50%", background: "linear-gradient(90deg,#F6A96B,#F4A7C4,#9E96EE,#7FB4E8,#82E2C2,#F5D06B)", opacity: .6 }}></div>
                <div style={{ position: "absolute", left: "50%", bottom: 36, transform: "translateX(-50%)", width: 64, height: 52, borderRadius: "50% 50% 46% 46%", background: "radial-gradient(circle at 46% 36%,rgba(214,206,248,.95),rgba(150,138,214,.85))", boxShadow: "inset 0 -6px 10px rgba(120,105,180,.4),inset 0 5px 9px rgba(255,255,255,.5)" }}></div>
              </div>
            </div>
          )}

          {(phase === "result" || phase === "departing") && (
            <div style={{ position: "absolute", inset: 0, zIndex: 15, overflow: "hidden", animation: "pu-arrive .6s ease" }}>
              <div style={{ position: "absolute", left: isMobile ? "-60vw" : "-340px", bottom: isMobile ? "-30vh" : "-640px", zIndex: 0, animation: phase === "departing" ? "pu-recoil 1.1s cubic-bezier(.2,.8,.3,1)" : "none" }}>
                <UniversePlanet tone={selected === "reduced" ? "calm" : "stress"} size={isMobile ? 800 : 1000} />
              </div>

              <div onClick={() => depart(otherKey)} style={{ position: "absolute", left: isMobile ? "80%" : 948, top: isMobile ? "12%" : 344, transform: "translate(-50%,-50%)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 }}>
                <UniversePlanet tone={otherKey === "reduced" ? "calm" : "stress"} size={isMobile ? 140 : 212} />
                {phase === "result" && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ font: "600 12.5px system-ui", color: "#ECEBF0" }}>{other && other.title}</div>
                    <div style={{ font: "400 10.5px system-ui", color: "#9a97a8", marginTop: 6 }}>눌러서 이 우주로 이동</div>
                  </div>
                )}
              </div>

              {phase === "result" && u && (
                <div style={{ position: "absolute", left: isMobile ? "5%" : 206, top: isMobile ? "28%" : 266, right: isMobile ? "5%" : "auto", display: "flex", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 0, zIndex: 2 }}>
                  <div style={{ animation: "pu-hover 4.5s ease-in-out infinite" }}>
                    {/* 말랑이는 이 화면의 화자이고 눌러서 다음 코멘트를 넘기는 조작 대상이다.
                        말풍선 옆에서 존재감이 밀려 눌러야 하는 줄도 몰랐다. 키운다. */}
                    <SpaceBlob size={isMobile ? 150 : 200} speaking={true} poked={blobPoke} onClick={handleBlobClick} />
                  </div>
                  
                  <div style={{ width: isMobile ? "100%" : "auto", maxWidth: 400, padding: isMobile ? "20px" : "18px 22px", borderRadius: 20, background: "rgba(255,255,255,.94)", boxShadow: "0 18px 44px -18px rgba(0,0,0,.6)", animation: "pu-pop .5s ease .15s both", position: "relative", zIndex: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, font: "600 10.5px system-ui", letterSpacing: ".03em", color: u.accent }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: u.accent }}></span>{u.tag} · {u.title}
                    </div>
                    <div style={{ font: "400 11px system-ui", color: "#8A837A", marginTop: 14 }}>{u.metricLabel}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 3 }}>
                      <span style={{ font: "800 40px/1 system-ui", color: u.accent, letterSpacing: "-.02em" }}>{u.metric}</span>
                      <span style={{ font: "700 15px system-ui", color: u.accent }}>{u.metric.includes("-") ? "▼" : "▲"}</span>
                    </div>
                    {u.subMetric && (
                      <div style={{ font: "600 12px system-ui", color: "#8A837A", marginTop: 6 }}>
                        {u.subMetricLabel} {u.subMetric}
                      </div>
                    )}
                    <div style={{ height: 1, background: "rgba(50,42,32,.09)", margin: "15px 0" }}></div>
                    <div style={{ font: "400 13px/1.6 system-ui", color: "#3A352F" }}>{u.narratives[narrativeIndex]}</div>
                    {/* 말랑이를 누르면 다음 코멘트로 넘어간다(handleBlobClick). 화면에 그 단서가 없어
                        코멘트가 여러 개인 줄도, 누를 수 있는 줄도 알 수 없었다.
                        점으로 개수와 현재 위치를 같이 보여준다. 하나뿐이면 넘길 게 없으니 감춘다. */}
                    {u.narratives.length > 1 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11 }}>
                        <span style={{ display: "inline-flex", gap: 4 }}>
                          {u.narratives.map((_, i) => (
                            <i key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i === narrativeIndex ? u.accent : "rgba(50,42,32,.22)", transition: "background .2s ease" }} />
                          ))}
                        </span>
                        <span style={{ font: "600 10.5px system-ui", color: "#8A837A" }}>말랑이를 누르면 다음 이야기</span>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 11, background: "rgba(50,42,32,.055)", font: "600 11px system-ui", color: "#5c564e" }}>🎯 {u.goalNote}</span>
                      {u.focusTag && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 11, background: "rgba(50,42,32,.055)", font: "600 11px system-ui", color: "#5c564e" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: u.accent }}></span>{u.focusTag}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {phase === "result" && (
                /* 어두운 우주 배경에 반투명 흰색 6% + 글자 #c9c6d4 라 거의 보이지 않았다.
                   여기서 빠져나가는 유일한 길이라 눈에 띄어야 한다. 불투명한 밝은 배경에
                   어두운 글자로 뒤집고, 모바일은 화면 아래 가운데로 내려 엄지에 닿게 한다. */
                <button
                  onClick={reset}
                  style={{
                    position: "absolute", zIndex: 6,
                    right: isMobile ? 16 : 34,
                    bottom: isMobile ? 20 : 28,
                    display: "inline-flex", alignItems: "center", gap: 9,
                    padding: "9px 10px 9px 18px", borderRadius: 24,
                    border: "1px solid rgba(255,255,255,.5)",
                    background: "rgba(255,255,255,.92)",
                    color: "#1b1622", font: "800 13px system-ui",
                    boxShadow: "0 10px 26px -8px rgba(0,0,0,.75)",
                    cursor: "pointer", whiteSpace: "nowrap"
                  }}
                >
                  콘솔로 돌아가기 <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "rgba(27,22,34,.10)", fontSize: 13 }}>↩</span>
                </button>
              )}
            </div>
          )}

          {egg && (
            <UniverseEasterEgg 
              goalName={U_DATA.goalName}
              current={U_DATA.current}
              reduced={U_DATA.reduced}
              revealProgress={Math.round(calc)}
              isMobile={isMobile}
              isShortMobile={isShortMobile}
            />
          )}

          {phase === "idle" && goalsList.length > 0 && (
            <div style={{ position: "absolute", top: isMobile ? 20 : 24, right: isMobile ? 16 : 26, zIndex: 16, display: "flex", justifyContent: "flex-end", maxWidth: "68%", pointerEvents: "auto" }}>
              <div style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 3, padding: 4, borderRadius: 999, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
                {goalsList.map(g => {
                  const on = g.goalId === activeGoalId;
                  return (
                    <button
                      key={g.goalId}
                      type="button"
                      onClick={() => selectGoal(g.goalId)}
                      style={{ border: 0, borderRadius: 999, padding: isMobile ? "6px 12px" : "6px 15px", cursor: "pointer", background: on ? "rgba(255,255,255,.92)" : "transparent", color: on ? "#1b1622" : "#b8b3c4", font: `${on ? 800 : 600} 12px system-ui`, whiteSpace: "nowrap", transition: "all .2s ease" }}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </PageWrapper>
        </div>
    </Container>
  </>
  );
}
