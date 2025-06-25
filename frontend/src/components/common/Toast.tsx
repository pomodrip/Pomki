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
  const { open, message, severity, duration, anchorOrigin } = useAppSelector((state) => state.toast);

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
      anchorOrigin={anchorOrigin}
      // 위치 조정: 데스크탑에서는 헤더 아래, 모바일에서는 바텀 네비게이션 위
      sx={{ 
        ...(anchorOrigin.vertical === 'bottom' && {
          bottom: { xs: '80px !important', sm: '16px !important' }
        }),
        ...(anchorOrigin.vertical === 'top' && {
          top: { xs: '16px !important', sm: '80px !important' } // 데스크탑에서 헤더 아래
        })
      }}
    >
      <StyledAlert severity={severity as AlertProps['severity']} variant="filled">
        {message}
      </StyledAlert>
    </Snackbar>
  );
};

export default Toast;
