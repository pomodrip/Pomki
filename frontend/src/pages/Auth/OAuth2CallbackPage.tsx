import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Typography, Alert } from '@mui/material';
import CircularProgress from '../../components/ui/CircularProgress';
import { AppDispatch } from '../../store/store';
import { setOAuth2User, setAccessToken } from '../../store/slices/authSlice';
import { getMyInfo } from '../../api/userApi';

const OAuth2CallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const handleOAuth2Callback = async () => {
      try {
        // URL에서 토큰과 결과 확인
        const accessToken = searchParams.get('accessToken'); // ✅ 올바른 파라미터명
        const resultCode = searchParams.get('resultCode');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(`OAuth2 인증 실패: ${errorParam}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (resultCode !== '200') {
          setError(`인증 실패: ${resultCode}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!accessToken) {
          setError('액세스 토큰이 없습니다.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // 1. 먼저 accessToken을 Redux에 저장
        dispatch(setAccessToken(accessToken));

        // 2. 실제 사용자 정보 가져오기
        try {
          const userInfo = await getMyInfo();
          
          // 3. 완전한 사용자 정보로 Redux 업데이트
          await dispatch(setOAuth2User({
            accessToken,
            user: {
              memberId: 0, // API에서 받아야 할 실제 값
              email: userInfo.email,
              nickname: userInfo.nickname,
              isEmailVerified: true,
              socialLogin: true
            }
          }));

          navigate('/dashboard');
          
        } catch (apiError) {
          console.error('사용자 정보 가져오기 실패:', apiError);
          // 토큰은 있으니까 대시보드로 이동
          navigate('/dashboard');
        }
        
      } catch (err) {
        console.error('OAuth2 콜백 처리 중 오류:', err);
        setError('인증 처리 중 오류가 발생했습니다.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuth2Callback();
  }, [searchParams, navigate, dispatch]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          3초 후 로그인 페이지로 이동합니다...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={40} />
      <Typography variant="h6">로그인 처리 중...</Typography>
      <Typography variant="body2" color="text.secondary">
        잠시만 기다려주세요.
      </Typography>
    </Box>
  );
};

export default OAuth2CallbackPage; 