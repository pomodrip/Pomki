import React, { useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon  from '../../assets/icons/home.svg?react';
import TimerIcon  from '../../assets/icons/timer.svg?react';
import NoteIcon  from '../../assets/icons/note.svg?react';
import DocumentIcon  from '../../assets/icons/documents.svg?react';
import ProfileIcon  from '../../assets/icons/profile.svg?react';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';

const MOBILE_BREAKPOINT = 768;

const BottomNav: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // 초기 설정
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const navItems = [
    { label: '타이머', inactiveIcon: <TimerIcon fill={theme.palette.text.secondary}/>, activeIcon: <TimerIcon fill={theme.palette.primary.main}/> },
    { label: '노트', inactiveIcon: <NoteIcon fill={theme.palette.text.secondary}/>, activeIcon: <NoteIcon fill={theme.palette.primary.main}/> },
    { label: '홈', inactiveIcon: <HomeIcon fill={theme.palette.text.secondary}/>, activeIcon: <HomeIcon fill={theme.palette.primary.main}/> },
    { label: '학습', inactiveIcon: <DocumentIcon fill={theme.palette.text.secondary}/>, activeIcon: <DocumentIcon fill={theme.palette.primary.main}/> },
    { label: '프로필', inactiveIcon: <ProfileIcon fill={theme.palette.text.secondary}/>, activeIcon: <ProfileIcon fill={theme.palette.primary.main}/> }
  ];

  return isMobile ? (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
      elevation={0}
    >
      <BottomNavigation
        showLabels
        value={getActiveTab()}
        onChange={handleChange}
        sx={{
          height: '100%',
        }}
      >
        {navItems.map((item, index) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={getActiveTab() === index ? item.activeIcon : item.inactiveIcon}
            sx={{
              padding: '0',
              minWidth: 'auto',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '10px',
                marginTop: '4px',
                '&.Mui-selected': {
                  fontSize: '10px',
                },
              },
              '& .MuiSvgIcon-root': {
                fontSize: '24px',
              },
              color: getActiveTab() === index ? theme.palette.primary.main : theme.palette.text.secondary,
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  ) : null;
};

export default BottomNav;
