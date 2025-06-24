import React from 'react';
import { Box, Typography, Button, Card, LinearProgress, styled } from '@mui/material';
import { useTimer } from '../../hooks/useTimer';

const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '32px',
  minHeight: '100vh',
  gap: '24px',
}));

const TimerDisplay = styled(Typography)(() => ({
  fontSize: '4rem',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  marginBottom: '16px',
}));

const SessionInfo = styled(Typography)(() => ({
  fontSize: '1.2rem',
  color: '#666',
  marginBottom: '8px',
}));

const ControlsContainer = styled(Box)(() => ({
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const SettingsCard = styled(Card)(() => ({
  padding: '20px',
  marginTop: '24px',
  minWidth: '300px',
}));

const PomodoroPage: React.FC = () => {
  const {
    currentTime,
    progress,
    isRunning,
    sessionProgress,
    settings,
    mode,
    canStart,
    canPause,
    isCompleted,
    nextSessionInfo,
    start,
    pause,
    stop,
    reset,
    changeMode,
    updateTimerSettings,
  } = useTimer();

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getModeDisplay = () => {
    switch (mode) {
      case 'FOCUS':
        return '🎯 집중시간';
      case 'SHORT_BREAK':
        return '☕ 짧은 휴식';
      case 'LONG_BREAK':
        return '🏖️ 긴 휴식';
      default:
        return '⏰ 타이머';
    }
  };

  const handleModeChange = (newMode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    if (!isRunning) {
      changeMode(newMode);
    }
  };

  const handleSettingsChange = (key: string, value: number) => {
    updateTimerSettings({ [key]: value });
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        포모도로 타이머
      </Typography>

      {/* 모드 표시 */}
      <Typography variant="h5" color="primary" gutterBottom>
        {getModeDisplay()}
      </Typography>

      {/* 타이머 디스플레이 */}
      <TimerDisplay>
        {formatTime(currentTime.minutes, currentTime.seconds)}
      </TimerDisplay>

      {/* 진행률 바 */}
      <Box sx={{ width: '300px', mb: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {progress.toFixed(1)}% 완료
        </Typography>
      </Box>

      {/* 세션 정보 */}
      <SessionInfo>
        세션 진행: {sessionProgress.current}/{sessionProgress.target} (사이클 {sessionProgress.cycle})
      </SessionInfo>

      {/* 완료 메시지 */}
      {isCompleted && (
        <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
          🎉 세션 완료! 다음: {nextSessionInfo.duration}분 {nextSessionInfo.mode === 'FOCUS' ? '집중시간' : '휴식시간'}
        </Typography>
      )}

      {/* 컨트롤 버튼 */}
      <ControlsContainer>
        <Button
          variant="contained"
          size="large"
          onClick={start}
          disabled={!canStart}
          color="success"
        >
          시작
        </Button>
        
        <Button
          variant="contained"
          size="large"
          onClick={pause}
          disabled={!canPause}
          color="warning"
        >
          일시정지
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={stop}
        >
          정지
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={reset}
        >
          초기화
        </Button>
      </ControlsContainer>

      {/* 모드 변경 버튼 */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          모드 변경
        </Typography>
        <ControlsContainer>
          <Button
            variant={mode === 'FOCUS' ? 'contained' : 'outlined'}
            onClick={() => handleModeChange('FOCUS')}
            disabled={isRunning}
          >
            집중시간 ({settings.focusTime}분)
          </Button>
          <Button
            variant={mode === 'SHORT_BREAK' ? 'contained' : 'outlined'}
            onClick={() => handleModeChange('SHORT_BREAK')}
            disabled={isRunning}
          >
            짧은 휴식 ({settings.shortBreakTime}분)
          </Button>
          <Button
            variant={mode === 'LONG_BREAK' ? 'contained' : 'outlined'}
            onClick={() => handleModeChange('LONG_BREAK')}
            disabled={isRunning}
          >
            긴 휴식 ({settings.longBreakTime}분)
          </Button>
        </ControlsContainer>
      </Box>

      {/* 설정 카드 */}
      <SettingsCard>
        <Typography variant="h6" gutterBottom>
          ⚙️ 타이머 설정
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">집중시간</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                size="small" 
                onClick={() => handleSettingsChange('focusTime', Math.max(5, settings.focusTime - 5))}
                disabled={isRunning}
              >
                -
              </Button>
              <Typography variant="h6">{settings.focusTime}분</Typography>
              <Button 
                size="small" 
                onClick={() => handleSettingsChange('focusTime', Math.min(120, settings.focusTime + 5))}
                disabled={isRunning}
              >
                +
              </Button>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">짧은 휴식</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                size="small" 
                onClick={() => handleSettingsChange('shortBreakTime', Math.max(1, settings.shortBreakTime - 1))}
                disabled={isRunning}
              >
                -
              </Button>
              <Typography variant="h6">{settings.shortBreakTime}분</Typography>
              <Button 
                size="small" 
                onClick={() => handleSettingsChange('shortBreakTime', Math.min(30, settings.shortBreakTime + 1))}
                disabled={isRunning}
              >
                +
              </Button>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">긴 휴식</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                size="small" 
                onClick={() => handleSettingsChange('longBreakTime', Math.max(5, settings.longBreakTime - 5))}
                disabled={isRunning}
              >
                -
              </Button>
              <Typography variant="h6">{settings.longBreakTime}분</Typography>
              <Button 
                size="small" 
                onClick={() => handleSettingsChange('longBreakTime', Math.min(60, settings.longBreakTime + 5))}
                disabled={isRunning}
              >
                +
              </Button>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">긴 휴식 간격</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                size="small" 
                onClick={() => handleSettingsChange('longBreakInterval', Math.max(2, settings.longBreakInterval - 1))}
                disabled={isRunning}
              >
                -
              </Button>
              <Typography variant="h6">{settings.longBreakInterval}회</Typography>
              <Button 
                size="small" 
                onClick={() => handleSettingsChange('longBreakInterval', Math.min(10, settings.longBreakInterval + 1))}
                disabled={isRunning}
              >
                +
              </Button>
            </Box>
          </Box>
        </Box>

        {/* 프리셋 버튼 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" gutterBottom>
            프리셋:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => updateTimerSettings({ focusTime: 25, shortBreakTime: 5, longBreakTime: 15 })}
              disabled={isRunning}
            >
              클래식 (25/5/15)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => updateTimerSettings({ focusTime: 50, shortBreakTime: 10, longBreakTime: 30 })}
              disabled={isRunning}
            >
              장시간 (50/10/30)
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => updateTimerSettings({ focusTime: 15, shortBreakTime: 3, longBreakTime: 10 })}
              disabled={isRunning}
            >
              단시간 (15/3/10)
            </Button>
          </Box>
        </Box>
      </SettingsCard>

      {/* 사용법 안내 */}
      <Card sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5', maxWidth: '600px' }}>
        <Typography variant="h6" gutterBottom>
          📚 사용법
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          • <strong>집중시간</strong>: 작업에 집중하는 시간<br/>
          • <strong>짧은 휴식</strong>: 집중시간 후 짧은 휴식<br/>
          • <strong>긴 휴식</strong>: 여러 세션 후 긴 휴식<br/>
          • <strong>사이클</strong>: 집중시간 → 휴식 → 집중시간... 반복<br/>
          • 설정은 타이머가 정지된 상태에서만 변경 가능합니다.
        </Typography>
      </Card>
    </Container>
  );
};

export default PomodoroPage;
