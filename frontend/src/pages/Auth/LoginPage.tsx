import React, { useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // 임시로 대시보드로 이동
    navigate('/dashboard');
  };

  const handleKakaoLogin = () => {
    // 카카오 로그인 로직
    console.log('카카오 로그인');
  };

  const handleGoogleLogin = () => {
    // 구글 로그인 로직
    console.log('구글 로그인');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '32px 24px', // design.md 패딩 적용
        backgroundColor: '#F8F9FA', // Background Secondary
      }}
    >
      {/* 페이지 제목 */}
      <Typography 
        variant="h1"
        sx={{
          fontSize: '28px', // H2 크기 사용
          fontWeight: 700,
          color: '#1A1A1A', // Text Primary
          lineHeight: 1.25,
          marginBottom: '8px',
          textAlign: 'center',
        }}
      >
        학습의 새로운 차원
      </Typography>

      <Typography 
        sx={{
          fontSize: '16px', // Body Regular
          fontWeight: 400,
          color: '#6B7280', // Text Secondary
          lineHeight: 1.5,
          marginBottom: '32px',
          textAlign: 'center',
        }}
      >
        Pomki와 함께 생산하세요.
      </Typography>

      {/* 로그인 폼 */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px', // Medium Spacing
        }}
      >
        <Input
          fullWidth
          placeholder="이메일"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          sx={{
            backgroundColor: '#FFFFFF', // Background Primary
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px', // Medium Radius
            },
          }}
        />
        
        <Input
          fullWidth
          placeholder="비밀번호"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          sx={{
            backgroundColor: '#FFFFFF',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.rememberMe}
              onChange={handleInputChange('rememberMe')}
              sx={{ color: '#2563EB' }} // Primary Main
            />
          }
          label={
            <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
              아이디 저장
            </Typography>
          }
          sx={{ alignSelf: 'flex-start', mb: 1 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#2563EB', // Primary Main
            color: '#FFFFFF',
            fontSize: '16px', // Button Large
            fontWeight: 600,
            padding: '12px 24px',
            borderRadius: '8px',
            textTransform: 'none',
            mb: 2,
            '&:hover': {
              backgroundColor: '#1D4ED8', // Primary Dark
            },
          }}
        >
          로그인
        </Button>

        {/* 하단 링크들 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Typography 
            sx={{ 
              fontSize: '14px', 
              color: '#6B7280',
              cursor: 'pointer',
              '&:hover': { color: '#1A1A1A' }
            }}
          >
            회원가입
          </Typography>
          <Typography 
            sx={{ 
              fontSize: '14px', 
              color: '#6B7280',
              cursor: 'pointer',
              '&:hover': { color: '#1A1A1A' }
            }}
          >
            비밀번호 찾기
          </Typography>
        </Box>

        {/* 소셜 로그인 버튼들 */}
        <Button
          fullWidth
          onClick={handleKakaoLogin}
          sx={{
            backgroundColor: '#FEE500', // 카카오 옐로우
            color: '#000000',
            fontSize: '16px',
            fontWeight: 600,
            padding: '12px 24px',
            borderRadius: '8px',
            textTransform: 'none',
            mb: 1,
            '&:hover': {
              backgroundColor: '#FDD835',
            },
          }}
        >
          💬 카카오 로그인
        </Button>

        <Button
          fullWidth
          onClick={handleGoogleLogin}
          sx={{
            backgroundColor: '#FFFFFF',
            color: '#1A1A1A',
            fontSize: '16px',
            fontWeight: 600,
            padding: '12px 24px',
            borderRadius: '8px',
            textTransform: 'none',
            border: '1px solid #E5E7EB', // Border Medium
            '&:hover': {
              backgroundColor: '#F8F9FA',
            },
          }}
        >
          G 구글 로그인
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
