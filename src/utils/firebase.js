import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAg9_490y4fCDpicBo9OiQLCbOUpFJQcYQ",
  authDomain: "feelio-f924f.firebaseapp.com",
  projectId: "feelio-f924f",
  storageBucket: "feelio-f924f.firebasestorage.app",
  messagingSenderId: "910888742113",
  appId: "1:910888742113:web:94189a59f35b65d12bdba0",
  measurementId: "G-2M0P58QY9F"
};

console.warn('[배포 디버그] Firebase 초기화 시도 중...', firebaseConfig.projectId);
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;
console.warn('[배포 디버그] Firebase 초기화 완료. messaging 객체:', !!messaging);

export const requestForToken = async () => {
  console.warn('[배포 디버그] requestForToken 함수 호출됨!');
  if (!messaging) {
    console.error('[배포 디버그] messaging 객체가 없어서 토큰 발급 중단됨!');
    return null;
  }
  
  try {
    console.warn('[배포 디버그] Notification 권한 요청 직전');
    const permission = await Notification.requestPermission();
    console.warn('[배포 디버그] 권한 요청 결과:', permission);
    
    if (permission === 'granted') {
      console.warn('[배포 디버그] 권한 granted 됨. getToken 시도...');
      const currentToken = await getToken(messaging);
      
      if (currentToken) {
        console.warn('✅ [배포 디버그] FCM 토큰 발급 완벽 성공:', currentToken);
        return currentToken;
      } else {
        console.error('❌ [배포 디버그] 토큰은 없으나 에러는 발생하지 않음 (VAPID 키 누락 의심)');
      }
    } else {
      console.warn('⚠️ [배포 디버그] 권한이 허용되지 않음:', permission);
    }
  } catch (err) {
    console.error('🔥 [배포 디버그] getToken 중 심각한 에러 발생:', err);
  }
  return null;
};
