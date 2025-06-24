import React from 'react';
import { styled } from '@mui/material/styles';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'small' | 'medium' | 'large';
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  indeterminate?: boolean;
  sx?: any;
}

const CheckboxContainer = styled('span')<CheckboxProps>(({ theme, size = 'medium', color = 'primary', sx }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: '20px',
          height: '20px',
          fontSize: '14px',
        };
      case 'large':
        return {
          width: '28px',
          height: '28px',
          fontSize: '20px',
        };
      default: // medium
        return {
          width: '24px',
          height: '24px',
          fontSize: '16px',
        };
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case 'primary':
        return {
          checkedColor: theme.palette.primary.main,
          hoverColor: theme.palette.primary.main + '14',
        };
      case 'secondary':
        return {
          checkedColor: theme.palette.secondary.main,
          hoverColor: theme.palette.secondary.main + '14',
        };
      case 'error':
        return {
          checkedColor: theme.palette.error.main,
          hoverColor: theme.palette.error.main + '14',
        };
      case 'warning':
        return {
          checkedColor: theme.palette.warning.main,
          hoverColor: theme.palette.warning.main + '14',
        };
      case 'info':
        return {
          checkedColor: theme.palette.info.main,
          hoverColor: theme.palette.info.main + '14',
        };
      case 'success':
        return {
          checkedColor: theme.palette.success.main,
          hoverColor: theme.palette.success.main + '14',
        };
      default:
        return {
          checkedColor: theme.palette.text.primary,
          hoverColor: theme.palette.action.hover,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const colorStyles = getColorStyles();

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
    padding: theme.spacing(1),
    cursor: 'pointer',
    userSelect: 'none',
    verticalAlign: 'middle',
    WebkitTapHighlightColor: 'transparent',
    '&:hover': {
      backgroundColor: colorStyles.hoverColor,
    },
    '& .checkbox-input': {
      position: 'absolute',
      opacity: 0,
      cursor: 'inherit',
      ...sizeStyles,
    },
    '& .checkbox-icon': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...sizeStyles,
      border: `2px solid ${theme.palette.action.active}`,
      borderRadius: '2px',
      transition: theme.transitions.create(['border-color', 'background-color'], {
        duration: theme.transitions.duration.shortest,
      }),
    },
    '& .checkbox-input:checked + .checkbox-icon': {
      backgroundColor: colorStyles.checkedColor,
      borderColor: colorStyles.checkedColor,
      color: theme.palette.getContrastText(colorStyles.checkedColor),
    },
    '& .checkbox-input:disabled + .checkbox-icon': {
      borderColor: theme.palette.action.disabled,
      backgroundColor: 'transparent',
      color: theme.palette.action.disabled,
    },
    '& .checkbox-input:focus-visible + .checkbox-icon': {
      outline: `2px solid ${colorStyles.checkedColor}`,
      outlineOffset: '2px',
    },
    ...sx,
  };
});

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </svg>
);

const IndeterminateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
  </svg>
);

const Checkbox: React.FC<CheckboxProps> = ({ 
  size = 'medium', 
  color = 'primary', 
  indeterminate = false,
  checked,
  disabled,
  ...props 
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const renderIcon = () => {
    if (indeterminate) {
      return <IndeterminateIcon />;
    }
    if (checked) {
      return <CheckIcon />;
    }
    return null;
  };

  return (
    <CheckboxContainer size={size} color={color} as="label">
      <input
        ref={inputRef}
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        disabled={disabled}
        {...props}
      />
      <span className="checkbox-icon">
        {renderIcon()}
      </span>
    </CheckboxContainer>
  );
};

export default Checkbox; 