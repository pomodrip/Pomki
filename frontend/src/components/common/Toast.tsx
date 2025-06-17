import React from 'react';
import { Snackbar, Alert, AlertProps, styled } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { hideToast } from '../../store/slices/toastSlice';

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  '& .MuiAlert-message': {
    fontSize: theme.typography.body2.fontSize,
  },
}));

const Toast: React.FC = () => {
  const dispatch = useAppDispatch();
  const { open, message, severity, duration } = useAppSelector((state) => state.toast);

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideToast());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ top: '80px !important' }}
    >
      <StyledAlert onClose={handleClose} severity={severity as AlertProps['severity']} variant="filled">
        {message}
      </StyledAlert>
    </Snackbar>
  );
};

export default Toast;
