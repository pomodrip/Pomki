import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ToastItem {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  createdAt: number;
  progress: number; // 0-100, progress bar를 위한 진행률
}

export interface ToastState {
  toasts: ToastItem[];
  maxToasts: number; // 최대 동시 표시 개수
}

const initialState: ToastState = {
  toasts: [],
  maxToasts: 3,
};

export interface ShowToastPayload {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Helper function to generate unique IDs
const generateToastId = () => `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ShowToastPayload>) => {
      const newToast: ToastItem = {
        id: generateToastId(),
        message: action.payload.message,
        severity: action.payload.severity || 'info',
        duration: action.payload.duration || 2000,
        createdAt: Date.now(),
        progress: 100, // 시작할 때는 100%
      };

      // 최대 개수 제한
      if (state.toasts.length >= state.maxToasts) {
        state.toasts.shift(); // 가장 오래된 토스트 제거
      }

      state.toasts.push(newToast);
    },
    
    hideToast: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        // 특정 토스트 ID로 숨기기
        state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
      } else {
        // 하위 호환성: 인자가 없으면 가장 최근 토스트 숨기기
        state.toasts.pop();
      }
    },
    
    updateToastProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const toast = state.toasts.find(t => t.id === action.payload.id);
      if (toast) {
        toast.progress = action.payload.progress;
      }
    },
    
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { showToast, hideToast, updateToastProgress, clearAllToasts } = toastSlice.actions;
export default toastSlice.reducer;
