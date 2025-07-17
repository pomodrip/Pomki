import React from 'react';
import { Box, Typography, IconButton, styled } from '@mui/material';
import Tag from '../ui/Tag';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import Stop from '@mui/icons-material/Stop';
import Settings from '@mui/icons-material/Settings';
import Timer from '../ui/Timer';
import { useTimer } from '../../hooks/useTimer';

const WidgetContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const SessionInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export interface TimerWidgetProps {
  onSettingsClick?: () => void;
}

const TimerWidget: React.FC<TimerWidgetProps> = ({
  onSettingsClick,
}) => {
  // Redux 기반 타이머 Hook 사용
  const {
    mode,
    isRunning,
    currentTime,
    sessionProgress,
    settings,
    canStart,
    canPause,
    start,
    pause,
    stop,
  } = useTimer();

  const handlePlayPause = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  const handleStop = () => {
    stop();
  };

  const getModeText = () => {
    switch (mode) {
      case 'FOCUS':
        return '집중시간';
      case 'SHORT_BREAK':
        return '짧은 휴식';
      case 'LONG_BREAK':
        return '긴 휴식';
      default:
        return '집중시간';
    }
  };

  // 전체 시간 계산 (초 단위)
  const totalSeconds = mode === 'FOCUS' 
    ? settings.focusTime * 60 
    : mode === 'SHORT_BREAK'
    ? settings.shortBreakTime * 60
    : settings.longBreakTime * 60;

  const elapsedSeconds = totalSeconds - (currentTime.minutes * 60 + currentTime.seconds);

  return (
    <WidgetContainer>
      <SessionInfo>
        <Typography variant="subtitle1" color="text.secondary">
          {getModeText()}
        </Typography>
        {mode === 'FOCUS' && (
          <Tag 
            label={`세션 ${sessionProgress.current}/${sessionProgress.target}`}
            selected={false}
          />
        )}
      </SessionInfo>

      <Timer
        minutes={currentTime.minutes}
        seconds={currentTime.seconds}
        totalSeconds={totalSeconds}
        elapsedSeconds={elapsedSeconds}
      />

      <ControlsContainer>
        <IconButton 
          onClick={handlePlayPause}
          disabled={!canStart && !canPause}
          color="primary"
          size="large"
          sx={{ 
            width: '48px', 
            height: '48px',
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:disabled': {
              backgroundColor: 'grey.300',
              color: 'grey.500',
            },
          }}
        >
          {isRunning ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <IconButton onClick={handleStop} size="large">
          <Stop />
        </IconButton>
        
        {onSettingsClick && (
          <IconButton onClick={onSettingsClick} size="large">
            <Settings />
          </IconButton>
        )}
      </ControlsContainer>
    </WidgetContainer>
  );
};

export default TimerWidget;
