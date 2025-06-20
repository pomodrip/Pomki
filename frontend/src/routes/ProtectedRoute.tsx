import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { RootState } from '../store/store';

const ProtectedRoute = () => {
  const { isAuthenticated, accessToken } = useAppSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />;
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