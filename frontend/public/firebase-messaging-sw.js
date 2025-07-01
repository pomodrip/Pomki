
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// --- Workbox Caching Strategies ---

// 1. Pre-caching (managed by vite-plugin-pwa)
// The self.__WB_MANIFEST will be injected by the PWA plugin.
if (workbox) {
  console.log(`Workbox is loaded`);
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // 2. Runtime Caching for APIs
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 Day
        }),
      ],
    })
  );
} else {
  console.log(`Workbox didn't load`);
}


importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');


const firebaseConfig = {
  apiKey: "__VITE_FIREBASE_API_KEY__",
  authDomain: "__VITE_FIREBASE_AUTH_DOMAIN__",
  projectId: "__VITE_FIREBASE_PROJECT_ID__",
  storageBucket: "__VITE_FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__VITE_FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__VITE_FIREBASE_APP_ID__",
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);


messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background FCM message:', payload);

  const notificationTitle = payload.data?.title || payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body,
    icon: payload.data?.icon || '/logo192.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload;
    console.log('[SW] Received request to show local notification:', { title, options });
    self.registration.showNotification(title, options);
  }
});

// Injected by vite-plugin-pwa
// self.__WB_MANIFEST;
