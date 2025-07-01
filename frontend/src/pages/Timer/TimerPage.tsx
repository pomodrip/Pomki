import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  styled,
  Box,
  Button,
  Select,
  MenuItem,
  CircularProgress as MuiCircularProgress,
  FormControl,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Text, IconButton, WheelTimeAdjuster } from '../../components/ui';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import CompressIcon from '@mui/icons-material/CloseFullscreen';
// import PauseIcon from '@mui/icons-material/Pause';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// import RestartAltIcon from '@mui/icons-material/RestartAlt';
// import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { useTimer } from '../../hooks/useTimer';
// import theme from '../../theme/theme';

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

const ProgressCircle = styled('circle')(() => ({
  fill: 'none',
  strokeWidth: '8',
  strokeLinecap: 'round',
  transition: 'stroke-dashoffset 0.3s ease',
}));

// 타이머 원형 컨테이너  
const TimerCircle = styled(Box)(() => ({
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
const CircularProgress = styled('svg')(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '100%',
  height: '100%',
  transform: 'translate(-50%, -50%) rotate(-90deg)', // 중앙 정렬 후 12시 방향부터 시작
}));

// const BackgroundCircle = styled('circle')(() => ({
//   fill: 'none',
//   stroke: '#E5E7EB',
//   strokeWidth: '8px',
//   '@media (min-width: 600px)': {
//     strokeWidth: '12px',
//   },
// }));

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
  flexWrap: 'wrap',
  justifyContent: 'center',
  
  '@media (max-width: 480px)': {
    flexDirection: 'column',
    width: '100%',
    maxWidth: '280px',
  },
}));

// 작업 입력 섹션
// const TaskInputSection = styled(Box)(() => ({
//   width: '100%',
//   maxWidth: '400px',
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
// }));

// 노트 섹션
const NotesSection = styled(Box)<{ expanded: boolean }>(({ expanded, theme }) => ({
  width: '100%',
  maxWidth: expanded ? 'none' : '400px',
  marginTop: '32px',
  transition: 'all 0.3s ease',
  padding: expanded ? 0 : '0 8px',
  [theme.breakpoints.up('sm')]: {
    padding: 0,
  },
  ...(expanded && {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 9999,
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  }),
}));

// 확장된 노트의 타이머 바
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

