import { useEffect } from 'react';
import styled from '@emotion/styled';
import { toastIn } from '../../styles/animations.js';

const ToastBox = styled.div`
  position: fixed;
  left: 50%;
  bottom: 38px;
  z-index: 300;
  transform: translateX(-50%);

  /* 모바일에서는 하단 메뉴바 위로 올린다. 38px 은 메뉴바(높이 67px + 아래 여백)가
     깔고 앉은 자리라, 토스트가 메뉴 항목을 가로질러 걸쳤다.

     토큰마다 기본값을 함께 적는다. 이 토스트는 AppLayoutDc(Shell) 바깥에서 렌더되므로
     Shell 에 선언된 --mobile-* 변수가 스코프에 없다. 값이 없으면 calc() 전체가 무효가 되고,
     bottom 이 auto 로 떨어져 토스트가 화면 밖에 서서 아예 안 보인다. */
  @media (max-width: 820px) {
    bottom: calc(
      var(--mobile-nav-height, 67px) + var(--mobile-nav-offset, 12px) +
      var(--mobile-nav-gap, 30px) + env(safe-area-inset-bottom, 0px) + 6px
    );
  }
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
  top: 16px;
  z-index: 400;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: 20px;
  width: calc(100% - 32px);
  max-width: 400px;
  background: color-mix(in srgb, var(--bg-1) 95%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--line);
  box-shadow: 0 16px 40px rgba(0,0,0,.15);
  animation: ${toastIn} .35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  
  .noti-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--sub);
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .noti-app-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .noti-icon {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
  }
  
  .noti-title {
    font-size: 14.5px;
    font-weight: 800;
    color: var(--text);
  }
  
  .noti-body {
    font-size: 13px;
    color: var(--sub);
    line-height: 1.4;
    word-break: keep-all;
  }
`;

export function NotificationToast({ notification, onClick, onClose }) {
  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <NotiToastBox onClick={() => { onClick(notification); onClose(); }}>
      <div className="noti-header">
        <div className="noti-app-info">
          <div className="noti-icon" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' }} />
          <span>감정소비일기</span>
        </div>
        <span>방금</span>
      </div>
      <div className="noti-title">{notification.title || '새 알림'}</div>
      <div className="noti-body">{notification.body || '내용이 없습니다'}</div>
    </NotiToastBox>
  );
}

