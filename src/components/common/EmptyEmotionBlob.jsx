/** @jsxImportSource @emotion/react */
import { useId } from 'react';

// 감정 기록/프로필 사진이 없을 때 쓰는 "물음표 말랑이" (빈 상태 아바타).
const emptyBlobShape =
  'M100 38C148 38 174 76 172 120C171 146 158 162 150 162C141 162 139 172 126 172C116 172 114 162 100 162C86 162 84 172 74 172C61 172 59 162 50 162C42 162 29 146 28 120C26 76 52 38 100 38Z';

export function EmptyEmotionBlob({ size = 260, dark = false }) {
  const id = `empty-${useId().replace(/:/g, '')}`;
  const width = size;
  const height = size * 1.1;
  const bodyHeight = size * 1.025;
  const colors = dark
    ? { fill: '#ffffff', o0: 0.17, o1: 0.07, o2: 0.02, stroke: 'rgba(255,255,255,.30)', sheen: 0.42, eye: '#8A85A3', mark: '#9B8CFF' }
    : { fill: '#7A7896', o0: 0.20, o1: 0.10, o2: 0.03, stroke: 'rgba(70,70,105,.32)', sheen: 0.55, eye: '#6C6785', mark: '#7C6BE0' };

  return (
    <div css={{
      width,
      height,
      position: 'relative',
      animation: 'es-float 5s ease-in-out infinite',
      '@keyframes es-float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      '@keyframes es-breathe': { '0%,100%': { transform: 'scale(1,1)' }, '50%': { transform: 'scale(1.03,.97)' } },
      '@keyframes es-tilt': { '0%,100%': { transform: 'rotate(-4deg)' }, '50%': { transform: 'rotate(4deg)' } },
      '@keyframes es-look': { '0%,16%,92%,100%': { transform: 'translate(0,0)' }, '30%,46%': { transform: 'translate(-5px,-2px)' }, '60%,78%': { transform: 'translate(5px,-1px)' } },
      '@keyframes es-qpulse': { '0%,100%': { transform: 'translateX(-50%) scale(1) translateY(0)', opacity: .5 }, '50%': { transform: 'translateX(-50%) scale(1.18) translateY(-3px)', opacity: 1 } },
      '@media (prefers-reduced-motion: reduce)': { '*': { animation: 'none !important' } }
    }}>
      <div css={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', animation: 'es-qpulse 1.8s ease-in-out infinite' }}>
        <svg width={size * .32} height={size * .32} viewBox="0 0 40 40">
          <text x="20" y="31" textAnchor="middle" fontSize="36" fontWeight="800" fill={colors.mark} fontFamily="system-ui,-apple-system,sans-serif">?</text>
        </svg>
      </div>
      <div css={{ position: 'absolute', bottom: 0, left: 0, width, height: bodyHeight, animation: 'es-tilt 4.5s ease-in-out infinite', transformOrigin: '50% 90%' }}>
        <div css={{ position: 'absolute', inset: 0, animation: 'es-breathe 4s ease-in-out infinite', transformOrigin: '50% 88%' }}>
          <svg width={width} height={bodyHeight} viewBox="0 0 200 205" css={{ position: 'absolute', inset: 0 }}>
            <defs>
              <radialGradient id={`${id}-glass`} cx="50%" cy="45%" r="66%">
                <stop offset="0%" stopColor={colors.fill} stopOpacity={colors.o0} />
                <stop offset="60%" stopColor={colors.fill} stopOpacity={colors.o1} />
                <stop offset="100%" stopColor={colors.fill} stopOpacity={colors.o2} />
              </radialGradient>
              <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={colors.sheen} />
                <stop offset="32%" stopColor="#ffffff" stopOpacity={colors.sheen * .19} />
                <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <clipPath id={`${id}-clip`}><path d={emptyBlobShape} /></clipPath>
              <filter id={`${id}-wobble`} x="-45%" y="-45%" width="190%" height="190%">
                <feTurbulence type="fractalNoise" baseFrequency="0.011 0.0126" numOctaves="2" seed="7" result="noise">
                  <animate attributeName="baseFrequency" dur="14s" repeatCount="indefinite" values="0.011 0.0126; 0.014 0.016; 0.011 0.0126" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                <feGaussianBlur in="displaced" stdDeviation="1.4" />
              </filter>
            </defs>
            <g filter={`url(#${id}-wobble)`}>
              <path d={emptyBlobShape} fill={`url(#${id}-glass)`} stroke={colors.stroke} strokeWidth="1.6" />
              <g clipPath={`url(#${id}-clip)`}><rect x="0" y="0" width="200" height="205" fill={`url(#${id}-sheen)`} /></g>
            </g>
            <g css={{ animation: 'es-look 3.6s ease-in-out infinite' }}>
              <circle cx="86" cy="108" r="4.2" fill={colors.eye} />
              <circle cx="114" cy="108" r="4.2" fill={colors.eye} />
            </g>
            <path d="M96 122 Q100 125 104 122" stroke={colors.eye} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
