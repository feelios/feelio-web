import { keyframes } from '@emotion/react';

export const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

export const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.035, .985); }
`;

export const squish = keyframes`
  0% { transform: scale(1); }
  30% { transform: scale(1.18, .78); }
  58% { transform: scale(.93, 1.10); }
  100% { transform: scale(1); }
`;

export const driftA = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(60px, -40px) scale(1.15); }
`;

export const driftB = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-54px, 42px) scale(1.12); }
`;

export const modalIn = keyframes`
  from { opacity: 0; transform: translateY(18px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const toastIn = keyframes`
  from { opacity: 0; transform: translate(-50%, 14px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

export const stepIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

