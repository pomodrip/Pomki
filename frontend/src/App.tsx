import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useDispatch } from 'react-redux';
import baseTheme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import AppRoutes from './routes';
import { useUI } from './hooks/useUI';
import GlobalNotifications from './components/common/GlobalNotifications';
import { validateToken } from './store/slices/authSlice';
import type { AppDispatch } from './store/store';

// UI 초기화 컴포넌트
function UIInitializer() {
  const { initialize, theme: currentTheme } = useUI();
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
      <AppRoutes />
      <GlobalNotifications />
    </ThemeProvider>
  );
}

function App() {
  return <UIInitializer />;
}

export default App;