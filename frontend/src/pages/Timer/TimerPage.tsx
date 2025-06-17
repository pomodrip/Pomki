import React, { useState, useEffect } from 'react';
import { Box, Typography, styled, IconButton } from '@mui/material';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

// 페이지 컨테이너 - design.md 가이드 적용
const PageContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '32px 24px', // Large Spacing
  minHeight: 'calc(100vh - 128px)', // 헤더/푸터 제외
  backgroundColor: '#F8F9FA', // Background Secondary
  
  '@media (min-width: 600px)': {
    padding: '48px 32px',
  },
}));

// 페이지 제목 - design.md 타이포그래피 가이드
const PageTitle = styled(Typography)(() => ({
  fontSize: '24px', // H2 크기
  fontWeight: 700, // Bold
  color: '#1A1A1A', // Text Primary
  marginBottom: '48px', // Extra Large Spacing
  textAlign: 'center',
  
  '@media (min-width: 600px)': {
    fontSize: '28px', // H1 크기 (태블릿 이상)
  },
}));

// 집중시간 섹션
const FocusTimeSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '32px',
}));

const FocusTimeLabel = styled(Typography)(() => ({
  fontSize: '20px', // H3 크기
  fontWeight: 600, // Semibold
  color: '#1A1A1A', // Text Primary
  marginBottom: '8px', // Small Spacing
  textAlign: 'center',
}));

const SessionInfo = styled(Typography)(() => ({
  fontSize: '14px', // Caption
  fontWeight: 500,
  color: '#6B7280', // Text Secondary
  marginBottom: '24px',
  textAlign: 'center',
}));

// 타이머 원형 컨테이너
const TimerCircle = styled(Box)(() => ({
  width: '280px',
  height: '280px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '32px', // Large Spacing
  backgroundColor: '#FFFFFF', // Background Primary
  position: 'relative',
  
  '@media (min-width: 600px)': {
    width: '320px',
    height: '320px',
  },
}));

// SVG 원형 프로그레스
const CircularProgress = styled('svg')(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  transform: 'rotate(-90deg)', // 12시 방향부터 시작
}));

const ProgressCircle = styled('circle')<{ progress: number }>(({ progress }) => ({
  fill: 'none',
  strokeWidth: '8px',
  strokeLinecap: 'round',
  strokeDasharray: '100, 100',
  strokeDashoffset: 100 - progress,
  transition: 'stroke-dashoffset 0.5s ease',
  
  '@media (min-width: 600px)': {
    strokeWidth: '12px',
  },
}));

// 타이머 시간 표시
const TimerDisplay = styled(Typography)(() => ({
  fontSize: '48px', // 큰 디스플레이 크기
  fontWeight: 700, // Bold
  color: '#1A1A1A', // Text Primary
  lineHeight: 1,
  fontFamily: "'Pretendard', monospace", // 숫자용 폰트
  zIndex: 1,
  
  '@media (min-width: 600px)': {
    fontSize: '56px',
  },
}));

// 버튼 컨테이너
const ButtonContainer = styled(Box)(() => ({
  display: 'flex',
  gap: '16px', // Medium Spacing
  marginBottom: '48px', // Extra Large Spacing
  
  '@media (max-width: 480px)': {
    flexDirection: 'column',
    width: '100%',
    maxWidth: '280px',
  },
}));

// 작업 입력 섹션
const TaskInputSection = styled(Box)(() => ({
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const TaskInputLabel = styled(Typography)(() => ({
  fontSize: '16px', // Body Regular
  fontWeight: 500, // Medium
  color: '#6B7280', // Text Secondary
  marginBottom: '16px', // Medium Spacing
  textAlign: 'center',
}));

// 노트 섹션
const NotesSection = styled(Box)(() => ({
  width: '100%',
  maxWidth: '400px',
  marginTop: '32px',
}));

const NotesHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
}));

const NotesTitle = styled(Typography)(() => ({
  fontSize: '18px',
  fontWeight: 600,
  color: '#1A1A1A',
}));

const NotesTextArea = styled('textarea')(() => ({
  width: '100%',
  minHeight: '120px',
  padding: '16px',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: "'Pretendard', sans-serif",
  color: '#6B7280',
  backgroundColor: '#FFFFFF',
  resize: 'vertical',
  outline: 'none',
  
  '&:focus': {
    borderColor: '#2563EB',
  },
  
  '&::placeholder': {
    color: '#9CA3AF',
  },
}));

// 설정 다이얼로그 스타일
const SettingsContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  minWidth: '300px',
}));

const SettingsRow = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
}));

const SettingItem = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
}));

const SettingValue = styled(Box)(() => ({
  width: '80px',
  height: '80px',
  borderRadius: '12px',
  backgroundColor: '#F3F4F6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  fontWeight: 700,
  color: '#1A1A1A',
  marginBottom: '8px',
  cursor: 'pointer',
  userSelect: 'none',
  
  '&:hover': {
    backgroundColor: '#E5E7EB',
  },
}));

const SettingLabel = styled(Typography)(() => ({
  fontSize: '14px',
  fontWeight: 500,
  color: '#6B7280',
  textAlign: 'center',
}));

const PresetsSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}));

const PresetsTitle = styled(Typography)(() => ({
  fontSize: '16px',
  fontWeight: 600,
  color: '#1A1A1A',
  marginBottom: '8px',
}));

