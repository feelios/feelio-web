import { useState, useEffect } from "react";

/* Feelio · 평행우주 → The Fork (서비스 디자인 정렬판)
 * 두 미래 = 감정 말랑이: 이대로면(스트레스) vs 줄이면(평온).
 * 슬라이더로 감정소비 절감 → 줄이면 궤적 실시간 분기 + 격차 fill.
 * 팔레트·말랑이·글래스·다크 톤 = EntryScreen/AiAnalysis와 동일. */

const SANS = "system-ui,-apple-system,'Apple SD Gothic Neo',sans-serif";
const EMO = {
  스트레스: { c: "#9E96EE", ink: "#4A4299", m: "frown" },
  평온: { c: "#82E2C2", ink: "#1E8562", m: "smile" },
  무덤덤: { c: "#C2C2CE", ink: "#5F5F6E", m: "line" },
};
const O = { x: 200, y: 300 }, CUR = { x: 726, y: 150 }, IF_STAY = 452000;
const MP = { smile: "M14 24 Q20 29 26 24", frown: "M14 27 Q20 23 26 27", line: "M15 25 L25 25" };

function Blob({ x, y, r, emo }) {
  const e = EMO[emo], gid = `tf-${emo}`, s = r / 20;
  return (
    <g>
      <circle cx={x} cy={y} r={r * 1.5} fill={e.c} opacity="0.28" filter="url(#tf-glow)" />
      <circle cx={x} cy={y} r={r} fill={`url(#${gid})`} />
      <g transform={`translate(${x - 20 * s},${y - 20 * s}) scale(${s})`}>
        <circle cx="15" cy="18" r="2.4" fill={e.ink} /><circle cx="25" cy="18" r="2.4" fill={e.ink} />
        <path d={MP[e.m]} stroke={e.ink} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

export default function TheFork({ selectedUniverse }) {
  const [manualReduce, setManualReduce] = useState(30);
  const targetReduce = selectedUniverse === 'current' ? 0 : selectedUniverse === 'alt' ? 50 : manualReduce;
  const [reduce, setReduce] = useState(targetReduce);

  useEffect(() => {
    let frameId;
    const animate = () => {
      setReduce(prev => {
        const diff = targetReduce - prev;
        if (Math.abs(diff) < 0.1) return targetReduce;
        frameId = requestAnimationFrame(animate);
        return prev + diff * 0.12;
      });
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [targetReduce]);
  const ifSave = Math.round(IF_STAY * (1 - (reduce / 100) * 0.62));
  const gap = IF_STAY - ifSave;
  const daysFaster = Math.round(reduce * 1.6);
  const savedY = 300 + reduce * 1.9;
  const SAV = { x: 690, y: savedY };
  const won = (n) => n.toLocaleString();
  const ST = EMO.스트레스.c, CA = EMO.평온.c;

  const curPath = `M${O.x} ${O.y} Q 520 ${O.y} ${CUR.x} ${CUR.y}`;
  const savPath = `M${O.x} ${O.y} Q 500 ${O.y} ${SAV.x} ${SAV.y}`;
  const gapPath = `M${O.x} ${O.y} Q 520 ${O.y} ${CUR.x} ${CUR.y} L${SAV.x} ${SAV.y} Q 500 ${O.y} ${O.x} ${O.y} Z`;
  const orbits = [90, 165, 250, 350, 460];
  const stars = [[120, 90], [340, 70], [610, 90], [840, 130], [110, 470], [420, 500], [780, 470], [900, 300], [560, 460]];

  return (
    <div style={{ fontFamily: SANS, position: "relative", overflow: "hidden", borderRadius: 22,
      border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(18px)",
      background: `radial-gradient(1000px 460px at 78% 118%, ${CA}1f 0%, transparent 60%), radial-gradient(760px 420px at 84% 8%, ${ST}1a 0%, transparent 58%), linear-gradient(160deg,#14151d,#0c0d14)`,
      padding: "clamp(16px,2vw,22px)", color: "#eef0f8", boxShadow: "0 20px 60px rgba(0,0,0,.42)" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ letterSpacing: "0.16em", fontSize: 11, fontWeight: 700, color: selectedUniverse === 'current' ? ST : selectedUniverse === 'alt' ? CA : "#7f86a0" }}>
            {selectedUniverse === 'current' ? 'CURRENT UNIVERSE' : selectedUniverse === 'alt' ? 'ALTERNATIVE UNIVERSE' : 'PARALLEL UNIVERSE'}
          </div>
          <div style={{ fontSize: "clamp(15px,1.8vw,18px)", fontWeight: 800, letterSpacing: "-0.02em", marginTop: 5 }}>
            {selectedUniverse === 'current' ? '이대로 소비하면 이렇게 흘러가요' : selectedUniverse === 'alt' ? '감정소비를 줄인 긍정적인 미래' : '미래는 지금 갈라지고 있어요'}
          </div>
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#7f86a0" }}>FIG.01 · THE FORK</div>
      </div>

      <svg viewBox="0 0 1000 560" width="100%" height="330" preserveAspectRatio="xMidYMid meet" style={{ display: "block", marginTop: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="tf-스트레스" cx="42%" cy="36%" r="58%"><stop offset="0%" stopColor={ST} /><stop offset="52%" stopColor={ST} stopOpacity="0.85" /><stop offset="100%" stopColor={ST} stopOpacity="0.55" /></radialGradient>
          <radialGradient id="tf-평온" cx="42%" cy="36%" r="58%"><stop offset="0%" stopColor={CA} /><stop offset="52%" stopColor={CA} stopOpacity="0.9" /><stop offset="100%" stopColor={CA} stopOpacity="0.6" /></radialGradient>
          <radialGradient id="tf-무덤덤" cx="42%" cy="36%" r="58%"><stop offset="0%" stopColor="#EAEAF0" /><stop offset="55%" stopColor={EMO.무덤덤.c} /><stop offset="100%" stopColor="#9A9AA6" /></radialGradient>
          <linearGradient id="tf-gap" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ST} stopOpacity="0.2" /><stop offset="100%" stopColor={CA} stopOpacity="0.06" /></linearGradient>
          <filter id="tf-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>

        {stars.map(([x, y], i) => <text key={i} x={x} y={y} fill="#31333f" fontSize="12">+</text>)}
        <g stroke="rgba(255,255,255,0.07)" fill="none">
          {orbits.map((r, i) => <ellipse key={i} cx={O.x} cy={O.y} rx={r} ry={r * 0.4} />)}
          {Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return <line key={i} x1={O.x} y1={O.y} x2={O.x + 470 * Math.cos(a)} y2={O.y + 190 * Math.sin(a)} />; })}
        </g>

        <path d={gapPath} fill="url(#tf-gap)" />
        <path d={curPath} fill="none" stroke={ST} strokeWidth="2" strokeDasharray="1 7" opacity="0.85" />
        <path d={savPath} fill="none" stroke={CA} strokeWidth="4" filter="url(#tf-glow)" opacity="0.5" />
        <path d={savPath} fill="none" stroke={CA} strokeWidth="2.6" />

        {/* 지금 */}
        <Blob x={O.x} y={O.y} r={15} emo="무덤덤" />
        <text x={O.x} y={O.y + 38} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#aeb4c8">지금</text>

        {/* 이대로면 = 스트레스 */}
        <Blob x={CUR.x} y={CUR.y} r={16} emo="스트레스" />
        <polyline points={`${CUR.x + 16},${CUR.y - 8} ${CUR.x + 58},${CUR.y - 40} ${CUR.x + 150},${CUR.y - 40}`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <text x={CUR.x + 64} y={CUR.y - 48} fontSize="11.5" fontWeight="700" fill={ST}>이대로면 · 스트레스</text>
        <text x={CUR.x + 64} y={CUR.y - 26} fontSize="17" fontWeight="800" fill="#fff">{won(IF_STAY)}원</text>

        {/* 줄이면 = 평온 */}
        <Blob x={SAV.x} y={SAV.y} r={18} emo="평온" />
        <polyline points={`${SAV.x + 17},${SAV.y + 6} ${SAV.x + 55},${SAV.y + 34} ${SAV.x + 150},${SAV.y + 34}`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <text x={SAV.x + 62} y={SAV.y + 30} fontSize="11.5" fontWeight="700" fill={CA}>줄이면 · 평온</text>
        <text x={SAV.x + 62} y={SAV.y + 52} fontSize="17" fontWeight="800" fill="#fff">{won(ifSave)}원</text>

        {/* 격차 배지 */}
        <g transform={`translate(455,${(CUR.y + savedY) / 2})`}>
          <rect x="-90" y="-18" width="180" height="36" rx="18" fill={`${CA}1f`} stroke={`${CA}73`} />
          <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="800" fill={CA}>격차 {won(gap)}원</text>
        </g>

        <text x="40" y="540" fontSize="34" fontWeight="800" fill="rgba(255,255,255,0.05)">01</text>
        <g transform="translate(900,528)" stroke="#33353f" fill="#5a6079">
          <line x1="-70" y1="0" x2="0" y2="0" /><line x1="-70" y1="-4" x2="-70" y2="4" /><line x1="0" y1="-4" x2="0" y2="4" />
          <text x="-70" y="18" fontSize="10" fill="#5a6079">0 ────── 12개월</text>
        </g>
      </svg>

      {/* 슬라이더 */}
      <div style={{ marginTop: 2, padding: "12px 15px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9, flexWrap: "wrap", gap: 6 }}>
          {selectedUniverse === 'current' ? (
            <>
              <div style={{ fontSize: 13.5, color: "#c3c8da" }}>감정소비를 <b style={{ color: ST, fontSize: 18 }}>유지</b>하면</div>
              <div style={{ fontSize: 12.5, color: "#8a90a6" }}>변화 없이 돈이 <b style={{ color: ST }}>빠져나갑니다</b></div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13.5, color: "#c3c8da" }}>감정소비를 <b style={{ color: CA, fontSize: 18 }}>{reduce}%</b> 줄이면</div>
              <div style={{ fontSize: 12.5, color: "#8a90a6" }}>목표 <b style={{ color: CA }}>{daysFaster}일</b> 단축 · 아끼는 돈 <b style={{ color: "#fff" }}>{won(gap)}원</b></div>
            </>
          )}
        </div>
        <input type="range" min="0" max="50" value={reduce} onChange={(e) => setManualReduce(+e.target.value)} aria-label="감정소비 절감 비율" style={{ width: "100%", accentColor: CA, cursor: "pointer", opacity: selectedUniverse ? 0.7 : 1 }} disabled={!!selectedUniverse} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#5a6079", marginTop: 4 }}>
          <span>지금 그대로</span><span>감정소비 절반으로</span>
        </div>
      </div>
    </div>
  );
}
