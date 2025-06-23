import React, { useState, useEffect } from 'react';
import { Box, styled, Select, MenuItem, FormControl, CircularProgress as MuiCircularProgress } from '@mui/material';
import { Text, IconButton } from '../../components/ui';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import CompressIcon from '@mui/icons-material/CloseFullscreen';
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
const PageTitle = styled(Text)(() => ({
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

const FocusTimeLabel = styled(Text)(() => ({
  fontSize: '20px', // H3 크기
  fontWeight: 600, // Semibold
  color: '#1A1A1A', // Text Primary
  marginBottom: '8px', // Small Spacing
  textAlign: 'center',
}));

// 실행 중 상태 헤더
const RunningHeader = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '32px',
  width: '100%',
}));

const SessionProgress = styled(Text)(() => ({
  fontSize: '18px',
  fontWeight: 600,
  color: '#1A1A1A',
  marginBottom: '8px',
}));

const ElapsedTime = styled(Text)(() => ({
  fontSize: '16px',
  fontWeight: 500,
  color: '#2563EB', // Primary color
  marginBottom: '16px',
}));

const ProgressBarContainer = styled(Box)(() => ({
  width: '100%',
  maxWidth: '400px',
  height: '8px',
  backgroundColor: '#E5E7EB',
  borderRadius: '4px',
  overflow: 'hidden',
  marginBottom: '32px',
}));

const ProgressBarFill = styled(Box)<{ progress: number }>(({ progress }) => ({
  width: `${progress}%`,
  height: '100%',
  backgroundColor: '#2563EB',
  transition: 'width 0.3s ease',
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
const TimerDisplay = styled(Text)(() => ({
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

const TaskInputLabel = styled(Text)(() => ({
  fontSize: '16px', // Body Regular
  fontWeight: 500, // Medium
  color: '#6B7280', // Text Secondary
  marginBottom: '16px', // Medium Spacing
  textAlign: 'center',
}));

// 노트 섹션
const NotesSection = styled(Box)<{ expanded: boolean }>(({ expanded }) => ({
  width: '100%',
  maxWidth: expanded ? 'none' : '400px',
  marginTop: '32px',
  transition: 'all 0.3s ease',
  ...(expanded && {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 9999,
    margin: 0,
    padding: '24px',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  }),
}));

// ?��????�트???�?�머 �?
const ExpandedTimerBar = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px',
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  marginBottom: '24px',
  border: '2px solid #E5E7EB',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
}));

const ExpandedTimerInfo = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
}));

const ExpandedTimerDisplay = styled(Text)(() => ({
  fontSize: '28px',
  fontWeight: 700,
  color: '#1A1A1A',
  fontFamily: "'Pretendard', monospace",
}));

const ExpandedSessionInfo = styled(Text)(() => ({
  fontSize: '16px',
  fontWeight: 500,
  color: '#6B7280',
}));

const ExpandedProgressBar = styled(Box)(() => ({
  flex: 1,
  height: '12px',
  backgroundColor: '#F3F4F6',
  borderRadius: '6px',
  overflow: 'hidden',
  margin: '0 20px',
  border: '1px solid #E5E7EB',
}));

const ExpandedProgressFill = styled(Box)<{ progress: number }>(({ progress }) => ({
  width: `${progress}%`,
  height: '100%',
  backgroundColor: '#2563EB',
  transition: 'width 0.3s ease',
  borderRadius: '6px',
  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
}));

const NotesHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
}));

const NotesTitle = styled(Text)(() => ({
  fontSize: '24px',
  fontWeight: 700,
  color: '#1A1A1A',
}));

const NotesTextArea = styled('textarea')<{ expanded: boolean }>(({ expanded }) => ({
  width: '100%',
  minHeight: expanded ? '60vh' : '120px',
  padding: '16px',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: "'Pretendard', sans-serif",
  color: '#1A1A1A',
  backgroundColor: '#FFFFFF',
  resize: 'vertical',
  outline: 'none',
  transition: 'min-height 0.3s ease',
  flex: expanded ? 1 : 'none',
  
  '&:focus': {
    borderColor: '#2563EB',
  },
  
  '&::placeholder': {
    color: '#9CA3AF',
  },
}));

// ?�장???�트 기능??
const ExpandedNotesFeatures = styled(Box)(() => ({
  marginTop: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
}));

const StudyModeSection = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const StudyModeLabel = styled(Text)(() => ({
  fontSize: '14px',
  fontWeight: 500,
  color: '#6B7280',
}));

// ?�정 ?�이?�로�??��???
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

