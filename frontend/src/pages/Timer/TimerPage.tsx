import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, styled, IconButton, Select, MenuItem, FormControl, CircularProgress as MuiCircularProgress } from '@mui/material';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import CompressIcon from '@mui/icons-material/CloseFullscreen';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal, { ModalProps } from '../../components/ui/Modal';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { showSnackbar } from '../../store/slices/snackbarSlice';
import {
  setSettings,
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  tick,
  finishFocusSession,
  finishBreakSession,
  TimerPhase,
} from '../../store/slices/timerSlice';

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

// 실행 중 상태 헤더
const RunningHeader = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '32px',
  width: '100%',
}));

const SessionProgress = styled(Typography)(() => ({
  fontSize: '18px',
  fontWeight: 600,
  color: '#1A1A1A',
  marginBottom: '8px',
}));

const ElapsedTime = styled(Typography)(() => ({
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
  border: '1px solid #E5E7EB', // 테두리 추가
  borderRadius: '12px', // 둥근 모서리
  padding: '24px', // 내부 여백
  backgroundColor: '#FFFFFF',
}));

const TaskInputLabel = styled(Typography)(() => ({
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

// 확대된 노트의 타이머 바
const ExpandedTimerBar = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
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

const ExpandedTimerDisplay = styled(Typography)(() => ({
  fontSize: '28px',
  fontWeight: 700,
  color: '#1A1A1A',
  fontFamily: "'Pretendard', monospace",
}));

const ExpandedTimerControls = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}));

const ExpandedSessionInfo = styled(Typography)(() => ({
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

// 노트 제목과 작업명
const NotesHeader = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
}));

const NotesTitle = styled(Typography)(() => ({
  fontSize: '22px', // H3 크기
  fontWeight: 600,
  color: '#1A1A1A',
}));

// 노트 텍스트 영역
const NotesTextArea = styled('textarea')<{ expanded?: boolean }>(({ expanded }: { expanded?: boolean }) => ({
  width: '100%',
  minHeight: expanded ? 'calc(100vh - 350px)' : '120px',
  padding: '16px',
  border: `1px solid ${expanded ? '#D1D5DB' : '#E5E7EB'}`,
  borderRadius: '8px',
  fontSize: '16px',
  fontFamily: "'Pretendard', sans-serif",
  color: '#1A1A1A',
  resize: 'none',
  transition: 'all 0.3s ease',
  '&:focus': {
    outline: 'none',
    borderColor: '#2563EB',
    boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
  },
  '&::placeholder': {
    color: '#9CA3AF',
  },
}));

// 확장된 노트의 기능 영역
const ExpandedNotesFeatures = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '24px',
  flexWrap: 'wrap',
  gap: '16px',
}));

const StudyModeSection = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}));

const StudyModeLabel = styled(Typography)(() => ({
  fontSize: '14px',
  fontWeight: 500,
  color: '#4B5563',
}));

// AI 생성 결과 표시
const AiResultSection = styled(Box)(() => ({
  marginTop: '24px',
  padding: '20px',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  backgroundColor: '#F9FAFB',
}));

const AiResultTitle = styled(Typography)(() => ({
  fontSize: '18px',
  fontWeight: 600,
  color: '#1A1A1A',
  marginBottom: '12px',
}));

const AiResultContent = styled(Typography)(() => ({
  fontSize: '16px',
  color: '#374151',
  whiteSpace: 'pre-wrap', // 줄바꿈 및 공백 유지
  lineHeight: 1.6,
}));

const TimerPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { phase, settings, currentSession, remainingSeconds } = useAppSelector(
    (state) => state.timer,
  );

  // 노트 관련 상태는 컴포넌트 로컬로 관리
  const [taskName, setTaskName] = useState('');
  const [notes, setNotes] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [summaryStyle, setSummaryStyle] = useState('summary');
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const notesTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const aiResultRef = useRef<HTMLDivElement>(null);

  // 타이머 로직 (Core Timer Logic)
  useEffect(() => {
    if (phase !== 'running' && phase !== 'break') {
      return;
    }

    if (remainingSeconds <= 0) {
      if (phase === 'running') {
        dispatch(finishFocusSession());
        dispatch(showSnackbar({ message: '집중 시간이 종료되었습니다. 잠시 휴식을 취하세요.' }));
      } else if (phase === 'break') {
        dispatch(finishBreakSession());
        dispatch(showSnackbar({ message: '휴식 시간이 종료되었습니다.' }));
      }
      return;
    }

    const interval = setInterval(() => {
      dispatch(tick());
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, remainingSeconds, dispatch]);

  // 노트 자동 확장 로직
  useEffect(() => {
    const element = notesTextAreaRef.current;
    if (!element || notesExpanded) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { scrollHeight, clientHeight } = entry.target;
        if (scrollHeight > clientHeight) {
          setNotesExpanded(true);
          observer.disconnect();
        }
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [notes, notesExpanded]);


  const handleStart = () => {
    if (phase === 'configuring') {
      dispatch(startTimer());
    } else if (phase === 'paused') {
      dispatch(resumeTimer());
    } else if (phase === 'running') {
      dispatch(pauseTimer());
    }
  };

  const handleReset = () => dispatch(resetTimer());

  const handleApplySettings = () => {
    dispatch(setSettings(tempSettings));
    setIsSettingsModalOpen(false);
  };
  
  // 시간 포맷팅
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // 진행률 계산
  const totalDuration = phase === 'running' || phase === 'paused'
    ? settings.focusMinutes * 60
    : settings.breakMinutes * 60;
  
  const progress = totalDuration > 0 ? ((totalDuration - remainingSeconds) / totalDuration) * 100 : 0;
  
  const radius = 130;
  const circumference = 2 * Math.PI * radius;

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    setAiResult('');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Mock API call
    const result = `AI 요약 결과 (${summaryStyle}):\n\n${notes}`;
    setAiResult(result);
    setIsGeneratingAI(false);
    dispatch(showSnackbar({ message: 'AI 요약이 생성되었습니다.' }));
    setTimeout(() => aiResultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSaveNote = () => {
    // TODO: 노트 저장 로직 (API 연동)
    dispatch(showSnackbar({ message: '노트가 저장되었습니다.' }));
    console.log({ taskName, notes });
  };


  const renderExpandedNotes = () => (
    <NotesSection expanded={true}>
      <ExpandedTimerBar>
        <ExpandedTimerInfo>
          <ExpandedTimerDisplay>
            {formatTime(remainingSeconds)}
          </ExpandedTimerDisplay>
          <ExpandedSessionInfo>
            {phase === 'running' ? '집중시간' : '휴식시간'} • 세션 {currentSession}/{settings.sessions}
          </ExpandedSessionInfo>
        </ExpandedTimerInfo>
        
        <ExpandedTimerControls>
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleStart} 
            sx={{ backgroundColor: phase === 'running' ? '#ed6c02' : undefined }} // warning color
          >
            {phase === 'running' ? '일시정지' : '계속'}
          </Button>
          <Button size="small" variant="outlined" onClick={handleReset}>
            리셋
          </Button>
          <IconButton
            size="small"
            sx={{ color: '#6B7280' }}
            onClick={() => setNotesExpanded(false)}
          >
            <CompressIcon fontSize="small" />
          </IconButton>
        </ExpandedTimerControls>
      </ExpandedTimerBar>

      <NotesHeader>
        <Box>
          <NotesTitle>📝 집중 노트</NotesTitle>
          {taskName && (
            <Typography sx={{ fontSize: '16px', color: '#6B7280', marginTop: '4px' }}>
              현재 작업: {taskName}
            </Typography>
          )}
        </Box>
        <Button size="small" variant="contained" onClick={handleSaveNote}>
          저장
        </Button>
      </NotesHeader>
      
      <NotesTextArea
        ref={notesTextAreaRef}
        expanded={true}
        placeholder="이번 세션에서 떠오른 아이디어, 배운 내용, 중요한 포인트를 기록해보세요..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <ExpandedNotesFeatures>
        <StudyModeSection>
          <StudyModeLabel>요약 스타일</StudyModeLabel>
          <FormControl size="small" variant="outlined">
            <Select
              value={summaryStyle}
              onChange={(e) => setSummaryStyle(e.target.value as string)}
              sx={{ minWidth: 150, backgroundColor: '#FFFFFF' }}
            >
              <MenuItem value="summary">핵심 요약</MenuItem>
              <MenuItem value="detailed">상세 서술</MenuItem>
              <MenuItem value="examples">주요 예시</MenuItem>
            </Select>
          </FormControl>
        </StudyModeSection>
        
        <Button
          variant="contained"
          size="small"
          onClick={handleGenerateAI}
          disabled={isGeneratingAI || !notes.trim()}
          sx={{ backgroundColor: '#10B981', '&:hover': { backgroundColor: '#059669' } }}
        >
          {isGeneratingAI ? <MuiCircularProgress size={20} color="inherit" /> : 'AI 생성'}
        </Button>
      </ExpandedNotesFeatures>

      {aiResult && (
        <AiResultSection ref={aiResultRef}>
          <AiResultTitle>✨ AI 요약 결과</AiResultTitle>
          <AiResultContent>{aiResult}</AiResultContent>
        </AiResultSection>
      )}
    </NotesSection>
  );

  if (notesExpanded) {
    return renderExpandedNotes();
  }

  const getPageTitle = () => {
    if (phase === 'running') return `집중 세션 ${currentSession}`;
    if (phase === 'break') return '휴식 시간';
    return '집중 타이머 설정';
  };
  
  const getButtonText = () => {
    if (phase === 'running') return '일시정지';
    if (phase === 'paused') return '계속하기';
    return '시작';
  }

  return (
    <PageContainer>
      <PageTitle>
        {getPageTitle()}
      </PageTitle>

      {(phase === 'running' || phase === 'paused' || phase === 'break') && (
        <RunningHeader>
          <SessionProgress>
            세션 {currentSession}/{settings.sessions}
          </SessionProgress>
          <ProgressBarContainer>
            <ProgressBarFill progress={progress} />
          </ProgressBarContainer>
        </RunningHeader>
      )}
      
      <TimerCircle>
        <CircularProgress width="280" height="280" style={{ position: 'absolute' }}>
            <circle cx="140" cy="140" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="12" />
            {(phase === 'running' || phase === 'break' || phase === 'paused') && (
               <ProgressCircle
                cx="140" cy="140" r={radius} stroke="#2563EB" progress={0} /* dummy progress */
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: circumference - (progress / 100) * circumference,
                  transition: 'stroke-dashoffset 0.5s linear',
                }}
                strokeWidth="12"
              />
            )}
        </CircularProgress>
        
        <TimerDisplay>
          {formatTime(remainingSeconds)}
        </TimerDisplay>
      </TimerCircle>

      <ButtonContainer>
        <Button
          variant="contained"
          size="large"
          onClick={handleStart}
          sx={{
            minWidth: '120px',
            backgroundColor: phase === 'running' ? '#EF4444' : '#2563EB',
            '&:hover': {
              backgroundColor: phase === 'running' ? '#DC2626' : '#1D4ED8',
            },
          }}
        >
          {getButtonText()}
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={phase === 'configuring' ? () => setIsSettingsModalOpen(true) : handleReset}
          sx={{ minWidth: '120px' }}
        >
          {phase === 'configuring' ? '설정' : '리셋'}
        </Button>
      </ButtonContainer>

      {phase === 'configuring' && (
        <>
          <TaskInputSection>
            <TaskInputLabel>
              이번 세션에 집중할 일은 무엇인가요? (선택)
            </TaskInputLabel>
            <Input
              fullWidth
              placeholder="예: Pomki 기능 개발"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#E5E7EB' } }}
            />
          </TaskInputSection>

          <NotesSection expanded={false}>
            <NotesHeader>
              <NotesTitle>📝 집중 노트</NotesTitle>
              <IconButton onClick={() => setNotesExpanded(true)}>
                <ExpandIcon />
              </IconButton>
            </NotesHeader>
            <NotesTextArea
              ref={notesTextAreaRef}
              placeholder="이번 세션에서 떠오른 아이디어, 배운 내용, 중요한 포인트를 기록해보세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </NotesSection>
        </>
      )}
      
      <Modal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="타이머 설정"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
          
          <FormControl fullWidth>
            <Typography gutterBottom sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>세션 수</Typography>
            <Input
              type="number"
              value={tempSettings.sessions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempSettings({ ...tempSettings, sessions: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#E5E7EB' } }}
            />
          </FormControl>

          <FormControl fullWidth>
            <Typography gutterBottom sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>집중 시간 (분)</Typography>
            <Input
              type="number"
              value={tempSettings.focusMinutes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempSettings({ ...tempSettings, focusMinutes: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#E5E7EB' } }}
            />
          </FormControl>

          <FormControl fullWidth>
            <Typography gutterBottom sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>휴식 시간 (분)</Typography>
            <Input
              type="number"
              value={tempSettings.breakMinutes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempSettings({ ...tempSettings, breakMinutes: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#E5E7EB' } }}
            />
          </FormControl>

          <Button variant="contained" onClick={handleApplySettings} sx={{ marginTop: '16px' }}>
            설정 적용
          </Button>
        </Box>
      </Modal>
    </PageContainer>
  );
};

export default TimerPage;
