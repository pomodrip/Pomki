import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// ==========================================
// 1. 타입 정의
// ==========================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    light: CustomColors;
    dark: CustomColors;
  };
}

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // ms, 0이면 수동으로 닫아야 함
  actions?: NotificationAction[];
  timestamp: number;
  persist?: boolean; // 새로고침 후에도 유지할지 여부
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface CreateNotificationPayload {
  type: NotificationItem['type'];
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
  persist?: boolean;
}

export interface UISettings {
  theme: ThemeMode;
  themePreset: string; // 선택된 테마 프리셋 ID
  customColors?: Partial<CustomColors>; // 사용자 정의 색상
  sidebarCollapsed: boolean;
  bottomNavVisible: boolean;
  animations: {
    enabled: boolean;
    duration: 'fast' | 'normal' | 'slow';
    reduceMotion: boolean; // 접근성: 모션 줄이기
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    maxVisible: number; // 동시에 표시할 최대 알림 수
    enablePersist: boolean; // 지속적 알림 활성화
  };
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reduceMotion: boolean;
  };
}

// ==========================================
// 2. 상태 인터페이스
// ==========================================

export interface UIState {
  // 테마
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark'; // system 모드 해석 결과
  themePresets: ThemePreset[]; // 사용 가능한 테마 프리셋들
  currentPreset: ThemePreset | null; // 현재 적용된 프리셋
  
  // 네비게이션
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  bottomNavVisible: boolean;
  
  // 전역 로딩
  globalLoading: boolean;
  loadingText?: string;
  loadingStack: string[]; // 여러 로딩 상태 관리
  
  // 알림 시스템
  notifications: NotificationItem[];
  maxNotifications: number;
  notificationQueue: NotificationItem[]; // 대기 중인 알림들
  
  // 반응형
  isMobile: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // 플로팅 액션 버튼 
  fab: {
    visible: boolean;
    position: {
      bottom: number;
      right: number | string;
    };
    size: 'small' | 'medium' | 'large';
    variant: 'circular' | 'extended';
    disabled: boolean;
  };
  
  // 설정
  settings: UISettings;
  
  // 상태
  initialized: boolean;
  error: string | null;
}

// ==========================================
// 3. 기본 테마 프리셋들
// ==========================================

const defaultThemePresets: ThemePreset[] = [
  {
    id: 'pomki-default',
    name: 'Pomki 기본',
    description: '기본 Pomki 테마',
    colors: {
      light: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#1E293B',
        textSecondary: '#64748B',
      },
      dark: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#FBBF24',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F1F5F9',
        textSecondary: '#94A3B8',
      },
    },
  },
  {
    id: 'forest',
    name: '포레스트',
    description: '자연스러운 녹색 테마',
    colors: {
      light: {
        primary: '#059669',
        secondary: '#0D9488',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F0FDF4',
        text: '#064E3B',
        textSecondary: '#047857',
      },
      dark: {
        primary: '#10B981',
        secondary: '#14B8A6',
        accent: '#FBBF24',
        background: '#064E3B',
        surface: '#065F46',
        text: '#ECFDF5',
        textSecondary: '#A7F3D0',
      },
    },
  },
  {
    id: 'sunset',
    name: '선셋',
    description: '따뜻한 석양 테마',
    colors: {
      light: {
        primary: '#DC2626',
        secondary: '#EA580C',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#FEF2F2',
        text: '#7F1D1D',
        textSecondary: '#DC2626',
      },
      dark: {
        primary: '#F87171',
        secondary: '#FB923C',
        accent: '#FBBF24',
        background: '#7F1D1D',
        surface: '#991B1B',
        text: '#FEF2F2',
        textSecondary: '#FCA5A5',
      },
    },
  },
  {
    id: 'ocean',
    name: '오션',
    description: '시원한 바다 테마',
    colors: {
      light: {
        primary: '#0EA5E9',
        secondary: '#06B6D4',
        accent: '#8B5CF6',
        background: '#FFFFFF',
        surface: '#F0F9FF',
        text: '#0C4A6E',
        textSecondary: '#0369A1',
      },
      dark: {
        primary: '#38BDF8',
        secondary: '#22D3EE',
        accent: '#A78BFA',
        background: '#0C4A6E',
        surface: '#075985',
        text: '#F0F9FF',
        textSecondary: '#7DD3FC',
      },
    },
  },
];

