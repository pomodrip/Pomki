import { useCallback } from 'react';
import { useAppDispatch } from './useRedux';
import { openDialog } from '../store/slices/dialogSlice';
import { DialogPayload } from '../store/slices/dialogSlice';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const useDialog = () => {
  const dispatch = useAppDispatch();

  const openDialogAction = useCallback(
    (payload: DialogPayload) => {
      dispatch(openDialog(payload));
    },
    [dispatch]
  );

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

  return { openDialog: openDialogAction, showConfirmDialog };
};