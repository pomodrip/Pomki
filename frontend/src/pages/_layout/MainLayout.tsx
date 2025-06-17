import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from '../../components/common/Header';
import BottomNav from '../../components/common/BottomNav';

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          paddingTop: (theme) => `${theme.spacing(2)}`, // 25. Page Content Padding (상하)
          paddingBottom: (theme) => `calc(64px + ${theme.spacing(2)})`, // 54. BottomNav 높이만큼 패딩
          paddingX: (theme) => `${theme.spacing(3)}`, // 24. Page Content Padding (좌우)
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Container>
      <BottomNav />
    </Box>
  );
};

export default MainLayout;
