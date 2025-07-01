
import { store } from '@/store/store';
import { openDialog } from '@/store/slices/dialogSlice';


export const showNotification = (title: string, options: NotificationOptions) => {
  if (document.visibilityState === 'visible') {
    store.dispatch(
      openDialog({
        title,
        content: options.body || '',
      }),
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
