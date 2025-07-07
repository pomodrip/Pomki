import React, { lazy, Suspense } from 'react';
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

// Dashboard (자주 사용되는 페이지 - 우선순위 높음)
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));

// Profile
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));
const EditProfilePage = lazy(() => import('../pages/Profile/EditProfilePage'));
const WithdrawalPage = lazy(() => import('../pages/Profile/WithdrawalPage'));

// Study (자주 사용되는 페이지들)
const FlashcardGenerationPage = lazy(() => import('../pages/Study/FlashcardGenerationPage'));
const FlashcardDeckListPage = lazy(() => import('../pages/Study/FlashcardDeckListPage'));
const FlashCardListPage = lazy(() => import('../pages/Study/FlashCardListPage'));
const FlashcardPracticePage = lazy(() => import('../pages/Study/FlashcardPracticePage'));
const DeckManagementPage = lazy(() => import('../pages/Study/DeckManagementPage'));

// Timer (자주 사용되는 페이지들)
const TimerPage = lazy(() => import('../pages/Timer/TimerPage'));
const TimerSettingsPage = lazy(() => import('../pages/Timer/TimerSettingsPage'));
const PomodoroPage = lazy(() => import('../pages/Timer/PomodoroPage'));

// Note (자주 사용되는 페이지들)
const NoteListPage = lazy(() => import('../pages/Note/NoteListPage'));
const NoteCreatePage = lazy(() => import('../pages/Note/NoteCreatePage'));
const NoteDetailPage = lazy(() => import('../pages/Note/NoteDetailPage'));

// Etc
const NotFoundPage = lazy(() => import('../pages/Etc/NotFoundPage'));
const OnboardingIntro = lazy(
  () => import('../pages/Etc/OnboardingIntro'),
);

// Examples (개발 환경에서만 유용할 수 있으나, 일단 동적으로 로드)
const AdUsageExample = lazy(() => import('../examples/AdUsageExample'));
const ApiWithFallbackExample = lazy(() => import('../examples/ApiWithFallbackExample'));

// ==========================================
// 페이지 Preload 함수들 (성능 최적화)
// ==========================================

// 자주 사용되는 페이지들을 미리 로드
const preloadCriticalPages = () => {
  // 사용자가 로그인 후 가장 먼저 접근할 가능성이 높은 페이지들
  const criticalPages = [
    () => import('../pages/Dashboard/DashboardPage'),
    () => import('../pages/Study/FlashcardDeckListPage'),
    () => import('../pages/Timer/TimerPage'),
    () => import('../pages/Note/NoteListPage'),
  ];

  // 1초 후에 preload 시작 (초기 로딩에 방해되지 않도록)
  setTimeout(() => {
    criticalPages.forEach(importPage => {
      importPage().catch(() => {
        // preload 실패는 무시 (사용자 경험에 영향 없음)
      });
    });
  }, 1000);
};

const AppRoutes = () => {
  // 컴포넌트 마운트 시 중요한 페이지들을 preload
  React.useEffect(() => {
    preloadCriticalPages();
  }, []);

  return (
    <Suspense fallback={<Spinner fullScreen />}>
      <Routes>
        {/* 인증 관련 페이지 (레이아웃 없음) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/login" element={<OAuth2CallbackPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/set-goal" element={<SetGoalPage />} />
        <Route path="/introduction" element={<OnboardingIntro />} />
        <Route path="/study/:noteId/flashcard-generation" element={<FlashcardGenerationPage />} />
        
        {/* 메인 애플리케이션 (MainLayout + ProtectedRoute 적용) */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate replace to="/timer" />} />
            
            {/* 핵심 페이지들 (자주 사용됨) */}
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Timer 관련 라우트 */}
            <Route path="timer" element={<TimerPage />} />
            <Route path="timer/settings" element={<TimerSettingsPage />} />
            <Route path="timer/pomodoro" element={<PomodoroPage />} />
            
            {/* Note 관련 라우트 */}
            <Route path="note" element={<NoteListPage />} />
            <Route path="note/create" element={<NoteCreatePage />} />
            <Route path="note/:noteId" element={<NoteDetailPage />} />
            <Route path="note/:noteId/edit" element={<NoteCreatePage />} />
            
            {/* Study 관련 라우트 */}
            <Route path="study" element={<FlashcardDeckListPage />} />
            <Route path="study/deck-management" element={<DeckManagementPage />} />
            <Route path="flashcards/:deckId/cards" element={<FlashCardListPage />} />
            <Route path="flashcards/:deckId/practice" element={<FlashcardPracticePage />} />
            
            {/* Profile 관련 라우트 */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/edit" element={<EditProfilePage />} />
            <Route path="profile/withdrawal" element={<WithdrawalPage />} />

            {/* 개발/테스트 페이지 */}
            <Route path="examples/ad" element={<AdUsageExample />} />
            <Route path="examples/api-fallback" element={<ApiWithFallbackExample />} />
          </Route>
        </Route>
        
        {/* 404 페이지 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;