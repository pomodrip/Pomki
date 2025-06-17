import { useCallback } from 'react';
import { useAppDispatch } from './useRedux';
import { showDialog } from '../store/slices/dialogSlice';
import { ShowDialogPayload } from '../types/dialog';

export const useDialog = () => {
  const dispatch = useAppDispatch();

  const openDialog = useCallback(
    (payload: ShowDialogPayload) => {
      dispatch(showDialog(payload));
    },
    [dispatch]
  );

  return { openDialog };
};