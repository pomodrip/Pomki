// src/utils/preloadUtils.ts

/**
 * 페이지 경로와 해당 페이지를 동적으로 import하는 함수를 매핑합니다.
 * 이 객체를 사용하면 문자열 경로를 기반으로 원하는 페이지의 코드를 미리 로드할 수 있습니다.
 */
export const pageLoaders: { [key: string]: () => Promise<any> } = {
  '/dashboard': () => import('../pages/Dashboard/DashboardPage'),
  '/study': () => import('../pages/Study/FlashcardDeckListPage'),
  '/timer': () => import('../pages/Timer/TimerPage'),
  '/note': () => import('../pages/Note/NoteListPage'),
  '/profile': () => import('../pages/Profile/ProfilePage'),
  // ... preloading이 필요할 수 있는 다른 주요 페이지들을 여기에 추가
};

/**
 * 주어진 경로에 해당하는 페이지의 JavaScript 모듈을 미리 로드합니다.
 * 사용자가 해당 페이지로 이동하기 전에 호출하면, 네트워크 지연 없이 페이지를 렌더링할 수 있습니다.
 * @param path 미리 로드할 페이지의 경로 (pageLoaders에 정의된 키)
 */
export const preloadPage = (path: string) => {
  const loader = pageLoaders[path];
  if (loader) {
    // preloading 실패는 사용자 경험에 치명적이지 않으므로, 에러는 콘솔에 경고로만 표시하고 무시합니다.
    loader().catch(err => {
      console.warn(`Preloading failed for ${path}:`, err);
    });
  }
}; 