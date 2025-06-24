import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import baseTheme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import AppRoutes from './routes';
import { useUI } from './hooks/useUI';
import GlobalNotifications from './components/common/GlobalNotifications';
import Toast from './components/common/Toast';

// UI 초기화 컴포넌트
function UIInitializer() {
  const { initialize, theme: currentTheme } = useUI();

  useEffect(() => {
    initialize();
  }, [initialize]);

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
      <Toast />
    </ThemeProvider>
  );
}

function App() {
  return <UIInitializer />;
}

export default App;