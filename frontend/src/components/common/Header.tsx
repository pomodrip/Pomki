import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, styled, useTheme } from '@mui/material';
import Button from '../ui/Button';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';
import { useUI } from '../../hooks/useUI';
import tomatoImg from '../../assets/icons/tomato.png';
import Brightness4Img from '../../assets/icons/brightness_4_196dp_1F1F1F.png';
import BrightnessLowImg from '../../assets/icons/brightness_low_196dp_1F1F1F.png';
import NotificationsImg from '../../assets/icons/notifications_none_196dp_1F1F1F.png';

// design.md 가이드 1-25번 적용 - Header 섹션
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: '64px', // 1. 헤더 높이
  boxShadow: 'none',
  position: 'sticky',
  zIndex: theme.zIndex.appBar,
}));

const StyledToolbar = styled(Toolbar)(() => ({
  justifyContent: 'space-between',
  paddingX: '16px', // 모바일 기본 패딩 (축소)
  minHeight: '64px', // 1. 헤더 높이
  position: 'relative', // 중앙 제목 절대 위치를 위해

  // 태블릿에서 패딩 증가
  '@media (min-width: 600px)': {
    paddingX: '20px',
  },

  // 데스크톱에서 최대 패딩
  '@media (min-width: 900px)': {
    paddingX: '24px',
  },
}));

const TomatoIconWrapper = styled('div')(() => ({
  width: '32px',
  height: '32px',
  cursor: 'pointer',
  transition: 'all 0.2s ease', // 20. 네비게이션 메뉴 transition
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  '& svg': {
    width: '100%',
    height: '100%',
  },
  '& img': {
    width: '100%',
    height: '100%',
  },
}));

// 브랜드 섹션 - design.md 가이드 6-10번 적용
const BrandText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Pretendard', sans-serif", // 6. 브랜드명 폰트
  fontSize: '20px', // 모바일 기본 크기 (24px에서 축소)
  fontWeight: 700, // 8. 브랜드명 폰트 무게
  color: theme.palette.text.primary,
  marginLeft: '8px', // 10. 토마토 아이콘과 텍스트 간격
  whiteSpace: 'nowrap', // 줄바꿈 방지
  overflow: 'hidden',
  textOverflow: 'ellipsis', // 말줄임표

  // 반응형 폰트 크기
  '@media (min-width: 400px)': {
    fontSize: '22px', // 중간 크기 모바일
  },
  '@media (min-width: 600px)': {
    fontSize: '24px', // 태블릿/데스크톱
  },
}));

