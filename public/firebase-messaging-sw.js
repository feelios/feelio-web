/* eslint-disable */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAg9_490y4fCDpicBo9OiQLCbOUpFJQcYQ",
  authDomain: "feelio-f924f.firebaseapp.com",
  projectId: "feelio-f924f",
  storageBucket: "feelio-f924f.firebasestorage.app",
  messagingSenderId: "910888742113",
  appId: "1:910888742113:web:94189a59f35b65d12bdba0",
  measurementId: "G-2M0P58QY9F"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Data-only 페이로드 대응
  const notificationTitle = payload.data?.title || 'Feelio 알림';
  const notificationOptions = {
    body: payload.data?.body || '새로운 알림이 도착했습니다.',
    icon: '/favicon.svg',
    data: {
      url: payload.data?.url || '/record'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/record';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
