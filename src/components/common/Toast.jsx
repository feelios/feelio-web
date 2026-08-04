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

const NotiToastBox = styled.div`
  position: fixed;
  left: 50%;
  top: 38px;
  z-index: 400;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  border-radius: 20px;
  background: var(--ink);
  color: var(--on-ink);
  box-shadow: 0 16px 40px rgba(0,0,0,.3);
  animation: ${toastIn} .35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  min-width: 280px;
  
  .noti-title {
    font-size: 14.5px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .noti-title span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #83C9B0;
  }
  .noti-body {
    font-size: 13px;
    opacity: 0.8;
    margin-left: 16px;
  }
`;

export function NotificationToast({ notification, onClick, onClose }) {
  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(onClose, 5000); // 5 seconds for push notification
    return () => window.clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <NotiToastBox onClick={() => { onClick(notification); onClose(); }}>
      <div className="noti-title"><span />{notification.title || '새 알림'}</div>
      <div className="noti-body">{notification.body || '내용이 없습니다'}</div>
    </NotiToastBox>
  );
}

