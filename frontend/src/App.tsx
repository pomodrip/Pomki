import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import AppRoutes from './routes';
import Toast from './components/common/Toast';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      <AppRoutes />
      
      {/* 전역 알림 시스템 컴포넌트 */}
      <Toast />
    </ThemeProvider>
  );
}

export default App;