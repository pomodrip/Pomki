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
      // 기존 위치 설정 (상단 중앙)
      // anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      // sx={{ top: '80px !important' }}
      
      // 새로운 위치 설정 (하단 오른쪽, 모바일에서는 bottomnav 위)
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ 
        bottom: { xs: '80px !important', sm: '16px !important' }, // 모바일에서는 bottomnav 위에, 데스크탑에서는 하단
        right: '16px !important'
      }}
    >
      <StyledAlert onClose={handleClose} severity={severity as AlertProps['severity']} variant="filled">
        {message}
      </StyledAlert>
    </Snackbar>
  );
};

export default Toast;
