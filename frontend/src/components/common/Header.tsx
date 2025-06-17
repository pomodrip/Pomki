import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, styled, Button } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';

// 58. Page Header Height와 디자인 시스템 원칙 적용
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: '56px', // 58. Page Header Height
  boxShadow: 'none',
  position: 'sticky',
  zIndex: theme.zIndex.appBar,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'space-between',
  paddingX: theme.spacing(2),
  minHeight: '56px',
  
  [theme.breakpoints.up('md')]: {
    paddingX: theme.spacing(4),
  },
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
  cursor: 'pointer',
  '&::before': {
    content: '"🍅"',
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transition: 'background-color 0.2s ease',
  },
}));

// 데스크톱 네비게이션 메뉴
const DesktopNav = styled(Box)(({ theme }) => ({
  display: 'none',
  gap: theme.spacing(1),
  
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'none',
  fontWeight: 500,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  borderRadius: theme.shape.borderRadius,
  
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
  },
  
  '&.active': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
  },
}));

const BrandSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
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
  const { isMobile } = useResponsive();

  const handleBack = () => {
    navigate(-1);
  };

  const handleBrandClick = () => {
    navigate('/');
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
  const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';

  // 디버깅 정보
  console.log('Header - isMobile:', isMobile, 'pathname:', location.pathname, 'shouldShowBackButton:', shouldShowBackButton);

  const getDefaultRightContent = () => {
    if (isHomePage) {
      return (
        <IconButton>
          <NotificationsNoneIcon />
        </IconButton>
      );
    }
    return null;
  };

  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path) || (path === '/' && isHomePage);
  };

  return (
    <StyledAppBar position="sticky" color="inherit">
      <StyledToolbar>
        {/* 왼쪽: 브랜드 또는 뒤로가기 */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '120px' }}>
          {shouldShowBackButton && isMobile ? (
            <IconButton onClick={handleBack} edge="start" sx={{ mr: 1 }}>
              <ArrowBackIosNewIcon />
            </IconButton>
          ) : (
            <BrandSection onClick={handleBrandClick}>
              <TomatoIcon />
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Pomki
              </Typography>
            </BrandSection>
          )}
        </Box>

        {/* 중앙: 모바일 타이틀 또는 데스크톱 네비게이션 */}
        {isMobile ? (
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, textAlign: 'center' }}>
            {shouldShowBackButton ? getTitle() : ''}
          </Typography>
        ) : (
          <DesktopNav>
            <NavButton 
              className={isActiveRoute('/') ? 'active' : ''}
              onClick={() => navigate('/')}
            >
              홈
            </NavButton>
            <NavButton 
              className={isActiveRoute('/timer') ? 'active' : ''}
              onClick={() => navigate('/timer')}
            >
              타이머
            </NavButton>
            <NavButton 
              className={isActiveRoute('/note') ? 'active' : ''}
              onClick={() => navigate('/note')}
            >
              노트
            </NavButton>
            <NavButton 
              className={isActiveRoute('/study') ? 'active' : ''}
              onClick={() => navigate('/study')}
            >
              학습
            </NavButton>
            <NavButton 
              className={isActiveRoute('/profile') ? 'active' : ''}
              onClick={() => navigate('/profile')}
            >
              프로필
            </NavButton>
          </DesktopNav>
        )}
        
        {/* 오른쪽: 알림 또는 커스텀 컨텐츠 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: '120px' }}>
          {rightContent || getDefaultRightContent()}
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Header;