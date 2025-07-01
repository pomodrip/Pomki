import React, { useEffect, useRef } from 'react';
import { Box, Typography, IconButton, LinearProgress, styled } from '@mui/material';
import { Close as CloseIcon, CheckCircle, Error, Warning, Info } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { hideToast, updateToastProgress } from '../../store/slices/toastSlice';
import { useResponsive } from '../../hooks/useResponsive';
import type { ToastItem } from '../../store/slices/toastSlice';

// maxWidth="md" 기준 중앙 정렬을 위한 Wrapper
const CenterWrapper = styled(Box)<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: theme.breakpoints.values.md, // md(900px) 기준 중앙 정렬
  zIndex: theme.zIndex.modal || 1300,
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // 위치 설정
  ...(isMobile
    ? {
        bottom: 0,
        top: 'auto',
      }
    : {
        top: 0,
        bottom: 'auto',
      }),
}));

const ToastContainer = styled(Box)<{ 
  isMobile: boolean; 
  position: { mobile: { bottom: number; top: 'auto' }; desktop: { top: number; bottom: 'auto' } } 
}>(({ theme, isMobile, position }) => ({
  width: 320,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  pointerEvents: 'none',
  // 🔴 Redux에서 위치 로직 관리
  marginTop: isMobile ? 'auto' : `${position.desktop.top}px`,
  marginBottom: isMobile ? `${position.mobile.bottom}px` : 'auto',
}));

type SeverityType = 'success' | 'error' | 'warning' | 'info';

const ToastItemBox = styled(Box)<{ severity: SeverityType }>(({ theme, severity }) => {
  const severityColors: Record<SeverityType, string> = {
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };
  return {
    position: 'relative',
    display: 'flex',
    alignItems: 'center', // 아이콘과 텍스트 수직 중앙 정렬
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${severityColors[severity]}`,
    boxShadow: theme.shadows[4],
    pointerEvents: 'auto',
    cursor: 'default',
    overflow: 'hidden', // 프로그래스 바가 벗어나지 않도록 숨김
    transition: theme.transitions.create(['transform', 'opacity'], {
      duration: theme.transitions.duration.short,
    }),
    '&:hover': {
      transform: 'translateX(-4px)',
    },
  };
});

const ProgressBar = styled(LinearProgress)<{ severity: SeverityType }>(({ theme, severity }) => {
  const severityColors: Record<SeverityType, string> = {
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };
  return {
    position: 'absolute',
    bottom: 0, // 바닥에 완전히 붙임
    left: 0,   // 전체 너비 사용
    right: 0,  // 전체 너비 사용
    height: 3,
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    '& .MuiLinearProgress-bar': {
      backgroundColor: severityColors[severity],
      borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    },
    '& .MuiLinearProgress-root': {
      backgroundColor: 'transparent',
    },
  };
});

const IconContainer = styled(Box)<{ severity: SeverityType }>(({ theme, severity }) => {
  const severityColors: Record<SeverityType, string> = {
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    flexShrink: 0, // 아이콘 크기 고정
    '& svg': {
      fontSize: '1.25rem',
      color: severityColors[severity],
    },
  };
});

const MessageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', // 텍스트 수직 중앙 정렬
  fontFamily: theme.typography.fontFamily,
}));

const ToastComponent: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const dispatch = useAppDispatch();
  const intervalRef = useRef<number | null>(null);

  const getSeverityIcon = (severity: SeverityType) => {
    switch (severity) {
      case 'success': return <CheckCircle />;
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <Info />;
    }
  };

  const handleClose = () => {
    dispatch(hideToast(toast.id));
  };

  useEffect(() => {
    if (toast.duration > 0) {
      const interval = 50; // 50ms마다 업데이트
      const decrement = (100 / toast.duration) * interval;
      intervalRef.current = setInterval(() => {
        dispatch(updateToastProgress({ 
          id: toast.id, 
          progress: Math.max(0, toast.progress - decrement) 
        }));
        if (toast.progress <= 0) {
          handleClose();
        }
      }, interval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [toast.id, toast.duration, toast.progress, dispatch]);

  return (
    <ToastItemBox severity={toast.severity}>
      <IconContainer severity={toast.severity}>
        {getSeverityIcon(toast.severity)}
      </IconContainer>
      <MessageContainer>
        <Typography variant="body2" sx={{ fontWeight: 600, margin: 0 }}>
          {toast.message}
        </Typography>
      </MessageContainer>
      <IconButton
        size="small"
        onClick={handleClose}
        sx={{ 
          padding: 0.25,
          flexShrink: 0, // 닫기 버튼 크기 고정
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <ProgressBar 
        variant="determinate" 
        value={toast.progress} 
        severity={toast.severity}
      />
    </ToastItemBox>
  );
};

const Toast: React.FC = () => {
  const { toasts, position } = useAppSelector((state) => state.toast); // 🔴 Redux에서 위치 로직 가져오기
  const { isMobile } = useResponsive();

  if (toasts.length === 0) return null;

  return (
    <CenterWrapper isMobile={isMobile}>
      <ToastContainer isMobile={isMobile} position={position}>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} />
        ))}
      </ToastContainer>
    </CenterWrapper>
  );
};

export default Toast;
