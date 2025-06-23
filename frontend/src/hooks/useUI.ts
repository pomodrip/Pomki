import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import type { AppDispatch } from '../store/store';
import {
  initializeUI,
  changeTheme,
  updateUISettings,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setBottomNavVisible,
  toggleBottomNav,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearAllNotifications,
  updateScreenSize,
  updateSystemTheme,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  selectUI,
  selectTheme,
  selectIsMobile,
  selectSidebarOpen,
  selectBottomNavVisible,
  selectGlobalLoading,
  selectNotifications,
  selectUISettings,
  selectIsInitialized,
  selectScreenSize,
  selectHasNotifications,
  selectUnreadNotificationCount,
  type ThemeMode,
  type CreateNotificationPayload,
  type UISettings,
} from '../store/slices/uiSlice';

/**
 * 🎨 UI 상태 관리를 위한 커스텀 훅
 * 
 * 전역 UI 상태를 관리하고 테마, 네비게이션, 알림 등의 기능을 제공합니다.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     theme, 
 *     isMobile, 
 *     toggleTheme, 
 *     showSuccess 
 *   } = useUI();
 *   
 *   return (
 *     <div className={theme === 'dark' ? 'dark' : 'light'}>
 *       <button onClick={toggleTheme}>테마 변경</button>
 *       <button onClick={() => showSuccess('성공!')}>성공 알림</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useUI = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 셀렉터들
  const ui = useSelector(selectUI);
  const theme = useSelector(selectTheme);
  const isMobile = useSelector(selectIsMobile);
  const sidebarOpen = useSelector(selectSidebarOpen);
  const bottomNavVisible = useSelector(selectBottomNavVisible);
  const globalLoading = useSelector(selectGlobalLoading);
  const notifications = useSelector(selectNotifications);
  const settings = useSelector(selectUISettings);
  const isInitialized = useSelector(selectIsInitialized);
  const screenSize = useSelector(selectScreenSize);
  const hasNotifications = useSelector(selectHasNotifications);
  const notificationCount = useSelector(selectUnreadNotificationCount);

  // 액션 생성자들
  const initialize = useCallback(() => {
    dispatch(initializeUI());
  }, [dispatch]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    dispatch(changeTheme(newTheme));
  }, [dispatch]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(changeTheme(newTheme));
  }, [dispatch, theme]);

  const updateSettings = useCallback((updates: Partial<UISettings>) => {
    dispatch(updateUISettings(updates));
  }, [dispatch]);

  // 사이드바 관리
  const openSidebar = useCallback(() => {
    dispatch(setSidebarOpen(true));
  }, [dispatch]);

  const closeSidebar = useCallback(() => {
    dispatch(setSidebarOpen(false));
  }, [dispatch]);

  const toggleSidebarState = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const collapseSidebar = useCallback((collapsed: boolean) => {
    dispatch(setSidebarCollapsed(collapsed));
  }, [dispatch]);

  const toggleSidebarCollapse = useCallback(() => {
    dispatch(toggleSidebarCollapsed());
  }, [dispatch]);

  // 바텀 네비게이션 관리
  const showBottomNav = useCallback((visible: boolean) => {
    dispatch(setBottomNavVisible(visible));
  }, [dispatch]);

  const toggleBottomNavigation = useCallback(() => {
    dispatch(toggleBottomNav());
  }, [dispatch]);

  // 전역 로딩
  const showGlobalLoading = useCallback((text?: string) => {
    dispatch(setGlobalLoading({ loading: true, text }));
  }, [dispatch]);

  const hideGlobalLoading = useCallback(() => {
    dispatch(setGlobalLoading({ loading: false }));
  }, [dispatch]);

  // 알림 관리
  const notify = useCallback((notification: CreateNotificationPayload) => {
    dispatch(addNotification(notification));
  }, [dispatch]);

  const removeNotify = useCallback((id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const clearNotifications = useCallback(() => {
    dispatch(clearAllNotifications());
  }, [dispatch]);

  // 편의 알림 메서드들
  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    dispatch(showSuccessNotification(title, message, duration));
  }, [dispatch]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    dispatch(showErrorNotification(title, message, duration));
  }, [dispatch]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    dispatch(showWarningNotification(title, message, duration));
  }, [dispatch]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    dispatch(showInfoNotification(title, message, duration));
  }, [dispatch]);

  // 화면 크기 감지
  const updateScreenInfo = useCallback((width: number) => {
    let screenSize: typeof ui.screenSize;
    let isMobileView: boolean;

    if (width < 576) {
      screenSize = 'xs';
      isMobileView = true;
    } else if (width < 768) {
      screenSize = 'sm';
      isMobileView = true;
    } else if (width < 992) {
      screenSize = 'md';
      isMobileView = false;
    } else if (width < 1200) {
      screenSize = 'lg';
      isMobileView = false;
    } else {
      screenSize = 'xl';
      isMobileView = false;
    }

    dispatch(updateScreenSize({ isMobile: isMobileView, screenSize }));
  }, [dispatch]);

  // 시스템 테마 변경 감지
  const handleSystemThemeChange = useCallback(() => {
    dispatch(updateSystemTheme());
  }, [dispatch]);

  return {
    // 상태
    ui,
    theme,
    isMobile,
    sidebarOpen,
    bottomNavVisible,
    globalLoading,
    notifications,
    settings,
    isInitialized,
    screenSize,
    hasNotifications,
    notificationCount,
    
    // 초기화
    initialize,
    
    // 테마 관리
    setTheme,
    toggleTheme,
    
    // 설정 관리
    updateSettings,
    
    // 사이드바 관리
    openSidebar,
    closeSidebar,
    toggleSidebarState,
    collapseSidebar,
    toggleSidebarCollapse,
    
    // 바텀 네비게이션 관리
    showBottomNav,
    toggleBottomNavigation,
    
    // 전역 로딩
    showGlobalLoading,
    hideGlobalLoading,
    
    // 알림 관리
    notify,
    removeNotify,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // 화면 크기 관리
    updateScreenInfo,
    handleSystemThemeChange,
  };
};

/**
 * 🎨 테마 전용 훅
 * 
 * 테마 관련 기능만 필요한 경우 사용
 */
export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useUI();
  
  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

/**
 * 🔔 알림 전용 훅
 * 
 * 알림 관련 기능만 필요한 경우 사용
 */
export const useNotifications = () => {
  const {
    notifications,
    hasNotifications,
    notificationCount,
    notify,
    removeNotify,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useUI();
  
  return {
    notifications,
    hasNotifications,
    count: notificationCount,
    notify,
    remove: removeNotify,
    clear: clearNotifications,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
  };
};

/**
 * 📱 반응형 전용 훅
 * 
 * 반응형 기능만 필요한 경우 사용
 */
export const useResponsiveUI = () => {
  const { isMobile, screenSize, updateScreenInfo } = useUI();
  
  useEffect(() => {
    const handleResize = () => {
      updateScreenInfo(window.innerWidth);
    };
    
    // 초기 설정
    handleResize();
    
    // 리스너 등록
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScreenInfo]);
  
  return {
    isMobile,
    screenSize,
    isXs: screenSize === 'xs',
    isSm: screenSize === 'sm',
    isMd: screenSize === 'md',
    isLg: screenSize === 'lg',
    isXl: screenSize === 'xl',
  };
}; 