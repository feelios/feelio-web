import { useEffect, useRef, useState } from 'react';

const EMOTIONS = {
  신남: { core: '#FF9DC4', light: '#FFF0F6', accent: '#FFC49A', ink: '#B84B7C', face: 'excited' },
  설렘: { core: '#E191DD', light: '#FBEEFA', accent: '#F3C6EF', ink: '#8E3E86', face: 'flutter' },
  뿌듯함: { core: '#FFC978', light: '#FFF6E6', accent: '#FFE3A0', ink: '#B5701E', face: 'proud' },
  스트레스: { core: '#9E96EE', light: '#ECEAFB', accent: '#B4AAF2', ink: '#4A4299', face: 'stress' },
  외로움: { core: '#86C9FF', light: '#EAF6FF', accent: '#AEE2E6', ink: '#2A6BA8', face: 'lonely' },
  화남: { core: '#FF8F89', light: '#FFEEEC', accent: '#FFB27E', ink: '#B54641', face: 'angry' },
  평온: { core: '#82E2C2', light: '#ECFBF4', accent: '#CBEEA0', ink: '#1E8562', face: 'calm' },
  무덤덤: { core: '#C2C2CE', light: '#F0F0F4', accent: '#D0C8D8', ink: '#5F5F6E', face: 'numb' }
};

const ALIASES = {
  즐거움: '신남',
  기쁨: '신남',
  불안: '스트레스',
  분노: '화남',
  자랑: '뿌듯함',
  뿌듯: '뿌듯함',
  우울: '외로움',
  고요: '평온'
};

const SILHOUETTE =
  'M100 38C148 38 174 76 172 120C171 146 158 162 150 162C141 162 139 172 126 172C116 172 114 162 100 162C86 162 84 172 74 172C61 172 59 162 50 162C42 162 29 146 28 120C26 76 52 38 100 38Z';

let uid = 0;

function normalizeEmotion(emotion) {
  return EMOTIONS[emotion] ? emotion : ALIASES[emotion] || '평온';
}

function Face({ face, ink }) {
  const stroke = {
    stroke: ink,
    strokeWidth: 2.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
    opacity: 0.9
  };
  const eye = (cx, cy, r = 4.4) => <circle cx={cx} cy={cy} r={r} fill={ink} opacity="0.92" />;
  const blush = (opacity = 0.5, color = '#ffffff') => (
    <>
      <ellipse cx="77" cy="118" rx="7" ry="4" fill={color} opacity={opacity} />
      <ellipse cx="123" cy="118" rx="7" ry="4" fill={color} opacity={opacity} />
    </>
  );
  const mouthAnim = {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    animation: 'eb-mouth2 3s ease-in-out infinite'
  };
  const lx = 88;
  const rx = 112;
  const ey = 106;

  switch (face) {
    case 'excited':
      return (
        <g>
          {blush(0.5)}
          {eye(lx, ey, 3.8)}
          {eye(rx, ey, 3.8)}
          <path
            d="M93 114 L107 114 L104 118 Q100 126 96 118 Z"
            fill={ink}
            opacity="0.9"
            style={{ transformBox: 'fill-box', transformOrigin: 'center top', animation: 'eb-mouth 3.4s ease-in-out infinite' }}
          />
        </g>
      );
    case 'flutter':
      return (
        <g>
          {blush(0.72, '#F4B4E4')}
          {eye(lx, ey - 2, 4.2)}
          {eye(rx, ey - 2, 4.2)}
          <path d="M96 117 Q100 120 104 117" {...stroke} strokeWidth="2.4" style={mouthAnim} />
        </g>
      );
    case 'proud':
      return (
        <g>
          {blush(0.45)}
          <path d="M83 106 Q88 101 93 106" {...stroke} />
          <path d="M107 106 Q112 101 117 106" {...stroke} />
          <path d="M95 116 Q100 121 105 116" {...stroke} style={mouthAnim} />
        </g>
      );
    case 'stress':
      return (
        <g>
          {eye(lx, ey, 3.8)}
          {eye(rx, ey, 3.8)}
          <path d="M83 100 Q88 98 92 100" {...stroke} strokeWidth="2.1" />
          <path d="M108 100 Q112 98 117 100" {...stroke} strokeWidth="2.1" />
          <path d="M95 119 q2.5 -2.4 5 0 t5 0" {...stroke} strokeWidth="2.4" style={mouthAnim} />
        </g>
      );
    case 'lonely':
      return (
        <g>
          {blush(0.4)}
          {eye(lx, ey, 4.4)}
          {eye(rx, ey, 4.4)}
          <path d="M95 121 Q100 117 105 121" {...stroke} strokeWidth="2.5" style={mouthAnim} />
        </g>
      );
    case 'angry':
      return (
        <g>
          <path d="M82 101 L92 104" {...stroke} strokeWidth="2.8" />
          <path d="M118 101 L108 104" {...stroke} strokeWidth="2.8" />
          {eye(lx, ey + 1, 4)}
          {eye(rx, ey + 1, 4)}
          <path d="M96 120 Q100 116 104 120" {...stroke} strokeWidth="2.6" style={mouthAnim} />
        </g>
      );
    case 'calm':
      return (
        <g>
          {blush(0.4)}
          <path d="M83 105 Q88 109 93 105" {...stroke} />
          <path d="M107 105 Q112 109 117 105" {...stroke} />
          <path d="M95 115 Q100 119.5 105 115" {...stroke} style={mouthAnim} />
        </g>
      );
    case 'numb':
      return (
        <g>
          {eye(lx, ey, 3.4)}
          {eye(rx, ey, 3.4)}
          <path d="M96 119 L104 119" {...stroke} strokeWidth="2.6" style={mouthAnim} />
        </g>
      );
    default:
      return null;
  }
}

