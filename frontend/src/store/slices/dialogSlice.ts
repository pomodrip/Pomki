import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { ReactNode } from 'react';

export interface DialogState {
  id: string | null;
  isOpen: boolean;
  title: string;
  content: ReactNode | null;
  onConfirm?: () => void;
}

export interface DialogPayload {
  id: string;
  title: string;
  content: ReactNode;
  onConfirm?: () => void;
}

const initialState: DialogState = {
  id: null,
  isOpen: false,
  title: '',
  content: null,
  onConfirm: undefined,
};

const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    openDialog: (state, action: PayloadAction<DialogPayload>) => {
      state.isOpen = true;
      state.id = action.payload.id;
      state.title = action.payload.title;
      state.content = action.payload.content;
      state.onConfirm = action.payload.onConfirm;
    },
    closeDialog: (state) => {
      state.isOpen = false;
      state.id = null;
      state.title = '';
      state.content = null;
      state.onConfirm = undefined;
    },
  },
});

export const { openDialog, closeDialog } = dialogSlice.actions;

// Selector
export const selectDialog = (state: RootState) => state.dialog;

export default dialogSlice.reducer;