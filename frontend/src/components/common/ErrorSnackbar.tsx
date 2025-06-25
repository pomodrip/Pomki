import React from 'react';
import { Snackbar as MuiSnackbar, Alert, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { hideSnackbar } from '../../store/slices/snackbarSlice';
import Button from '../ui/Button';
import LoginIcon from '@mui/icons-material/Login';

// Toast.tsx와 동일한 스타일링 패턴 사용 + 테마 에러 색상 적용
const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  backgroundColor: theme.palette.error.main, // 테마 에러 색상 명시적 적용
  color: theme.palette.common.white, // 흰색 텍스트
  '& .MuiAlert-message': {
    fontSize: theme.typography.body2.fontSize,
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    color: 'inherit',
  },
  '& .MuiAlert-action': {
    paddingLeft: theme.spacing(2),
    marginRight: 0,
    alignItems: 'center',
  },
  '& .MuiAlert-icon': {
    color: 'inherit',
  },
  display: 'flex',
  alignItems: 'center',
}));

const ErrorSnackbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const snackbar = useAppSelector((state) => state.snackbar);

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideSnackbar());
  };

  const handleLoginClick = () => {
    navigate('/login');
    dispatch(hideSnackbar());
  };

  // 401 에러 관련 스낵바만 처리 (action이 '로그인'인 경우)
  if (!snackbar.open || snackbar.action !== '로그인') {
    return null;
  }

  return (
    <MuiSnackbar
      open={snackbar.open}
      autoHideDuration={snackbar.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={snackbar.anchorOrigin}
      // 위치 조정: 데스크탑에서는 헤더 아래, 모바일에서는 바텀 네비게이션 위
      sx={{ 
        ...(snackbar.anchorOrigin?.vertical === 'bottom' && {
          bottom: { xs: '80px !important', sm: '16px !important' }
        }),
        ...(snackbar.anchorOrigin?.vertical === 'top' && {
          top: { xs: '16px !important', sm: '80px !important' } // 데스크탑에서 헤더 아래
        })
      }}
    >
      <StyledAlert
        severity="error"
        variant="filled"
        onClose={handleClose}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<LoginIcon fontSize="small" />}
            onClick={handleLoginClick}
            sx={{
              color: 'inherit',
              fontWeight: 600,
              minWidth: 'auto',
              padding: (theme) => theme.spacing(0.5, 1.5),
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            로그인
          </Button>
        }
      >
        {snackbar.message}
      </StyledAlert>
    </MuiSnackbar>
  );
};

export default ErrorSnackbar;