export function EmotionBlob({ emotion = '평온', size = 140, interactive = true, onDragChange }) {
  const emotionName = normalizeEmotion(emotion);
  const meta = EMOTIONS[emotionName];
  const idRef = useRef(`eb${uid++}`);
  const turbulenceRef = useRef(null);
  const squishTimer = useRef(null);
  const physicsRef = useRef({ val: 1, vel: 0 });
  const lastDragDistRef = useRef(0);
  const prevEmotion = useRef(emotionName);
  const [squishing, setSquishing] = useState(false);
  const [springScale, setSpringScale] = useState({ x: 1, y: 1 });
  const [drag, setDrag] = useState({ isDragging: false, startX: 0, startY: 0, dx: 0, dy: 0 });

  useEffect(() => {
    if (prevEmotion.current !== emotionName) {
      prevEmotion.current = emotionName;
      poke();
    }
  }, [emotionName]);

  // 드래그(늘리기) 값을 외부로 노출 → 말풍선 등 주변 요소가 함께 반응
  useEffect(() => {
    onDragChange?.({ dx: drag.dx, dy: drag.dy, isDragging: drag.isDragging });
  }, [drag.dx, drag.dy, drag.isDragging, onDragChange]);

  useEffect(() => {
    let frame;
    let last = 0;
    let t = 0;

    function tick(now) {
      if (now - last > 60) {
        last = now;
        t += 0.05;
        const f = 0.011 + 0.004 * Math.sin(t * 0.6);
        turbulenceRef.current?.setAttribute('baseFrequency', `${f.toFixed(4)} ${(f * 1.15).toFixed(4)}`);
      }
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let frame;

    function tick() {
      if (!drag.isDragging) {
        const k = 0.15;
        const damping = 0.77;
        const force = (1 - physicsRef.current.val) * k;
        physicsRef.current.vel = (physicsRef.current.vel + force) * damping;
        physicsRef.current.val += physicsRef.current.vel;
        const y = physicsRef.current.val;
        const x = 1 + (1 - y) * 0.75;
        setSpringScale({ x, y });
      }
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [drag.isDragging]);

  useEffect(() => {
    if (!drag.isDragging) return undefined;

    function clampDrag(clientX, clientY) {
      const dx = clientX - drag.startX;
      const dy = clientY - drag.startY;
      const dist = Math.hypot(dx, dy);
      const maxDist = 140;

      if (dist > maxDist) {
        const angle = Math.atan2(dy, dx);
        setDrag(prev => ({
          ...prev,
          dx: Math.cos(angle) * maxDist,
          dy: Math.sin(angle) * maxDist
        }));
        return;
      }

      setDrag(prev => ({ ...prev, dx, dy }));
    }

    function releaseDrag() {
      setDrag(prev => {
        if (prev.isDragging) {
          const dist = Math.hypot(prev.dx, prev.dy);
          lastDragDistRef.current = dist;
          physicsRef.current.val = 1 - Math.min(0.25, dist * 0.0018);
          physicsRef.current.vel = Math.min(0.2, dist * 0.0035);
        }
        return { isDragging: false, startX: 0, startY: 0, dx: 0, dy: 0 };
      });
    }

    const onMouseMove = event => clampDrag(event.clientX, event.clientY);
    const onTouchMove = event => {
      if (event.touches.length) clampDrag(event.touches[0].clientX, event.touches[0].clientY);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', releaseDrag);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', releaseDrag);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', releaseDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', releaseDrag);
    };
  }, [drag.isDragging, drag.startX, drag.startY]);

  function poke() {
    physicsRef.current.val = 0.68;
    physicsRef.current.vel = -0.16;
    setSquishing(false);
    requestAnimationFrame(() => {
      setSquishing(true);
      clearTimeout(squishTimer.current);
      squishTimer.current = setTimeout(() => setSquishing(false), 620);
    });
  }

  function startDrag(clientX, clientY) {
    if (!interactive) return;
    lastDragDistRef.current = 0;
    setDrag({ isDragging: true, startX: clientX, startY: clientY, dx: 0, dy: 0 });
  }

  const width = size;
  const height = size * 1.025;
  const id = idRef.current;
  const dragDist = Math.hypot(drag.dx, drag.dy);
  const dragAngle = dragDist > 0 ? Math.atan2(drag.dy, drag.dx) : 0;
  const dragStretchX = 1 + dragDist * 0.0022;
  const dragStretchY = Math.max(0.65, 1 - dragDist * 0.0012);
  const physicsTransform = drag.isDragging
    ? `translate(${drag.dx * 0.38}px, ${drag.dy * 0.38}px) rotate(${dragAngle}rad) scaleX(${dragStretchX}) scaleY(${dragStretchY}) rotate(${-dragAngle}rad)`
    : `scaleX(${springScale.x}) scaleY(${springScale.y})`;

  return (
    <div
      onMouseDown={event => startDrag(event.clientX, event.clientY)}
      onTouchStart={event => {
        if (event.touches.length) startDrag(event.touches[0].clientX, event.touches[0].clientY);
      }}
      onClick={interactive ? () => {
        if (lastDragDistRef.current < 5) poke();
        window.setTimeout(() => { lastDragDistRef.current = 0; }, 0);
      } : undefined}
      style={{
        width,
        height,
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        animation: 'eb-float 5s ease-in-out infinite',
        userSelect: 'none',
        touchAction: interactive ? 'none' : 'auto'
      }}
      aria-label={`${emotionName} 말랑이`}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '50% 88%',
          transform: physicsTransform,
          transition: drag.isDragging ? 'none' : 'transform 0.06s linear'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: '50% 88%',
            animation: squishing ? 'eb-squish .6s cubic-bezier(.2,.8,.2,1)' : 'eb-breathe 4s ease-in-out infinite'
          }}
        >
          <svg width={width} height={height} viewBox="0 0 200 205" style={{ position: 'absolute', inset: 0, display: 'block', overflow: 'visible' }}>
            <defs>
              <radialGradient id={`${id}-bleed`} cx="50%" cy="49%" r="70%">
                <stop offset="0%" stopColor={meta.core} stopOpacity="0.9" />
                <stop offset="28%" stopColor={meta.core} stopOpacity="0.85" />
                <stop offset="58%" stopColor={meta.core} stopOpacity="0.6" />
                <stop offset="80%" stopColor={meta.core} stopOpacity="0.3" />
                <stop offset="100%" stopColor={meta.core} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`${id}-pool`} cx="40%" cy="60%" r="48%">
                <stop offset="0%" stopColor={meta.core} stopOpacity="0.42" />
                <stop offset="70%" stopColor={meta.core} stopOpacity="0.14" />
                <stop offset="100%" stopColor={meta.core} stopOpacity="0" />
              </radialGradient>
              <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="11" />
              </filter>
              <filter id={`${id}-wobble`} x="-45%" y="-45%" width="190%" height="190%">
                <feTurbulence ref={turbulenceRef} type="fractalNoise" baseFrequency="0.011 0.0126" numOctaves="2" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                <feGaussianBlur in="displaced" stdDeviation="2" />
              </filter>
            </defs>

            <ellipse cx="100" cy="104" rx="82" ry="84" fill={meta.core} opacity="0.3" filter={`url(#${id}-glow)`} />
            <g filter={`url(#${id}-wobble)`}>
              <path d={SILHOUETTE} fill={`url(#${id}-bleed)`} />
              <path d={SILHOUETTE} fill={`url(#${id}-pool)`} />
            </g>
            <Face face={meta.face} ink={meta.ink} />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes eb-float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } }
        @keyframes eb-breathe { 0%,100%{ transform: scale(1) } 50%{ transform: scale(1.02,0.985) } }
        @keyframes eb-squish { 0%{ transform: scale(1,1) } 30%{ transform: scale(1.14,0.82) } 60%{ transform: scale(0.94,1.08) } 100%{ transform: scale(1,1) } }
        @keyframes eb-mouth { 0%,100%{ transform: scaleY(0.72) } 50%{ transform: scaleY(1) } }
        @keyframes eb-mouth2 { 0%,100%{ transform: scaleY(0.88) } 50%{ transform: scaleY(1.06) } }
        @media (prefers-reduced-motion: reduce){ *{ animation: none !important } }
      `}</style>
    </div>
  );
}
