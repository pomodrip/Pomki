import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import MainLayout from '../pages/_layout/MainLayout';
import NotFoundPage from '../pages/Etc/NotFoundPage';

// 임시 간단한 테스트 컴포넌트 (디버깅용)
const TestPage = ({ title }: { title: string }) => {
  console.log(`${title} page rendering...`);
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">{title}</Typography>
      <Typography>이 페이지가 표시되면 라우팅이 작동하는 것입니다.</Typography>
      <Typography variant="body2" sx={{ mt: 2, color: 'gray' }}>
        하단에 네비게이션이 보여야 합니다.
      </Typography>
    </Box>
  );
};

const AppRoutes = () => {
  console.log('AppRoutes rendering...');
  
  return (
    <Routes>
      {/* 인증 관련 페이지 (레이아웃 없음) */}
      <Route path="/login" element={<TestPage title="로그인 페이지 (레이아웃 없음)" />} />
      
      {/* 메인 애플리케이션 (MainLayout 적용) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="dashboard" element={<TestPage title="대시보드 페이지" />} />
        <Route path="timer" element={<TestPage title="타이머 페이지" />} />
        <Route path="note" element={<TestPage title="노트 페이지" />} />
        <Route path="study" element={<TestPage title="학습 페이지" />} />
        <Route path="profile" element={<TestPage title="프로필 페이지" />} />
      </Route>
      
      {/* 404 페이지 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;