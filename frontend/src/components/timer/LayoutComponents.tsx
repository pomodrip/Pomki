import React from 'react';
import { styled, Box } from '@mui/material';
import Text from '../ui/Text';

// 페이지 컨테이너
export const PageContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',  
  alignItems: 'center',
  padding: '32px 24px',
  minHeight: 'calc(100vh - 128px)',

  '@media (min-width: 600px)': {
    padding: '48px 32px',
  },
}));

// 집중시간 섹션
export const FocusTimeSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '32px',
}));

// 실행 중 상태 헤더
export const RunningHeader = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '32px',
  width: '100%',
}));

// 버튼 컨테이너
export const ButtonContainer = styled(Box)(() => ({
  display: 'flex',
  gap: '16px',
  marginBottom: '48px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  
  '@media (max-width: 480px)': {
    flexDirection: 'column',
    width: '100%',
    maxWidth: '280px',
  },
}));

// 스터디 모드 섹션
export const StudyModeSection = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

// 타이머 관련 텍스트 컴포넌트들
export const PageTitle = styled(Text)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 700,
  color: theme.palette.text.primary,
  marginBottom: '48px',
  textAlign: 'center',
  
  '@media (min-width: 600px)': {
    fontSize: '28px',
  },
}));

export const FocusTimeLabel = styled(Text)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: '8px',
  textAlign: 'center',
}));

export const SessionProgress = styled(Text)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: '8px',
}));

export const ElapsedTime = styled(Text)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 500,
  color: theme.palette.primary.main,
  marginBottom: '16px',
}));

export const TimerDisplay = styled(Text)(({ theme }) => ({
  fontSize: '48px',
  fontWeight: 700,
  color: theme.palette.text.primary,
  lineHeight: 1,
  zIndex: 1,
  
  '@media (min-width: 600px)': {
    fontSize: '56px',
  },
})); 