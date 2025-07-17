import React from 'react';
import { styled, Box, Button } from '@mui/material';
import Text from '../ui/Text';

// 설정 다이얼로그 스타일
export const SettingsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  minWidth: '300px',
  
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    width: '100%',
  },
}));

export const SettingsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  
  [theme.breakpoints.down('sm')]: {
    gap: '4px', // 모바일에서 간격 더 줄임
    justifyContent: 'space-around', // 균등 분배
  },
}));

export const PresetsSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}));

export const PresetsTitle = styled(Text)(() => ({
  fontSize: '16px',
  fontWeight: 600,
  marginBottom: '8px',
}));

export const PresetButton = styled(Button)(() => ({
  justifyContent: 'flex-start',
  backgroundColor: '#F3F4F6',
  color: '#1A1A1A',
  borderRadius: '8px',
  padding: '12px 16px',
  textTransform: 'none',
  
  '&:hover': {
    backgroundColor: '#E5E7EB',
  },
})); 