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

// 54-57번 디자인 가이드 적용
const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  height: '64px', // 54. Bottom Navigation Height
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  
  '& .MuiBottomNavigationAction-root': {
    color: theme.palette.text.secondary, // 57. Inactive Icon Color
    minWidth: 'auto',
    padding: `${theme.spacing(0.75)} ${theme.spacing(1)}`,
    
    '&.Mui-selected': {
      color: theme.palette.primary.main, // 56. Active Icon Color
    },
    
    '& .MuiSvgIcon-root': {
      fontSize: '24px', // 55. Bottom Navigation Icon Size
    },
    
    '& .MuiBottomNavigationAction-label': {
      fontSize: '0.75rem',
      fontWeight: 500,
      marginTop: theme.spacing(0.5),
      
      '&.Mui-selected': {
        fontSize: '0.75rem',
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
}));

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
        navigate('/');
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
        <BottomNavigationAction label="타이머" icon={<TimerIcon />} />
        <BottomNavigationAction label="노트" icon={<NoteIcon />} />
        <BottomNavigationAction label="홈" icon={<HomeIcon />} />
        <BottomNavigationAction label="학습" icon={<StudyIcon />} />
        <BottomNavigationAction label="프로필" icon={<ProfileIcon />} />
      </StyledBottomNavigation>
    </StyledPaper>
  );
};

export default BottomNav;