// 데스크톱 네비게이션 메뉴 - design.md 가이드 11-20번 적용
const DesktopNav = styled(Box)(() => ({
  display: 'none',
  gap: '16px', // 좁은 화면을 위해 간격 축소 (32px → 16px)

  // 1024px 이상에서만 데스크톱 네비게이션 표시
  '@media (min-width: 1024px)': {
    display: 'flex',
    alignItems: 'center',
    gap: '24px', // 데스크톱에서는 더 넓은 간격
  },

  '@media (min-width: 1200px)': {
    gap: '32px', // 큰 화면에서는 원래 간격
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  fontSize: '14px', // 모바일/태블릿용 축소 크기 (16px → 14px)
  fontWeight: 500, // 12. 네비게이션 메뉴 폰트 무게
  color: '#6B7280', // 13. 네비게이션 메뉴 기본 색상
  textTransform: 'none',
  padding: '6px 12px', // 패딩 축소 (8px 16px → 6px 12px)
  borderRadius: '8px', // 19. 네비게이션 메뉴 border-radius
  transition: 'all 0.2s ease', // 20. 네비게이션 메뉴 transition
  whiteSpace: 'nowrap', // 줄바꿈 방지
  minWidth: 'auto', // 최소 너비 제거
  position: 'relative', // 가상 요소를 위한 상대 위치

  // 기본 상태의 언더바 (투명하게 숨김)
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    height: '2px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '1px',
    opacity: 0,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },


  // 새로운 호버 효과 - 연한 파란색 배경
  '&:hover': {
    backgroundColor: theme.palette.primary.light, // E3F2FD 연한 파란색 배경
    color: theme.palette.primary.main, // 파란색 텍스트
    fontSize: '15px', // 폰트 크기 증가
    '&::after': {
      opacity: 0, // 일반 호버 시에는 언더바 숨김
    },
  },

  // 선택된 상태에서 호버 시 - 밑줄 + 배경색 함께
  '&.active:hover': {
    backgroundColor: theme.palette.primary.light, // 연한 파란색 배경
    '&::after': {
      opacity: 1, // 선택된 상태에서 호버 시에는 언더바 유지
    },
  },

  '&:active': {
    backgroundColor: 'transparent', // 배경색 변화 없음
    color: theme.palette.primary.main, // 파란색으로 변경
    fontSize: '15px', // 폰트 크기 증가
    '&::after': {
      opacity: 1, // 언더바 나타남
      transform: 'translateX(-50%) scaleX(1)', // 스케일 효과
    },
  },

  '&.active': {
    backgroundColor: 'transparent', // 배경색 변화 없음
    color: theme.palette.primary.main, // 활성화 시 파란색
    fontSize: '15px', // 폰트 크기 증가
    fontWeight: 700, // 활성화 시 폰트 굵기 증가
    '&::after': {
      opacity: 1, // 언더바 항상 표시
      transform: 'translateX(-50%) scaleX(1)', // 스케일 효과
    },
  },

  // 데스크톱에서는 원래 크기
  '@media (min-width: 1024px)': {
    fontSize: '15px',
    padding: '8px 14px',

    // 새로운 호버 효과
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      fontSize: '16px',
      '&::after': {
        opacity: 0,
      },
    },
    '&.active:hover': {
      backgroundColor: theme.palette.primary.light,
      '&::after': {
        opacity: 1,
      },
    },
    '&:active': {
      fontSize: '16px',
    },
    '&.active': {
      fontSize: '16px',
      fontWeight: 700,
    },
  },

  '@media (min-width: 1200px)': {
    fontSize: '16px', // 큰 화면에서는 원래 크기
    padding: '8px 16px',

    // 새로운 호버 효과
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      fontSize: '17px',
      '&::after': {
        opacity: 0,
      },
    },
    '&.active:hover': {
      backgroundColor: theme.palette.primary.light,
      '&::after': {
        opacity: 1,
      },
    },
    '&:active': {
      fontSize: '17px',
    },
    '&.active': {
      fontSize: '17px',
      fontWeight: 700,
    },
  },
}));

// 우측 영역 - design.md 가이드 21-25번 적용
const NotificationButton = styled(IconButton)(() => ({
  width: '40px', // 24. 알림 아이콘 배경 크기
  height: '40px', // 24. 알림 아이콘 배경 크기
  borderRadius: '8px', // 25. 알림 아이콘 border-radius
  color: '#6B7280', // 22. 알림 아이콘 색상

  '&:hover': {
    backgroundColor: 'rgba(107, 114, 128, 0.1)', // 23. 알림 아이콘 hover 배경
  },

  '& .MuiSvgIcon-root': {
    fontSize: '24px', // 21. 알림 아이콘 크기
  },
}));

// 햄버거 메뉴 버튼
const MenuButton = styled(IconButton)(() => ({
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  color: '#6B7280',

  '&:hover': {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },

  '& .MuiSvgIcon-root': {
    fontSize: '24px',
  },
}));

const BrandSection = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
}));

interface HeaderProps {
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  showBackButton,
  rightContent
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const { toggleTheme } = useUI();
  const theme = useTheme();

  const handleBack = () => {
    navigate(-1);
  };

  const handleBrandClick = () => {
    navigate('/dashboard');
  };

