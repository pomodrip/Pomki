// import React from 'react';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../pages/_layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import Spinner from '../components/ui/Spinner';

// ==========================================
// 동적 임포트를 위한 페이지 컴포넌트
// ==========================================

// Auth
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const OAuth2CallbackPage = lazy(() => import('../pages/Auth/OAuth2CallbackPage'));
const SignupPage = lazy(() => import('../pages/Auth/SignupPage'));
const SetGoalPage = lazy(() => import('../pages/Auth/SetGoalPage'));

// Dashboard
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));

// Profile
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));
const EditProfilePage = lazy(() => import('../pages/Profile/EditProfilePage'));

// Study
const FlashcardGenerationPage = lazy(() => import('../pages/Study/FlashcardGenerationPage'));
const FlashcardDeckListPage = lazy(() => import('../pages/Study/FlashcardDeckListPage'));
const FlashCardListPage = lazy(() => import('../pages/Study/FlashCardListPage'));
const FlashcardPracticePage = lazy(() => import('../pages/Study/FlashcardPracticePage'));
const DeckManagementPage = lazy(() => import('../pages/Study/DeckManagementPage'));

// Etc
const NotFoundPage = lazy(() => import('../pages/Etc/NotFoundPage'));

// Timer
const TimerPage = lazy(() => import('../pages/Timer/TimerPage'));

// Note
const NoteListPage = lazy(() => import('../pages/Note/NoteListPage'));
const NoteCreatePage = lazy(() => import('../pages/Note/NoteCreatePage'));
const NoteDetailPage = lazy(() => import('../pages/Note/NoteDetailPage'));

// Examples (개발 환경에서만 유용할 수 있으나, 일단 동적으로 로드)
const AdUsageExample = lazy(() => import('../examples/AdUsageExample'));
const ApiWithFallbackExample = lazy(() => import('../examples/ApiWithFallbackExample'));


const AppRoutes = () => {
  return (
    <Suspense fallback={<Spinner fullScreen />}>
      <Routes>
        {/* 인증 관련 페이지 (레이아웃 없음) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/login" element={<OAuth2CallbackPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/set-goal" element={<SetGoalPage />} />
        <Route path="/study/:noteId/flashcard-generation" element={<FlashcardGenerationPage />} />
        
        {/* 메인 애플리케이션 (MainLayout + ProtectedRoute 적용) */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate replace to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="timer" element={<TimerPage />} />
            <Route path="note" element={<NoteListPage />} />
            <Route path="note/create" element={<NoteCreatePage />} />
            <Route path="note/:noteId" element={<NoteDetailPage />} />
            <Route path="note/:noteId/edit" element={<NoteCreatePage />} />
            <Route path="study" element={<FlashcardDeckListPage />} />
            <Route path="flashcards/:deckId/cards" element={<FlashCardListPage />} />
            <Route path="flashcards/:deckId/practice" element={<FlashcardPracticePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/edit" element={<EditProfilePage />} />

            {/* 테스트 페이지 */}
            <Route path="study/deck-management" element={<DeckManagementPage />} />
            <Route path="ad" element={<AdUsageExample />} />
            <Route path="api-fallback" element={<ApiWithFallbackExample />} />
          </Route>
        </Route>
        
        {/* 404 페이지 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;