const QuillEditor = styled(ReactQuill)<{ 
  expanded: boolean; 
  disabled?: boolean; 
  animate?: boolean 
}>(({ expanded, disabled, animate }) => ({
  width: '100%',
  flex: expanded ? 1 : 'none',
  transition: 'all 0.3s ease, box-shadow 0.6s ease',
  transform: animate ? 'translateY(-2px)' : 'translateY(0)',
  
  '& .ql-container': {
    minHeight: expanded ? '60vh' : '120px',
    border: `1px solid ${disabled ? '#E5E7EB' : '#E5E7EB'}`,
    borderRadius: '0 0 8px 8px',
    fontFamily: "'Pretendard', sans-serif",
    fontSize: '14px',
    color: disabled ? '#9CA3AF' : '#1A1A1A',
    backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: animate ? '0 0 0 4px rgba(37, 99, 235, 0.2), 0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
  },
  
  '& .ql-toolbar': {
    border: `1px solid ${disabled ? '#E5E7EB' : '#E5E7EB'}`,
    borderRadius: '8px 8px 0 0',
    backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
    borderBottom: 'none',
  },
  
  '& .ql-editor': {
    padding: '16px',
    minHeight: expanded ? 'calc(60vh - 42px)' : '88px',
    
    '&.ql-blank::before': {
      color: disabled ? '#D1D5DB' : '#9CA3AF',
      fontStyle: disabled ? 'italic' : 'normal',
    },
  },
  
  '& .ql-toolbar .ql-formats': {
    marginRight: '8px',
  },
  
  '& .ql-toolbar .ql-picker-label': {
    color: disabled ? '#9CA3AF' : '#374151',
  },
  
  '& .ql-toolbar .ql-stroke': {
    stroke: disabled ? '#9CA3AF' : '#374151',
  },
  
  '& .ql-toolbar .ql-fill': {
    fill: disabled ? '#9CA3AF' : '#374151',
  },
  
  '& .ql-toolbar button:hover': {
    color: disabled ? '#9CA3AF' : '#2563EB',
  },
  
  '& .ql-toolbar button:hover .ql-stroke': {
    stroke: disabled ? '#9CA3AF' : '#2563EB',
  },
  
  '& .ql-toolbar button:hover .ql-fill': {
    fill: disabled ? '#9CA3AF' : '#2563EB',
  },
  
  '& .ql-toolbar button.ql-active': {
    color: '#2563EB',
  },
  
  '& .ql-toolbar button.ql-active .ql-stroke': {
    stroke: '#2563EB',
  },
  
  '& .ql-toolbar button.ql-active .ql-fill': {
    fill: '#2563EB',
  },
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

// 자동 저장 설정 섹션
const AutoSaveSection = styled(Box)(() => ({
  marginBottom: '16px',
  padding: '12px 16px',
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
}));

const AutoSaveTitle = styled(Text)(() => ({
  fontSize: '14px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '8px',
}));

const ToggleContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ToggleLabel = styled(Text)(() => ({
  fontSize: '14px',
  color: '#374151',
  fontWeight: 500,
}));

// 통합된 작업 입력
const TaskInput = styled('input')<{ disabled?: boolean }>(({ disabled }) => ({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: "'Pretendard', sans-serif",
  color: disabled ? '#9CA3AF' : '#1F2937',
  backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
  outline: 'none',
  transition: 'all 0.2s ease',
  cursor: disabled ? 'not-allowed' : 'text',
  
  '&:focus': {
    borderColor: disabled ? '#E5E7EB' : '#2563EB',
    boxShadow: disabled ? 'none' : '0 0 0 3px rgba(37, 99, 235, 0.1)',
  },
  
  '&::placeholder': {
    color: '#9CA3AF',
    fontSize: '14px',
  },
}));

// 설정 다이얼로그 스타일
const SettingsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  minWidth: '300px',
  
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    width: '100%',
  },
}));

const SettingsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  
  [theme.breakpoints.down('sm')]: {
    gap: '4px', // 모바일에서 간격 더 줄임
    justifyContent: 'space-around', // 균등 분배
  },
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
  targetSessions?: number;
}

// React-Quill 에디터 설정
const editorModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const editorFormats = [
  'header', 'bold', 'italic', 'underline',
  'list', 'bullet', 'link'
];

