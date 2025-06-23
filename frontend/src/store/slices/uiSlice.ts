import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// ==========================================
// 1. 타입 정의
// ==========================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // ms, 0이면 수동으로 닫아야 함
  actions?: NotificationAction[];
  timestamp: number;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'text' | 'outlined' | 'contained';
}

export interface CreateNotificationPayload {
  type: NotificationItem['type'];
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface UISettings {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  bottomNavVisible: boolean;
  notifications: {
    enabled: boolean;
    sound: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
  animations: {
    enabled: boolean;
    duration: 'fast' | 'normal' | 'slow';
  };
}

// ==========================================
// 2. 상태 인터페이스
// ==========================================

export interface UIState {
  // 테마
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark'; // system 모드 해석 결과
  
  // 네비게이션
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  bottomNavVisible: boolean;
  
  // 전역 로딩
  globalLoading: boolean;
  loadingText?: string;
  
  // 알림 시스템
  notifications: NotificationItem[];
  maxNotifications: number;
  
  // 반응형
  isMobile: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // 설정
  settings: UISettings;
  
  // 상태
  initialized: boolean;
  error: string | null;
}

// ==========================================
// 3. 초기 상태
// ==========================================

const initialState: UIState = {
  theme: 'system',
  resolvedTheme: 'light',
  sidebarOpen: false,
  sidebarCollapsed: false,
  bottomNavVisible: true,
  globalLoading: false,
  loadingText: undefined,
  notifications: [],
  maxNotifications: 5,
  isMobile: false,
  screenSize: 'md',
  settings: {
    theme: 'system',
    sidebarCollapsed: false,
    bottomNavVisible: true,
    notifications: {
      enabled: true,
      sound: false,
      position: 'top-right',
    },
    animations: {
      enabled: true,
      duration: 'normal',
    },
  },
  initialized: false,
  error: null,
};

// ==========================================
// 4. 헬퍼 함수들
// ==========================================

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (theme: ThemeMode): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

const saveUISettings = (settings: UISettings) => {
  try {
    localStorage.setItem('ui_settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('UI 설정 저장 실패:', error);
  }
};

const loadUISettings = (): Partial<UISettings> => {
  try {
    const stored = localStorage.getItem('ui_settings');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('UI 설정 로드 실패:', error);
    return {};
  }
};

const generateNotificationId = () => `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ==========================================
// 5. Async Thunk 액션들
// ==========================================

// UI 초기화
export const initializeUI = createAsyncThunk<
  Partial<UISettings>,
  void,
  { state: RootState; rejectValue: string }
>('ui/initialize', async (_, { rejectWithValue }) => {
  try {
    const savedSettings = loadUISettings();
    
    // 시스템 테마 감지 설정 (향후 리스너 추가 예정)
    return savedSettings;
  } catch {
    return rejectWithValue('UI 초기화 실패');
  }
});

// 테마 변경
export const changeTheme = createAsyncThunk<
  { theme: ThemeMode; resolvedTheme: 'light' | 'dark' },
  ThemeMode,
  { state: RootState; rejectValue: string }
>('ui/changeTheme', async (theme, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const newSettings = {
      ...state.ui.settings,
      theme,
    };
    
    saveUISettings(newSettings);
    
    return {
      theme,
      resolvedTheme: resolveTheme(theme),
    };
  } catch {
    return rejectWithValue('테마 변경 실패');
  }
});

// UI 설정 업데이트
export const updateUISettings = createAsyncThunk<
  UISettings,
  Partial<UISettings>,
  { state: RootState; rejectValue: string }
>('ui/updateSettings', async (updates, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const newSettings = {
      ...state.ui.settings,
      ...updates,
    };
    
    saveUISettings(newSettings);
    return newSettings;
  } catch {
    return rejectWithValue('설정 업데이트 실패');
  }
});

// ==========================================
// 6. Slice 정의
// ==========================================

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 사이드바 관리
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // 바텀 네비게이션 관리
    setBottomNavVisible: (state, action: PayloadAction<boolean>) => {
      state.bottomNavVisible = action.payload;
    },
    
    toggleBottomNav: (state) => {
      state.bottomNavVisible = !state.bottomNavVisible;
    },
    
    // 전역 로딩 관리
    setGlobalLoading: (state, action: PayloadAction<{ loading: boolean; text?: string }>) => {
      state.globalLoading = action.payload.loading;
      state.loadingText = action.payload.text;
    },
    
    // 알림 관리
    addNotification: (state, action: PayloadAction<CreateNotificationPayload>) => {
      const notification: NotificationItem = {
        id: generateNotificationId(),
        ...action.payload,
        duration: action.payload.duration ?? 4000,
        timestamp: Date.now(),
      };
      
      state.notifications.unshift(notification);
      
      // 최대 알림 수 제한
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications);
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // 반응형 상태 업데이트
    updateScreenSize: (state, action: PayloadAction<{ 
      isMobile: boolean; 
      screenSize: UIState['screenSize'] 
    }>) => {
      state.isMobile = action.payload.isMobile;
      state.screenSize = action.payload.screenSize;
    },
    
    // 시스템 테마 변경 감지
    updateSystemTheme: (state) => {
      if (state.theme === 'system') {
        state.resolvedTheme = getSystemTheme();
      }
    },
    
    // 에러 관리
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // UI 초기화
      .addCase(initializeUI.fulfilled, (state, action) => {
        const savedSettings = action.payload;
        state.settings = { ...state.settings, ...savedSettings };
        state.theme = savedSettings.theme || state.theme;
        state.resolvedTheme = resolveTheme(state.theme);
        state.sidebarCollapsed = savedSettings.sidebarCollapsed ?? state.sidebarCollapsed;
        state.bottomNavVisible = savedSettings.bottomNavVisible ?? state.bottomNavVisible;
        state.initialized = true;
        state.error = null;
      })
      .addCase(initializeUI.rejected, (state, action) => {
        state.error = action.payload || '초기화 실패';
        state.initialized = true; // 실패해도 초기화는 완료로 처리
      })
      
      // 테마 변경
      .addCase(changeTheme.fulfilled, (state, action) => {
        state.theme = action.payload.theme;
        state.resolvedTheme = action.payload.resolvedTheme;
        state.settings.theme = action.payload.theme;
        state.error = null;
      })
      .addCase(changeTheme.rejected, (state, action) => {
        state.error = action.payload || '테마 변경 실패';
      })
      
      // 설정 업데이트
      .addCase(updateUISettings.fulfilled, (state, action) => {
        state.settings = action.payload;
        // 변경된 설정들을 상태에 반영
        state.theme = action.payload.theme;
        state.resolvedTheme = resolveTheme(action.payload.theme);
        state.sidebarCollapsed = action.payload.sidebarCollapsed;
        state.bottomNavVisible = action.payload.bottomNavVisible;
        state.error = null;
      })
      .addCase(updateUISettings.rejected, (state, action) => {
        state.error = action.payload || '설정 업데이트 실패';
      });
  },
});

// ==========================================
// 7. 액션 및 셀렉터 export
// ==========================================

export const {
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
  setError,
  clearError,
} = uiSlice.actions;

// 기본 셀렉터들
export const selectUI = (state: RootState) => state.ui;
export const selectTheme = (state: RootState) => state.ui.resolvedTheme;
export const selectIsMobile = (state: RootState) => state.ui.isMobile;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectBottomNavVisible = (state: RootState) => state.ui.bottomNavVisible;
export const selectGlobalLoading = (state: RootState) => state.ui.globalLoading;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectUISettings = (state: RootState) => state.ui.settings;

// 편의 셀렉터들
export const selectIsInitialized = (state: RootState) => state.ui.initialized;
export const selectScreenSize = (state: RootState) => state.ui.screenSize;
export const selectHasNotifications = (state: RootState) => state.ui.notifications.length > 0;
export const selectUnreadNotificationCount = (state: RootState) => state.ui.notifications.length;

// ==========================================
// 8. 편의 액션 생성자들
// ==========================================

// 미리 정의된 알림 타입들
export const showSuccessNotification = (title: string, message?: string, duration?: number) => 
  addNotification({ type: 'success', title, message, duration });

export const showErrorNotification = (title: string, message?: string, duration?: number) => 
  addNotification({ type: 'error', title, message, duration: duration ?? 6000 });

export const showWarningNotification = (title: string, message?: string, duration?: number) => 
  addNotification({ type: 'warning', title, message, duration: duration ?? 5000 });

export const showInfoNotification = (title: string, message?: string, duration?: number) => 
  addNotification({ type: 'info', title, message, duration });

export default uiSlice.reducer;
