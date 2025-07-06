import React, { useCallback, useMemo } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon  from '../../assets/icons/home.svg?react';
import TimerIcon  from '../../assets/icons/timer.svg?react';
import NoteIcon  from '../../assets/icons/note.svg?react';
import StudyIcon  from '../../assets/icons/study.svg?react';
import ProfileIcon  from '../../assets/icons/profile.svg?react';
import { useTheme } from '@mui/material/styles';

import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsiveUI } from '../../hooks/useUI';
import { useTabNavigationKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isMobile } = useResponsiveUI();

  // 현재 활성 탭 계산 - useMemo 최적화
  const activeTab = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/timer')) return 0;
    if (pathname.startsWith('/note')) return 1;
    if (pathname === '/' || pathname.startsWith('/dashboard')) return 2;
    if (pathname.startsWith('/study') || pathname.startsWith('/flashcards')) return 3;
    if (pathname.startsWith('/profile')) return 4;
    return 2; // default to home
  }, [location.pathname]);

  // 네비게이션 핸들러 - useCallback 최적화
  const handleChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
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
  }, [navigate]);

  // 키보드 단축키로 탭 네비게이션 - useCallback 최적화
  const handleNextTab = useCallback(() => {
    const nextTab = activeTab >= 4 ? 0 : activeTab + 1;
    handleChange({} as React.SyntheticEvent, nextTab);
  }, [activeTab, handleChange]);

  const handlePreviousTab = useCallback(() => {
    const previousTab = activeTab <= 0 ? 4 : activeTab - 1;
    handleChange({} as React.SyntheticEvent, previousTab);
  }, [activeTab, handleChange]);

  // Tab/Shift+Tab으로 네비게이션 이동 (모바일에서만 활성화)
  useTabNavigationKeyboardShortcuts(handleNextTab, handlePreviousTab, {
    enabled: isMobile,
    excludeInputs: true // 입력 필드 포커스 시 비활성화
  });

  // 네비게이션 아이템들 - useMemo 최적화
  const navItems = useMemo(() => [
    { label: '타이머', inactiveIcon: <TimerIcon fill={theme.palette.text.secondary}/>, activeIcon: <TimerIcon fill={theme.palette.primary.main}/> },
    { label: '노트', inactiveIcon: <NoteIcon fill={theme.palette.text.secondary}/>, activeIcon: <NoteIcon fill={theme.palette.primary.main}/> },
    { label: '홈', inactiveIcon: <HomeIcon fill={theme.palette.text.secondary}/>, activeIcon: <HomeIcon fill={theme.palette.primary.main}/> },
    { label: '학습', inactiveIcon: <StudyIcon stroke={theme.palette.text.secondary}/>, activeIcon: <StudyIcon stroke={theme.palette.primary.main}/> },
    { label: '프로필', inactiveIcon: <ProfileIcon fill={theme.palette.text.secondary}/>, activeIcon: <ProfileIcon fill={theme.palette.primary.main}/> }
  ], [theme.palette.text.secondary, theme.palette.primary.main]);

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
        value={activeTab}
        onChange={handleChange}
        sx={{
          height: '100%',
        }}
      >
        {navItems.map((item, index) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={activeTab === index ? item.activeIcon : item.inactiveIcon}
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
              color: activeTab === index ? theme.palette.primary.main : theme.palette.text.secondary,
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  ) : null;
};

export default React.memo(BottomNav);
