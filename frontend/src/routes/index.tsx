import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../pages/_layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import Spinner from '../components/ui/Spinner';
import { pageLoaders } from '../utils/preloadUtils';

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

/**
 * 브라우저가 유휴 상태일 때 핵심 페이지들을 미리 로드합니다.
 * 초기 로딩 성능에 영향을 주지 않으면서 후속 탐색 속도를 향상시킵니다.
 */
const preloadCriticalPagesOnIdle = () => {
  // 유휴 상태일 때 미리 로드할 페이지들의 경로 배열
  const criticalPaths = ['/dashboard', '/timer', '/note', '/study'];

  const preload = (deadline: IdleDeadline) => {
    // 유휴 시간이 남아있거나 작업이 긴급할 때 (타임아웃 발생 시) 루프 실행
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && criticalPaths.length > 0) {
      const path = criticalPaths.shift(); // 배열에서 경로 하나를 꺼냄
      if (path) {
        const loader = pageLoaders[path];
        if (loader) {
          loader().catch(() => { /* preloading 실패는 무시 */ });
        }
      }
    }

    // 아직 로드할 페이지가 남아있다면, 다음 유휴 시간에 다시 작업을 요청
    if (criticalPaths.length > 0) {
      requestIdleCallback(preload);
    }
  };

  // 브라우저가 지원하는 경우에만 유휴 콜백 등록
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload);
  } else {
    // 지원하지 않는 경우, 2초 후 약간의 지연을 두고 로드 (폴백)
    setTimeout(() => {
      criticalPaths.forEach(path => {
        const loader = pageLoaders[path];
        if(loader) loader().catch(() => {});
      });
    }, 2000);
  }
};


const AppRoutes = () => {
  // 컴포넌트 마운트 시 중요한 페이지들을 preload
  /* React.useEffect(() => {
    preloadCriticalPagesOnIdle(); // 유휴 시간에 핵심 페이지 preload 실행
  }, []); */

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