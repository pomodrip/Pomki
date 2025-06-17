import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import AppRoutes from './routes';

function App() {
  console.log('=== App component rendering... ===');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      
      {/* 디버깅을 위한 테스트 정보 */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 9999, 
        bgcolor: 'green', 
        color: 'white', 
        p: 1,
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        🟢 App + Routes LOADED ✓
      </Box>
      
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;