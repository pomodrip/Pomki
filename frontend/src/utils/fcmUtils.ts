import { getMessaging, getToken, onMessage, deleteToken as deleteFirebaseToken } from 'firebase/messaging';
import { app, messaging } from '@/services/firebaseConfig';
import { sendFcmToken, deleteFcmToken } from '@/api/notificationApi';
import { setFcmToken, setPermissionStatus } from '@/store/slices/notificationSlice';
import type { AppDispatch } from '@/store/store';
import { showNotification } from './notificationUtils';

export const requestPermission = async (dispatch: AppDispatch) => {
  try {
    const permission = await Notification.requestPermission();
    dispatch(setPermissionStatus(permission));
    return permission;
  } catch (error) {
    console.error('An error occurred during permission request.', error);
    dispatch(setPermissionStatus('denied'));
    return 'denied';
  }
};

export const getTokenAndSend = async (dispatch: AppDispatch) => {
  try {
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
      console.debug('No registration token available.');
      dispatch(setFcmToken(null));
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token.', error);
    dispatch(setFcmToken(null));
    return null;
  }
};

export const requestPermissionAndGetToken = async (dispatch: AppDispatch) => {
  const permission = await requestPermission(dispatch);
  if (permission === 'granted') {
    await getTokenAndSend(dispatch);
  }
};

export const deleteToken = async () => {
  try {
    await deleteFcmToken(); // 서버에 모든 토큰 삭제 요청
    await deleteFirebaseToken(messaging);
    console.debug('FCM token deleted successfully.');
  } catch (error) {
    console.error('Error deleting FCM token:', error);
    throw error;
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
