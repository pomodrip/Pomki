import { useAppDispatch } from './useRedux';
import { showSnackbar as showSnackbarAction } from '../store/slices/snackbarSlice';
import { useCallback } from 'react';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export const useSnackbar = () => {
  const dispatch = useAppDispatch();

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity = 'info') => {
      dispatch(showSnackbarAction({ message, severity }));
    },
    [dispatch]
  );

  return showSnackbar;
}; 