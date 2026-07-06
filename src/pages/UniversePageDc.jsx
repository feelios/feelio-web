/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import UniversePlanet from '../components/UniversePlanet';
import SpaceBlob from '../components/SpaceBlob';
import UniverseConsole from '../components/UniverseConsole';
import UniverseEasterEgg from '../components/UniverseEasterEgg';

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
  @keyframes pu-fly-a{0%{transform:translate(580px,600px) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(330px,205px) scale(.32) rotate(-10deg);opacity:1}}
  @keyframes pu-fly-a-m{0%{transform:translate(50vw,85vh) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(35vw,35vh) scale(.32) rotate(-10deg);opacity:1}}
  @keyframes pu-fly-b{0%{transform:translate(580px,600px) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(830px,225px) scale(.32) rotate(10deg);opacity:1}}
  @keyframes pu-fly-b-m{0%{transform:translate(50vw,85vh) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(65vw,35vh) scale(.32) rotate(10deg);opacity:1}}
  @keyframes pu-depart{0%{transform:translate(330px,430px) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(948px,344px) scale(.22) rotate(16deg);opacity:1}}
  @keyframes pu-depart-m{0%{transform:translate(25vw,25vh) scale(1) rotate(0deg);opacity:0}14%{opacity:1}100%{transform:translate(80vw,15vh) scale(.22) rotate(16deg);opacity:1}}
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
  height: calc(100dvh - 100px);
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
  box-shadow: 0 44px 100px -34px rgba(20,16,30,.72),0 0 0 1px rgba(255,255,255,.06);
  font-family: system-ui, -apple-system, sans-serif;
  animation: pu-unfold 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, pu-flicker 1.2s ease-out forwards;
