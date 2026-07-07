export default function UniverseConsole({ 
  isMobile, leverA, leverB, startLeverA, startLeverB, ignite, recommending, statusText, 
  selectCurrent, selectReduced, leftOn, rightOn 
}) {
  if (isMobile) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* 모바일 콘솔 메인 패널 (크기 및 여백 축소) */}
        <div style={{ width: '92%', maxWidth: '400px', background: '#17181c', borderRadius: '28px', border: '1.5px solid #23252a', padding: '16px 16px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          
          {/* 상단 도트 인디케이터 (여백 축소) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#32343c' }}></span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#32343c' }}></span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8B7EE8', boxShadow: '0 0 6px #8B7EE8' }}></span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#32343c' }}></span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#82E2C2', boxShadow: '0 0 6px #82E2C2' }}></span>
          </div>

          {/* STANDBY 텍스트 (여백 축소) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B7EE8', boxShadow: '0 0 8px #8B7EE8' }}></span>
            <span style={{ font: "400 10px ui-monospace,Menlo,monospace", color: "#6a6d75", letterSpacing: ".1em" }}>STANDBY <span style={{ opacity: 0.3, margin: '0 4px' }}>·</span> 목적지 선택 대기</span>
          </div>
          
          {/* 계기판: REC 노브가 상단에 걸쳐있고 아래 카드들이 벌어져 있는 구조 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px', position: 'relative', marginTop: '10px' }}>
            
            {/* 중앙: 둥근 REC 노브 (데스크탑 SVG 다이얼과 동일한 디자인 적용) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10, marginBottom: '-16px' }}>
              <button onClick={ignite} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {recommending && <div style={{ position: 'absolute', inset: -2, border: '1.5px solid #82E2C2', borderRadius: '50%', animation: 'pu-scan 1.7s ease-out infinite' }}></div>}
                <svg viewBox="0 0 62 62" width="62" height="62" style={{ display: 'block', borderRadius: '50%', background: '#17181c', boxShadow: 'inset 0 4px 10px rgba(0,0,0,.6)' }}>
                  <circle cx="31" cy="31" r="30" fill="rgba(0,0,0,.45)" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
                  <circle cx="31" cy="31" r="23" fill="none" stroke="#8B7EE8" strokeOpacity=".25" strokeWidth="1" strokeDasharray="2 4"/>
                  <circle cx="31" cy="31" r="17" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.14)" strokeWidth="1"/>
                  <line x1="31" y1="18" x2="31" y2="24" stroke="#8B7EE8" strokeWidth="2.4" strokeLinecap="round"/>
                </svg>
              </button>
              <span style={{ font: "600 8px ui-monospace,Menlo,monospace", letterSpacing: ".15em", color: "rgba(255,255,255,.4)", marginTop: '8px' }}>REC</span>
            </div>

            {/* 하단: 두 선택 버튼 컨테이너 (위의 REC 버튼이 중앙에 걸쳐짐) */}
            <div style={{ display: 'flex', width: '100%', gap: '16px', justifyContent: 'space-between' }}>
              
              {/* 왼쪽: 지금 이대로 */}
              <button onClick={selectCurrent} style={{ flex: 1, height: '76px', borderRadius: '16px', background: leftOn ? '#212329' : '#1c1d22', border: `1.5px solid ${leftOn ? '#343741' : '#26282e'}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '12px 14px', transition: 'all 0.2s', cursor: 'pointer', position: 'relative', boxShadow: leftOn ? 'inset 0 2px 10px rgba(0,0,0,0.2)' : 'none' }}>
                <span style={{ font: "600 12px system-ui", color: '#e4e5e7', marginBottom: '4px' }}>지금 이대로</span>
                <span style={{ font: "400 9px ui-monospace,Menlo,monospace", color: '#6a6d75' }}>STRESS</span>
                {leftOn && <span style={{ position: 'absolute', top: '14px', right: '14px', width: '5px', height: '5px', borderRadius: '50%', background: '#8B7EE8', boxShadow: '0 0 6px #8B7EE8' }}></span>}
              </button>

              {/* 오른쪽: 조금 줄이면 */}
              <button onClick={selectReduced} style={{ flex: 1, height: '76px', borderRadius: '16px', background: rightOn ? '#212329' : '#1c1d22', border: `1.5px solid ${rightOn ? '#343741' : '#26282e'}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '12px 14px', transition: 'all 0.2s', cursor: 'pointer', position: 'relative', boxShadow: rightOn ? 'inset 0 2px 10px rgba(0,0,0,0.2)' : 'none' }}>
                <span style={{ font: "600 12px system-ui", color: '#e4e5e7', marginBottom: '4px' }}>조금 줄이면</span>
                <span style={{ font: "400 9px ui-monospace,Menlo,monospace", color: '#6a6d75' }}>CALM</span>
                {rightOn && <span style={{ position: 'absolute', top: '14px', left: '14px', width: '5px', height: '5px', borderRadius: '50%', background: '#82E2C2', boxShadow: '0 0 6px #82E2C2' }}></span>}
              </button>

            </div>
          </div>

          {/* 하단 슬라이더 바 (웹의 하단 장식 느낌으로 유지) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', opacity: 0.8 }}>
            <span style={{ font: "400 9px ui-monospace,Menlo,monospace", color: '#555861' }}>SEC</span>
            <div style={{ flex: 1, margin: '0 12px', height: '3px', background: '#23252a', position: 'relative', borderRadius: '2px' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, #624b22, #b8860b)', borderRadius: '2px' }}></div>
              <div style={{ position: 'absolute', left: '40%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #ffd700, #b8860b)', boxShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 6px rgba(255, 215, 0, 0.4)' }}></div>
            </div>
            <span style={{ font: "400 9px ui-monospace,Menlo,monospace", color: '#555861' }}>120</span>
          </div>


          
        </div>
      </div>
    );
  }

  const leverAFillStyle = { transform: `scaleY(${leverA})`, transformOrigin: "448px 298px" };
  const leverBFillStyle = { transform: `scaleY(${leverB})`, transformOrigin: "713px 298px" };
  const leverAStyle = { transform: `translateY(${(1 - leverA) * 40}px)`, cursor: "grab" };
  const leverBStyle = { transform: `translateY(${(1 - leverB) * 40}px)`, cursor: "grab" };

  return (
    <>
      <svg viewBox="0 0 1160 300" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} aria-hidden="true">
        <defs>
          <linearGradient id="cn-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".10"/><stop offset="1" stopColor="#ffffff" stopOpacity=".045"/></linearGradient>
          <linearGradient id="cn-wing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".07"/><stop offset="1" stopColor="#ffffff" stopOpacity=".03"/></linearGradient>
          <linearGradient id="cn-inset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000000" stopOpacity=".38"/><stop offset=".3" stopColor="#000000" stopOpacity="0"/></linearGradient>
          <linearGradient id="cn-bez" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000000" stopOpacity=".26"/><stop offset=".55" stopColor="#000000" stopOpacity=".06"/><stop offset="1" stopColor="#ffffff" stopOpacity=".05"/></linearGradient>
        </defs>
        <g id="console-base">
          <path d="M0,120 L360,74 Q382,70 404,70 L756,70 Q778,70 800,74 L1160,120 L1160,320 L0,320 Z" fill="url(#cn-glass)"/>
          <path d="M0,120 L360,74 Q382,70 404,70 L756,70 Q778,70 800,74 L1160,120" fill="none" stroke="rgba(255,255,255,.13)" strokeWidth="1"/>
          <path d="M368,88 L404,84 L756,84 L792,88" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1"/>
        </g>
        <g id="deco-left">
          <path d="M0,120 L360,74 L360,92 L18,138 Z" fill="url(#cn-wing)"/>
          <line x1="46" y1="156" x2="150" y2="156" stroke="rgba(255,255,255,.09)" strokeWidth="1"/>
          <circle cx="60" cy="182" r="2.8" fill="#7FB4E8"/>
          <circle cx="80" cy="182" r="2.8" fill="rgba(255,255,255,.26)"/>
          <circle cx="100" cy="182" r="2.8" fill="rgba(255,255,255,.18)"/>
          <rect x="46" y="202" width="22" height="12" rx="6" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.1)"/>
          <circle cx="52" cy="208" r="3.4" fill="rgba(255,255,255,.5)"/>
          <line x1="82" y1="208" x2="150" y2="208" stroke="rgba(255,255,255,.09)" strokeWidth="1"/>
          <line x1="46" y1="226" x2="128" y2="226" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
        </g>
        <g id="deco-right">
          <path d="M1160,120 L800,74 L800,92 L1142,138 Z" fill="url(#cn-wing)"/>
          <line x1="1010" y1="156" x2="1114" y2="156" stroke="rgba(255,255,255,.09)" strokeWidth="1"/>
          <circle cx="1100" cy="182" r="2.8" fill="#F5D06B"/>
          <circle cx="1080" cy="182" r="2.8" fill="rgba(255,255,255,.26)"/>
          <circle cx="1060" cy="182" r="2.8" fill="rgba(255,255,255,.18)"/>
          <rect x="1092" y="202" width="22" height="12" rx="6" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.1)"/>
          <circle cx="1108" cy="208" r="3.4" fill="rgba(255,255,255,.5)"/>
          <line x1="1010" y1="208" x2="1078" y2="208" stroke="rgba(255,255,255,.09)" strokeWidth="1"/>
          <line x1="1032" y1="226" x2="1114" y2="226" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
        </g>
        <g id="emotion-rail">
          <circle cx="498" cy="98" r="3" fill="#F6A96B"/>
          <circle cx="521" cy="98" r="3" fill="#F4A7C4"/>
          <circle cx="544" cy="98" r="3" fill="#F5D06B"/>
          <circle cx="567" cy="98" r="3" fill="#9E96EE"/>
          <circle cx="590" cy="98" r="3" fill="#7FB4E8"/>
          <circle cx="613" cy="98" r="3" fill="#F08A7E"/>
          <circle cx="636" cy="98" r="3" fill="#82E2C2"/>
          <circle cx="659" cy="98" r="3" fill="#B8B4C4"/>
        </g>
        <g id="telemetry">
          <rect x="466" y="120" width="228" height="24" rx="8" fill="rgba(0,0,0,.30)"/>
          <rect x="466" y="120" width="228" height="24" rx="8" fill="url(#cn-inset)"/>
          <rect x="466.5" y="120.5" width="227" height="23" rx="7.5" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1"/>
        </g>
        <g id="btn-slot-left">
          <rect x="330" y="158" width="210" height="66" rx="15" fill="rgba(0,0,0,.24)"/>
          <rect x="330" y="158" width="210" height="66" rx="15" fill="url(#cn-bez)"/>
          <rect x="330.5" y="158.5" width="209" height="65" rx="14.5" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
        </g>
        <g id="btn-slot-right">
          <rect x="620" y="158" width="210" height="66" rx="15" fill="rgba(0,0,0,.24)"/>
          <rect x="620" y="158" width="210" height="66" rx="15" fill="url(#cn-bez)"/>
          <rect x="620.5" y="158.5" width="209" height="65" rx="14.5" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
        </g>
        <g id="ignition" onClick={ignite} style={{ cursor: "pointer" }}>
          {recommending && <circle cx="580" cy="191" r="20" fill="none" stroke="#82E2C2" strokeWidth="2" style={{ transformOrigin: "580px 191px", animation: "pu-scan 1.7s ease-out" }}/>}
          <circle cx="580" cy="191" r="31" fill="rgba(0,0,0,.28)"/>
          <circle cx="580" cy="191" r="31" fill="url(#cn-inset)"/>
          <circle cx="580" cy="191" r="31" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
          <circle cx="580" cy="191" r="26" fill="none" stroke="#8B7EE8" strokeOpacity=".22" strokeWidth="1" strokeDasharray="2 5"/>
          <circle cx="580" cy="191" r="18" fill="url(#cn-glass)" stroke="rgba(255,255,255,.14)" strokeWidth="1"/>
          <circle cx="580" cy="191" r="18" fill="url(#cn-bez)"/>
          <line x1="580" y1="178" x2="580" y2="186" stroke="#8B7EE8" strokeWidth="2.4" strokeLinecap="round"/>
          <text x="580" y="234" textAnchor="middle" fill="rgba(255,255,255,.3)" style={{ font: "600 7px ui-monospace,Menlo,monospace", letterSpacing: ".14em" }}>REC</text>
        </g>
        <g id="controls-detail">
          <circle cx="282" cy="90" r="1.6" fill="rgba(255,255,255,.2)"/>
          <circle cx="878" cy="90" r="1.6" fill="rgba(255,255,255,.2)"/>
          <circle cx="200" cy="112" r="1.6" fill="rgba(255,255,255,.16)"/>
          <circle cx="960" cy="112" r="1.6" fill="rgba(255,255,255,.16)"/>
          <circle cx="176" cy="250" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="200" cy="250" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="224" cy="250" r="6.5" fill="#8B7EE8" opacity=".55"/>
          <circle cx="176" cy="274" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="200" cy="274" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="224" cy="274" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <rect x="252" y="243" width="40" height="15" rx="7.5" fill="rgba(0,0,0,.28)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="260" cy="250.5" r="5" fill="rgba(255,255,255,.55)"/>
          <rect x="252" y="267" width="40" height="15" rx="7.5" fill="rgba(0,0,0,.28)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="284" cy="274.5" r="5" fill="#82E2C2" opacity=".7"/>
          <circle cx="984" cy="250" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="960" cy="250" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="936" cy="250" r="6.5" fill="#F5D06B" opacity=".5"/>
          <circle cx="984" cy="274" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="960" cy="274" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="936" cy="274" r="6.5" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <rect x="868" y="243" width="40" height="15" rx="7.5" fill="rgba(0,0,0,.28)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="900" cy="250.5" r="5" fill="rgba(255,255,255,.55)"/>
          <rect x="868" y="267" width="40" height="15" rx="7.5" fill="rgba(0,0,0,.28)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="876" cy="274.5" r="5" fill="#7FB4E8" opacity=".7"/>
          <rect x="512" y="182" width="16" height="16" rx="4" fill="rgba(0,0,0,.26)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="520" cy="190" r="3" fill="#9E96EE" opacity=".6"/>
          <rect x="632" y="182" width="16" height="16" rx="4" fill="rgba(0,0,0,.26)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="640" cy="190" r="3" fill="#82E2C2" opacity=".6"/>
          <ellipse cx="468" cy="302" rx="17" ry="6" fill="rgba(0,0,0,.34)"/>
          <rect x="460" y="286" width="16" height="12" rx="3" fill="url(#cn-inset)" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
          <rect x="445" y="250" width="5" height="48" rx="2.5" fill="rgba(0,0,0,.32)"/>
          <rect x="445" y="250" width="5" height="48" rx="2.5" fill="#8B7EE8" style={leverAFillStyle}/>
          <g onPointerDown={startLeverA} style={leverAStyle}>
            <rect x="464" y="250" width="8" height="48" rx="4" fill="url(#cn-bez)" stroke="rgba(255,255,255,.16)" strokeWidth="1"/>
            <circle cx="468" cy="248" r="12" fill="#d8c48a" stroke="rgba(120,96,40,.5)" strokeWidth="1"/>
            <circle cx="464" cy="244" r="3.6" fill="rgba(255,255,255,.7)"/>
          </g>
          <ellipse cx="692" cy="302" rx="17" ry="6" fill="rgba(0,0,0,.34)"/>
          <rect x="684" y="286" width="16" height="12" rx="3" fill="url(#cn-inset)" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
          <rect x="710" y="250" width="5" height="48" rx="2.5" fill="rgba(0,0,0,.32)"/>
          <rect x="710" y="250" width="5" height="48" rx="2.5" fill="#82E2C2" style={leverBFillStyle}/>
          <g onPointerDown={startLeverB} style={leverBStyle}>
            <rect x="688" y="250" width="8" height="48" rx="4" fill="url(#cn-bez)" stroke="rgba(255,255,255,.16)" strokeWidth="1"/>
            <circle cx="692" cy="248" r="12" fill="#d8c48a" stroke="rgba(120,96,40,.5)" strokeWidth="1"/>
            <circle cx="688" cy="244" r="3.6" fill="rgba(255,255,255,.7)"/>
          </g>
          <circle cx="884" cy="178" r="20" fill="rgba(0,0,0,.3)" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
          <circle cx="884" cy="178" r="20" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" strokeDasharray="1.5 5"/>
          <line x1="884" y1="178" x2="896" y2="170" stroke="#82E2C2" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="884" cy="178" r="2.4" fill="rgba(255,255,255,.6)"/>
          <rect x="244" y="166" width="58" height="26" rx="4" fill="rgba(0,0,0,.3)" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
          <path d="M248,179 L254,174 L260,183 L266,172 L272,181 L278,176 L284,182 L290,175 L296,179" fill="none" stroke="#8B7EE8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".8"/>
        </g>
      </svg>

      <div style={{ position: "absolute", left: "40.17%", top: "40%", width: "19.66%", height: "8%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, pointerEvents: "none" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B7EE8", animation: "pu-blink 1.4s ease-in-out infinite", flex: "none" }}></span>
        <span style={{ font: "600 9px ui-monospace,Menlo,monospace", letterSpacing: ".1em", color: "#9a97a8", whiteSpace: "nowrap" }}>{statusText}</span>
      </div>

      <button onClick={selectCurrent} style={{ position: "absolute", left: "29.31%", top: "55%", width: "16.55%", height: "17.33%", border: "none", padding: 0, background: "transparent", cursor: "pointer" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 13, background: "linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.03))", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 3px 7px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.2)", display: "flex", alignItems: "center", gap: 11, padding: "0 15px", boxSizing: "border-box", transition: "transform .15s ease,box-shadow .2s ease" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(255,255,255,.24)", flex: "none", transition: ".25s" }}></span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.22 }}>
            <span style={{ font: "600 13.5px system-ui", color: "#ECEBF0" }}>지금 이대로라면</span>
            <span style={{ font: "500 8.5px ui-monospace,Menlo,monospace", color: "#8f8c9c", letterSpacing: ".1em" }}>PLANET-01 · STRESS</span>
          </span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 2.5 }}>
            <i style={{ width: 1.5, height: 18, background: "rgba(255,255,255,.1)", display: "block" }}></i>
            <i style={{ width: 1.5, height: 18, background: "rgba(255,255,255,.1)", display: "block" }}></i>
            <i style={{ width: 1.5, height: 18, background: "rgba(255,255,255,.1)", display: "block" }}></i>
          </span>
          {leftOn && (
            <>
              <span style={{ position: "absolute", inset: 0, borderRadius: 13, border: "1.5px solid rgba(158,150,238,.65)", boxShadow: "inset 0 2px 7px rgba(0,0,0,.4),0 0 18px -4px rgba(158,150,238,.7)", pointerEvents: "none" }}></span>
              <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", width: 9, height: 9, borderRadius: "50%", background: "#9E96EE", boxShadow: "0 0 9px #9E96EE", pointerEvents: "none" }}></span>
            </>
          )}
        </div>
      </button>

      <button onClick={selectReduced} style={{ position: "absolute", left: "54.14%", top: "55%", width: "16.55%", height: "17.33%", border: "none", padding: 0, background: "transparent", cursor: "pointer" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 13, background: "linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.03))", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 3px 7px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.2)", display: "flex", alignItems: "center", gap: 11, padding: "0 15px", boxSizing: "border-box", transition: "transform .15s ease,box-shadow .2s ease" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(255,255,255,.24)", flex: "none", transition: ".25s" }}></span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.22 }}>
            <span style={{ font: "600 13.5px system-ui", color: "#ECEBF0" }}>조금 줄여본다면</span>
            <span style={{ font: "500 8.5px ui-monospace,Menlo,monospace", color: "#8f8c9c", letterSpacing: ".1em" }}>PLANET-02 · CALM</span>
          </span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 2.5 }}>
            <i style={{ width: 1.5, height: 18, background: "rgba(255,255,255,.1)", display: "block" }}></i>
            <i style={{ width: 1.5, height: 18, background: "rgba(255,255,255,.1)", display: "block" }}></i>
            <i style={{ width: 1.5, height: 18, background: "rgba(255,255,255,.1)", display: "block" }}></i>
          </span>
          {rightOn && (
            <>
              <span style={{ position: "absolute", inset: 0, borderRadius: 13, border: "1.5px solid rgba(130,226,194,.65)", boxShadow: "inset 0 2px 7px rgba(0,0,0,.4),0 0 18px -4px rgba(130,226,194,.7)", pointerEvents: "none" }}></span>
              <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", width: 9, height: 9, borderRadius: "50%", background: "#82E2C2", boxShadow: "0 0 9px #82E2C2", pointerEvents: "none" }}></span>
            </>
          )}
        </div>
      </button>
    </>
  );
}
