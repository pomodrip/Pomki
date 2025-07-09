import React, { useEffect, useRef } from 'react';
import { Box, Typography, IconButton, LinearProgress, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';
import Warning from '@mui/icons-material/Warning';
import Info from '@mui/icons-material/Info';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { hideToast, updateToastProgress } from '../../store/slices/toastSlice';
import { useResponsive } from '../../hooks/useResponsive';
import Button from '../ui/Button';
import type { ToastItem } from '../../store/slices/toastSlice';

const HEADER_HEIGHT_DESKTOP = 72; // 실제 헤더 높이에 맞게 조정
const BOTTOM_BAR_HEIGHT_MOBILE = 72; // 실제 바텀바 높이에 맞게 조정

// maxWidth="md" 기준 중앙 정렬을 위한 Wrapper
const CenterWrapper = styled(Box)<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: theme.breakpoints.values.md, // md(900px) 기준 중앙 정렬
  zIndex: 10001,
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // 위치 설정
  ...(isMobile
    ? {
        bottom: BOTTOM_BAR_HEIGHT_MOBILE,
        top: 'auto',
      }
    : {
        top: HEADER_HEIGHT_DESKTOP,
        bottom: 'auto',
      }),
}));

const ToastContainer = styled(Box)<{ 
  isMobile: boolean; 
}>(({ theme, isMobile }) => ({
  width: 320,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  pointerEvents: 'none',
  // 위치는 CenterWrapper에서 관리
}));

type SeverityType = 'success' | 'error' | 'warning' | 'info';

const ToastItemBox = styled(Box)<{ severity: SeverityType; clickable?: boolean }>(({ theme, severity, clickable }) => {
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
    cursor: clickable ? 'pointer' : 'default',
    overflow: 'hidden', // 프로그래스 바가 벗어나지 않도록 숨김
    transition: theme.transitions.create(['transform', 'opacity'], {
      duration: theme.transitions.duration.short,
    }),
    '&:hover': {
      ...(clickable && {
        transform: 'scale(1.02)', // 살짝 확대 효과만 적용하여 중복되는 듯한 시각 오류 방지
        backgroundColor: theme.palette.action.hover,
      }),
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

  const handleClick = () => {
    if (toast.onClick) {
      toast.onClick();
      dispatch(hideToast(toast.id)); // 클릭 후 토스트 닫기
    }
  };

  const handleAction = () => {
    if (toast.onAction) {
      toast.onAction();
      dispatch(hideToast(toast.id)); // 액션 실행 후 토스트 닫기
    }
  };

  useEffect(() => {
    if (toast.duration > 0) {
      const interval = 50; // 50ms마다 업데이트
      const decrement = (100 / toast.duration) * interval;
      intervalRef.current = window.setInterval(() => {
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
        window.clearInterval(intervalRef.current);
      }
    };
  }, [toast.id, toast.duration, toast.progress, dispatch]);

  return (
    <ToastItemBox 
      severity={toast.severity} 
      clickable={!!toast.onClick}
      onClick={handleClick}
      role="alert"
      aria-live={toast.severity === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-describedby={`toast-message-${toast.id}`}
      tabIndex={toast.onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (toast.onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <IconContainer severity={toast.severity} aria-hidden="true">
        {getSeverityIcon(toast.severity)}
      </IconContainer>
      <MessageContainer>
        <Typography 
          variant="body2" 
          sx={{ fontWeight: 600, margin: 0 }}
          id={`toast-message-${toast.id}`}
        >
          {toast.message}
        </Typography>
      </MessageContainer>
      {toast.action ? (
        <Button 
          color="inherit" 
          size="small" 
          onClick={(e) => {
            e.stopPropagation(); // 부모 클릭 이벤트 방지
            handleAction();
          }}
          aria-label={`${toast.action} 액션 수행`}
          sx={{
            flexShrink: 0,
            fontSize: '0.75rem',
            padding: '4px 8px',
            minWidth: 'auto',
            fontWeight: 600,
          }}
        >
          {toast.action}
        </Button>
      ) : (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // 부모 클릭 이벤트 방지
            handleClose();
          }}
          sx={{ 
            padding: 0.25,
            flexShrink: 0, // 닫기 버튼 크기 고정
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
      <ProgressBar 
        variant="determinate" 
        value={toast.progress} 
        severity={toast.severity}
        role="progressbar"
        aria-valuenow={Math.round(toast.progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </ToastItemBox>
  );
};

const Toast: React.FC = () => {
  const { toasts } = useAppSelector((state) => state.toast);
  const { isMobile } = useResponsive();

  if (toasts.length === 0) return null;

  return (
    <CenterWrapper isMobile={isMobile}>
      <ToastContainer 
        isMobile={isMobile}
        role="region"
        aria-label="토스트 알림 영역"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} />
        ))}
      </ToastContainer>
    </CenterWrapper>
  );
};

export default Toast;
