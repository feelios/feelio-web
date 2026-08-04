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

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging);
      if (currentToken) {
        console.log('✅ [FCM 테스트용 토큰 발급 완료]:', currentToken);
        return currentToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
  return null;
};