const TimerPage: React.FC = () => {
  const {
    isRunning,
    currentTime,
    sessionProgress,
    start,
    pause,
    reset,
    settings,
    updateTimerSettings,
    progress,
  } = useTimer();

  const { minutes, seconds } = currentTime;
  const [taskName, setTaskName] = useState('');
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [summaryStyle, setSummaryStyle] = useState('concept');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [noteImpact, setNoteImpact] = useState(false);
  const [hasTimerStarted, setHasTimerStarted] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false);
  
  // 로컬 설정 (모달에서 편집용)
  const [localSettings, setLocalSettings] = useState<TimerSettings>({
    sessions: (settings as any).targetSessions ?? 2,
    focusMinutes: settings.focusTime,
    breakMinutes: settings.shortBreakTime,
  });
  
  // 임시 설정값 (모달에서 편집용)
  const [tempSettings, setTempSettings] = useState<TimerSettings>({
    sessions: (settings as any).targetSessions ?? 2,
    focusMinutes: settings.focusTime,
    breakMinutes: settings.shortBreakTime,
  });

  // 자동저장을 위한 디바운싱 ref
  const autoSaveTimeoutRef = useRef<number | null>(null);

  // 저장 로직 함수
  const saveNotesLogic = useCallback(async () => {
    if (!notes.trim() && !taskName.trim()) {
      return;
    }

    try {
      const saveData = {
        taskName,
        notes,
        sessionId: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        autoSaveEnabled,
        hasAIGenerated: hasGeneratedAI,
      };

      console.log('저장될 데이터:', saveData);
      // TODO: API 연동 - 노트 저장
    } catch (error) {
      console.error('노트 저장 실패:', error);
    }
  }, [notes, taskName, autoSaveEnabled, hasGeneratedAI]);

  // 디바운싱된 자동저장 함수
  const debouncedAutoSave = useCallback((content: string) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (autoSaveEnabled && content.trim()) {
        saveNotesLogic();
      }
    }, 1000) as unknown as number;
  }, [autoSaveEnabled, saveNotesLogic]);

  // 에디터 내용 변경 핸들러 (useCallback 적용)
  const handleEditorChange = useCallback((content: string) => {
    setNotes(content);
    
    // 자동저장이 활성화된 경우 디바운싱된 저장 실행
    if (autoSaveEnabled && content.trim()) {
      debouncedAutoSave(content);
    }
  }, [autoSaveEnabled, debouncedAutoSave]);

  // 컴포넌트 언마운트 시 timeout 정리
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // 총 시간 계산
  const totalTime = settings.focusTime * 60;

  // 노트 임팩트 효과
  useEffect(() => {
    if (isRunning) {
      setNoteImpact(true);
      const timer = setTimeout(() => setNoteImpact(false), 600); // 0.6초 임팩트
      return () => clearTimeout(timer);
    }
  }, [isRunning]);

  // 경과시간 계산
  useEffect(() => {
    if (isRunning) {
      setElapsedTime((totalTime - (minutes * 60 + seconds)));
    }
  }, [isRunning, minutes, seconds, totalTime]);

  // 타이머 시작 추적
  useEffect(() => {
    if (isRunning) {
      setHasTimerStarted(true);
    }
  }, [isRunning]);

  // 설정값 변경 감지
  useEffect(() => {
    const newLocalSettings = {
      sessions: (settings as any).targetSessions ?? 2,
      focusMinutes: settings.focusTime,
      breakMinutes: settings.shortBreakTime,
    };
    setLocalSettings(newLocalSettings);
    setTempSettings(newLocalSettings);
  }, [settings]);

  // 자동 저장 비활성화 시 AI 생성 상태 리셋
  useEffect(() => {
    if (!autoSaveEnabled) {
      setHasGeneratedAI(false);
    }
  }, [autoSaveEnabled]);

  const handleStart = () => {
    if (isRunning) {
      pause();
    } else {
      start();
      if (!hasTimerStarted) {
        setHasTimerStarted(true);
      }
    }
  };

  const handleReset = () => {
    reset();
    setHasTimerStarted(false);
    setElapsedTime(0);
  };

  const handleSettings = () => {
    if (isRunning) {
      handleReset();
    } else {
      // 설정 모달을 열 때 현재 설정값을 임시 설정값에 복사
      setTempSettings({ ...localSettings });
      setShowSettings(true);
    }
  };

  const handleApplySettings = () => {
    // 임시 설정값을 실제 설정값에 적용
    setLocalSettings({ ...tempSettings });
    updateTimerSettings({
      focusTime: tempSettings.focusMinutes,
      shortBreakTime: tempSettings.breakMinutes,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      targetSessions: tempSettings.sessions,
    } as any);
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    // 설정 취소 시 임시 설정값 초기화
    setTempSettings({ ...localSettings });
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
      setHasGeneratedAI(true);
      alert('AI 노트가 성공적으로 생성되었습니다!');
    }, 2000);
  };

  // 노트 수동 저장 핸들러
  const handleSaveNotes = async () => {
    if (!notes.trim() && !taskName.trim()) {
      alert('저장할 내용이 없습니다.');
      return;
    }

    try {
      await saveNotesLogic();
      alert('노트가 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('노트 저장 실패:', error);
      alert('노트 저장에 실패했습니다.');
    }
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

  // 버튼 활성화 조건
  const canGenerateAI = notes.trim() && !isGeneratingAI;
  const canSave = (notes.trim() || taskName.trim());

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
      <Box sx={{
        padding: { xs: '16px', sm: '48px' },
        paddingTop: { xs: '16px', sm: '32px' },
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
      {/* 모바일 상단 타이머 바 */}
      <Box sx={{ 
        display: { xs: 'block', sm: 'none' },  // 모바일에서만 표시
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#FFFFFF',
        padding: '12px 16px',
        marginBottom: '16px',
      }}>
        {/* 상단 행: 타이머, 버튼들, 세션 정보, 닫기 버튼 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <Text sx={{ 
            fontSize: '20px', 
            fontWeight: 700, 
            color: '#1A1A1A',
            fontFamily: "'Pretendard', monospace",
            minWidth: '70px',
          }}>
            {formatTime(minutes, seconds)}
          </Text>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconButton 
              size="small" 
              sx={{ 
                color: '#FFFFFF',
                backgroundColor: '#EF4444',
                '&:hover': {
                  backgroundColor: '#DC2626',
                },
                width: '32px',
                height: '32px',
              }}
              onClick={isRunning ? pause : handleStart}
            >
              {isRunning ? (
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}>
                  <Box sx={{ 
                    width: '3px', 
                    height: '12px', 
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.5px',
                  }} />
                  <Box sx={{ 
                    width: '3px', 
                    height: '12px', 
                    backgroundColor: '#FFFFFF',
                    borderRadius: '0.5px',
                  }} />
                </Box>
              ) : (
                <Box sx={{ 
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid #FFFFFF',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  marginLeft: '1px',
                }} />
              )}
            </IconButton>
            
            <IconButton 
              size="small" 
              sx={{ 
                color: '#6B7280',
                backgroundColor: '#F3F4F6',
                '&:hover': {
                  backgroundColor: '#E5E7EB',
                },
                width: '32px',
                height: '32px',
              }}
              onClick={handleReset}
            >
              <Box sx={{ 
                width: '12px', 
                height: '12px', 
                border: '2px solid currentColor',
                borderRadius: '50%',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-1px',
                  right: '1px',
                  width: 0,
                  height: 0,
                  borderLeft: '3px solid transparent',
                  borderRight: '3px solid transparent',
                  borderBottom: '4px solid currentColor',
                },
              }} />
            </IconButton>
          </Box>
          
          <Text sx={{ 
            fontSize: '14px', 
            fontWeight: 500, 
            color: '#6B7280',
            textAlign: 'center',
            minWidth: '60px',
          }}>
            세션 {sessionProgress.current + 1}/{sessionProgress.target}
          </Text>
        </Box>
        
        {/* 프로그레스 바 */}
        <Box sx={{ 
          width: '100%',
          height: '6px',
          backgroundColor: '#F3F4F6',
          borderRadius: '3px',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
        }}>
          <Box sx={{ 
            width: `${isRunning ? progress : 0}%`,
            height: '100%',
            backgroundColor: '#2563EB',
            transition: 'width 0.3s ease',
            borderRadius: '3px',
          }} />
        </Box>
      </Box>

      {/* 데스크톱 타이머 바 */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <ExpandedTimerBar>
          <ExpandedTimerInfo>
            <ExpandedTimerDisplay>
              {formatTime(minutes, seconds)}
            </ExpandedTimerDisplay>
            {isRunning ? (
              <ExpandedSessionInfo>
                세션 {sessionProgress.current + 1}/{sessionProgress.target}
              </ExpandedSessionInfo>
            ) : (
              <ExpandedSessionInfo>
                세션 {sessionProgress.current + 1}/{sessionProgress.target} • 준비됨
              </ExpandedSessionInfo>
            )}
          </ExpandedTimerInfo>
          
          <ExpandedProgressBar>
            <ExpandedProgressFill progress={isRunning ? progress : 0} />
          </ExpandedProgressBar>
        </ExpandedTimerBar>
      </Box>

      {/* 노트 제목과 자동저장 토글 */}
      <NotesHeader>
        <Box>
          <NotesTitle>
            📝 집중 노트
          </NotesTitle>
        </Box>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center', 
          gap: '16px' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text sx={{ fontSize: '12px', color: autoSaveEnabled ? '#10B981' : '#9CA3AF' }}>
              자동저장
            </Text>
            <Switch
              checked={autoSaveEnabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoSaveEnabled(e.target.checked)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#10B981',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#10B981',
                },
              }}
            />
          </Box>
          <IconButton 
            size="small" 
            sx={{ 
              color: '#6B7280',
              backgroundColor: '#F3F4F6',
              '&:hover': {
                backgroundColor: '#E5E7EB',
              },
              width: '28px',
              height: '28px',
            }}
            onClick={() => setNotesExpanded(false)}
          >
            <CompressIcon fontSize="small" />
          </IconButton>
        </Box>
      </NotesHeader>

      {/* 통합된 작업 입력 영역 */}
      <TaskInput
        type="text"
        value={taskName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskName(e.target.value)}
        disabled={!isRunning}
        placeholder={
          isRunning
            ? "이번 세션에서 떠오른 아이디어, 배운 내용, 중요한 포인트를 기록해보세요..."
            : "타이머를 시작하면 입력할 수 있습니다"
        }
        aria-label={isRunning ? "현재 집중 중인 작업" : "이번 세션 집중 작업"}
        style={{ marginBottom: '12px' }}
      />
      
      {/* 노트 에디터 영역 */}
      <QuillEditor
        theme="snow"
        modules={editorModules}
        formats={editorFormats}
        expanded={true}
        disabled={!isRunning}
        animate={noteImpact}
        placeholder={
          isRunning
            ? "이번 세션에서 떠오른 아이디어, 배운 내용, 중요한 포인트를 기록해보세요..."
            : "타이머를 시작하면 입력할 수 있습니다"
        }
        value={notes}
        onChange={handleEditorChange}
        readOnly={!isRunning}
        sx={{
          marginBottom: { xs: '120px', sm: '16px' }, // 모바일에서 하단 툴바 공간 확보
        }}
      />

      {/* 데스크톱 확장된 기능들 */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Box sx={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            flex: 1,
          }}>
            <FormControl size="small" variant="outlined">
              <Select
                value={summaryStyle}
                onChange={(e) => setSummaryStyle(e.target.value as string)}
                displayEmpty
                sx={{
                  minWidth: '150px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2563EB',
                  },
                  '& .MuiSelect-select': {
                    padding: '10px 14px',
                    fontSize: '14px',
                    fontWeight: 500,
                  },
                }}
              >
                <MenuItem value="concept">개념 정리</MenuItem>
                <MenuItem value="detail">상세 분석</MenuItem>
                <MenuItem value="summary">핵심 요약</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              size="medium"
              onClick={handleGenerateAI}
              disabled={!canGenerateAI}
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
                minWidth: '120px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              {isGeneratingAI ? (
                <>
                  <MuiCircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                  생성 중
                </>
              ) : (
                'AI 노트 생성'
              )}
            </Button>
          </Box>
          
          <Button
            variant="outlined"
            size="medium"
            onClick={handleSaveNotes}
            disabled={!canSave}
            sx={{
              borderColor: '#2563EB',
              color: '#2563EB',
              '&:hover': {
                borderColor: '#1D4ED8',
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
              },
              '&:disabled': {
                borderColor: '#D1D5DB',
                color: '#9CA3AF',
              },
              fontWeight: 600,
              textTransform: 'none',
              minWidth: '70px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            저장
          </Button>
        </Box>
      </Box>

      {/* 모바일 하단 툴바 */}
      <Box sx={{ 
        display: { xs: 'block', sm: 'none' },  // 모바일에서만 표시
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '16px 16px 20px 16px',
        zIndex: 10000,
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          justifyContent: 'space-between',
        }}>
          <FormControl size="small" variant="outlined" sx={{ 
            minWidth: '120px',
            flex: 1,
            maxWidth: '160px',
          }}>
            <Select
              value={summaryStyle}
              onChange={(e) => setSummaryStyle(e.target.value as string)}
              displayEmpty
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E5E7EB',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#D1D5DB',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2563EB',
                },
                '& .MuiSelect-select': {
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontWeight: 500,
                },
              }}
            >
              <MenuItem value="concept">개념 정리</MenuItem>
              <MenuItem value="detail">상세 분석</MenuItem>
              <MenuItem value="summary">핵심 요약</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            size="medium"
            onClick={handleGenerateAI}
            disabled={!canGenerateAI}
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
              fontSize: '14px',
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {isGeneratingAI ? (
              <>
                <MuiCircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                생성 중
              </>
            ) : (
              'AI 노트 생성'
            )}
          </Button>
          
          <Button
            variant="outlined"
            size="medium"
            onClick={handleSaveNotes}
            disabled={!canSave}
            sx={{
              borderColor: '#2563EB',
              color: '#2563EB',
              '&:hover': {
                borderColor: '#1D4ED8',
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
              },
              '&:disabled': {
                borderColor: '#D1D5DB',
                color: '#9CA3AF',
              },
              fontWeight: 600,
              textTransform: 'none',
              minWidth: '60px',
              fontSize: '14px',
              padding: '10px 16px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            저장
          </Button>
        </Box>
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

      {isRunning ? (
        <RunningHeader>
          <SessionProgress>
            세션 {sessionProgress.current + 1}/{sessionProgress.target}
          </SessionProgress>
          <ElapsedTime>
            {formatElapsedTime(elapsedTime)}
          </ElapsedTime>
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

      {/* 타이머 시작 전 안내 문구 */}
      {!isRunning && !hasTimerStarted && (
        <Box
          sx={{
            margin: '32px 0 0 0',
            color: '#9CA3AF',
            fontSize: '16px',
            textAlign: 'center',
            maxWidth: { xs: '300px', sm: 'none' },
            whiteSpace: { xs: 'normal', sm: 'nowrap' },
          }}
        >
          타이머를 시작하면 목표와 집중 노트를 입력할 수 있습니다.
        </Box>
      )}

      {/* 타이머가 실행 중이거나 시작된 적이 있을 때만 노트 영역 노출 */}
      {(isRunning || hasTimerStarted) && (
        <NotesSection expanded={false}>
          <NotesHeader>
            <Box>
              <NotesTitle>
                📝 집중 노트
              </NotesTitle>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text sx={{ fontSize: '12px', color: autoSaveEnabled ? '#10B981' : '#9CA3AF' }}>
                자동저장
              </Text>
              <Switch
                checked={autoSaveEnabled}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoSaveEnabled(e.target.checked)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#10B981',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#10B981',
                  },
                }}
              />
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
            </Box>
          </NotesHeader>

          {/* 통합된 작업 입력 영역 */}
          <TaskInput
            type="text"
            value={taskName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskName(e.target.value)}
            disabled={!isRunning}
            placeholder={
              isRunning
                ? "🍅포모도로 타임! 집중할 목표를 수정하세요"
                : "타이머를 시작하면 입력할 수 있습니다"
            }
            aria-label={isRunning ? "현재 집중 중인 작업" : "이번 세션 집중 작업"}
            style={{ marginBottom: '12px' }}
          />
          
          {/* 노트 에디터 영역 */}
          <QuillEditor
            theme="snow"
            modules={editorModules}
            formats={editorFormats}
            expanded={false}
            disabled={!isRunning}
            animate={noteImpact}
            placeholder={
              isRunning
                ? "이번 세션에서 떠오른 아이디어, 배운 내용을 기록해보세요..."
                : "타이머를 시작하면 입력할 수 있습니다"
            }
            value={notes}
            onChange={handleEditorChange}
            readOnly={!isRunning}
          />
          
          {/* 하단 버튼 섹션 */}
          <Box sx={{ 
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: '8px', sm: '12px' },
            minHeight: '40px',
            padding: { xs: '8px 4px', sm: '16px' },
            backgroundColor: { xs: 'transparent', sm: '#F9FAFB' },
            borderRadius: { xs: '0', sm: '8px' },
            border: { xs: 'none', sm: '1px solid #E5E7EB' },
          }}>
            <FormControl size="small" variant="outlined" sx={{ 
              minWidth: { xs: '80px', sm: '120px' },
              flex: 1,
              maxWidth: { xs: '100px', sm: '160px' },
            }}>
              <Select
                value={summaryStyle}
                onChange={(e) => setSummaryStyle(e.target.value as string)}
                displayEmpty
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: { xs: '6px', sm: '8px' },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E5E7EB',
                    display: { xs: 'block', sm: 'block' },
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: { xs: '#D1D5DB', sm: '#D1D5DB' },
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2563EB',
                  },
                  '& .MuiSelect-select': {
                    padding: { xs: '8px 10px', sm: '10px 14px' },
                    fontSize: { xs: '12px', sm: '14px' },
                    fontWeight: 500,
                  },
                }}
              >
                <MenuItem value="concept">개념 정리</MenuItem>
                <MenuItem value="detail">상세 분석</MenuItem>
                <MenuItem value="summary">핵심 요약</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              size="medium"
              onClick={handleGenerateAI}
              disabled={!canGenerateAI}
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
                minWidth: { xs: '70px', sm: '100px' },
                fontSize: { xs: '12px', sm: '14px' },
                padding: { xs: '8px 12px', sm: '10px 20px' },
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              {isGeneratingAI ? (
                <>
                  <MuiCircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>생성 중</Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>생성</Box>
                </>
              ) : (
                <>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>AI 노트 생성</Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>AI생성</Box>
                </>
              )}
            </Button>
            
            <Button
              variant="outlined"
              size="medium"
              onClick={handleSaveNotes}
              disabled={!canSave}
              sx={{
                borderColor: '#2563EB',
                color: '#2563EB',
                '&:hover': {
                  borderColor: '#1D4ED8',
                  backgroundColor: 'rgba(37, 99, 235, 0.05)',
                },
                '&:disabled': {
                  borderColor: '#D1D5DB',
                  color: '#9CA3AF',
                },
                fontWeight: 600,
                textTransform: 'none',
                minWidth: { xs: '50px', sm: '60px' },
                fontSize: { xs: '12px', sm: '14px' },
                padding: { xs: '8px 12px', sm: '10px 16px' },
                borderRadius: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              저장
            </Button>
          </Box>
        </NotesSection>
      )}

      {/* 설정 다이얼로그 */}
      <Modal
        open={showSettings}
        onClose={handleCancelSettings}
        title=""
        actions={settingsActions}
      >
        {/* 커스텀 제목 헤더 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'baseline', 
          gap: '8px', 
          marginBottom: '16px'
        }}>
          <Text sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
            타이머 설정
          </Text>
          <Text sx={{ 
            fontSize: '0.75rem', 
            fontWeight: 400, 
            color: '#6B7280'
          }}>
            (휠 또는 터치로 조정 가능)
          </Text>
        </Box>
        
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
