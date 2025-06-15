import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon  from '../../assets/icons/home.svg?react';
import TimerIcon  from '../../assets/icons/timer.svg?react';
import NoteIcon  from '../../assets/icons/note.svg?react';
import DocumentIcon  from '../../assets/icons/documents.svg?react';
import ProfileIcon  from '../../assets/icons/profile.svg?react';
import { useTheme } from '@mui/material/styles';

const BottomNav: React.FC = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();

  const navItems = [
    { label: '타이머', inactiveIcon: <TimerIcon />, activeIcon: <TimerIcon /> },
    { label: '노트', inactiveIcon: <NoteIcon />, activeIcon: <NoteIcon /> },
    { label: '홈', inactiveIcon: <HomeIcon />, activeIcon: <HomeIcon /> },
    { label: '학습', inactiveIcon: <DocumentIcon />, activeIcon: <DocumentIcon /> },
    { label: '프로필', inactiveIcon: <ProfileIcon />, activeIcon: <ProfileIcon /> }
  ];

  return (
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
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{
          height: '100%',
        }}
      >
        {navItems.map((item, index) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={value === index ? item.activeIcon : item.inactiveIcon}
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
              color: value === index ? theme.palette.primary.main : theme.palette.text.secondary,
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
