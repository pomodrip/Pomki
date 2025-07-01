import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/services/firebaseConfig';
import { sendFcmToken } from '@/api/userApi';
import { setFcmToken, setPermissionStatus } from '@/store/slices/notificationSlice';
import type { AppDispatch } from '@/store/store';
import { showNotification } from './notificationUtils';

// Function to request notification permission and get token
export const requestPermissionAndGetToken = async (dispatch: AppDispatch) => {
  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    dispatch(setPermissionStatus(permission));

    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // The service worker is now automatically registered by vite-plugin-pwa
      const swRegistration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (currentToken) {
        console.log('FCM Token:', currentToken);
        dispatch(setFcmToken(currentToken));
        await sendFcmToken(currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        dispatch(setFcmToken(null));
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      dispatch(setFcmToken(null));
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    dispatch(setFcmToken(null));
    return null;
  }
};

// Function to set up foreground message handling
export const onForegroundMessage = () => {
  const messaging = getMessaging(app);
  // onMessage returns an unsubscribe function
  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground. ', payload);

    const notificationTitle = payload.data?.title || 'New Notification';
    const notificationOptions = {
      body: payload.data?.body || '',
      icon: payload.data?.icon || '/logo192.png',
      data: payload.data,
    };

    // Use the unified notification handler
    showNotification(notificationTitle, notificationOptions);
  });
};
