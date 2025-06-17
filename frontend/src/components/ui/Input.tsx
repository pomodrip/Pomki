import React from 'react';
import { TextField, TextFieldProps, styled } from '@mui/material';

// 41, 42, 43, 44, 45, 46번 가이드 적용
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.grey[50], // 41
    borderRadius: theme.shape.borderRadius, // 28
    '& fieldset': {
      borderColor: 'transparent', // 42
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main, // 43
      borderWidth: '2px',
    },
    '& input': {
      padding: theme.spacing(1.5), // 44
      fontSize: '1rem', // 45
    },
    '& input::placeholder': {
      color: theme.palette.text.secondary, // 46
      opacity: 1,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'standard' | 'pin';
}

const Input: React.FC<InputProps> = ({ variant = 'standard', ...props }) => {
  if (variant === 'pin') {
    return (
      <StyledTextField
        {...props}
        variant="outlined"
        inputProps={{
          ...props.inputProps,
          maxLength: 1,
          style: {
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 600,
            ...props.inputProps?.style,
          },
        }}
        sx={{
          width: '48px',
          height: '48px',
          '& .MuiOutlinedInput-root': {
            height: '48px',
          },
          ...props.sx,
        }}
      />
    );
  }

  return <StyledTextField {...props} variant="outlined" />;
};

export default Input;
