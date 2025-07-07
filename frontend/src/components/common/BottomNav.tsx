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
    { label: '타이머', inactiveIcon: <img src={TimerPng} alt="타이머" style={{ width: 28, height: 28 }} />, activeIcon: <TimerActiveIcon color={theme.palette.primary.main} /> },
    { label: '노트', inactiveIcon: <img src={NotePng} alt="노트" style={{ width: 28, height: 28 }} />, activeIcon: <NoteActiveIcon color={theme.palette.primary.main} /> },
    { label: '홈', inactiveIcon: <img src={HomePng} alt="홈" style={{ width: 28, height: 28 }} />, activeIcon: <HomeActiveIcon color={theme.palette.primary.main} /> },
    { label: '학습', inactiveIcon: <img src={SchoolPng} alt="학습" style={{ width: 28, height: 28 }} />, activeIcon: <StudyActiveIcon color={theme.palette.primary.main} /> },
    { label: '프로필', inactiveIcon: <img src={PersonPng} alt="프로필" style={{ width: 28, height: 28 }} />, activeIcon: <ProfileActiveIcon color={theme.palette.primary.main} /> }
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
