import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface DialogState {
  isOpen: boolean;
  title: string;
  content: string;
  onConfirm?: () => void;
}

export interface DialogPayload {
  title: string;
  content: string;
  onConfirm?: () => void;
}

const initialState: DialogState = {
  isOpen: false,
  title: '',
  content: '',
  onConfirm: undefined,
};

const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<DialogPayload>) => {
      state.isOpen = true;
      state.title = action.payload.title;
      state.content = action.payload.content;
      state.onConfirm = action.payload.onConfirm;
    },
    closeDialog: (state) => {
      state.isOpen = false;
      state.title = '';
      state.content = '';
      state.onConfirm = undefined;
    },
  },
});

export const { openDialog, closeDialog } = dialogSlice.actions;

// Selector
export const selectDialog = (state: RootState) => state.dialog;

export default dialogSlice.reducer;