import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import baseTheme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import AppRoutes from './routes';
import { useUI } from './hooks/useUI';
import { useAuth } from './hooks/useAuth';
import GlobalNotifications from './components/common/GlobalNotifications';
import { validateToken } from './store/slices/authSlice';
import type { AppDispatch } from './store/store';
import ErrorSnackbar from './components/common/ErrorSnackbar';
import Toast from './components/common/Toast';
import { requestPermissionAndGetToken, onForegroundMessage } from './utils/fcmUtils';
import { openDialog } from './store/slices/dialogSlice';

// 로딩 스플래시 화면 컴포넌트
function LoadingSplash() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="background.default"
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

  useEffect(() => {
    initialize();
    // 앱 시작 시 refreshToken으로 인증 상태 복원
    dispatch(validateToken());
  }, [initialize, dispatch]);

  useEffect(() => {
    // 사용자가 인증된 상태일 때만 알림 권한 요청
    if (isAuthenticated) {
      requestPermissionAndGetToken(dispatch);
      const unsubscribe = onForegroundMessage();
      return () => {
        unsubscribe();
      };
    }
  }, [isAuthenticated, dispatch]);

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
      }),
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
          <GlobalNotifications />
          <ErrorSnackbar />
          <Toast />
        </>
      )}
    </ThemeProvider>
  );
}

function App() {
  return <UIInitializer />;
}

export default App;