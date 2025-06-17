import React from 'react';
import { Button as MuiButton, ButtonProps, styled } from '@mui/material';

// 32, 33, 34, 37, 38번 가이드 적용
const StyledButton = styled(MuiButton)<ButtonProps>(({ theme, variant, color }) => ({
  borderRadius: theme.shape.borderRadius, // 28. Global Border Radius
  padding: `${theme.spacing(1.5)} ${theme.spacing(3)}`, // 38, 37
  boxShadow: 'none',
  textTransform: 'none',
  fontWeight: 600,
  minHeight: '44px', // 39. Button Height
  fontSize: '1rem', // 40. Button Text Size
  
  ...(variant === 'contained' &&
    color === 'primary' && {
      color: theme.palette.common.white, // 32
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark, // 33
        boxShadow: 'none',
      },
      '&:disabled': {
        backgroundColor: theme.palette.action.disabledBackground, // 34
        color: theme.palette.action.disabled,
      },
    }),
    
  ...(variant === 'outlined' && {
    borderColor: theme.palette.grey[300], // 36
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
  }),
  
  ...(variant === 'text' && {
    color: theme.palette.primary.main, // 35
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
}));

const Button: React.FC<ButtonProps> = (props) => {
  return <StyledButton {...props} />;
};

export default Button;