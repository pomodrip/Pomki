import React from 'react';
import { TextField, TextFieldProps, styled, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// 41, 42, 43, 44, 45, 46번 가이드 적용
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.grey[50], // 41
    borderRadius: theme.shape.borderRadius, // 28
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
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

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

  if (props.type !== 'password') {
    return <StyledTextField {...props} variant="outlined" />;
  }

  return (
    <StyledTextField
      {...props}
      variant="outlined"
      type={showPassword ? 'text' : 'password'}
      InputProps={{
        ...props.InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default Input;