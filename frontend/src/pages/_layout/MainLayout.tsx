import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';
import { useResponsive } from '../../hooks/useResponsive';

const MainLayout: React.FC = () => {
  const { isMobile } = useResponsive();
  
  console.log('MainLayout rendering...', { isMobile });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      
      {/* 디버깅 정보 표시 */}
      <Box sx={{ 
        position: 'fixed', 
        top: 60, 
        right: 0, 
        zIndex: 9998, 
        bgcolor: 'blue', 
        color: 'white', 
        p: 1,
        fontSize: '12px'
      }}>
        MainLayout Active - {isMobile ? 'Mobile' : 'Desktop'}
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          width: '100%',
        }}
      >
        <Outlet />
      </Box>
      
      {/* BottomNav는 모바일에서만 렌더링됨 */}
      <BottomNav />
      
      {/* BottomNav 디버깅 정보 */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 70, 
        right: 0, 
        zIndex: 9998, 
        bgcolor: 'green', 
        color: 'white', 
        p: 1,
        fontSize: '12px'
      }}>
        BottomNav Should Be Here
      </Box>
    </Box>
  );
};

export default MainLayout;
