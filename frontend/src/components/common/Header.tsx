import React from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
// import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNone';
import BellIcon from '../../assets/icons/bell.svg?react';

const Header: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery('(min-width:1024px)');

  // 공통 배경색 + 테두리 스타일 (footer 와 동일)
  const headerBase = {
    backgroundColor: '#fff',
    borderBottom: `1px solid ${theme.palette.divider}`,
  };


  // 모바일용 헤더 
  if (!isDesktop) {
    return (
      <AppBar position="sticky" color="default" elevation={0} 
      sx={{ height: 56, px: 2, justifyContent: 'center', ...headerBase }}>
        <Toolbar sx={{ justifyContent: 'space-between', p: 0 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontWeight={700} fontSize="1rem">
              Pomki
            </Typography>
          </Box>
          {/* 종 로고 MUI에서 가져옴 */}
          {/* 다운받아서 사용 할 것 */}
          <IconButton size="small" aria-label="알림">
            {/* <NotificationsNoneRoundedIcon /> */}
            <BellIcon width={24} height={24} />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }

  {/* 데스크탑용 헤더 */}
  return (
    <AppBar position="sticky" color="default" elevation={0} 
    sx={{ height: 64, px: 4, justifyContent: 'center', ...headerBase }}>
      <Toolbar sx={{ justifyContent: 'space-between', p: 0 }}>
        {/* 왼쪽 제목 */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography fontWeight={700} fontSize="1.25rem">
            Pomki
          </Typography>
        </Box>

        {/* 오른쪽 네비게이션 */}
        <Box display="flex" alignItems="center" gap={3}>
          {['홈', '타이머', '노트', '학습', '프로필'].map((label) => (
            <Typography
              key={label}
              fontWeight={700}
              fontSize="1rem"
              sx={{
                color: '#222',
                cursor: 'pointer',
                // transition: '0.2s',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  color: theme.palette.primary.main,
                  fontWeight: 900,
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  transform: 'scale(1.05)',
                },
              }}
            >
              {label}
            </Typography>
          ))}
          {/* 종 로고 MUI에서 가져옴 */}
          {/* 다운받아서 사용 할 것 */}
          <IconButton size="small" aria-label="알림">
            {/* <NotificationsNoneRoundedIcon /> */}
            <BellIcon width={24} height={24} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
