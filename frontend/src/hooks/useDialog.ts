import { useAppDispatch, useAppSelector } from './useRedux';
import {
  openDialog,
  closeDialog as closeDialogAction,
  DialogPayload,
} from '../store/slices/dialogSlice';
import { useCallback } from 'react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const useDialog = () => {
  const dispatch = useAppDispatch();
  const dialog = useAppSelector((state) => state.dialog);

  const showDialog = (title: string, content: string, onConfirm?: () => void) => {
    dispatch(openDialog({ title, content, onConfirm }));
  };

  const openDialogAction = useCallback(
    (payload: DialogPayload) => {
      dispatch(openDialog(payload));
    },
    [dispatch]
  );

  const closeDialog = useCallback(() => {
    dispatch(closeDialogAction());
  }, [dispatch]);

  const showConfirmDialog = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        dispatch(openDialog({
          title: options.title,
          content: options.message,
          onConfirm: () => resolve(true),
        }));
      });
    },
    [dispatch]
  );

  return {
    dialog,
    showDialog,
    openDialog: openDialogAction,
    closeDialog,
    showConfirmDialog,
  };
};