const PresetButton = styled(Button)(() => ({
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

interface TimerSettings {
  sessions: number;
  focusMinutes: number;
  breakMinutes: number;
}

const TimerPage: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [notes, setNotes] = useState('');
  const [session, setSession] = useState(1);
  const [totalTime] = useState(25 * 60); // 25분 = 1500초
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    sessions: 3,
    focusMinutes: 25,
    breakMinutes: 5,
  });

  // 진행률 계산
  const currentTime = minutes * 60 + seconds;
  const progress = ((totalTime - currentTime) / totalTime) * 100;

  // 타이머 로직
  useEffect(() => {
    let interval: number | null = null;
    
    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0 && isRunning) {
      setIsRunning(false);
      // 세션 완료 로직
      if (session < settings.sessions) {
        setSession(session + 1);
        setMinutes(settings.focusMinutes);
        setSeconds(0);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, minutes, seconds, session, settings]);

  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(settings.focusMinutes);
    setSeconds(0);
    setSession(1);
  };

  const handleSettings = () => {
    if (isRunning) {
      handleReset();
    } else {
      setShowSettings(true);
    }
  };

  const handleApplySettings = () => {
    setMinutes(settings.focusMinutes);
    setSeconds(0);
    setSession(1);
    setShowSettings(false);
  };

  const handlePreset = (preset: string) => {
    switch (preset) {
      case 'deep':
        setSettings({ sessions: 3, focusMinutes: 50, breakMinutes: 10 });
        break;
      case 'pomodoro':
        setSettings({ sessions: 4, focusMinutes: 25, breakMinutes: 5 });
        break;
      case 'quick':
        setSettings({ sessions: 6, focusMinutes: 15, breakMinutes: 3 });
        break;
    }
  };

  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, '0')} : ${sec.toString().padStart(2, '0')}`;
  };

  // SVG 원의 둘레 계산 (반지름 기준)
  const radius = 136; // 280px 원의 반지름에서 stroke-width 고려
  const circumference = 2 * Math.PI * radius;

  const settingsActions = (
    <Button
      variant="contained"
      onClick={handleApplySettings}
      sx={{ width: '100%', marginTop: '16px' }}
    >
      Start
    </Button>
  );

  return (
    <PageContainer>
      <PageTitle>
        타이머
      </PageTitle>

      <FocusTimeSection>
        <FocusTimeLabel>
          집중시간
        </FocusTimeLabel>
        {isRunning && (
          <SessionInfo>
            세션 {session}/{settings.sessions}
          </SessionInfo>
        )}
      </FocusTimeSection>

      <TimerCircle>
        {isRunning && (
          <CircularProgress width="280" height="280">
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
              stroke="#2563EB"
              progress={progress}
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
        
        <TimerDisplay>
          {formatTime(minutes, seconds)}
        </TimerDisplay>
      </TimerCircle>

      <ButtonContainer>
        <Button
          variant="contained"
          size="large"
          onClick={handleStart}
          sx={{
            minWidth: '120px',
            backgroundColor: isRunning ? '#EF4444' : '#2563EB',
            '&:hover': {
              backgroundColor: isRunning ? '#DC2626' : '#1D4ED8',
            },
          }}
        >
          {isRunning ? '일시정지' : '시작'}
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={handleSettings}
          sx={{
            minWidth: '120px',
            borderColor: '#E5E7EB',
            color: '#6B7280',
            '&:hover': {
              borderColor: '#D1D5DB',
              backgroundColor: '#F9FAFB',
            },
          }}
        >
          {isRunning ? '리셋' : '설정'}
        </Button>
      </ButtonContainer>

      {!isRunning ? (
        <TaskInputSection>
          <TaskInputLabel>
            이번 세션에 집중할 일은 무엇인가요?
          </TaskInputLabel>
          
          <Input
            fullWidth
            placeholder="e.g. Draft presentation report"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            sx={{
              backgroundColor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '16px',
                color: '#9CA3AF',
              },
            }}
          />
        </TaskInputSection>
      ) : (
        <NotesSection>
          <NotesHeader>
            <NotesTitle>
              Your Notes ✨
            </NotesTitle>
            <IconButton size="small" sx={{ color: '#6B7280' }}>
              <ExpandIcon fontSize="small" />
            </IconButton>
          </NotesHeader>
          
          <NotesTextArea
            placeholder="오늘 무엇이 떠올랐나요?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </NotesSection>
      )}

      {/* 설정 다이얼로그 */}
      <Modal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="설정"
        actions={settingsActions}
      >
        <SettingsContainer>
          <SettingsRow>
            <SettingItem>
              <SettingValue>
                {settings.sessions}
              </SettingValue>
              <SettingLabel>세션</SettingLabel>
            </SettingItem>
            <SettingItem>
              <SettingValue>
                {settings.focusMinutes}
              </SettingValue>
              <SettingLabel>집중 시간</SettingLabel>
            </SettingItem>
            <SettingItem>
              <SettingValue>
                {settings.breakMinutes}
              </SettingValue>
              <SettingLabel>휴식 시간</SettingLabel>
            </SettingItem>
          </SettingsRow>

          <PresetsSection>
            <PresetsTitle>Presets</PresetsTitle>
            <PresetButton onClick={() => handlePreset('deep')}>
              심층 학습 (50 min / 10 min)
            </PresetButton>
            <PresetButton onClick={() => handlePreset('pomodoro')}>
              포모도로 학습 (25 min / 5 min)
            </PresetButton>
            <PresetButton onClick={() => handlePreset('quick')}>
              빠른 학습 (15 min / 3 min)
            </PresetButton>
          </PresetsSection>
        </SettingsContainer>
      </Modal>
    </PageContainer>
  );
};

export default TimerPage;
