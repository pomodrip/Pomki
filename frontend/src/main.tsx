import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import App from './App.tsx';
import theme from './theme/theme.ts'; // 우리가 만든 테마 불러오기
import GlobalStyles from './theme/GlobalStyles.tsx'; // 전역 스타일 불러오기

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles /> {/* 전역 스타일 적용 */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);