import { useId, useMemo } from 'react';

const SIL = "M100 38C148 38 174 76 172 120C171 146 158 162 150 162C141 162 139 172 126 172C116 172 114 162 100 162C86 162 84 172 74 172C61 172 59 162 50 162C42 162 29 146 28 120C26 76 52 38 100 38Z";
const BODY = { light: "#F4F5FA", base: "#DDE0EA", dark: "#C2C7D4", ink: "#4a4a58" };

export default function SpaceBlob({ size = 220, speaking = false, poked = false, onClick }) {
  const id = `sb${useId().replace(/:/g, '')}`;
  const sparkles = useMemo(() => ([
    { x: 30, y: 24, s: 8, d: "3.2s", delay: "0s" },
    { x: 168, y: 40, s: 6, d: "2.6s", delay: "0.6s" },
    { x: 182, y: 120, s: 5, d: "3.6s", delay: "1.1s" },
    { x: 20, y: 118, s: 6, d: "3s", delay: "0.3s" },
    { x: 150, y: 176, s: 4.5, d: "2.8s", delay: "0.9s" },
  ]), []);
  const dots = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    x: [46, 62, 140, 158, 96, 120, 176][i], y: [58, 182, 26, 150, 12, 190, 78][i],
    r: 1 + (i % 3) * 0.6, d: (2.5 + (i % 4)).toFixed(1), delay: (i * 0.5).toFixed(1),
  })), []);
  const S = size;

  const sparklePath = (cx, cy, s) =>
    `M${cx} ${cy - s} C${cx + s * 0.16} ${cy - s * 0.16} ${cx + s * 0.16} ${cy - s * 0.16} ${cx + s} ${cy} C${cx + s * 0.16} ${cy + s * 0.16} ${cx + s * 0.16} ${cy + s * 0.16} ${cx} ${cy + s} C${cx - s * 0.16} ${cy + s * 0.16} ${cx - s * 0.16} ${cy + s * 0.16} ${cx - s} ${cy} C${cx - s * 0.16} ${cy - s * 0.16} ${cx - s * 0.16} ${cy - s * 0.16} ${cx} ${cy - s} Z`;

  return (
    <div onClick={onClick} style={{ width: S, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "system-ui,-apple-system,sans-serif", cursor: onClick ? "pointer" : "default" }}>
      <style>{`
        @keyframes sb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes sb-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.03,.97)}}
        @keyframes sb-speak{0%,100%{transform:scale(1,1)}50%{transform:scale(1.045,.955)}}
        @keyframes sb-tw{0%,100%{opacity:.2;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes sb-dot{0%,100%{opacity:.2}50%{opacity:.9}}
        @keyframes sb-talk{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1.15)}}
        @keyframes sb-poke{0%,100%{transform:scale(1,1) translateY(0)}30%{transform:scale(1.15,0.85) translateY(12px)}60%{transform:scale(0.9,1.1) translateY(-6px)}}
      `}</style>
      <div style={{ position: "relative", width: S, height: S }}>
        <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ display: "block", overflow: "visible" }}>
          <defs>
            <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.6" /></filter>
            <filter id={`${id}-halo`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="11" /></filter>
            <radialGradient id={`${id}-b`} cx="42%" cy="30%" r="78%">
              <stop offset="0%" stopColor={BODY.light} /><stop offset="56%" stopColor={BODY.base} /><stop offset="100%" stopColor={BODY.dark} />
            </radialGradient>
          </defs>
          {dots.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#c9cfe0" style={{ animation: `sb-dot ${s.d}s ease-in-out ${s.delay}s infinite` }} />
          ))}
          <g style={{ animation: poked ? "sb-poke 0.45s cubic-bezier(.2,.8,.2,1)" : "sb-float 6s ease-in-out infinite" }}>
            <g style={{ animation: `${speaking ? "sb-speak 0.5s ease-in-out infinite" : "sb-breathe 4.5s ease-in-out infinite"}`, transformOrigin: "100px 176px" }}>
              <path d={SIL} fill="#E4E7F0" opacity="0.5" filter={`url(#${id}-halo)`} />
              <path d={SIL} fill={`url(#${id}-b)`} filter={`url(#${id}-soft)`} />
              <g opacity="0.9">
                <circle cx="86" cy="106" r="5" fill={BODY.ink} />
                <circle cx="114" cy="106" r="5" fill={BODY.ink} />
                {speaking ? (
                  <ellipse cx="100" cy="122" rx="6" ry="4" fill={BODY.ink} style={{ animation: "sb-talk 0.32s ease-in-out infinite", transformOrigin: "100px 122px" }} />
                ) : (
                  <path d="M93 120 Q100 125 107 120" stroke={BODY.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" />
                )}
              </g>
            </g>
          </g>
          {sparkles.map((s, i) => (
            <path key={i} d={sparklePath(s.x, s.y, s.s)} fill="#eef1f8"
              style={{ animation: `sb-tw ${s.d} ease-in-out ${s.delay} infinite`, transformOrigin: `${s.x}px ${s.y}px` }} />
          ))}
        </svg>
      </div>
    </div>
  );
}
