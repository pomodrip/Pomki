import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
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
      
      <Container
        component="main"
        maxWidth={isMobile ? 'sm' : 'md'}
        sx={{
          flexGrow: 1,
          paddingTop: (theme) => `${theme.spacing(2)}`, // 25. Page Content Padding (상하)
          paddingBottom: (theme) => isMobile 
            ? `calc(64px + ${theme.spacing(2)})` // 54. BottomNav 높이만큼 패딩 (모바일)
            : `${theme.spacing(2)}`, // 데스크톱에서는 하단 패딩만
          paddingX: (theme) => isMobile ? `${theme.spacing(3)}` : `${theme.spacing(4)}`, // 24. Page Content Padding (좌우)
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Container>
      
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
