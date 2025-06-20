import React from "react";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import kakaoImg from "../../assets/icons/kakao.png";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Box, Checkbox, Typography, Alert, Paper } from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import Container from '@mui/material/Container';
import { getEmailValidationMessage, getPasswordValidationMessage } from "../../utils/validators";
import { loginUser } from "../../store/slices/authSlice";
import type { AppDispatch, RootState } from "../../store/store";
import { unwrapResult } from "@reduxjs/toolkit";

const SocialButton = styled(Button)(({ theme }) => ({
  height: '45px',
  justifyContent: 'center',
  fontWeight: 'bold',
  gap: theme.spacing(2),
  '& .MuiButton-startIcon': {
    margin: 0,
  },
}));

const KakaoButton = styled(SocialButton)({
  background: '#fee500',
  color: 'rgba(0, 0, 0, 0.85)',
  '&:hover': {
    background: '#fdd835',
  },
});

const GoogleButton = styled(SocialButton)(({ theme }) => ({
  background: '#ffffff',
  color: '#3c4043',
  border: '1px solid #dadce0',
  boxShadow: '0 1px 2px rgba(60,64,67,.08)',
  marginTop: '12px',
  '&:hover': {
    background: '#f5f5f5',
    border: '1px solid #dadce0',
  },
}));

const GoogleIcon = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: 20, height: 20 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);

const LoginPage = () => {
  const [id, setId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error: loginError } = useSelector((state: RootState) => state.auth);
  const isLoading = status === 'loading';

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setId(value);
    setEmailError(getEmailValidationMessage(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(getPasswordValidationMessage(value));
  };

  const handleLoginClick = async () => {
    const emailValidationError = getEmailValidationMessage(id);
    const passwordValidationError = getPasswordValidationMessage(password);
    
    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);
    
    if (!emailValidationError && !passwordValidationError) {
      try {
        const resultAction = await dispatch(loginUser({ email: id, password }));
        unwrapResult(resultAction);
        
        navigate('/dashboard');
        
      } catch (err: any) {
        // unwrapResult가 에러를 throw하므로 여기서 별도 처리가 필요 없습니다.
        // 에러 메시지는 authSlice의 state.error에서 자동으로 처리됩니다.
        console.error('Login failed:', err);
      }
    }
  };

  return (
    
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: { xs: '24px 8px', sm: '32px 16px' },
        mt: 8,
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          padding: { xs: 3, sm: 4 }, 
          borderRadius: 2 
        }}
      >
        <Typography variant="h1" sx={{ mb: 2, textAlign: 'center', fontSize: '36px' }} >🍅 Pomkist</Typography>
        <Typography variant="body2" sx={{ mb: 8, textAlign: 'center' }}>AI와 함께 플래시 카드를 만드세요.</Typography>
        
        
        {loginError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {loginError}
          </Alert>
        )}
        
        <Box sx={{ width: '100%', mb: 2 }}>
          <Input
            placeholder="이메일"
            value={id}
            onChange={handleEmailChange}
            fullWidth
            error={!!emailError}
            disabled={isLoading}
          />
          {emailError && (
            <Typography variant="body2" sx={{ color: 'error.main', mt: 0.5 }}>
              {emailError}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: '100%', mb: 3 }}>
          <Input
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            fullWidth
            error={!!passwordError}
            disabled={isLoading}
          />
          {passwordError && (
            <Typography variant="body2" sx={{ color: 'error.main', mt: 0.5 }}>
              {passwordError}
            </Typography>
          )}
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mb: 4, mt: 3 }}
          onClick={handleLoginClick}
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>

        <Box sx={{width: '100%', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button variant="text" sx={{ color: 'text.secondary' }} onClick={handleSignupClick} disabled={isLoading}>회원가입</Button>
          <Button variant="text" sx={{ color: 'text.secondary' }} disabled={isLoading}>비밀번호 찾기</Button>
        </Box>

        <KakaoButton
          fullWidth
          variant="contained"
          startIcon={<img src={kakaoImg} alt="카카오 심볼" style={{ width: 20, height: 20 }} />}
          disabled={isLoading}
        >
          카카오 로그인
        </KakaoButton>
        
        <GoogleButton
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          disabled={isLoading}
        >
          구글 로그인
        </GoogleButton>
        </Paper>
    </Container>
  );
};

export default LoginPage;
