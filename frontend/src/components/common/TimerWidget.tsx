import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, styled } from '@mui/material';
import Tag from '../ui/Tag';
import { PlayArrow, Pause, Stop, Settings } from '@mui/icons-material';
import Timer from '../ui/Timer';

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
  mode: 'pomodoro' | 'focus' | 'break';
  sessionCount?: number;
  totalSessions?: number;
  onModeChange?: (mode: 'pomodoro' | 'focus' | 'break') => void;
  onSettingsClick?: () => void;
}

const TimerWidget: React.FC<TimerWidgetProps> = ({
  mode = 'pomodoro',
  sessionCount = 1,
  totalSessions = 4,
  onSettingsClick,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60); // 25분 기본값
  const [totalSeconds] = useState(25 * 60);
  
  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  const elapsedSeconds = totalSeconds - seconds;

  useEffect(() => {
    let interval: number;
    
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    setSeconds(totalSeconds);
  };

  const getModeText = () => {
    switch (mode) {
      case 'pomodoro':
        return '집중시간';
      case 'focus':
        return '자유 집중';
      case 'break':
        return '휴식시간';
      default:
        return '집중시간';
    }
  };

  return (
    <WidgetContainer>
      <SessionInfo>
        <Typography variant="subtitle1" color="text.secondary">
          {getModeText()}
        </Typography>
        {mode === 'pomodoro' && (
          <Tag 
            label={`세션 ${sessionCount}/${totalSessions}`}
            selected={false}
          />
        )}
      </SessionInfo>

      <Timer
        minutes={minutes}
        seconds={displaySeconds}
        totalSeconds={totalSeconds}
        elapsedSeconds={elapsedSeconds}
      />

      <ControlsContainer>
        <IconButton 
          onClick={handlePlayPause}
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
