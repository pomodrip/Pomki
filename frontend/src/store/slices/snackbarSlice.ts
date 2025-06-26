import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration: number;
  action?: string;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  // 🔴 Redux에서 리디렉션 로직 관리
  redirectConfig?: {
    enabled: boolean;
    targetPath: string;
    delay: number;
    shouldClearAuth: boolean;
  };
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 6000,
  action: undefined,
  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<{
      message: string;
      severity?: 'success' | 'error' | 'warning' | 'info';
      autoHideDuration?: number;
      action?: string;
      anchorOrigin?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'center' | 'right';
      };
    }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
      state.autoHideDuration = action.payload.autoHideDuration || 6000;
      state.action = action.payload.action;
      state.anchorOrigin = action.payload.anchorOrigin || { vertical: 'bottom', horizontal: 'center' };
    },
    showSuccessSnackbar: (state, action: PayloadAction<{ message: string }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = 'success';
      state.autoHideDuration = 4000;
      state.action = undefined;
      state.anchorOrigin = { vertical: 'bottom', horizontal: 'center' };
    },
        showErrorSnackbar: (state, action: PayloadAction<{ message: string }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = 'error';
      state.autoHideDuration = 6000;
      state.action = undefined;
      state.anchorOrigin = { vertical: 'bottom', horizontal: 'center' };
    },
    show401ErrorSnackbar: (state) => {
      const isMobile = window.innerWidth <= 768;
      state.open = true;
      state.message = '로그인이 필요합니다';
      state.severity = 'error';
      state.autoHideDuration = 8000;
      state.action = '로그인';
      state.anchorOrigin = {
        vertical: isMobile ? 'bottom' : 'top',
        horizontal: 'center'
      };
      // 🔴 Redux에서 리디렉션 설정 관리
      state.redirectConfig = {
        enabled: true,
        targetPath: '/login',
        delay: 2000,
        shouldClearAuth: true,
      };
    },
    hideSnackbar: (state) => {
      state.open = false;
      state.action = undefined;
      state.redirectConfig = undefined;
    },
  },
  });
  
  export const { 
  showSnackbar, 
  showSuccessSnackbar, 
  showErrorSnackbar,
  show401ErrorSnackbar,
  hideSnackbar 
} = snackbarSlice.actions;

export default snackbarSlice.reducer;
