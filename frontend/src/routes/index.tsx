import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../pages/_layout/MainLayout';
import LoginPage from '../pages/Auth/LoginPage';
import SignupPage from '../pages/Auth/SignupPage';
import SetGoalPage from '../pages/Auth/SetGoalPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import NotFoundPage from '../pages/Etc/NotFoundPage';
import TimerPage from '../pages/Timer/TimerPage';
import NoteListPage from '../pages/Note/NoteListPage';
// import StudyPage from '../pages/Study/StudyPage';
// import ProfilePage from '../pages/Profile/ProfilePage';

// 실제 페이지 컴포넌트들 import
// import DashboardPage from '../pages/Dashboard/DashboardPage';
// import TimerPage from '../pages/Timer/TimerPage';


// 임시 간단한 테스트 컴포넌트 (디버깅용)
// const TestPage = ({ title }: { title: string }) => {
//   console.log(`${title} page rendering...`);
//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4">{title}</Typography>
//       <Typography>이 페이지가 표시되면 라우팅이 작동하는 것입니다.</Typography>
//       <Typography variant="body2" sx={{ mt: 2, color: 'gray' }}>
//         하단에 네비게이션이 보여야 합니다.
//       </Typography>
//     </Box>
//   );
// };

const AppRoutes = () => {
  console.log('AppRoutes rendering...');
  
  return (
    <Routes>
      {/* 인증 관련 페이지 (레이아웃 없음) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/set-goal" element={<SetGoalPage />} />
      
      {/* 메인 애플리케이션 (MainLayout 적용) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="timer" element={<TimerPage />} />
        <Route path="note" element={<NoteListPage  />} />
        {/* <Route path="study" element={<StudyPage title="학습 페이지" />} />
        <Route path="profile" element={<ProfilePage title="프로필 페이지" />} /> */}
      </Route>
      
      {/* 404 페이지 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;