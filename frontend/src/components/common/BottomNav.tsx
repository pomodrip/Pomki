import React, { useCallback, useMemo } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomePng from '../../assets/icons/home_196dp_1F1F1F.png';
import NotePng from '../../assets/icons/sticky_note_2_196dp_1F1F1F.png';
import SchoolPng from '../../assets/icons/school_196dp_1F1F1F.png';
import PersonPng from '../../assets/icons/account_circle_196dp_1F1F1F.png';
import { useTheme } from '@mui/material/styles';
import TimerPng from '../../assets/icons/timer_196dp_1F1F1F.png';

import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsiveUI } from '../../hooks/useUI';
import { useTabNavigationKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { preloadPage } from '../../utils/preloadUtils';

// 파란색으로 칠해진 활성 상태 아이콘을 만들기 위한 마스크 컴포넌트
const TimerActiveIcon: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: 'inline-block',
      width: 28,
      height: 28,
      backgroundColor: color,
      WebkitMaskImage: `url(${TimerPng})`,
      maskImage: `url(${TimerPng})`,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
    }}
  />
);

// 파란색으로 칠해진 Note 활성 아이콘
const NoteActiveIcon: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: 'inline-block',
      width: 28,
      height: 28,
      backgroundColor: color,
      WebkitMaskImage: `url(${NotePng})`,
      maskImage: `url(${NotePng})`,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
    }}
  />
);

// Home 활성 아이콘
const HomeActiveIcon: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: 'inline-block',
      width: 28,
      height: 28,
      backgroundColor: color,
      WebkitMaskImage: `url(${HomePng})`,
      maskImage: `url(${HomePng})`,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
    }}
  />
);

// 학습(학교) 활성 아이콘
const StudyActiveIcon: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: 'inline-block',
      width: 28,
      height: 28,
      backgroundColor: color,
      WebkitMaskImage: `url(${SchoolPng})`,
      maskImage: `url(${SchoolPng})`,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
    }}
  />
);

// 프로필 활성 아이콘
const ProfileActiveIcon: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: 'inline-block',
      width: 28,
      height: 28,
      backgroundColor: color,
      WebkitMaskImage: `url(${PersonPng})`,
      maskImage: `url(${PersonPng})`,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
    }}
  />
);

const navConfig = [
  { path: '/timer', label: '타이머', icon: TimerActiveIcon, preload: () => preloadPage('/timer') },
  { path: '/note', label: '노트', icon: NoteActiveIcon, preload: () => preloadPage('/note') },
  { path: '/dashboard', label: '홈', icon: HomeActiveIcon, preload: () => preloadPage('/dashboard') },
  { path: '/study', label: '학습', icon: StudyActiveIcon, preload: () => preloadPage('/study') },
  { path: '/profile', label: '프로필', icon: ProfileActiveIcon, preload: () => preloadPage('/profile') },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isMobile } = useResponsiveUI();

  // 현재 활성 탭 계산 - useMemo 최적화
  const activeTab = useMemo(() => {
    const pathname = location.pathname;
    const activeIndex = navConfig.findIndex(item => item.path !== '/dashboard' && pathname.startsWith(item.path));
    if (activeIndex !== -1) return activeIndex;
    
    // /dashboard 또는 / 일 경우 홈 탭을 활성화
    if (pathname.startsWith('/dashboard') || pathname === '/') {
      const homeIndex = navConfig.findIndex(item => item.path === '/dashboard');
      if (homeIndex !== -1) return homeIndex;
    }
    
    return navConfig.findIndex(item => item.path === '/dashboard'); // default to home
  }, [location.pathname]);

  // 네비게이션 핸들러 - useCallback 최적화
  const handleChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      navigate(navConfig[newValue].path);
    },
    [navigate],
  );

  // 키보드 단축키로 탭 네비게이션 - useCallback 최적화
  const handleNextTab = useCallback(() => {
    const nextTab = activeTab >= navConfig.length - 1 ? 0 : activeTab + 1;
    handleChange({} as React.SyntheticEvent, nextTab);
  }, [activeTab, handleChange]);

  const handlePreviousTab = useCallback(() => {
    const previousTab = activeTab <= 0 ? navConfig.length - 1 : activeTab - 1;
    handleChange({} as React.SyntheticEvent, previousTab);
  }, [activeTab, handleChange]);

  // Tab/Shift+Tab으로 네비게이션 이동 (모바일에서만 활성화)
  useTabNavigationKeyboardShortcuts(handleNextTab, handlePreviousTab, {
    enabled: isMobile,
    excludeInputs: true, // 입력 필드 포커스 시 비활성화
  });

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
        {navConfig.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = activeTab === index;
          return (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={<IconComponent color={isActive ? theme.palette.primary.main : theme.palette.text.secondary} />}
              onMouseEnter={item.preload}
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
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
              }}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  ) : null;
};

export default React.memo(BottomNav);
