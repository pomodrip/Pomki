import React, { useState, useEffect } from 'react';
import { Box, styled, Select, MenuItem, FormControl, CircularProgress as MuiCircularProgress, Fab } from '@mui/material';
import { Text, IconButton, WheelTimeAdjuster } from '../../components/ui';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import CompressIcon from '@mui/icons-material/CloseFullscreen';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import theme from '../../theme/theme';

// 페이지 컨테이너 - design.md 가이드 적용
const PageContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '32px 24px', // Large Spacing
  minHeight: 'calc(100vh - 128px)', // 헤더/푸터 제외

  '@media (min-width: 600px)': {
    padding: '48px 32px',
  },
}));

// 페이지 제목 - theme 활용
const PageTitle = styled(Text)(({ theme }) => ({
  fontSize: '24px', // H2 크기
  fontWeight: 700, // Bold
  color: theme.palette.text.primary, // theme에서 가져온 텍스트 색상
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

const FocusTimeLabel = styled(Text)(({ theme }) => ({
  fontSize: '20px', // H3 크기
  fontWeight: 600, // Semibold
  color: theme.palette.text.primary, // theme에서 가져온 텍스트 색상
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

const SessionProgress = styled(Text)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: '8px',
}));

const ElapsedTime = styled(Text)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 500,
  color: theme.palette.primary.main, // theme에서 가져온 Primary 색상
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

const ProgressBarFill = styled(Box)<{ progress: number }>(({ progress, theme }) => ({
  width: `${progress}%`,
  height: '100%',
  backgroundColor: theme.palette.primary.main, // theme에서 가져온 Primary 색상
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
  position: 'relative',
  
  '@media (min-width: 600px)': {
    width: '320px',
    height: '320px',
  },
}));

// SVG 원형 프로그레스
const CircularProgress = styled('svg')(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '100%',
  height: '100%',
  transform: 'translate(-50%, -50%) rotate(-90deg)', // 중앙 정렬 후 12시 방향부터 시작
}));

const BackgroundCircle = styled('circle')(() => ({
  fill: 'none',
  stroke: '#E5E7EB',
  strokeWidth: '8px',
  '@media (min-width: 600px)': {
    strokeWidth: '12px',
  },
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

// 타이머 시간 표시 - theme 활용
const TimerDisplay = styled(Text)(({ theme }) => ({
  fontSize: '48px', // 큰 디스플레이 크기
  fontWeight: 700, // Bold
  color: theme.palette.text.primary, // theme에서 가져온 텍스트 색상
  lineHeight: 1,
  // fontFamily는 theme에서 자동으로 적용됨 (KoddiUD 폰트)
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

// 확장된 노트의 타이머 바
const ExpandedTimerBar = styled(Box)(({ theme }) => ({
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
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '12px 16px',
    gap: '12px',
  },
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

const NotesTextArea = styled('textarea')<{ 
  expanded: boolean; 
  animate?: boolean 
}>(({ expanded, animate }) => ({
  width: '100%',
  minHeight: expanded ? '60vh' : '120px',
  padding: '16px',
  border: `1px solid ${expanded ? '#E5E7EB' : '#E5E7EB'}`,
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: "'Pretendard', sans-serif",
  color: '#1A1A1A',
  backgroundColor: '#FFFFFF',
  resize: 'vertical',
  outline: 'none',
  transition: 'all 0.3s ease, box-shadow 0.6s ease',
  flex: expanded ? 1 : 'none',
  cursor: 'text',
  boxShadow: animate ? '0 0 0 4px rgba(37, 99, 235, 0.2), 0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
  transform: animate ? 'translateY(-2px)' : 'translateY(0)',
  
  '&:focus': {
    borderColor: '#2563EB',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
  },
  
  '&::placeholder': {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
}));

// 확장된 노트 기능들
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
  const [hasTimerStarted, setHasTimerStarted] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [notes, setNotes] = useState('');
  const [session, setSession] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [summaryStyle, setSummaryStyle] = useState('concept');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [noteImpact, setNoteImpact] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    sessions: 3,
    focusMinutes: 25,
    breakMinutes: 5,
  });
  
  // 임시 설정값 (모달에서 편집용)
  const [tempSettings, setTempSettings] = useState<TimerSettings>({
    sessions: 3,
    focusMinutes: 25,
    breakMinutes: 5,
  });

  const totalTime = settings.focusMinutes * 60;

  // 진행률 계산
  const currentTime = minutes * 60 + seconds;
  const progress = ((totalTime - currentTime) / totalTime) * 100;

  // 노트 임팩트 효과
  useEffect(() => {
    if (isRunning) {
      setNoteImpact(true);
      const timer = setTimeout(() => setNoteImpact(false), 600); // 0.6초 임팩트
      return () => clearTimeout(timer);
    }
  }, [isRunning]);

  // 타이머 로직
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
      // 세션 완료 로직
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
    if (!isRunning && !hasTimerStarted) {
      setHasTimerStarted(true);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasTimerStarted(false);
    setMinutes(settings.focusMinutes);
    setSeconds(0);
    setSession(1);
    setElapsedTime(0);
    setTaskName('');
    setNotes('');
  };

  const handleSettings = () => {
    if (isRunning) {
      handleReset();
    } else {
      // 설정 모달을 열 때 현재 설정값을 임시 설정값에 복사
      setTempSettings({ ...settings });
      setShowSettings(true);
    }
  };

  const handleApplySettings = () => {
    // 임시 설정값을 실제 설정값에 적용
    setSettings({ ...tempSettings });
    setMinutes(tempSettings.focusMinutes);
    setSeconds(0);
    setSession(1);
    setElapsedTime(0);
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    // 설정 취소 시 임시 설정값 초기화
    setTempSettings({ ...settings });
    setShowSettings(false);
  };

  const handlePreset = (preset: string) => {
    let newSettings: TimerSettings;
    switch (preset) {
      case 'deep':
        newSettings = { sessions: 3, focusMinutes: 50, breakMinutes: 10 };
        break;
      case 'pomodoro':
        newSettings = { sessions: 4, focusMinutes: 25, breakMinutes: 5 };
        break;
      case 'quick':
        newSettings = { sessions: 6, focusMinutes: 15, breakMinutes: 3 };
        break;
      default:
        return;
    }
    // 프리셋 적용 시 임시 설정값 업데이트
    setTempSettings(newSettings);
  };

  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, '0')} : ${sec.toString().padStart(2, '0')}`;
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // AI 노트 생성 핸들러 (임시 구현)
  const handleGenerateAI = async () => {
    if (!notes.trim()) {
              alert('먼저 노트에 내용을 작성해주세요.');
      return;
    }

    setIsGeneratingAI(true);
    
    // 임시 AI 생성 시뮬레이션
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

  // 임시 AI 컨텐츠 생성 함수
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

  // SVG 원의 중심과 반지름 계산 (반지름 기준)
  const radius = 130; // 280px 원의 반지름에서 stroke-width 고려하여 조정
  const circumference = 2 * Math.PI * radius;

  const settingsActions = (
    <Box sx={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
      <Button
        variant="outlined"
        onClick={handleCancelSettings}
        sx={{ 
          flex: 1,
          borderColor: '#E5E7EB',
          color: '#6B7280',
          '&:hover': {
            borderColor: '#D1D5DB',
            backgroundColor: '#F9FAFB',
          },
        }}
      >
        취소
      </Button>
      <Button
        variant="contained"
        onClick={handleApplySettings}
        sx={{ 
          flex: 1,
          backgroundColor: '#2563EB',
          '&:hover': {
            backgroundColor: '#1D4ED8',
          },
        }}
      >
        적용
      </Button>
    </Box>
  );

  // 확장된 노트 렌더링 함수
  const renderExpandedNotes = () => (
    <NotesSection expanded={true}>
      {/* 데스크톱 타이머 바 */}
      <ExpandedTimerBar sx={{ display: { xs: 'none', sm: 'flex' } }}>
        <ExpandedTimerInfo>
          <ExpandedTimerDisplay>
            {formatTime(minutes, seconds)}
          </ExpandedTimerDisplay>
          <ExpandedSessionInfo>
            세션 {session}/{settings.sessions}
          </ExpandedSessionInfo>
        </ExpandedTimerInfo>
        
        <ExpandedProgressBar>
          <ExpandedProgressFill progress={progress} />
        </ExpandedProgressBar>
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <Button
                variant="contained"
                size="small"
                onClick={handleStart}
                sx={{
                    backgroundColor: isRunning ? '#EF4444' : '#2563EB',
                    '&:hover': { backgroundColor: isRunning ? '#DC2626' : '#1D4ED8' },
                    minWidth: '120px',
                }}
            >
                {isRunning ? '일시정지' : '재시작'}
            </Button>

            <Button
                variant="outlined"
                size="small"
                onClick={handleReset}
                sx={{
                    marginLeft: '8px',
                    borderColor: '#E5E7EB',
                    color: '#6B7280',
                    minWidth: '60px',
                    '&:hover': {
                        borderColor: '#D1D5DB',
                        backgroundColor: '#F9FAFB',
                    },
                }}
            >
                리셋
            </Button>
        </Box>
      </ExpandedTimerBar>

      {/* 모바일 상단 타이머 바 */}
      <Box sx={{ 
        display: { xs: 'block', sm: 'none' },
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#FFFFFF',
        padding: '12px 16px',
      }}>
        {/* 시간, 버튼들, 세션 정보 */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          width: '100%',
        }}>
          {/* 시간 표시 */}
          <Box sx={{ flex: 1 }}>
            <Text sx={{ fontSize: '22px', fontWeight: 600, color: '#1A1A1A' }}>
              {formatTime(minutes, seconds)}
            </Text>
          </Box>
          
          {/* 가운데 버튼들 */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            flex: 1,
            justifyContent: 'center',
          }}>
            <IconButton
              onClick={handleReset}
              sx={{ 
                width: '28px', 
                height: '28px', 
                color: '#6B7280',
                backgroundColor: '#F3F4F6',
                '&:hover': { backgroundColor: '#E5E7EB' },
              }}
            >
              <RestartAltIcon sx={{ fontSize: '14px' }} />
            </IconButton>

            <IconButton
              onClick={handleStart}
              sx={{
                width: '28px', 
                height: '28px',
                backgroundColor: isRunning ? '#EF4444' : '#2563EB',
                color: '#FFFFFF',
                '&:hover': { 
                  backgroundColor: isRunning ? '#DC2626' : '#1D4ED8',
                },
              }}
            >
              {isRunning ? <PauseIcon sx={{ fontSize: '14px' }} /> : <PlayArrowIcon sx={{ fontSize: '14px' }} />}
            </IconButton>
          </Box>
          
          {/* 세션 정보 */}
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Text sx={{ fontSize: '14px', color: '#6B7280' }}>
              세션 {session}/{settings.sessions}
            </Text>
          </Box>
        </Box>
        
        {/* 얇은 프로그레스 바 */}
        <Box sx={{
          width: '100%',
          height: '4px',
          backgroundColor: '#F3F4F6',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <Box sx={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#2563EB',
            transition: 'width 0.3s ease',
            borderRadius: '2px',
          }} />
        </Box>
      </Box>

      {/* 노트 제목과 작업명 */}
      <NotesHeader>
        <Box>
          <NotesTitle sx={{ display: { xs: 'block', sm: 'block' } }}>
            📝 집중 노트
          </NotesTitle>
          {taskName && (
            <Text 
              sx={{ 
                fontSize: '16px', 
                color: '#6B7280', 
                marginTop: '4px',
                fontWeight: 500,
                display: { xs: 'none', sm: 'block' }, // 모바일에서는 작업명 숨김
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
          onClick={() => setNotesExpanded(false)}
        >
          <CompressIcon fontSize="small" />
        </IconButton>
      </NotesHeader>
      
      {/* 노트 텍스트 영역 */}
      <NotesTextArea
        expanded={true}
        animate={noteImpact}
        placeholder={
          "이번 세션에서 떠오른 아이디어, 배운 내용, 중요한 포인트를 기록해보세요..."
        }
        value={notes} 
        onChange={(e) => setNotes(e.target.value)}
        aria-label={"확장된 집중 노트 입력"}
        sx={{
          paddingBottom: { xs: '100px', sm: '0' }, // 모바일에서 하단 툴바 공간 확보
        }}
      />

      {/* 데스크톱 확장된 기능들 */}
      <ExpandedNotesFeatures sx={{ display: { xs: 'none', sm: 'flex' } }}>
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

      {/* 모바일 하단 툴바 */}
      <Box sx={{ 
        display: { xs: 'block', sm: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #E5E7EB',
        padding: '16px',
        zIndex: 10000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        {/* 요약 스타일 라벨 */}
        <Text sx={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          color: '#6B7280',
          marginBottom: '8px',
          display: 'block',
        }}>
          요약 스타일
        </Text>
        
        {/* 선택란과 AI 생성 버튼 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <FormControl size="small" variant="outlined" sx={{ flex: 1 }}>
            <Select
              value={summaryStyle}
              onChange={(e) => setSummaryStyle(e.target.value as string)}
              displayEmpty
              sx={{
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
          
          {/* AI 생성 버튼 */}
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
        </Box>
      </Box>
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

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80px', // 세션 정보 표시 영역의 최소 높이를 지정하여 레이아웃 밀림 방지
          marginBottom: '32px',
        }}
      >
        {isRunning ? (
          <>
            <SessionProgress>
              세션 {session}/{settings.sessions}
            </SessionProgress>
            <ElapsedTime>
              {formatElapsedTime(elapsedTime)}
            </ElapsedTime>
          </>
        ) : (
          <FocusTimeLabel>
            집중시간
          </FocusTimeLabel>
        )}
      </Box>

      <TimerCircle>
        <CircularProgress width="280" height="280" viewBox="0 0 280 280">
          {/* 배경 원 */}
          <BackgroundCircle cx="140" cy="140" r={radius} />
          {/* 진행률 원 */}
          <ProgressCircle
            cx="140"
            cy="140"
            r={radius}
            stroke="#2979FF" // theme의 primary.main 색상
            progress={progress}
            style={{
              strokeDasharray: `${circumference}, ${circumference}`,
              strokeDashoffset:
                circumference - (progress / 100) * circumference,
            }}
          />
        </CircularProgress>

        <TimerDisplay>{formatTime(minutes, seconds)}</TimerDisplay>
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

      {/* 타이머 시작 전 안내 문구 */}
      {!isRunning && (
        <Box
          sx={{
            margin: '32px 0 0 0',
            color: '#9CA3AF',
            fontSize: '16px',
            textAlign: 'center',
          }}
        >
          타이머를 시작하면 목표와 집중 노트를 입력할 수 있습니다.
        </Box>
      )}

      {/* 타이머가 실행 중일 때만 목표 입력란과 노트 영역 노출 */}
      {hasTimerStarted && (
        <>
          <TaskInputSection>
            <TaskInputLabel>이번 포모도로의 목표</TaskInputLabel>
            <Input
              fullWidth
              placeholder="이번 포모도로의 목표를 입력하세요"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              sx={{
                backgroundColor: '#FFFFFF',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#1A1A1A',
                },
              }}
            />
          </TaskInputSection>

          <NotesSection expanded={false}>
            <NotesHeader>
              <Box>
                <NotesTitle>📝 집중 노트</NotesTitle>
                {taskName && (
                  <Text
                    sx={{
                      fontSize: '14px',
                      color: '#6B7280',
                      marginTop: '4px',
                      fontWeight: 500,
                    }}
                  >
                    현재 목표: {taskName}
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
              animate={noteImpact}
              placeholder="이번 세션에서 떠오른 아이디어, 배운 내용을 기록해보세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-label="집중 노트 입력"
              sx={{
                backgroundColor: '#FFFFFF',
              }}
            />
          </NotesSection>
        </>
      )}

      {/* 설정 다이얼로그 */}
      <Modal
        open={showSettings}
        onClose={handleCancelSettings}
        title="타이머 설정"
        actions={settingsActions}
      >
        <SettingsContainer>
          <SettingsRow>
            <WheelTimeAdjuster
              value={tempSettings.sessions}
              onChange={(value) => setTempSettings(prev => ({ ...prev, sessions: value }))}
              label="세션"
              min={1}
              max={10}
              step={1}
            />
            <WheelTimeAdjuster
              value={tempSettings.focusMinutes}
              onChange={(value) => setTempSettings(prev => ({ ...prev, focusMinutes: value }))}
              label="집중 시간"
              min={5}
              max={120}
              step={5}
            />
            <WheelTimeAdjuster
              value={tempSettings.breakMinutes}
              onChange={(value) => setTempSettings(prev => ({ ...prev, breakMinutes: value }))}
              label="휴식 시간"
              min={1}
              max={60}
              step={1}
            />
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
