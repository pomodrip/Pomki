import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, styled } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useLocation, useNavigate } from 'react-router-dom';

// 58. Page Header Height와 디자인 시스템 원칙 적용
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: '56px', // 58. Page Header Height
  boxShadow: 'none',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'space-between',
  paddingX: theme.spacing(2),
  minHeight: '56px',
}));

const TomatoIcon = styled('div')(({ theme }) => ({
  width: '32px',
  height: '32px',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  '&::before': {
    content: '"🍅"',
  },
}));

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton,
  rightContent 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  const getTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    if (path.startsWith('/note/')) return 'Note Detail';
    if (path === '/note') return 'My Notes';
    if (path === '/' || path === '/dashboard') return 'Pomki';
    if (path === '/timer') return 'Focus Timer';
    if (path === '/study') return 'Study';
    if (path === '/profile') return 'Profile';
    return 'Pomki';
  };

  const shouldShowBackButton = showBackButton ?? (location.pathname !== '/' && location.pathname !== '/dashboard');

  const getDefaultRightContent = () => {
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      return (
        <IconButton>
          <NotificationsNoneIcon />
        </IconButton>
      );
    }
    return null;
  };

  return (
    <StyledAppBar position="sticky" color="inherit">
      <StyledToolbar>
        <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-start' }}>
          {shouldShowBackButton && (
            <IconButton onClick={handleBack} edge="start">
              <ArrowBackIosNewIcon />
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {(location.pathname === '/' || location.pathname === '/dashboard') && (
            <TomatoIcon />
          )}
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {getTitle()}
          </Typography>
        </Box>
        
        <Box sx={{ width: '40px', display: 'flex', justifyContent: 'flex-end' }}>
          {rightContent || getDefaultRightContent()}
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Header;