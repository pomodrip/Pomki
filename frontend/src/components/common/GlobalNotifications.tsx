import React, { useCallback } from 'react';
import { Snackbar, Alert, IconButton, Box, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNotifications } from '../../hooks/useUI';

/**
 * 🔔 전역 알림 컴포넌트
 * 
 * uiSlice의 notification 상태를 기반으로 Snackbar 알림을 표시합니다.
 * App.tsx 또는 최상위 레벨에서 한 번만 렌더링하면 됩니다.
 */
const GlobalNotifications: React.FC = () => {
  const { notifications, remove } = useNotifications();

  const handleClose = useCallback((notificationId: string) => {
    remove(notificationId);
  }, [remove]);

  // 알림이 없으면 아무것도 렌더링하지 않음
  if (notifications.length === 0) {
    return null;
  }

  // 가장 최근 알림 하나만 표시 (여러 개를 동시에 표시하려면 수정 필요)
  const currentNotification = notifications[0];

  return (
    <Snackbar
      key={currentNotification.id}
      open={true}
      autoHideDuration={currentNotification.duration || 4000}
      onClose={() => handleClose(currentNotification.id)}
      anchorOrigin={{ 
        vertical: 'bottom', 
        horizontal: 'right' 
      }}
      sx={{
        '& .MuiSnackbarContent-root': {
          padding: 0,
        },
      }}
    >
      <Alert
        severity={currentNotification.type}
        onClose={() => handleClose(currentNotification.id)}
        action={
          currentNotification.actions?.length ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentNotification.actions.map((action, index) => (
                <IconButton
                  key={index}
                  size="small"
                  color="inherit"
                  onClick={action.action}
                >
                  {action.label}
                </IconButton>
              ))}
              <IconButton
                size="small"
                color="inherit"
                onClick={() => handleClose(currentNotification.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : undefined
        }
        sx={{
          width: '100%',
          '& .MuiAlert-message': {
            overflow: 'hidden',
          },
        }}
      >
        <Box>
          <Typography variant="subtitle2" component="div">
            {currentNotification.title}
          </Typography>
          {currentNotification.message && (
            <Typography variant="body2" color="text.secondary">
              {currentNotification.message}
            </Typography>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default GlobalNotifications; 