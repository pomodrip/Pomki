import { getMessaging, getToken, onMessage, Unsubscribe } from 'firebase/messaging';
import { app,messaging } from '@/services/firebaseConfig';
import { sendFcmToken } from '@/api/userApi';
import { setFcmToken, setPermissionStatus } from '@/store/slices/notificationSlice';
import type { AppDispatch } from '@/store/store';
import { showNotification } from './notificationUtils';


export const requestPermissionAndGetToken = async (dispatch: AppDispatch) => {
  try {
    const permission = await Notification.requestPermission();
    dispatch(setPermissionStatus(permission));

    if (permission === 'granted') {
      console.debug('Notification permission granted.');

      const swRegistration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (currentToken) {
        console.debug('FCM Token:', currentToken);
        dispatch(setFcmToken(currentToken));
        await sendFcmToken(currentToken);
        return currentToken;
      } else {
        console.debug('No registration token available. Request permission to generate one.');
        dispatch(setFcmToken(null));
        return null;
      }
    } else {
      console.debug('Unable to get permission to notify.');
      dispatch(setFcmToken(null));
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    dispatch(setFcmToken(null));
    return null;
  }
};

export const onForegroundMessage = () => {

  return onMessage(messaging, (payload) => {
  console.debug('Message received in foreground. ', payload);

    const notificationTitle = payload.data?.title || 'New Notification';
    const notificationOptions = {
      body: payload.data?.body || '',
      icon: payload.data?.icon || '/logo192.png',
      data: payload.data,
    };
    


    showNotification(notificationTitle, notificationOptions);
  });
};
