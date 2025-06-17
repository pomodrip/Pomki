import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, styled } from '@mui/material';
import {
  TimerOutlined as TimerIcon,
  StickyNote2Outlined as NoteIcon,
  HomeOutlined as HomeIcon,
  SchoolOutlined as StudyIcon,
  PersonOutlined as ProfileIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';

// 54-57번 디자인 가이드 적용
const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  height: '64px', // 54. Bottom Navigation Height
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  
  '& .MuiBottomNavigationAction-root': {
    color: theme.palette.text.secondary, // 57. Inactive Icon Color
    minWidth: 'auto',
    padding: `${theme.spacing(0.75)} ${theme.spacing(1)}`,
    transition: 'all 0.2s ease-in-out',
    
    '&.Mui-selected': {
      color: theme.palette.primary.main, // 56. Active Icon Color
      transform: 'scale(1.05)',
    },
    
    '& .MuiSvgIcon-root': {
      fontSize: '24px', // 55. Bottom Navigation Icon Size
      transition: 'all 0.2s ease-in-out',
    },
    
    '& .MuiBottomNavigationAction-label': {
      fontSize: '0.75rem',
      fontWeight: 500,
      marginTop: theme.spacing(0.5),
      transition: 'all 0.2s ease-in-out',
      
      '&.Mui-selected': {
        fontSize: '0.75rem',
        fontWeight: 600,
      },
    },
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  borderTop: `1px solid ${theme.palette.divider}`,
  
  // 데스크톱에서는 숨김 (임시로 주석 처리하여 항상 표시)
  // [theme.breakpoints.up('md')]: {
  //   display: 'none',
  // },
}));

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // 디버깅 정보
  console.log('BottomNav - isMobile:', isMobile, 'pathname:', location.pathname);

  // 임시로 조건부 렌더링 제거하여 항상 표시
  // if (!isMobile) {
  //   return null;
  // }

  const getActiveTab = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/timer')) return 0;
    if (pathname.startsWith('/note')) return 1;
    if (pathname === '/' || pathname.startsWith('/dashboard')) return 2;
    if (pathname.startsWith('/study')) return 3;
    if (pathname.startsWith('/profile')) return 4;
    return 2; // default to home
  };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/timer');
        break;
      case 1:
        navigate('/note');
        break;
      case 2:
        navigate('/dashboard');
        break;
      case 3:
        navigate('/study');
        break;
      case 4:
        navigate('/profile');
        break;
    }
  };

  return (
    <StyledPaper elevation={0}>
      <StyledBottomNavigation value={getActiveTab()} onChange={handleChange} showLabels>
        <BottomNavigationAction 
          label="타이머" 
          icon={<TimerIcon />}
          sx={{
            '&.Mui-selected .MuiSvgIcon-root': {
              color: 'primary.main',
            },
          }}
        />
        <BottomNavigationAction 
          label="노트" 
          icon={<NoteIcon />}
          sx={{
            '&.Mui-selected .MuiSvgIcon-root': {
              color: 'primary.main',
            },
          }}
        />
        <BottomNavigationAction 
          label="홈" 
          icon={<HomeIcon />}
          sx={{
            '&.Mui-selected .MuiSvgIcon-root': {
              color: 'primary.main',
            },
          }}
        />
        <BottomNavigationAction 
          label="학습" 
          icon={<StudyIcon />}
          sx={{
            '&.Mui-selected .MuiSvgIcon-root': {
              color: 'primary.main',
            },
          }}
        />
        <BottomNavigationAction 
          label="프로필" 
          icon={<ProfileIcon />}
          sx={{
            '&.Mui-selected .MuiSvgIcon-root': {
              color: 'primary.main',
            },
          }}
        />
      </StyledBottomNavigation>
    </StyledPaper>
  );
};

export default BottomNav;
