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

export interface ShowToastPayload {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// 하위 호환성을 위한 레거시 타입들
export interface Toast {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}
