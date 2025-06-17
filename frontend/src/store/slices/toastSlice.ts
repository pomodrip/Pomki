import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

const initialState: ToastState = {
  open: false,
  message: '',
  severity: 'info',
  duration: 4000,
};

export interface ShowToastPayload {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ShowToastPayload>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
      state.duration = action.payload.duration || 4000;
    },
    hideToast: (state) => {
      state.open = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
