import { useEffect } from 'react';
import styled from '@emotion/styled';
import { toastIn } from '../../styles/animations.js';

const ToastBox = styled.div`
  position: fixed;
  left: 50%;
  bottom: 38px;
  z-index: 300;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--on-ink);
  font-weight: 700;
  box-shadow: 0 14px 38px rgba(0,0,0,.26);
  animation: ${toastIn} .28s ease;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #83C9B0;
  }
`;

export function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onDone, 1800);
    return () => window.clearTimeout(timer);
  }, [message, onDone]);

  if (!message) return null;
  return <ToastBox><span />{message}</ToastBox>;
}

