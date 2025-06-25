import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import baseTheme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import AppRoutes from './routes';
import { useUI } from './hooks/useUI';
import { useAuth } from './hooks/useAuth';
import GlobalNotifications from './components/common/GlobalNotifications';
import { validateToken } from './store/slices/authSlice';
import type { AppDispatch } from './store/store';

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
  const { isInitialized } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    initialize();
    // 앱 시작 시 refreshToken으로 인증 상태 복원
    dispatch(validateToken());
  }, [initialize, dispatch]);

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
        </>
      )}
    </ThemeProvider>
  );
}

function App() {
  return <UIInitializer />;
}

export default App;