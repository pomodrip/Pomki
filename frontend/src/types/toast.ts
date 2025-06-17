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

export interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

export interface ShowToastPayload {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
