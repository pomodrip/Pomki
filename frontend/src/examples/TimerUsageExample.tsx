import React from 'react';
import { Box, Typography, Button, Card, LinearProgress, Chip } from '@mui/material';
import { useTimer, useTimerNotification, useTimerStats } from '../hooks/useTimer';

/**
 * 🎯 타이머 Hook 사용 예시 컴포넌트
 * 
 * useTimer, useTimerNotification, useTimerStats Hook의 사용법을 보여주는 예시
 */

const TimerUsageExample: React.FC = () => {
  // 메인 타이머 Hook
  const {
    mode,
    isRunning,
    currentTime,
    progress,
    sessionProgress,
    settings,
    canStart,
    canPause,
    isCompleted,
    nextSessionInfo,
    error,
    start,
    pause,
    stop,
    reset,
    changeMode,
    updateTimerSettings,
    clearTimerError,
  } = useTimer();

  // 알림 관리 Hook
  const { hasPermission, canRequest, requestPermission } = useTimerNotification();

  // 통계 Hook
  const { todayFocusTime, goalProgress, completedSessions, currentCycle } = useTimerStats();

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getModeColor = (timerMode: typeof mode) => {
    switch (timerMode) {
      case 'FOCUS': return '#2979FF';
      case 'SHORT_BREAK': return '#4CAF50';
      case 'LONG_BREAK': return '#FF9800';
      default: return '#2979FF';
    }
  };

  const handleSettingsUpdate = () => {
    updateTimerSettings({
      focusTime: 30, // 30분으로 변경
      shortBreakTime: 10, // 10분으로 변경
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🎯 타이머 Hook 사용 예시
      </Typography>

      {/* 에러 표시 */}
      {error && (
        <Card sx={{ p: 2, mb: 3, backgroundColor: '#ffebee' }}>
          <Typography color="error">에러: {error}</Typography>
          <Button onClick={clearTimerError} size="small" sx={{ mt: 1 }}>
            에러 제거
          </Button>
        </Card>
      )}

      {/* 현재 상태 */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          현재 타이머 상태
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip 
            label={mode === 'FOCUS' ? '집중시간' : mode === 'SHORT_BREAK' ? '짧은 휴식' : '긴 휴식'}
            sx={{ backgroundColor: getModeColor(mode), color: 'white' }}
          />
          <Typography variant="h4">
            {formatTime(currentTime.minutes, currentTime.seconds)}
          </Typography>
          {isRunning && <Chip label="실행 중" color="success" />}
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mb: 2, height: 8, borderRadius: 4 }}
        />

        <Typography variant="body2" color="text.secondary">
          세션 진행률: {sessionProgress.current}/{sessionProgress.target} (사이클 {currentCycle})
        </Typography>

        {isCompleted && (
          <Typography variant="h6" color="success.main" sx={{ mt: 1 }}>
            ✅ 세션 완료! 다음: {nextSessionInfo.duration}분 {nextSessionInfo.mode === 'FOCUS' ? '집중시간' : '휴식시간'}
          </Typography>
        )}
      </Card>

      {/* 컨트롤 버튼 */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          타이머 제어
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={start} 
            disabled={!canStart}
            color="primary"
          >
            시작
          </Button>
          
          <Button 
            variant="contained" 
            onClick={pause} 
            disabled={!canPause}
            color="warning"
          >
            일시정지
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={stop}
          >
            정지
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={reset}
          >
            초기화
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button 
            size="small"
            variant={mode === 'FOCUS' ? 'contained' : 'outlined'}
            onClick={() => changeMode('FOCUS')}
            disabled={isRunning}
          >
            집중시간
          </Button>
          
          <Button 
            size="small"
            variant={mode === 'SHORT_BREAK' ? 'contained' : 'outlined'}
            onClick={() => changeMode('SHORT_BREAK')}
            disabled={isRunning}
          >
            짧은 휴식
          </Button>
          
          <Button 
            size="small"
            variant={mode === 'LONG_BREAK' ? 'contained' : 'outlined'}
            onClick={() => changeMode('LONG_BREAK')}
            disabled={isRunning}
          >
            긴 휴식
          </Button>
        </Box>
      </Card>

      {/* 설정 */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          현재 설정
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">집중시간</Typography>
            <Typography variant="h6">{settings.focusTime}분</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">짧은 휴식</Typography>
            <Typography variant="h6">{settings.shortBreakTime}분</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">긴 휴식</Typography>
            <Typography variant="h6">{settings.longBreakTime}분</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">긴 휴식 간격</Typography>
            <Typography variant="h6">{settings.longBreakInterval}회</Typography>
          </Box>
        </Box>

        <Button onClick={handleSettingsUpdate} sx={{ mt: 2 }}>
          설정 변경 예시 (30분/10분)
        </Button>
      </Card>

      {/* 통계 */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          오늘의 통계
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">집중시간</Typography>
            <Typography variant="h6">{todayFocusTime}분</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">완료된 세션</Typography>
            <Typography variant="h6">{completedSessions}개</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">목표 달성률</Typography>
            <Typography variant="h6">{goalProgress.toFixed(1)}%</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">현재 사이클</Typography>
            <Typography variant="h6">{currentCycle}</Typography>
          </Box>
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={goalProgress} 
          sx={{ mt: 2, height: 6, borderRadius: 3 }}
        />
      </Card>

      {/* 알림 설정 */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          브라우저 알림
        </Typography>
        
        {hasPermission ? (
          <Typography color="success.main">✅ 알림 권한이 허용되었습니다</Typography>
        ) : canRequest ? (
          <Box>
            <Typography color="warning.main">⚠️ 알림 권한이 필요합니다</Typography>
            <Button onClick={requestPermission} sx={{ mt: 1 }}>
              알림 권한 요청
            </Button>
          </Box>
        ) : (
          <Typography color="error.main">❌ 알림 권한이 거부되었습니다</Typography>
        )}
      </Card>

      {/* 사용법 설명 */}
      <Card sx={{ p: 3, mt: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          📚 Hook 사용법
        </Typography>
        
        <Typography variant="body2" component="pre" sx={{ 
          fontFamily: 'monospace', 
          whiteSpace: 'pre-wrap',
          fontSize: '0.875rem',
          lineHeight: 1.5 
        }}>
{`// 기본 사용법
const { 
  start, pause, stop, 
  currentTime, progress, 
  isRunning, mode 
} = useTimer();

// 옵션 설정
const timer = useTimer({
  autoTick: true,        // 자동 틱 처리 (기본: true)
  tickInterval: 1000     // 틱 간격 (기본: 1000ms)
});

// 알림 관리
const { hasPermission, requestPermission } = useTimerNotification();

// 통계 조회
const { todayFocusTime, goalProgress } = useTimerStats();`}
        </Typography>
      </Card>
    </Box>
  );
};

export default TimerUsageExample; 