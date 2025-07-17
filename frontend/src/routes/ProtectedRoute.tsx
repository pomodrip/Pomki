import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { RootState } from '../store/store';
import { show401ErrorSnackbar } from '../store/slices/snackbarSlice';
import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import CircularProgress from '../components/ui/CircularProgress';

const ProtectedRoute = () => {
  const { isAuthenticated, accessToken, user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 사용자가 인증되었고, 소개 페이지를 아직 보지 않았다면 리디렉션
    if (isAuthenticated && user && user.hasSeenIntroduction === false && location.pathname !== '/introduction') {
      navigate('/introduction', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  useEffect(() => {
    // 🔵 Axios 간접 활용을 대신해 ProtectedRoute에서 스낵바 트리거
    // 인증되지 않은 상태에서 보호된 페이지에 접근하려고 할 때 Redux 액션 디스패치
    if (import.meta.env.CI !== 'true' &&(!isAuthenticated || !accessToken )) {
      console.log('CI:', import.meta.env.CI);
      dispatch(show401ErrorSnackbar()); 
    }
  }, [isAuthenticated, accessToken, dispatch]);

  // 🟢 React Component - 인증되지 않은 경우 로딩 UI 표시
  // 스낵바와 자동 리디렉션은 ErrorSnackbar 컴포넌트와 useSnackbarRedirect 훅에서 처리
  if (import.meta.env.CI !== 'true' &&(!isAuthenticated || !accessToken )) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
        sx={{ backgroundColor: 'background.default' }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          인증 확인 중...
        </Typography>
      </Box>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;


/**
 * 5.3. 인증된 접근을 위한 보호된 라우트 구현
ProtectedRoute는 특정 라우트를 인증된 사용자에게만 허용하기 위한 래퍼(wrapper) 컴포넌트입니다. 이 컴포넌트는 useAuth와 같은 커스텀 훅을 통해 Redux 스토어의 인증 상태(isAuthenticated)를 확인합니다. 만약 사용자가 인증되지 않았다면, react-router-dom의 <Navigate> 컴포넌트를 사용하여 로그인 페이지로 리디렉션시킵니다. 인증된 경우에만 자식 컴포넌트(페이지)를 렌더링하는 <Outlet>을 반환합니다. 

TypeScript

// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';

const ProtectedRoute = () => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // 실제 프로덕션 환경에서는 토큰 유효성 검증 로직 추가를 권장
  if (!isAuthenticated ||!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
 * 
 * 
 */