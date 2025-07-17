import React, { useState } from 'react';
import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import CircularProgress from './components/ui/CircularProgress';
import { useDispatch } from 'react-redux';
import baseTheme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import AppRoutes from './routes';
import { useUI } from './hooks/useUI';
import { useAuth } from './hooks/useAuth';
import { validateToken } from './store/slices/authSlice';
import type { AppDispatch } from './store/store';
import ErrorSnackbar from './components/common/ErrorSnackbar';
import Toast from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import { initializePrefetch } from './utils/prefetch';
import IntroductionDialog from './components/common/IntroductionDialog';
import GlobalNotifications from './components/common/GlobalNotifications';

const INTRO_POPUP_STORAGE_KEY = 'pomki-intro-popup-last-seen';

// 로딩 스플래시 화면 컴포넌트
function LoadingSplash() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2 }} />
    </Box>
  );
}

// UI 초기화 컴포넌트
function UIInitializer() {
  const { initialize, theme: currentTheme } = useUI();
  const { isInitialized, isAuthenticated } = useAuth(); // isAuthenticated 추가
  const dispatch = useDispatch<AppDispatch>();
  const [isIntroDialogOpen, setIntroDialogOpen] = useState(false);

  useEffect(() => {
    initialize();
    // 앱 시작 시 refreshToken으로 인증 상태 복원
    dispatch(validateToken());
    
    // prefetch 초기화 (인증 후)
    // setTimeout(() => {
    //   initializePrefetch();
    // }, 2000);
  }, [initialize, dispatch]);

  useEffect(() => {
    // 팝업 로직: 인증된 사용자에게만 하루에 한 번 보여줌
    if (isAuthenticated) {
      const lastSeen = localStorage.getItem(INTRO_POPUP_STORAGE_KEY);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      if (lastSeen !== today) {
        // 테스트를 위해 잠시 주석 처리. 필요시 주석 해제하여 사용
        setIntroDialogOpen(true);
      }
    }
  }, [isAuthenticated]);

  const handleCloseIntroDialog = () => {
    setIntroDialogOpen(false);
  };

  const handleDontShowToday = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    localStorage.setItem(INTRO_POPUP_STORAGE_KEY, today);
    handleCloseIntroDialog();
  };

  

  // Redux 테마에 따라 MUI 테마 동적 생성
  const dynamicTheme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode: currentTheme, // light 또는 dark
      // 다크 모드 추가 설정 (필요시)
      ...(currentTheme === 'dark' && {
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        },
        grey: {
          50: '#121212',
          100: '#121212',
          200: '#121212',
          300: '#121212',
          400: '#121212',
          500: '#121212',
          600: '#121212',
          700: '#121212',
          800: '#121212',
          900: '#121212',
        },
      }),
    },
      components: {
      ...(baseTheme.components || {}),
      // TextField 컴포넌트의 색상을 다크모드에 맞게 조정
      ...(currentTheme === 'dark' ? {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#90caf9',
              },
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#90caf9',
              },
            },
          },
        },
        MuiInputAdornment: {
          styleOverrides: {
            root: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          },
        },
      } : {}),
    },
   });

  return (
    <ThemeProvider theme={dynamicTheme}>
      <CssBaseline />
      <GlobalStyles />
      {/* 초기화가 완료되지 않았다면 로딩 화면 표시 */}
      {!isInitialized ? (
        <LoadingSplash />
      ) : (
        <>
          <AppRoutes />
          <ErrorSnackbar />
          <Toast />
          <GlobalNotifications />
          <IntroductionDialog
            open={isIntroDialogOpen}
            onClose={handleCloseIntroDialog}
            onDontShowToday={handleDontShowToday}
          />
        </>
      )}
    </ThemeProvider>
  );
}


function App() {
  return (
    <ErrorBoundary>
      <UIInitializer />
    </ErrorBoundary>
  );
}

export default App;