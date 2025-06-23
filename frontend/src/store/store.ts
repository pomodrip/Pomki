import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dialogReducer from './slices/dialogSlice';
import toastReducer from './slices/toastSlice';
import { setStoreReference } from '../api/index';
import noteReducer from './slices/noteSlice';
import studyReducer from './slices/studySlice';
import deckReducer from './slices/deckSlice';
import membershipReducer from './slices/membershipSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dialog: dialogReducer,
    toast: toastReducer,
    note: noteReducer,
    study: studyReducer,
    deck: deckReducer, // 🎯 새로운 덱 슬라이스 추가
    membership: membershipReducer, // 🎯 새로운 멤버십 슬라이스 추가
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;