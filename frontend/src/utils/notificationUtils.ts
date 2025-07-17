
import { store } from '@/store/store';
import { openDialog } from '@/store/slices/dialogSlice';
import { showToast } from '@/store/slices/toastSlice';


export const showNotification = (title: string, options: NotificationOptions, duration : number = 2000) => {
  if (document.visibilityState === 'visible') {
    store.dispatch(
      showToast({ 
          message: `${title} : ${options.body?? "알림"}`,
          duration: duration
        })
    );
  } else {
    navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: {
          title,
          options,
        },
      });
    });
  }
};
