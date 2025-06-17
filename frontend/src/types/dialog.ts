export interface DialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmColor: 'primary' | 'error' | 'warning';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ShowDialogPayload {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'warning';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export type DialogType = 'confirm' | 'alert' | 'prompt';

export interface BaseDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export interface ConfirmDialogProps extends BaseDialogProps {
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}