// ==========================================
// 4. 초기 상태
// ==========================================

const initialState: UIState = {
  theme: 'system',
  resolvedTheme: 'light',
  themePresets: defaultThemePresets,
  currentPreset: defaultThemePresets[0],
  sidebarOpen: false,
  sidebarCollapsed: false,
  bottomNavVisible: true,
  globalLoading: false,
  loadingText: undefined,
  loadingStack: [],
  notifications: [],
  maxNotifications: 5,
  notificationQueue: [],
  isMobile: false,
  screenSize: 'md',
  fab: {
    visible: false,
    position: {
      bottom: 80,
      right: 16,
    },
    size: 'medium',
    variant: 'circular',
    disabled: false,
  },
  settings: {
    theme: 'system',
    themePreset: 'pomki-default',
    sidebarCollapsed: false,
    bottomNavVisible: true,
    animations: {
      enabled: true,
      duration: 'normal',
      reduceMotion: false,
    },
    notifications: {
      enabled: true,
      sound: false,
      position: 'bottom-right',
      maxVisible: 3,
      enablePersist: false,
    },
    accessibility: {
      highContrast: false,
      fontSize: 'medium',
      reduceMotion: false,
    },
  },
  initialized: false,
  error: null,
};

// ==========================================
// 5. 헬퍼 함수들
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
// 6. Async Thunk 액션들
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
// 7. Slice 정의
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
    
    // 전역 로딩 관리 (스택 기반)
    setGlobalLoading: (state, action: PayloadAction<{ loading: boolean; text?: string }>) => {
      if (action.payload.loading) {
        // 로딩 시작
        if (action.payload.text) {
          state.loadingStack.push(action.payload.text);
        }
        state.globalLoading = true;
        state.loadingText = action.payload.text || state.loadingStack[state.loadingStack.length - 1];
      } else {
        // 로딩 종료
        if (action.payload.text) {
          // 특정 텍스트의 로딩 제거
          state.loadingStack = state.loadingStack.filter(text => text !== action.payload.text);
        } else {
          // 마지막 로딩 제거
          state.loadingStack.pop();
        }
        
        if (state.loadingStack.length === 0) {
          state.globalLoading = false;
          state.loadingText = undefined;
        } else {
          state.loadingText = state.loadingStack[state.loadingStack.length - 1];
        }
      }
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

    // 테마 프리셋 관리
    setThemePreset: (state, action: PayloadAction<string>) => {
      const preset = state.themePresets.find(p => p.id === action.payload);
      if (preset) {
        state.currentPreset = preset;
        state.settings.themePreset = action.payload;
      }
    },

    addCustomThemePreset: (state, action: PayloadAction<ThemePreset>) => {
      const existingIndex = state.themePresets.findIndex(p => p.id === action.payload.id);
      if (existingIndex >= 0) {
        state.themePresets[existingIndex] = action.payload;
      } else {
        state.themePresets.push(action.payload);
      }
    },

    removeThemePreset: (state, action: PayloadAction<string>) => {
      // 기본 프리셋은 삭제할 수 없음
      const preset = state.themePresets.find(p => p.id === action.payload);
      if (preset && !['pomki-default', 'forest', 'sunset', 'ocean'].includes(preset.id)) {
        state.themePresets = state.themePresets.filter(p => p.id !== action.payload);
        
        // 현재 선택된 프리셋이 삭제되면 기본 프리셋으로 변경
        if (state.currentPreset?.id === action.payload) {
          state.currentPreset = state.themePresets[0];
          state.settings.themePreset = state.themePresets[0].id;
        }
      }
    },

    // 접근성 설정
    setHighContrast: (state, action: PayloadAction<boolean>) => {
      state.settings.accessibility.highContrast = action.payload;
    },

    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.settings.accessibility.fontSize = action.payload;
    },

    setReduceMotion: (state, action: PayloadAction<boolean>) => {
      state.settings.accessibility.reduceMotion = action.payload;
      state.settings.animations.reduceMotion = action.payload;
    },

    // 알림 큐 관리
    addToNotificationQueue: (state, action: PayloadAction<NotificationItem>) => {
      state.notificationQueue.push(action.payload);
    },

    processNotificationQueue: (state) => {
      const maxVisible = state.settings.notifications.maxVisible;
      const currentVisible = state.notifications.length;
      
      if (currentVisible < maxVisible && state.notificationQueue.length > 0) {
        const notification = state.notificationQueue.shift();
        if (notification) {
          state.notifications.unshift(notification);
        }
      }
    },

    // 알림 설정
    updateNotificationSettings: (state, action: PayloadAction<Partial<UISettings['notifications']>>) => {
      state.settings.notifications = { ...state.settings.notifications, ...action.payload };
    },

    // 🔴 FAB (플로팅 액션 버튼) 관리
    setFabVisible: (state, action: PayloadAction<boolean>) => {
      state.fab.visible = action.payload;
    },

    updateFabPosition: (state, action: PayloadAction<{ bottom?: number; right?: number | string }>) => {
      if (action.payload.bottom !== undefined) {
        state.fab.position.bottom = action.payload.bottom;
      }
      if (action.payload.right !== undefined) {
        state.fab.position.right = action.payload.right;
      }
    },

    setFabSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fab.size = action.payload;
    },

    setFabDisabled: (state, action: PayloadAction<boolean>) => {
      state.fab.disabled = action.payload;
    },

    toggleFab: (state) => {
      state.fab.visible = !state.fab.visible;
    },

    // 화면 크기에 따른 FAB 자동 조정
    adjustFabForScreenSize: (state, action: PayloadAction<{ isMobile: boolean; hasBottomNav: boolean }>) => {
      const { isMobile, hasBottomNav } = action.payload;
      
      // 위치만 조정하고, visible 상태는 페이지에서 제어하도록 변경
      if (isMobile) {
        // 모바일/태블릿: 바텀네비 위치에 맞춰 조정
        state.fab.position.bottom = hasBottomNav ? 80 : 16;
        state.fab.position.right = 16;
      } else {
        // 데스크톱: 기본 위치
        state.fab.position.bottom = 16;
        state.fab.position.right = 16;
      }
      
      console.log('🔴 adjustFabForScreenSize:', {
        isMobile,
        hasBottomNav,
        position: state.fab.position,
        visible: state.fab.visible
      });
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
// 8. 액션 및 셀렉터 export
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
  setThemePreset,
  addCustomThemePreset,
  removeThemePreset,
  setHighContrast,
  setFontSize,
  setReduceMotion,
  addToNotificationQueue,
  processNotificationQueue,
  updateNotificationSettings,
  // 🔴 FAB 액션들
  setFabVisible,
  updateFabPosition,
  setFabSize,
  setFabDisabled,
  toggleFab,
  adjustFabForScreenSize,
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

// 새로운 셀렉터들
export const selectThemePresets = (state: RootState) => state.ui.themePresets;
export const selectCurrentPreset = (state: RootState) => state.ui.currentPreset;
export const selectLoadingStack = (state: RootState) => state.ui.loadingStack;
export const selectNotificationQueue = (state: RootState) => state.ui.notificationQueue;
export const selectCurrentColors = (state: RootState) => {
  const preset = state.ui.currentPreset;
  const theme = state.ui.resolvedTheme;
  return preset ? preset.colors[theme] : null;
};
export const selectAccessibilitySettings = (state: RootState) => state.ui.settings.accessibility;
export const selectAnimationSettings = (state: RootState) => state.ui.settings.animations;
export const selectNotificationSettings = (state: RootState) => state.ui.settings.notifications;

// 🔴 FAB 셀렉터들
export const selectFab = (state: RootState) => state.ui.fab;
export const selectFabVisible = (state: RootState) => state.ui.fab.visible;
export const selectFabPosition = (state: RootState) => state.ui.fab.position;
export const selectFabSize = (state: RootState) => state.ui.fab.size;
export const selectFabDisabled = (state: RootState) => state.ui.fab.disabled;

// ==========================================
// 9. 편의 액션 생성자들
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
