// import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../pages/_layout/MainLayout';
import LoginPage from '../pages/Auth/LoginPage';
import OAuth2CallbackPage from '../pages/Auth/OAuth2CallbackPage';
import SignupPage from '../pages/Auth/SignupPage';
import SetGoalPage from '../pages/Auth/SetGoalPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import EditProfilePage from '../pages/Profile/EditProfilePage';
import FlashcardGenerationPage from '../pages/Study/FlashcardGenerationPage';
import FlashcardDeckListPage from '../pages/Study/FlashcardDeckListPage';
import FlashCardListPage from '../pages/Study/FlashCardListPage';
import FlashcardPracticePage from '../pages/Study/FlashcardPracticePage';
import NotFoundPage from '../pages/Etc/NotFoundPage';
import TimerPage from '../pages/Timer/TimerPage';
import NoteListPage from '../pages/Note/NoteListPage';
import NoteCreatePage from '../pages/Note/NoteCreatePage';
import NoteDetailPage from '../pages/Note/NoteDetailPage';
import DeckManagementPage from '../pages/Study/DeckManagementPage';
import AdUsageExample from '../examples/AdUsageExample';
// import SimpleNoteList from '../pages/Note/SimpleNoteList';
// import SimpleNoteCreate from '../pages/Note/SimpleNoteCreate';
// import SimpleNoteDetail from '../pages/Note/SimpleNoteDetail';

// import MembershipUsageExample from '../examples/MembershipUsageExample';
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
      <Route path="/auth/login" element={<OAuth2CallbackPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/set-goal" element={<SetGoalPage />} />
      <Route path="/study/:noteId/flashcard-generation" element={<FlashcardGenerationPage />} />
      
      {/* 메인 애플리케이션 (MainLayout 적용) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="timer" element={<TimerPage />} />
        
        {/* Note Routes */}
        <Route path="note" element={<NoteListPage />} />
        <Route path="note/create" element={<NoteCreatePage />} />
        <Route path="note/:noteId" element={<NoteDetailPage />} />
        <Route path="note/:noteId/edit" element={<NoteCreatePage />} />

        {/* Study Routes */}
        <Route path="study" element={<FlashcardDeckListPage />} />
        <Route path="flashcards/:deckId/cards" element={<FlashCardListPage />} />
        <Route path="flashcards/:deckId/practice" element={<FlashcardPracticePage />} />
        
        {/* Profile Routes */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />

        {/* Test/Example Routes */}
        <Route path="study/deck-management" element={<DeckManagementPage />} />
        <Route path="ad" element={<AdUsageExample />} />
      </Route>
      
      {/* 404 페이지 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;