import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface NotificationState {
  fcmToken: string | null;
  permissionStatus: 'default' | 'granted' | 'denied';
}

const initialState: NotificationState = {
  fcmToken: null,
  permissionStatus: 'default',
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setFcmToken: (state, action: PayloadAction<string | null>) => {
      state.fcmToken = action.payload;
    },
    setPermissionStatus: (state, action: PayloadAction<'default' | 'granted' | 'denied'>) => {
      state.permissionStatus = action.payload;
    },
  },
});

export const { setFcmToken, setPermissionStatus } = notificationSlice.actions;

// Selectors
export const selectFcmToken = (state: RootState) => state.notification.fcmToken;
export const selectPermissionStatus = (state: RootState) => state.notification.permissionStatus;

export default notificationSlice.reducer;
