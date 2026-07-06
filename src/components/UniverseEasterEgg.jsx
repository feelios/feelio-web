import React, { useMemo } from 'react';

export default function UniverseEasterEgg({ eggPct, calc, eggDistA, eggTimeA, eggDistB, eggTimeB, eggCurv }) {
  const { rings, mers, arcS, arcC, O, S, C } = useMemo(() => {
    var cx = 430, cy = 248, ty = 0.5, R0 = 95, D = 175;
    var proj = (r, th) => [cx + r * Math.cos(th), cy + r * Math.sin(th) * ty + D / (1 + Math.pow(r / R0, 2))];
    var rings = [], mers = [], radii = [];
    for (var r = 48; r <= 384; r += 42) radii.push(r);
    radii.forEach(rr => {
      var d = "";
      for (var i = 0; i <= 64; i++) { var th = i / 64 * 2 * Math.PI, p = proj(rr, th); d += (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }
      rings.push(d + "Z");
    });
    for (var a = 0; a < 24; a++) {
      var th = a / 24 * 2 * Math.PI, d = "";
      for (var k = 0; k < radii.length; k++) { var p = proj(radii[k], th); d += (k ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }
      mers.push(d);
    }
    var O = proj(85, 90 * Math.PI / 180), S = proj(320, 212 * Math.PI / 180), C = proj(322, -40 * Math.PI / 180);
    var mkArc = (a, b) => "M" + a[0].toFixed(1) + "," + a[1].toFixed(1) + " Q" + ((a[0] + b[0]) / 2).toFixed(1) + "," + (Math.min(a[1], b[1]) - 70).toFixed(1) + " " + b[0].toFixed(1) + "," + b[1].toFixed(1);
    return {
      rings, mers, arcS: mkArc(O, S), arcC: mkArc(O, C),
      O, S, C
    };
  }, []);

  const eggEqs = useMemo(() => {
    const raw = [
      ["E = mc²", "left:5%;top:12%", "600 14px", "rgba(160,185,242,.72)", ".0s"],
      ["Gμν + Λgμν = (8πG/c⁴) Tμν", "right:4%;top:9%;textAlign:right", "600 13px", "rgba(178,155,236,.7)", ".5s"],
      ["iℏ ∂Ψ/∂t = ĤΨ", "left:6%;bottom:13%", "600 13px", "rgba(120,205,175,.7)", ".9s"],
      ["γ = 1 / √(1 − v²/c²)", "right:5%;bottom:15%;textAlign:right", "600 13px", "rgba(160,185,242,.7)", "1.3s"],
      ["ds² = −c²dt² + a(t)² dxⁱdxʲ", "left:3.5%;top:45%", "600 12px", "rgba(178,155,236,.62)", ".7s"],
      ["∇²φ = 4πGρ", "right:6%;top:47%;textAlign:right", "600 12px", "rgba(120,205,175,.62)", "1.1s"],
      ["|Ψ⟩ = α|우주₁⟩ + β|우주₂⟩", "left:50%;top:16%;transform:translateX(-50%)", "700 13px", "rgba(206,214,255,.8)", ".3s"],
      ["for (u of universes) solve(geodesic(u))", "left:8%;top:30%", "500 11px", "rgba(150,168,210,.42)", "1.5s"],
      ["Δv = ∫ a·dt", "right:9%;top:31%;textAlign:right", "500 11px", "rgba(150,168,210,.42)", "1.8s"],
      ["P(우주₂) = |β|²", "left:12%;bottom:27%", "600 12px", "rgba(178,155,236,.6)", "2.1s"],
      ["κ = R_μν − ½R g_μν", "right:11%;bottom:27%;textAlign:right", "600 12px", "rgba(120,205,175,.6)", ".6s"],
    ];
    return raw.map((e, i) => {
      const styles = Object.fromEntries(e[1].split(';').map(s => { const [k,v]=s.split(':'); return k?[k.trim(), v.trim()]:null; }).filter(Boolean));
      return { id: i, t: e[0], style: { position:"absolute", whiteSpace:"nowrap", fontFamily:"ui-monospace,Menlo,monospace", letterSpacing:".03em", animation:"pu-eqfloat 5s ease-in-out infinite", ...styles, fontWeight: e[2].split(" ")[0], fontSize: e[2].split(" ")[1], color: e[3], animationDelay: e[4] } };
    });
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 30, background: "radial-gradient(78% 68% at 50% 44%,rgba(9,8,19,.95),rgba(4,4,9,.99))", overflow: "hidden", animation: "pu-arrive .4s ease" }}>
      {eggEqs.map(eq => (
        <div key={eq.id} style={eq.style}>{eq.t}</div>
      ))}
      <svg viewBox="0 0 900 520" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", animation: "pu-welldraw 1.1s ease" }}>
        <defs>
          <radialGradient id="pw-cur" cx="38%" cy="34%"><stop offset="0" stopColor="#cabff6"/><stop offset="1" stopColor="#6a58c6"/></radialGradient>
          <radialGradient id="pw-oth" cx="38%" cy="34%"><stop offset="0" stopColor="#c3f2df"/><stop offset="1" stopColor="#3ba184"/></radialGradient>
          <linearGradient id="pw-arc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a99bec"/><stop offset="1" stopColor="#5cc6a3"/></linearGradient>
          <radialGradient id="pw-now" cx="38%" cy="34%"><stop offset="0" stopColor="#f3f0fb"/><stop offset="1" stopColor="#b9b2d6"/></radialGradient>
        </defs>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-12 430 262;-9 430 262;-12 430 262" dur="10s" repeatCount="indefinite"/>
          <g fill="none" stroke="rgba(150,168,228,.28)" strokeWidth="1">
            {mers.map((d, i) => <path key={`mer-${i}`} d={d}></path>)}
          </g>
          <g fill="none" stroke="rgba(178,192,246,.46)" strokeWidth="1.1">
            {rings.map((d, i) => <path key={`rng-${i}`} d={d}></path>)}
          </g>

          <path id="pu-arcS" d={arcS} fill="none" stroke="#b6a6ef" strokeWidth="1.8" strokeDasharray="5 7" opacity=".9"></path>
          <path id="pu-arcC" d={arcC} fill="none" stroke="#5cc6a3" strokeWidth="1.8" strokeDasharray="5 7" opacity=".9"></path>

          <ellipse cx={O[0].toFixed(1)} cy={(O[1] + 7).toFixed(1)} rx="18" ry="5" fill="rgba(0,0,0,.45)"></ellipse>
          <circle cx={O[0].toFixed(1)} cy={O[1].toFixed(1)} r="12" fill="url(#pw-now)"></circle>
          <text x={O[0].toFixed(1)} y={(O[1] + 26).toFixed(1)} textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="11" fontWeight="700" fill="#e7e3f2">현재 우주</text>

          <ellipse cx={S[0].toFixed(1)} cy={(S[1] + 13).toFixed(1)} rx="33" ry="8.5" fill="rgba(0,0,0,.45)"></ellipse>
          <circle cx={S[0].toFixed(1)} cy={S[1].toFixed(1)} r="25" fill="url(#pw-cur)"></circle>
          <text x={S[0].toFixed(1)} y={(S[1] - 34).toFixed(1)} textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="11.5" fontWeight="700" fill="#cabff6">지금처럼 소비한 나</text>

          <ellipse cx={C[0].toFixed(1)} cy={(C[1] + 13).toFixed(1)} rx="33" ry="8.5" fill="rgba(0,0,0,.45)"></ellipse>
          <circle cx={C[0].toFixed(1)} cy={C[1].toFixed(1)} r="25" fill="url(#pw-oth)"></circle>
          <text x={C[0].toFixed(1)} y={(C[1] - 34).toFixed(1)} textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="11.5" fontWeight="700" fill="#c3f2df">감정소비를 줄인 나</text>

          <g>
            <ellipse rx="8.5" ry="4.2" fill="#e9e5f6"></ellipse>
            <ellipse cx="0" cy="-2.2" rx="4.8" ry="3.9" fill="#d7ccf6"></ellipse>
            <animateMotion dur="2.8s" repeatCount="indefinite" calcMode="linear"><mpath href="#pu-arcS"></mpath></animateMotion>
          </g>
          <g>
            <ellipse rx="8.5" ry="4.2" fill="#e9e5f6"></ellipse>
            <ellipse cx="0" cy="-2.2" rx="4.8" ry="3.9" fill="#ccf0e0"></ellipse>
            <animateMotion dur="2.8s" begin="0.5s" repeatCount="indefinite" calcMode="linear"><mpath href="#pu-arcC"></mpath></animateMotion>
          </g>
        </g>
      </svg>

      <div style={{ position: "absolute", left: "50%", top: "7%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ font: "700 12px ui-monospace,Menlo,monospace", letterSpacing: ".2em", color: "#ECEBF0" }}>시공간 곡률 연산 · {eggPct}%</div>
        <div style={{ font: "500 9px ui-monospace,Menlo,monospace", letterSpacing: ".14em", color: "#8f8c9c", marginTop: 5 }}>SPACETIME CURVATURE · GEODESIC SOLVER</div>
      </div>

      <div style={{ position: "absolute", left: "50%", bottom: "7%", transform: "translateX(-50%)", display: "flex", gap: 11 }}>
        <div style={{ padding: "9px 15px", borderRadius: 11, background: "rgba(122,98,214,.12)", border: "1px solid rgba(122,98,214,.34)" }}>
          <div style={{ font: "600 8.5px ui-monospace,Menlo,monospace", letterSpacing: ".1em", color: "#c6b9f2" }}>지금처럼 소비한 나</div>
          <div style={{ font: "700 15px ui-monospace,Menlo,monospace", color: "#ECEBF0", marginTop: 3 }}>{eggDistA} <span style={{ fontSize: 9.5, color: "#8f8c9c" }}>광년</span> · {eggTimeA}<span style={{ fontSize: 9.5, color: "#8f8c9c" }}>시간</span></div>
        </div>
        <div style={{ padding: "9px 15px", borderRadius: 11, background: "rgba(59,161,132,.12)", border: "1px solid rgba(59,161,132,.34)" }}>
          <div style={{ font: "600 8.5px ui-monospace,Menlo,monospace", letterSpacing: ".1em", color: "#a7e6cf" }}>감정소비를 줄인 나</div>
          <div style={{ font: "700 15px ui-monospace,Menlo,monospace", color: "#ECEBF0", marginTop: 3 }}>{eggDistB} <span style={{ fontSize: 9.5, color: "#8f8c9c" }}>광년</span> · {eggTimeB}<span style={{ fontSize: 9.5, color: "#8f8c9c" }}>시간</span></div>
        </div>
        <div style={{ padding: "9px 15px", borderRadius: 11, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.16)" }}>
          <div style={{ font: "600 8.5px ui-monospace,Menlo,monospace", letterSpacing: ".1em", color: "#c9c6d4" }}>시공간 곡률 κ</div>
          <div style={{ font: "700 15px ui-monospace,Menlo,monospace", color: "#ECEBF0", marginTop: 3 }}>{eggCurv}<span style={{ fontSize: 9.5, color: "#8f8c9c" }}> m⁻²</span></div>
        </div>
      </div>
    </div>
  );
}
