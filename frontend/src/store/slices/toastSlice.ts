import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  anchorOrigin: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

const initialState: ToastState = {
  open: false,
  message: '',
  severity: 'info',
  duration: 4000,
  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
};

export interface ShowToastPayload {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ShowToastPayload>) => {
      // 화면 크기에 따라 위치 결정 (Redux에서 관리)
      const isMobile = window.innerWidth <= 768;
      
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
      state.duration = action.payload.duration || 4000;
      state.anchorOrigin = action.payload.anchorOrigin || {
        vertical: isMobile ? 'bottom' : 'top',
        horizontal: 'center'
      };
    },
    hideToast: (state) => {
      state.open = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
