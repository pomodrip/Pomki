import React from 'react';
import { styled } from '@mui/material/styles';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  severity?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'filled' | 'outlined' | 'standard';
  onClose?: () => void;
  closeText?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  sx?: any;
}

const StyledAlert = styled('div')<AlertProps>(({ theme, severity = 'info', variant = 'standard', sx }) => {
  const getSeverityStyles = () => {
    const baseStyles = {
      error: {
        backgroundColor: variant === 'filled' ? theme.palette.error.main : theme.palette.error.light + '20',
        color: variant === 'filled' ? theme.palette.error.contrastText : theme.palette.error.main,
        borderColor: theme.palette.error.main,
      },
      warning: {
        backgroundColor: variant === 'filled' ? theme.palette.warning.main : theme.palette.warning.light + '20',
        color: variant === 'filled' ? theme.palette.warning.contrastText : theme.palette.warning.main,
        borderColor: theme.palette.warning.main,
      },
      info: {
        backgroundColor: variant === 'filled' ? theme.palette.info.main : theme.palette.info.light + '20',
        color: variant === 'filled' ? theme.palette.info.contrastText : theme.palette.info.main,
        borderColor: theme.palette.info.main,
      },
      success: {
        backgroundColor: variant === 'filled' ? theme.palette.success.main : theme.palette.success.light + '20',
        color: variant === 'filled' ? theme.palette.success.contrastText : theme.palette.success.main,
        borderColor: theme.palette.success.main,
      },
    };
    
    return baseStyles[severity];
  };

  const severityStyles = getSeverityStyles();

  return {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.body2.fontWeight,
    lineHeight: theme.typography.body2.lineHeight,
    minHeight: '48px',
    ...severityStyles,
    ...(variant === 'outlined' && {
      backgroundColor: 'transparent',
      border: `1px solid ${severityStyles.borderColor}`,
    }),
    ...sx,
  };
});

const IconWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(1),
  opacity: 0.9,
}));

const MessageWrapper = styled('div')({
  flex: 1,
  minWidth: 0,
});

const ActionWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: theme.spacing(1),
}));

const CloseButton = styled('button')(({ theme }) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  opacity: 0.7,
  color: 'inherit',
  '&:hover': {
    opacity: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
}));

const getDefaultIcon = (severity: string) => {
  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅',
  };
  return icons[severity as keyof typeof icons] || 'ℹ️';
};

const Alert: React.FC<AlertProps> = ({ 
  severity = 'info',
  variant = 'standard',
  children,
  onClose,
  closeText = '닫기',
  icon,
  action,
  ...props 
}) => {
  return (
    <StyledAlert severity={severity} variant={variant} {...props}>
      {(icon !== false) && (
        <IconWrapper>
          {icon || getDefaultIcon(severity)}
        </IconWrapper>
      )}
      
      <MessageWrapper>
        {children}
      </MessageWrapper>
      
      {action && (
        <ActionWrapper>
          {action}
        </ActionWrapper>
      )}
      
      {onClose && (
        <CloseButton onClick={onClose} aria-label={closeText}>
          ×
        </CloseButton>
      )}
    </StyledAlert>
  );
};

export default Alert; 