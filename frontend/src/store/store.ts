import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dialogReducer from './slices/dialogSlice';
import toastReducer from './slices/toastSlice';
import snackbarReducer from './slices/snackbarSlice';
import { setStoreReference } from '../api/index';
import noteReducer from './slices/noteSlice';
import studyReducer from './slices/studySlice';
import deckReducer from './slices/deckSlice';
import membershipReducer from './slices/membershipSlice';
import timerReducer from './slices/timerSlice';
import uiReducer from './slices/uiSlice';
import adReducer from './slices/adSlice';
import notificationReducer from './slices/notificationSlice'; // 🔔 알림 슬라이스 추가

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dialog: dialogReducer,
    toast: toastReducer,
    snackbar: snackbarReducer,
    note: noteReducer,
    study: studyReducer,
    deck: deckReducer, // 🎯 새로운 덱 슬라이스 추가
    membership: membershipReducer, // 🎯 새로운 멤버십 슬라이스 추가
    timer: timerReducer, // 🎯 새로운 타이머 슬라이스 추가
    ui: uiReducer, // 🎨 UI 상태 관리 슬라이스 추가
    ad: adReducer, // 🎯 새로운 광고 슬라이스 추가
    notification: notificationReducer, // 🔔 알림 리듀서 추가
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // onConfirm 콜백 함수는 직렬화가 불가능하므로 경고를 무시합니다.
        ignoredActions: ['dialog/openDialog'],
        ignoredPaths: ['dialog.onConfirm'],
      },
    }),
});

// 🔥 API 인터셉터에서 store에 접근할 수 있도록 참조 설정
setStoreReference(store);

// 🛠️ 개발 환경에서만 브라우저 콘솔에서 store에 접근할 수 있도록 전역 노출
if (import.meta.env.DEV) {
  (window as any).store = store;
  
  // 콘솔에서 쉽게 테스트할 수 있는 함수들 노출
  (window as any).test401Error = () => {
    store.dispatch({
      type: 'snackbar/show401ErrorSnackbar'
    });
  };
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;