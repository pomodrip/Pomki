
self.__WB_MANIFEST;


importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');


const firebaseConfig = {
  apiKey: "__VITE_FIREBASE_API_KEY__",
  authDomain: "__VITE_FIREBASE_AUTH_DOMAIN__",
  projectId: "__VITE_FIREBASE_PROJECT_ID__",
  storageBucket: "__VITE_FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__VITE_FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__VITE_FIREBASE_APP_ID__",
};
self.addEventListener('install', (e) => {
  console.debug("설치됨")
  self.skipWaiting()
})
self.addEventListener('activate', function (e) {
  console.debug('fcm sw activate..');
});

self.addEventListener('notificationclick', function (event) {
  const url = event.notification?.data?.innerLink|| '/';
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);


messaging.onBackgroundMessage((payload) => {
  console.debug('[SW] Received background FCM message:', payload);

  const notificationTitle = payload.data?.title || payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body,
    icon: payload.data?.icon || '/logo192.png',
    data: payload.data,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload;
    console.debug('[SW] Received request to show local notification:', { title, options });
    return self.registration.showNotification(title, options);
  }
});

