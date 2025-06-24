import React from 'react';
import { Box, CircularProgress, styled } from '@mui/material';
import Text from './Text';
import theme from '../../theme/theme';

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

const CircularProgressWrapper = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const BackgroundCircle = styled(CircularProgress)({
  color: theme.palette.grey[300],
  position: 'absolute',
  top: 0,
  left: 0,
});

const ProgressCircle = styled(CircularProgress)({
  color: theme.palette.primary.main,
  position: 'absolute',
  top: 0,
  left: 0,
});

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
        <CircularProgressWrapper>
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
        </CircularProgressWrapper>
        <Text 
          variant="h1"
          sx={{
            fontSize: '4rem', // 91. Timer Font Size (64px)
            fontWeight: 300, // 91. Timer Font Weight
            color: theme.palette.text.primary,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            // fontFamily는 theme에서 자동으로 적용됨
          }}
        >
          {timeDisplay}
        </Text>
      </TimerCircle>
    </TimerContainer>
  );
};

export default Timer;