`;

const U_DATA = {
  current: {
    tag: "현재 우주", title: "지금처럼 소비한 나", metricLabel: "이번 달 감정소비", metric: "-182,000원", accent: "#9E96EE",
    narratives: [
      "외로운 밤의 배달이 지금 속도로 이어지면, 제주도 여행 목표까지 4개월이 더 걸려요.",
      "충동적인 지출은 잠시 위안을 주지만, 장기적인 목표를 멀어지게 만들고 있어요.",
      "가끔은 밖으로 나가 가벼운 산책을 해보는 건 어떨까요? 기분이 한결 나아질 거예요!"
    ],
    goalNote: "제주도 여행 · 4개월 지연", emotionTag: "외로움 · 스트레스"
  },
  reduced: {
    tag: "다른 우주", title: "감정소비를 줄인 나", metricLabel: "매달 아낄 수 있는 금액", metric: "+62,000원", accent: "#82E2C2",
    narratives: [
      "외로운 밤의 배달을 절반만 줄이면, 목표에 이만큼씩 더 가까워져요.",
      "불필요한 소비를 줄인 당신! 제주도의 푸른 바다가 한 뼘 더 가까워졌네요.",
      "자신의 감정을 잘 다스리는 지금의 모습, 우주에서 가장 반짝이고 있어요! ✨"
    ],
    goalNote: "제주도 여행 · 더 가까이", emotionTag: "평온 · 뿌듯함"
  }
};



export default function UniversePageDc() {
  const [phase, setPhase] = useState("idle");
  const [selected, setSelected] = useState("");
  const [from, setFrom] = useState("");
  const [leverA, setLeverA] = useState(0.5);
  const [leverB, setLeverB] = useState(0.6);
  const [egg, setEgg] = useState(false);
  const [calc, setCalc] = useState(0);
  const [departTo, setDepartTo] = useState("");
  const [blobPoke, setBlobPoke] = useState(false);
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  
  const tRef = useRef(null);
  const stRef = useRef(null);
  const ivRef = useRef(null);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
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
  }, []);

  const reset = () => {
    if (tRef.current) clearTimeout(tRef.current);
    setPhase("idle"); setSelected(""); setFrom("");
  };

  const select = (key) => {
    if (tRef.current) clearTimeout(tRef.current);
    setPhase("flying"); setSelected(key); setFrom(selected); setNarrativeIndex(0);
    tRef.current = setTimeout(() => setPhase("result"), 1200);
  };

  const handleBlobClick = () => {
    if (blobPoke) return;
    setBlobPoke(true);
    setTimeout(() => setBlobPoke(false), 450);
    
    if (selected && U_DATA[selected]) {
      const u = U_DATA[selected];
      setNarrativeIndex(prev => (prev + 1) % u.narratives.length);
    }
  };

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
    setPhase("departing"); setDepartTo(key);
    tRef.current = setTimeout(() => {
      setPhase("result"); setSelected(key); setDepartTo("");
    }, 1150);
  };

  const switchOther = () => depart(selected === "current" ? "reduced" : "current");

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
      <Container ref={containerRef} style={isMobile ? { height: 'calc(100dvh - 190px)', padding: '0', borderRadius: 0, boxShadow: 'none', overflow: 'hidden' } : {}}>
        <div style={isMobile ? { width: '100%', height: '100%' } : { transform: `scale(${scale})`, transformOrigin: "center center" }}>
          <PageWrapper style={isMobile ? { width: '100%', height: '100%', borderRadius: '24px 24px 0 0', overflow: 'hidden', transform: 'none' } : {}}>

          <div style={{ position: "absolute", inset: 0, opacity: parked && phase !== "flying" ? 0 : 1, pointerEvents: phase === "idle" ? "auto" : "none", transition: "opacity .45s ease" }}>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
               <div style={{ position:"absolute",left:"6%",top:60,width:2,height:2,borderRadius:"50%",background:"#fff",animation:"pu-twinkle 3.2s ease-in-out infinite" }}></div>
               <div style={{ position:"absolute",left:"15%",top:130,width:2,height:2,borderRadius:"50%",background:"#fff",animation:"pu-twinkle 2.6s ease-in-out .4s infinite" }}></div>
               <div style={{ position:"absolute",left:"23%",top:70,width:1.5,height:1.5,borderRadius:"50%",background:"#fff",animation:"pu-twinkle 3.8s ease-in-out .8s infinite" }}></div>
               <div style={{ position:"absolute",left:"82%",top:64,width:2,height:2,borderRadius:"50%",background:"#fff",animation:"pu-twinkle 3.1s ease-in-out .5s infinite" }}></div>
            </div>

            {isMobile ? (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "absolute", inset: 0, zIndex: 3 }}>
                <div style={{ flexShrink: 0, padding: 24, zIndex: 10, display: "flex", flexDirection: "column", gap: 6, opacity: phase === "idle" ? 1 : 0, transition: "opacity .3s ease", pointerEvents: "none" }}>
                  <div style={{ font: "600 10px ui-monospace,Menlo,monospace", letterSpacing: ".1em", color: "#ECEBF0", opacity: 0.7 }}>PARALLEL UNIVERSE</div>
                  <div style={{ font: "800 22px/1.2 system-ui", color: "#fff", letterSpacing: "-.02em" }}>미래는 지금 갈라지고 있어요</div>
                  <div style={{ font: "400 12px system-ui", color: "#8A837A", marginTop: 2 }}>두 우주 중 하나를 눌러 항해를 시작해요.</div>
                </div>

                {(phase === "flying" || phase === "departing") && (
                  <div style={{ position: "absolute", left: 24, top: 24, zIndex: 10, animation: "pu-welldraw .6s ease both" }}>
                    <div style={{ font: `600 10px ui-monospace,Menlo,monospace`, letterSpacing: ".1em", color: "#ECEBF0" }}>VOYAGE LOG</div>
                    <div style={{ font: `800 20px/1 system-ui`, color: "#fff", letterSpacing: "-.02em", marginTop: 6 }}>{from === "current" ? U_DATA.current.title : U_DATA.reduced.title} 우주로<br/>진입하고 있어요</div>
                  </div>
                )}

                <div style={{ flexGrow: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", inset: 0, transition: "transform .6s cubic-bezier(.4,0,.2,1)", transform: phase === "flying" ? `scale(2.5) ${selected === "current" ? "translate(28%, 15%)" : "translate(-28%, -5%)"}` : phase === "result" ? "scale(0) opacity(0)" : "scale(1)" }}>
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 3 }}>
                      <div style={{ position: "relative", width: "100%", maxWidth: 400, height: orbitHeight + 120, pointerEvents: "none" }}>
                        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%) rotate(-8deg)", width: "82%", height: orbitHeight, border: "1px solid rgba(255,255,255,0.25)", borderRadius: "50%", pointerEvents: "none", zIndex: 3 }}></div>
                        
                        <div onClick={() => select("current")} style={{ position: "absolute", left: "22%", top: `calc(50% - ${orbitHeight/2}px + 8px)`, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 4, pointerEvents: "auto" }}>
                          <div style={{ position: "relative", width: pSize, height: pSize }}>
                            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(158,150,238,.5),transparent 60%)", filter: "blur(16px)", animation: "pu-glow 4.4s ease-in-out infinite" }}></div>
                            <UniversePlanet tone="stress" size={pSize} />
                          </div>
                          <div style={{ position: "absolute", left: "50%", top: pTextOffset, transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center", opacity: parked ? 0 : 1, transition: "opacity .3s ease", pointerEvents: "none" }}>
                            <div style={{ font: "600 13px system-ui", color: "#ECEBF0" }}>지금처럼 소비한 나</div>
                          </div>
                        </div>

                        <div onClick={() => select("reduced")} style={{ position: "absolute", left: "78%", top: `calc(50% + ${orbitHeight/2}px - 15px)`, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 4, pointerEvents: "auto" }}>
                          <div style={{ position: "relative", width: pSize, height: pSize }}>
                            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(130,226,194,.5),transparent 60%)", filter: "blur(16px)", animation: "pu-glow 4s ease-in-out .6s infinite" }}></div>
                            <UniversePlanet tone="calm" size={pSize} />
                          </div>
                          <div style={{ position: "absolute", left: "50%", top: pTextOffset, transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center", opacity: parked ? 0 : 1, transition: "opacity .3s ease", pointerEvents: "none" }}>
                            <div style={{ font: "600 13px system-ui", color: "#ECEBF0" }}>감정소비를 줄인 나</div>
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
                  <div style={{ font: "600 12px ui-monospace,Menlo,monospace", letterSpacing: ".1em", color: "#ECEBF0" }}>2026년 7월 6일 월요일</div>
                  <div style={{ font: "800 28px/1 system-ui", color: "#fff", letterSpacing: "-.02em" }}>평행우주 ☾</div>
                </div>

                {(phase === "flying" || phase === "departing") && (
                  <div style={{ position: "absolute", left: 48, top: 48, zIndex: 10, animation: "pu-welldraw .6s ease both" }}>
                    <div style={{ font: `600 12px ui-monospace,Menlo,monospace`, letterSpacing: ".1em", color: "#ECEBF0" }}>VOYAGE LOG</div>
                    <div style={{ font: `800 28px/1 system-ui`, color: "#fff", letterSpacing: "-.02em", marginTop: 6 }}>{from === "current" ? U_DATA.current.title : U_DATA.reduced.title} 우주로<br/>진입하고 있어요</div>
                  </div>
                )}

                <div style={{ position: "absolute", inset: 0, zIndex: 3, transition: "transform .6s cubic-bezier(.4,0,.2,1)", transform: phase === "flying" ? `scale(2.5) ${selected === "current" ? "translate(10%, 20%)" : "translate(-30%, 15%)"}` : phase === "result" ? "scale(0) opacity(0)" : "scale(1)" }}>
                  <div onClick={() => select("current")} style={{ position: "absolute", left: 330, top: 196, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 4, pointerEvents: "auto" }}>
                    <div style={{ position: "relative", width: 150, height: 150 }}>
                      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 232, height: 232, borderRadius: "50%", background: "radial-gradient(circle,rgba(158,150,238,.5),transparent 60%)", filter: "blur(16px)", animation: "pu-glow 4.4s ease-in-out infinite" }}></div>
                      <UniversePlanet tone="stress" size={150} />
                    </div>
                  </div>

                  <div onClick={() => select("reduced")} style={{ position: "absolute", left: 830, top: 196, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 4, pointerEvents: "auto" }}>
                    <div style={{ position: "relative", width: 150, height: 150 }}>
                      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 232, height: 232, borderRadius: "50%", background: "radial-gradient(circle,rgba(130,226,194,.5),transparent 60%)", filter: "blur(16px)", animation: "pu-glow 4s ease-in-out .6s infinite" }}></div>
                      <UniversePlanet tone="calm" size={150} />
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
            <div style={{ position: "absolute", left: 0, top: 0, zIndex: 20, animation: (phase === "departing" ? (isMobile ? "pu-depart-m" : "pu-depart") : (selected === "current" ? (isMobile ? "pu-fly-a-m" : "pu-fly-a") : (isMobile ? "pu-fly-b-m" : "pu-fly-b"))) + " 1.2s cubic-bezier(.42,.08,.5,1) forwards" }}>
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
                    <SpaceBlob size={isMobile ? 110 : 150} speaking={true} poked={blobPoke} onClick={handleBlobClick} />
                  </div>
                  {!isMobile && <div style={{ width: 16, height: 16, background: "rgba(255,255,255,.94)", transform: "rotate(45deg)", marginLeft: -8, marginRight: -8, borderRadius: 3, alignSelf: "center", position: "relative", top: 8 }}></div>}
                  {isMobile && <div style={{ width: 16, height: 16, background: "rgba(255,255,255,.94)", transform: "rotate(45deg)", marginBottom: -12, borderRadius: 3, alignSelf: "center", position: "relative", zIndex: 1 }}></div>}
                  
                  <div style={{ width: isMobile ? "100%" : "auto", maxWidth: 400, padding: isMobile ? "20px" : "18px 22px", borderRadius: 20, background: "rgba(255,255,255,.94)", boxShadow: "0 18px 44px -18px rgba(0,0,0,.6)", animation: "pu-pop .5s ease .15s both", position: "relative", zIndex: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, font: "600 10.5px system-ui", letterSpacing: ".03em", color: u.accent }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: u.accent }}></span>{u.tag} · {u.title}
                    </div>
                    <div style={{ font: "400 11px system-ui", color: "#8A837A", marginTop: 14 }}>{u.metricLabel}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 3 }}>
                      <span style={{ font: "800 40px/1 system-ui", color: u.accent, letterSpacing: "-.02em" }}>{u.metric}</span>
                      <span style={{ font: "700 15px system-ui", color: u.accent }}>{u.metric.includes("-") ? "▼" : "▲"}</span>
                    </div>
                    <div style={{ height: 1, background: "rgba(50,42,32,.09)", margin: "15px 0" }}></div>
                    <div style={{ font: "400 13px/1.6 system-ui", color: "#3A352F" }}>{u.narratives[narrativeIndex]}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 11, background: "rgba(50,42,32,.055)", font: "600 11px system-ui", color: "#5c564e" }}>🎯 {u.goalNote}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 11, background: "rgba(50,42,32,.055)", font: "600 11px system-ui", color: "#5c564e" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: u.accent }}></span>{u.emotionTag}</span>
                    </div>
                  </div>
                </div>
              )}

              {phase === "result" && (
                <button onClick={reset} style={{ position: "absolute", right: 34, bottom: 28, zIndex: 3, display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 8px 7px 16px", borderRadius: 24, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "#c9c6d4", font: "600 12px system-ui", cursor: "pointer", backdropFilter: "blur(8px)" }}>
                  콘솔로 돌아가기 <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.12)", fontSize: 13 }}>↩</span>
                </button>
              )}
            </div>
          )}

          {egg && (
            <UniverseEasterEgg 
              eggPct={Math.round(calc)} calc={calc}
              eggDistA={((calc / 100) * 4.24).toFixed(2)} eggTimeA={Math.round((calc / 100) * 37)}
              eggDistB={((calc / 100) * 7.81).toFixed(2)} eggTimeB={Math.round((calc / 100) * 63)}
              eggCurv={((calc / 100) * 0.83).toFixed(2)}
            />
          )}
        </PageWrapper>
        </div>
    </Container>
  </>
  );
}
