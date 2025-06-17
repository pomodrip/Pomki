import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../pages/_layout/MainLayout';

// 실제 페이지 컴포넌트들 import
import DashboardPage from '../pages/Dashboard/DashboardPage';
import TimerPage from '../pages/Timer/TimerPage';
import LoginPage from '../pages/Auth/LoginPage';

const AppRoutes = () => {
  console.log('AppRoutes rendering...');
  
  return (
    <Routes>
      {/* 인증 관련 페이지 (레이아웃 없음) */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* 메인 애플리케이션 (MainLayout 적용) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="timer" element={<TimerPage />} />
        <Route path="note" element={<div>노트 페이지 (구현 예정)</div>} />
        <Route path="study" element={<div>학습 페이지 (구현 예정)</div>} />
        <Route path="profile" element={<div>프로필 페이지 (구현 예정)</div>} />
      </Route>
      
      {/* 404 페이지 */}
      <Route path="*" element={<div>404 - 페이지를 찾을 수 없습니다</div>} />
    </Routes>
  );
};

export default AppRoutes;