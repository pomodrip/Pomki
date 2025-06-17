import React from 'react';
import { Box, Typography, CircularProgress, styled } from '@mui/material';

const TimerContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

const TimerCircle = styled(Box)({
  width: '240px', // 89. Timer Circle Size
  height: '240px',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const TimerText = styled(Typography)(({ theme }) => ({
  fontSize: '4rem', // 91. Timer Font Size (64px)
  fontWeight: 300, // 91. Timer Font Weight
  color: theme.palette.text.primary,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}));

const BackgroundCircle = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.grey[300],
  position: 'absolute',
}));

const ProgressCircle = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  position: 'absolute',
}));

export interface TimerProps {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  elapsedSeconds: number;
}

const Timer: React.FC<TimerProps> = ({ 
  minutes, 
  seconds, 
  totalSeconds, 
  elapsedSeconds,
}) => {
  const progress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;
  const timeDisplay = `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;

  return (
    <TimerContainer>
      <TimerCircle>
        <BackgroundCircle
          variant="determinate"
          value={100}
          size={240}
          thickness={3} // 90. Timer Circle Thickness 조정
        />
        <ProgressCircle
          variant="determinate"
          value={progress}
          size={240}
          thickness={3}
        />
        <TimerText variant="h1">
          {timeDisplay}
        </TimerText>
      </TimerCircle>
    </TimerContainer>
  );
};

export default Timer;
