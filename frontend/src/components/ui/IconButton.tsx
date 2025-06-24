import React from 'react';
import { styled } from '@mui/material/styles';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  edge?: 'start' | 'end' | false;
  sx?: any;
}

const StyledIconButton = styled('button')<IconButtonProps>(({ theme, size = 'medium', color = 'default', edge, sx }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: theme.spacing(0.5),
          fontSize: '1.125rem',
        };
      case 'large':
        return {
          padding: theme.spacing(1.5),
          fontSize: '1.75rem',
        };
      default: // medium
        return {
          padding: theme.spacing(1),
          fontSize: '1.5rem',
        };
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case 'primary':
        return {
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.main + '14',
          },
        };
      case 'secondary':
        return {
          color: theme.palette.secondary.main,
          '&:hover': {
            backgroundColor: theme.palette.secondary.main + '14',
          },
        };
      case 'error':
        return {
          color: theme.palette.error.main,
          '&:hover': {
            backgroundColor: theme.palette.error.main + '14',
          },
        };
      case 'warning':
        return {
          color: theme.palette.warning.main,
          '&:hover': {
            backgroundColor: theme.palette.warning.main + '14',
          },
        };
      case 'info':
        return {
          color: theme.palette.info.main,
          '&:hover': {
            backgroundColor: theme.palette.info.main + '14',
          },
        };
      case 'success':
        return {
          color: theme.palette.success.main,
          '&:hover': {
            backgroundColor: theme.palette.success.main + '14',
          },
        };
      default:
        return {
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        };
    }
  };

  const getEdgeStyles = () => {
    if (edge === 'start') {
      return { marginLeft: theme.spacing(-1) };
    }
    if (edge === 'end') {
      return { marginRight: theme.spacing(-1) };
    }
    return {};
  };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    outline: 0,
    border: 0,
    margin: 0,
    borderRadius: '50%',
    cursor: 'pointer',
    userSelect: 'none',
    verticalAlign: 'middle',
    textDecoration: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: theme.transitions.create(['background-color'], {
      duration: theme.transitions.duration.shortest,
    }),
    ...getSizeStyles(),
    ...getColorStyles(),
    ...getEdgeStyles(),
    '&:disabled': {
      backgroundColor: 'transparent',
      color: theme.palette.action.disabled,
      cursor: 'default',
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },
    ...sx,
  };
});

const IconButton: React.FC<IconButtonProps> = ({ children, ...props }) => {
  return <StyledIconButton {...props}>{children}</StyledIconButton>;
};

export default IconButton; 