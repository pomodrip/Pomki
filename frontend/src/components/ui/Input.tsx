import React from 'react';
import { OutlinedInput as MuiOutlinedInput } from '@mui/material';
import type { OutlinedInputProps } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * 기본 입력(Input) 컴포넌트
 *
 * @param {OutlinedInputProps} props - Material-UI OutlinedInputProps를 상속받습니다.
 */
const Input: React.FC<OutlinedInputProps> = (props) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <MuiOutlinedInput
      {...props}
      type={props.type === 'password' ? (showPassword ? 'text' : 'password') : props.type}
      endAdornment={
        props.type === 'password' && (
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
        )
      }
    />
  );
};

export default Input;
