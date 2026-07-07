import { useId, useMemo } from 'react';

const TONES = {
  stress: { name: "스트레스", accent: "#8A6FE0", blobs: ["#8A6FE0", "#6E7BE0", "#B57BE8", "#F0726A", "#5E45AE", "#C2A4F0"], streaks: ["#B9A6FF", "#7A6BD6", "#F48BB5", "#6E7BE0"] },
  calm:   { name: "평온",   accent: "#5FC9A8", blobs: ["#73D2B2", "#4FD6C4", "#A6E8D2", "#8FB4FF", "#469B7E", "#C2E8DE"], streaks: ["#8FE8D6", "#5FC9A8", "#8FB4FF", "#B9E8DA"] },
};

function seeded(seed) { let s = seed; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }

export default function UniversePlanet({ tone = "stress", size = 280, label, sublabel }) {
  const t = TONES[tone] || TONES.stress;
  const id = `up${useId().replace(/:/g, '')}`;
  const S = size;

  const { blobs } = useMemo(() => {
    const rnd = seeded(tone === "calm" ? 91 : 37);
    const blobs = Array.from({ length: 26 }, () => {
      const a = rnd() * Math.PI * 2;
      const rr = rnd();
      const r = Math.sqrt(rr) * 84;
      const nx = Math.cos(a) * r, ny = Math.sin(a) * r;
      const edge = r / 84;
      const foreshorten = 1 - edge * 0.75;
      const base = 22 + rnd() * 26;
      const tangent = (a * 180 / Math.PI) + 90;
      return {
        x: 100 + nx, y: 100 + ny,
        rx: base * (0.85 + rnd() * 0.5),
        ry: base * (0.75 + rnd() * 0.4) * foreshorten,
        rot: tangent,
        c: t.blobs[(rnd() * t.blobs.length) | 0],
        o: (0.22 + rnd() * 0.3) * (1 - edge * 0.3),
      };
    });
    return { blobs };
  }, [tone, t.blobs]);

  return (
    <div style={{ width: S, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes up-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}`}</style>
      <div style={{ animation: "up-float 7s ease-in-out infinite" }}>
        <svg width={S} height={S} viewBox="0 0 200 200" style={{ display: "block" }}>
          <defs>
            <radialGradient id={`${id}-base`} cx="50%" cy="52%" r="52%">
              <stop offset="0%" stopColor="#fbfaf7" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#f2f0ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#eae7e6" stopOpacity="0.85" />
            </radialGradient>
            <radialGradient id={`${id}-fade`} cx="50%" cy="50%" r="50%">
              <stop offset="82%" stopColor="#fff" stopOpacity="1" />
              <stop offset="97%" stopColor="#fff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-shade`} cx="40%" cy="32%" r="72%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="45%" stopColor="#f0eef4" stopOpacity="1" />
              <stop offset="80%" stopColor="#c9c5d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#8f8aa0" stopOpacity="1" />
            </radialGradient>
            <radialGradient id={`${id}-term`} cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#1a1826" stopOpacity="0" />
              <stop offset="100%" stopColor="#1a1826" stopOpacity="0.55" />
            </radialGradient>
            <mask id={`${id}-m`}><circle cx="100" cy="100" r="86" fill={`url(#${id}-fade)`} /></mask>
            <filter id={`${id}-blur`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" /></filter>
            <clipPath id={`${id}-c`}><circle cx="100" cy="100" r="86" /></clipPath>
          </defs>
          <g mask={`url(#${id}-m)`}>
            <circle cx="100" cy="100" r="86" fill={`url(#${id}-base)`} />
            <g clipPath={`url(#${id}-c)`}>
              <g filter={`url(#${id}-blur)`} style={{ mixBlendMode: "multiply" }}>
                {blobs.map((b, i) => <ellipse key={i} cx={b.x} cy={b.y} rx={b.rx} ry={b.ry} fill={b.c} opacity={b.o} transform={`rotate(${b.rot} ${b.x} ${b.y})`} />)}
              </g>
              <ellipse cx="78" cy="66" rx="40" ry="30" fill="#ffffff" opacity="0.3" filter={`url(#${id}-blur)`} />
              <circle cx="100" cy="100" r="86" fill={`url(#${id}-shade)`} style={{ mixBlendMode: "multiply" }} />
              <circle cx="100" cy="100" r="86" fill={`url(#${id}-term)`} />
            </g>
          </g>
        </svg>
      </div>
      {label && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{label}</div>
          {sublabel && <div style={{ color: t.accent, fontSize: 12, fontWeight: 500, marginTop: 2 }}>{sublabel}</div>}
        </div>
      )}
    </div>
  );
}
