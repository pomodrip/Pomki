import React from 'react';
import { Snackbar as MuiSnackbar, Alert, Button, IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  '& .MuiAlert-message': {
    fontSize: theme.typography.body2.fontSize,
  },
}));

export interface SnackbarProps {
  open: boolean;
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration?: number;
  action?: string;
  onClose: () => void;
  onAction?: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  severity = 'info',
  autoHideDuration = 6000,
  action,
  onClose,
  onAction,
}) => {
  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  const actionComponent = action ? (
    <Button color="inherit" size="small" onClick={onAction}>
      {action}
    </Button>
  ) : (
    <IconButton size="small" color="inherit" onClick={onClose}>
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <StyledAlert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        action={actionComponent}
      >
        {message}
      </StyledAlert>
    </MuiSnackbar>
  );
};

export default Snackbar;
