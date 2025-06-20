import { useAppDispatch, useAppSelector } from './useRedux';
import { openDialog } from '../store/slices/dialogSlice';

export const useDialog = () => {
  const dispatch = useAppDispatch();
  const dialog = useAppSelector((state) => state.dialog);

  const showDialog = (title: string, content: string, onConfirm?: () => void) => {
    dispatch(openDialog({ title, content, onConfirm }));
  };

  return {
    dialog,
    showDialog,
  };
};