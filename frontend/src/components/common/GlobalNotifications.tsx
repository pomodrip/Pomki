import React, { useCallback, useEffect } from 'react';
import { Snackbar, Alert, IconButton, Box, Typography, Button, Stack } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNotifications, useUI } from '../../hooks/useUI';
import { styled } from '@mui/material/styles';

const NotificationContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  zIndex: theme.zIndex.snackbar,
  pointerEvents: 'none',
  '& > *': {
    pointerEvents: 'auto',
  },
}));

const getPositionStyles = (position: string) => {
  switch (position) {
    case 'top-right':
      return { top: 24, right: 24 };
    case 'top-left':
      return { top: 24, left: 24 };
    case 'bottom-left':
      return { bottom: 24, left: 24 };
    case 'bottom-right':
    default:
      return { bottom: 24, right: 24 };
  }
};

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  minWidth: '300px',
  maxWidth: '500px',
  boxShadow: theme.shadows[8],
  '& .MuiAlert-message': {
    width: '100%',
    padding: 0,
  },
  '& .MuiAlert-action': {
    alignItems: 'flex-start',
    paddingTop: theme.spacing(0.5),
  },
}));

const NotificationContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const NotificationTitle = styled(Typography)(() => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.2,
}));

const NotificationMessage = styled(Typography)(() => ({
  fontSize: '0.75rem',
  opacity: 0.9,
  lineHeight: 1.3,
}));

const NotificationActions = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(1),
  flexDirection: 'row',
  gap: theme.spacing(1),
  '& .MuiButton-root': {
    fontSize: '0.75rem',
    padding: theme.spacing(0.5, 1),
    minWidth: 'auto',
  },
}));

/**
 * 🔔 전역 알림 컴포넌트 (확장된 버전)
 * 
 * 기능:
 * - 여러 알림 동시 표시
 * - 커스텀 액션 버튼 지원
 * - 위치 설정 가능
 * - 자동 큐 처리
 * - 접근성 지원
 */
const GlobalNotifications: React.FC = () => {
  const { notifications, remove, settings } = useNotifications();
  const { processQueue } = useUI();

  // 알림 큐 자동 처리
  useEffect(() => {
    const interval = setInterval(() => {
      processQueue();
    }, 500); // 0.5초마다 큐 확인

    return () => clearInterval(interval);
  }, [processQueue]);

  const handleClose = useCallback((notificationId: string) => {
    remove(notificationId);
  }, [remove]);

  const handleAction = useCallback((action: () => void, notificationId?: string) => {
    action();
    if (notificationId) {
      remove(notificationId);
    }
  }, [remove]);

  // 알림이 없으면 아무것도 렌더링하지 않음
  if (!settings.enabled || notifications.length === 0) {
    return null;
  }

  const positionStyles = getPositionStyles(settings.position);
  const visibleNotifications = notifications.slice(0, settings.maxVisible);

  return (
    <NotificationContainer sx={positionStyles}>
      <Stack spacing={1} direction="column-reverse">
        {visibleNotifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            autoHideDuration={notification.duration || 4000}
            onClose={() => handleClose(notification.id)}
            sx={{
              position: 'relative',
              '& .MuiSnackbarContent-root': {
                padding: 0,
              },
            }}
          >
            <StyledAlert
              severity={notification.type}
              action={
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  {notification.actions && notification.actions.length > 0 && (
                    <NotificationActions>
                      {notification.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant || 'text'}
                          color={action.color || 'inherit'}
                          onClick={() => handleAction(action.action, notification.id)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </NotificationActions>
                  )}
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => handleClose(notification.id)}
                    sx={{ ml: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <NotificationContent>
                <NotificationTitle variant="subtitle2">
                  {notification.title}
                </NotificationTitle>
                {notification.message && (
                  <NotificationMessage variant="body2">
                    {notification.message}
                  </NotificationMessage>
                )}
                {notification.actions && notification.actions.length > 0 && (
                  <NotificationActions>
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'text'}
                        color={action.color || 'inherit'}
                        onClick={() => handleAction(action.action, notification.id)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </NotificationActions>
                )}
              </NotificationContent>
            </StyledAlert>
          </Snackbar>
        ))}
      </Stack>
    </NotificationContainer>
  );
};

export default GlobalNotifications; 