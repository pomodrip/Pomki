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

// design.md 디자인 시스템 적용
const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  height: '64px', // 헤더와 동일한 높이
  borderTop: '1px solid #E5E7EB', // Border Medium
  backgroundColor: '#FFFFFF', // Background Primary
  
  '& .MuiBottomNavigationAction-root': {
    color: '#6B7280', // Text Secondary
    minWidth: 'auto',
    padding: `${theme.spacing(1)} ${theme.spacing(1)}`,
    transition: 'all 0.2s ease', // Normal Transition
    
    '&.Mui-selected': {
      color: '#2563EB', // Primary Main
      transform: 'scale(1.02)', // Hover Scale (활성 상태)
    },
    
    '& .MuiSvgIcon-root': {
      fontSize: '24px', // 알림 아이콘 크기와 동일
      transition: 'all 0.2s ease',
    },
    
    '& .MuiBottomNavigationAction-label': {
      fontSize: '12px', // Caption 크기
      fontWeight: 500,
      marginTop: theme.spacing(0.5),
      transition: 'all 0.2s ease',
      
      '&.Mui-selected': {
        fontSize: '12px',
        fontWeight: 600,
      },
    },
  },
}));

const StyledPaper = styled(Paper)(() => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  borderTop: '1px solid #E5E7EB', // Border Medium
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Shadow SM
  
  // 900px 이상에서만 완전히 숨김
  '@media (min-width: 900px)': {
    display: 'none',
  },
}));

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();

  // 모바일에서만 표시
  if (!isMobile) {
    return null;
  }

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
        />
        <BottomNavigationAction 
          label="노트" 
          icon={<NoteIcon />}
        />
        <BottomNavigationAction 
          label="홈" 
          icon={<HomeIcon />}
        />
        <BottomNavigationAction 
          label="학습" 
          icon={<StudyIcon />}
        />
        <BottomNavigationAction 
          label="프로필" 
          icon={<ProfileIcon />}
        />
      </StyledBottomNavigation>
    </StyledPaper>
  );
};

export default BottomNav;
