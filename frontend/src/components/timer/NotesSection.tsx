import React from 'react';
import { styled, Box } from '@mui/material';
import Text from '../ui/Text';

// 노트 섹션
export const NotesSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ expanded, theme }) => ({
  width: '100%',
  maxWidth: expanded ? 'none' : '400px',
  marginTop: '32px',
  transition: 'all 0.3s ease',
  padding: expanded ? 0 : '0 8px',
  [theme.breakpoints.up('sm')]: {
    padding: 0,
  },
  ...(expanded && {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 9999,
    margin: 0,
    padding: 0,
    overflow: 'auto',
  }),
}));

export const NotesHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
}));

export const NotesTitle = styled(Text)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

// 통합된 작업 입력
export const TaskInput = styled('input')<{ disabled?: boolean }>(({ disabled, theme }) => ({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: "'Pretendard', sans-serif",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  outline: 'none',
  transition: 'all 0.2s ease',
  cursor: disabled ? 'not-allowed' : 'text',
  
  '&:focus': {
    borderColor: disabled ? '#E5E7EB' : '#2563EB',
    boxShadow: disabled ? 'none' : '0 0 0 3px rgba(37, 99, 235, 0.1)',
  },
  
  '&::placeholder': {
    color: '#9CA3AF',
    fontSize: '14px',
  },
}));

// 자동 저장 설정 섹션
export const AutoSaveSection = styled(Box)(() => ({
  marginBottom: '16px',
  padding: '12px 16px',
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
}));

export const ToggleContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})); 