  const handleMenuClick = () => {
    // 사이드바 열기 로직 추가 예정
    console.log('메뉴 클릭');
  };

  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/note/')) return 'Note Detail';
    if (path === '/note') return 'My Notes';
    if (path === '/timer') return 'Focus Timer';
    if (path === '/study' || path.startsWith('/flashcards')) return 'Study';
    if (path === '/profile') return 'Profile';
    return 'Pomkist';
  };

  const shouldShowBackButton = showBackButton ?? (location.pathname !== '/' && location.pathname !== '/dashboard');
  const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';



  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path) || (path === '/' && isHomePage);
  };

  return (
    <StyledAppBar position="sticky" color="inherit">
      <StyledToolbar>
        {/* 왼쪽: 햄버거 메뉴 + 브랜드 (또는 뒤로가기) */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {shouldShowBackButton && isMobile ? (
            <IconButton onClick={handleBack} edge="start" sx={{ mr: 1 }} disableRipple aria-label="뒤로가기">
              <ArrowBackIosNewIcon />
            </IconButton>
          ) : (
            <>
              <BrandSection onClick={handleBrandClick} sx={{ ml: 1 }}>
                <TomatoIconWrapper>
                  <img src={tomatoImg} alt="Pomkist logo" />
                </TomatoIconWrapper>
                <BrandText>
                  Pomkist
                </BrandText>
              </BrandSection>
            </>
          )}
        </Box>

        {/* 중앙: 페이지 제목 (뒤로가기 버튼이 있을 때만) */}
        {shouldShowBackButton && isMobile && (
          <Typography variant="h6" component="div" sx={{
            fontWeight: 600,
            textAlign: 'center',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            color: theme.palette.text.primary,
            fontSize: '16px', // 기본 크기
            whiteSpace: 'nowrap', // 줄바꿈 방지
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '40%', // 최대 너비 제한

            // 반응형 폰트 크기
            '@media (min-width: 400px)': {
              fontSize: '18px',
              maxWidth: '50%',
            },
            '@media (min-width: 600px)': {
              fontSize: '20px',
              maxWidth: '60%',
            },
          }}>
            {getTitle()}
          </Typography>
        )}

        {/* 오른쪽: 데스크톱 네비게이션 + 알림 아이콘 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1, gap: 2 }}>
          {/* 데스크톱에서만 네비게이션 메뉴 표시 */}
          <DesktopNav>
            <NavButton
              className={isActiveRoute('/dashboard') ? 'active' : ''}
              onClick={() => navigate('/dashboard')}
              disableRipple
            >
              홈
            </NavButton>
            <NavButton
              className={isActiveRoute('/timer') ? 'active' : ''}
              onClick={() => navigate('/timer')}
              disableRipple
            >
              타이머
            </NavButton>
            <NavButton
              className={isActiveRoute('/note') ? 'active' : ''}
              onClick={() => navigate('/note')}
              disableRipple
            >
              노트
            </NavButton>
            <NavButton
              className={isActiveRoute('/study') || isActiveRoute('/flashcards') ? 'active' : ''}
              onClick={() => navigate('/study')}
              disableRipple
            >
              학습
            </NavButton>
            <NavButton
              className={isActiveRoute('/profile') ? 'active' : ''}
              onClick={() => navigate('/profile')}
              disableRipple
            >
              프로필
            </NavButton>
          </DesktopNav>

          {/* 테마 토글 버튼 */}
          <NotificationButton onClick={toggleTheme} disableRipple title={`${theme.palette.mode === 'dark' ? 'Light' : 'Dark'} 모드로 변경`} aria-label={`${theme.palette.mode === 'dark' ? 'Light' : 'Dark'} 모드로 변경`}>
            {theme.palette.mode === 'dark' ? (
              <img src={BrightnessLowImg} alt="라이트 모드 아이콘" style={{ width: 24, height: 24 }} />
            ) : (
              <img src={Brightness4Img} alt="다크 모드 아이콘" style={{ width: 24, height: 24 }} />
            )}
          </NotificationButton>

          {/* 알림 아이콘 (항상 표시) */}
          {rightContent || (
            <NotificationButton disableRipple aria-label="알림">
              <img src={NotificationsImg} alt="알림 아이콘" style={{ width: 24, height: 24 }} />
            </NotificationButton>
          )}
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Header;