import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dialogReducer from './slices/dialogSlice';
import toastReducer from './slices/toastSlice';
import timerReducer from './slices/timerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dialog: dialogReducer,
    toast: toastReducer,
    timer: timerReducer,
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;