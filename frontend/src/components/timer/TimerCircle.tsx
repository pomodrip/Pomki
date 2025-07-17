import React from 'react';
import { styled, Box } from '@mui/material';
import Text from '../ui/Text';

// 타이머 원형 컨테이너  
const StyledTimerCircle = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '32px', // Large Spacing
  width: '280px', // 기본 크기 설정
  height: '280px', // 기본 크기 설정
  
  '@media (min-width: 600px)': {
    width: '320px',
    height: '320px',
  },
}));

// SVG 기반 원형 프로그레스
export const CircularProgress = styled('svg')(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '100%',
  height: '100%',
  transform: 'translate(-50%, -50%) rotate(-90deg)', // 중앙 정렬 후 12시 방향부터 시작
}));

export const ProgressCircle = styled('circle')(() => ({
  fill: 'none',
  strokeWidth: '8',
  strokeLinecap: 'round',
  transition: 'stroke-dashoffset 0.3s ease',
}));

interface TimerCircleProps {
  isRunning: boolean;
  progress: number;
  minutes: number;
  seconds: number;
}

const TimerCircle: React.FC<TimerCircleProps> = ({
  isRunning,
  progress,
  minutes,
  seconds
}) => {
  // SVG 원의 중심과 반지름 계산 (반지름 기준)
  const radius = 130; // 280px 원의 반지름에서 stroke-width 고려하여 조정
  const circumference = 2 * Math.PI * radius;

  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, '0')} : ${sec.toString().padStart(2, '0')}`;
  };

  return (
    <StyledTimerCircle>
      {isRunning && (
        <CircularProgress width="280" height="280" viewBox="0 0 280 280">
          {/* 배경 원 */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          {/* 진행률 원 */}
          <ProgressCircle
            cx="140"
            cy="140"
            r={radius}
            stroke="#2979FF" // theme의 primary.main 색상
            style={{
              strokeDasharray: `${circumference}, ${circumference}`,
              strokeDashoffset: circumference - (progress / 100) * circumference,
            }}
          />
        </CircularProgress>
      )}
      
      {!isRunning && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            border: '8px solid #E5E7EB',
            borderRadius: '50%',
            '@media (min-width: 600px)': {
              border: '12px solid #E5E7EB',
            },
          }}
        />
      )}
      
      <Text
        variant="h1"
        sx={{
          fontSize: '48px',
          fontWeight: 700,
          lineHeight: 1,
          zIndex: 1,
          '@media (min-width: 600px)': {
            fontSize: '56px',
          },
        }}
      >
        {formatTime(minutes, seconds)}
      </Text>
    </StyledTimerCircle>
  );
};

export default TimerCircle; 