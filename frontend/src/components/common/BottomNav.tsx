import React, { useCallback, useMemo } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsiveUI } from '../../hooks/useUI';
import { useTabNavigationKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

// Custom timer icon (SVG) provided by designer
import TimerSvg from '../../assets/icons/timer.svg?react';
import NoteSvg from '../../assets/icons/note.svg?react';
import HomeSvg from '../../assets/icons/home.svg?react';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ProfileSvg from '../../assets/icons/profile.svg?react';

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

  // 네비게이션 아이템 타입 정의
  interface NavItem {
    label: string;
    Icon: React.ElementType;
    route: string;
    isSvg?: boolean;
    size?: number; // optional custom icon size
  }

  // 네비게이션 아이템들 - useMemo 최적화
  const navItems: NavItem[] = useMemo(() => [
    { label: '타이머', Icon: TimerSvg, isSvg: true, route: '/timer' },
    { label: '노트', Icon: NoteSvg, isSvg: true, route: '/note' },
    { label: '홈', Icon: HomeSvg, isSvg: true, route: '/dashboard' },
    { label: '학습', Icon: SchoolOutlinedIcon, route: '/study', size: 28 },
    { label: '프로필', Icon: ProfileSvg, isSvg: true, route: '/profile' },
  ], []);

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
        {navItems.map((item, index) => {
          const color = activeTab === index ? theme.palette.primary.main : theme.palette.text.secondary;
          const IconComponent = item.Icon;
          const size = item.size ?? 24;
          const IconElement = item.isSvg ? (
            <IconComponent style={{ width: size, height: size, fill: color }} />
          ) : (
            <IconComponent sx={{ fontSize: size, color }} />
          );

          return (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={IconElement}
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
              }}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  ) : null;
};

export default React.memo(BottomNav);