const SettingLabel = styled(Text)(() => ({
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

const PresetsTitle = styled(Text)(() => ({
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
  const [showSettings, setShowSettings] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [summaryStyle, setSummaryStyle] = useState('concept');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    sessions: 3,
    focusMinutes: 25,
    breakMinutes: 5,
  });

  const totalTime = settings.focusMinutes * 60;

  // 진행�?계산
  const currentTime = minutes * 60 + seconds;
  const progress = ((totalTime - currentTime) / totalTime) * 100;

  // ?�?�머 로직
  useEffect(() => {
    let interval: number | null = null;
    
    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0 && isRunning) {
      setIsRunning(false);
      // ?�션 ?�료 로직
      if (session < settings.sessions) {
        setSession(session + 1);
        setMinutes(settings.focusMinutes);
        setSeconds(0);
        setElapsedTime(0);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, minutes, seconds, session, settings]);

  const handleStart = () => {
    if (!isRunning) {
      setElapsedTime(0);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(settings.focusMinutes);
    setSeconds(0);
    setSession(1);
    setElapsedTime(0);
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
    setElapsedTime(0);
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

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // AI ?�트 ?�성 ?�들??(?�시 구현)
  const handleGenerateAI = async () => {
    if (!notes.trim()) {
              alert('먼저 노트에 내용을 작성해주세요.');
      return;
    }

    setIsGeneratingAI(true);
    
    // ?�시 AI ?�성 ?��??�이??
    setTimeout(() => {
      const aiContent = generateMockAIContent(summaryStyle, taskName);
      setNotes(prevNotes => {
        const separator = prevNotes.trim() ? '\n\n--- AI 생성 내용 ---\n\n' : '';
        return prevNotes + separator + aiContent;
      });
      setIsGeneratingAI(false);
              alert('AI 노트가 성공적으로 생성되었습니다!');
    }, 2000);
  };

  // ?�시 AI 컨텐�??�성 ?�수
  const generateMockAIContent = (style: string, task: string) => {
    const taskPrefix = task ? `${task}에 대한 ` : '';
    
    switch (style) {
      case 'concept':
        return `${taskPrefix}핵심 개념 정리:
• 주요 아이디어와 개념들을 체계적으로 정리
• 개념 간의 연관성과 관계 파악
• 실무 적용 가능한 포인트 도출`;
      
      case 'detail':
        return `${taskPrefix}상세 분석:
1. 구체적인 실행 단계와 방법론
2. 세부 사항과 주의해야 할 점들
3. 예상되는 문제점과 해결 방안
4. 성과 측정 및 평가 기준`;
      
      case 'summary':
        return `${taskPrefix}요약:
- 핵심 내용을 간결하게 정리
- 주요 학습 포인트 3가지
- 다음 단계 액션 아이템
- 기억해야 할 중요 사항`;
      
      default:
        return `${taskPrefix}학습 내용 정리 및 다음 단계 계획`;
    }
  };

  // SVG ?�의 ?�레 계산 (반�?�?기�?)
  const radius = 136; // 280px ?�의 반�?름에??stroke-width 고려
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

  // ?��????�트 ?�더�??�수
  const renderExpandedNotes = () => (
    <NotesSection expanded={true}>
      {/* ?�?�머 �?*/}
      <ExpandedTimerBar>
        <ExpandedTimerInfo>
          <ExpandedTimerDisplay>
            {formatTime(minutes, seconds)}
          </ExpandedTimerDisplay>
          {isRunning ? (
            <ExpandedSessionInfo>
              세션 {session}/{settings.sessions} • {formatElapsedTime(elapsedTime)}
            </ExpandedSessionInfo>
          ) : (
            <ExpandedSessionInfo>
              세션 {session}/{settings.sessions} • 준비됨
            </ExpandedSessionInfo>
          )}
        </ExpandedTimerInfo>
        
        <ExpandedProgressBar>
          <ExpandedProgressFill progress={isRunning ? progress : 0} />
        </ExpandedProgressBar>
        
        <IconButton 
          size="small" 
          sx={{ 
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
            '&:hover': {
              backgroundColor: '#E5E7EB',
            },
          }}
          onClick={() => setNotesExpanded(false)}
        >
          <CompressIcon fontSize="small" />
        </IconButton>
      </ExpandedTimerBar>

      {/* 노트 제목과 작업명 */}
      <NotesHeader>
        <Box>
          <NotesTitle>
            📝 집중 노트
          </NotesTitle>
          {taskName && (
            <Text 
              sx={{ 
                fontSize: '16px', 
                color: '#6B7280', 
                marginTop: '4px',
                fontWeight: 500,
              }}
            >
              현재 작업: {taskName}
            </Text>
          )}
        </Box>
      </NotesHeader>
      
      {/* 노트 텍스트 영역 */}
      <NotesTextArea
        expanded={true}
        placeholder="이번 세션에서 떠오른 아이디어, 배운 내용, 중요한 포인트를 기록해보세요..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* 확장된 기능들 */}
      <ExpandedNotesFeatures>
        <StudyModeSection>
          <StudyModeLabel>요약 스타일</StudyModeLabel>
          <FormControl size="small" variant="outlined">
            <Select
              value={summaryStyle}
              onChange={(e) => setSummaryStyle(e.target.value as string)}
              displayEmpty
              sx={{
                minWidth: '150px',
                backgroundColor: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E5E7EB',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#D1D5DB',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2563EB',
                },
              }}
            >
              <MenuItem value="concept">Concept-focused</MenuItem>
              <MenuItem value="detail">Detail-focused</MenuItem>
              <MenuItem value="summary">Summary-focused</MenuItem>
            </Select>
          </FormControl>
        </StudyModeSection>
        
        <Button
          variant="contained"
          size="small"
          onClick={handleGenerateAI}
          disabled={isGeneratingAI || !notes.trim()}
          sx={{
            backgroundColor: '#10B981',
            '&:hover': {
              backgroundColor: '#059669',
            },
            '&:disabled': {
              backgroundColor: '#D1D5DB',
              color: '#9CA3AF',
            },
            fontWeight: 600,
            textTransform: 'none',
            minWidth: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isGeneratingAI ? (
            <>
              <MuiCircularProgress size={16} sx={{ color: '#FFFFFF' }} />
              생성 중...
            </>
          ) : (
            'AI 생성'
          )}
        </Button>
      </ExpandedNotesFeatures>
    </NotesSection>
  );

  // 확대된 노트가 표시 중일 때는 오버레이만 렌더링
  if (notesExpanded) {
    return renderExpandedNotes();
  }

  return (
    <PageContainer>
      <PageTitle>
        타이머
      </PageTitle>

      {isRunning ? (
        <RunningHeader>
          <SessionProgress>
            세션 {session}/{settings.sessions}
          </SessionProgress>
          <ElapsedTime>
            {formatElapsedTime(elapsedTime)}
          </ElapsedTime>
          <ProgressBarContainer>
            <ProgressBarFill progress={progress} />
          </ProgressBarContainer>
        </RunningHeader>
      ) : (
        <FocusTimeSection>
          <FocusTimeLabel>
            집중시간
          </FocusTimeLabel>
        </FocusTimeSection>
      )}

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
        <>
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

          <NotesSection expanded={false}>
            <NotesHeader>
              <Box>
                <NotesTitle>
                  📝 집중 노트
                </NotesTitle>
                {taskName && (
                  <Text 
                    sx={{ 
                      fontSize: '14px', 
                      color: '#6B7280', 
                      marginTop: '4px',
                      fontWeight: 500,
                    }}
                  >
                    현재 작업: {taskName}
                  </Text>
                )}
              </Box>
              <IconButton 
                size="small" 
                sx={{ 
                  color: '#6B7280',
                  backgroundColor: '#F3F4F6',
                  '&:hover': {
                    backgroundColor: '#E5E7EB',
                  },
                }}
                onClick={() => setNotesExpanded(true)}
              >
                <ExpandIcon fontSize="small" />
              </IconButton>
            </NotesHeader>
            
            <NotesTextArea
              expanded={false}
              placeholder="이번 세션에서 떠오른 아이디어, 배운 내용을 기록해보세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </NotesSection>
        </>
      ) : (
        <NotesSection expanded={false}>
          <NotesHeader>
            <Box>
              <NotesTitle>
                📝 집중 노트
              </NotesTitle>
              {taskName && (
                <Text 
                  sx={{ 
                    fontSize: '14px', 
                    color: '#6B7280', 
                    marginTop: '4px',
                    fontWeight: 500,
                  }}
                >
                  현재 작업: {taskName}
                </Text>
              )}
            </Box>
            <IconButton 
              size="small" 
              sx={{ 
                color: '#6B7280',
                backgroundColor: '#F3F4F6',
                '&:hover': {
                  backgroundColor: '#E5E7EB',
                },
              }}
              onClick={() => setNotesExpanded(true)}
            >
              <ExpandIcon fontSize="small" />
            </IconButton>
          </NotesHeader>
          
          <NotesTextArea
            expanded={false}
            placeholder="이번 세션에서 떠오른 아이디어, 배운 내용을 기록해보세요..."
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
