import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration: number;
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 6000,
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<{
      message: string;
      severity?: 'success' | 'error' | 'warning' | 'info';
      autoHideDuration?: number;
    }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
      state.autoHideDuration = action.payload.autoHideDuration || 6000;
    },
    showSuccessSnackbar: (state, action: PayloadAction<{ message: string }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = 'success';
      state.autoHideDuration = 4000;
    },
    showErrorSnackbar: (state, action: PayloadAction<{ message: string }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = 'error';
      state.autoHideDuration = 6000;
    },
    hideSnackbar: (state) => {
      state.open = false;
    },
  },
});

export const { 
  showSnackbar, 
  showSuccessSnackbar, 
  showErrorSnackbar, 
  hideSnackbar 
} = snackbarSlice.actions;

export default snackbarSlice.reducer;
