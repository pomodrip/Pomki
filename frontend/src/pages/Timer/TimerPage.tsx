import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Select,
  MenuItem,
  CircularProgress as MuiCircularProgress,
  FormControl,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Text, IconButton, WheelTimeAdjuster, Button, Container } from '../../components/ui';
import Modal from '../../components/ui/Modal';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import CompressIcon from '@mui/icons-material/CloseFullscreen';
import 'react-quill/dist/quill.snow.css';
import { styled } from '@mui/material/styles';

// Timer 전용 컴포넌트들 import
import {
  TimerCircle,
  QuillEditor,
  NotesSection,
  NotesHeader,
  NotesTitle,
  TaskInput,
  SettingsContainer,
  SettingsRow,
  PresetsSection,
  PresetsTitle,
  PresetButton,
  PageContainer,
  FocusTimeSection,
  RunningHeader,
  ButtonContainer,
  PageTitle,
  FocusTimeLabel,
  SessionProgress,
  ElapsedTime,
  TimerDisplay,
} from '../../components/timer';

import { useTimer } from '../../hooks/useTimer';
import { createNote, enhanceNoteWithAI, AIEnhanceResponse } from '../../api/noteApi';
import { recordStudyTime } from '../../api/statsApi';
import { updateTodayStudyMinutes } from '../../store/slices/dashboardSlice';
import { AIEnhanceDialog } from '../../components/common/AIEnhanceDialog';
import LazyAIEnhanceDialog from '../../components/common/LazyAIEnhanceDialog';
import { 
  saveTempNote, 
  getTempNote, 
  clearTempNote, 
  TempNoteData,
  getTempSaveStatus
} from '../../utils/storage';
import theme from '../../theme/theme';
import Toast from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useRedux';
import { showToast } from '../../store/slices/toastSlice';

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

interface TimerSettings {
  sessions: number;
  focusMinutes: number;
  breakMinutes: number;
  targetSessions?: number;
}

const editorModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['image'],
  ],
};

const editorFormats = [
  'header', 'bold', 'italic', 'underline',
  'list', 'bullet', 'link', 'image'
];

const TimerPage: React.FC = () => {
  const {
    status,
    mode,
    isRunning,
    currentTime,
    progress,
    sessionProgress,
    settings,
    isCompleted,
    start,
    pause,
    reset,
    updateTimerSettings,
  } = useTimer();

  const { minutes, seconds } = currentTime;
  const [taskName, setTaskName] = useState('');
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  const [summaryStyle, setSummaryStyle] = useState('concept');
  const [noteImpact, setNoteImpact] = useState(false);
  const [hasTimerStarted, setHasTimerStarted] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [hasGeneratedAI, setHasGeneratedAI] = useState(false);
  const [lastContentLength, setLastContentLength] = useState(0);
  
  // AI 다이얼로그 상태
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIEnhanceResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // 임시 저장 관련 상태
  const [tempSaveStatus, setTempSaveStatus] = useState<{
    hasTempData: boolean;
    lastSaved: string | null;
    timeSinceLastSave: number | null;
  }>({ hasTempData: false, lastSaved: null, timeSinceLastSave: null });
  
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
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
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // 페이지 로드 시 임시 저장된 노트 불러오기
  useEffect(() => {
    try {
      const tempNote = getTempNote();
      const restoreDialogHandled = sessionStorage.getItem('pomki_restore_dialog_handled');
      
      if (tempNote && !restoreDialogHandled) {
        console.log('🔄 이전 세션 데이터 발견:', tempNote);
        setShowRestoreDialog(true);
      } else if (restoreDialogHandled) {
        console.log('📝 이번 세션에서 이미 복원 다이얼로그를 처리했으므로 생략');
      }
      
      // 임시 저장 상태 업데이트
      updateTempSaveStatus();
    } catch (error) {
      console.error('❌ 페이지 로드 시 임시 노트 확인 실패:', error);
      // 에러가 발생해도 앱이 정상 동작하도록 함
    }
  }, []);
  
  // 임시 저장 상태 업데이트 함수
  const updateTempSaveStatus = useCallback(() => {
    try {
      const status = getTempSaveStatus();
      setTempSaveStatus(status);
    } catch (error) {
      console.error('❌ 임시 저장 상태 업데이트 실패:', error);
      // 에러 발생 시 기본값으로 설정
      setTempSaveStatus({
        hasTempData: false,
        lastSaved: null,
        timeSinceLastSave: null
      });
    }
  }, []);
  
  // 임시 저장 상태를 주기적으로 업데이트 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      updateTempSaveStatus();
    }, 30000); // 30초마다 업데이트로 변경
    return () => clearInterval(interval);
  }, []); // 의존성 배열 수정
  
  // 복원 확인 핸들러
  const handleRestoreData = () => {
    try {
      const tempNote = getTempNote();
      if (tempNote) {
        setTaskName(tempNote.taskName || '');
        setNotes(tempNote.notes || '');
        setAutoSaveEnabled(tempNote.autoSaveEnabled ?? true);
        console.log('✅ 임시 저장된 노트 복원 완료');
      }
      
      // 이번 세션에서 복원 다이얼로그 처리했음을 기록
      sessionStorage.setItem('pomki_restore_dialog_handled', 'true');
      setShowRestoreDialog(false);
      updateTempSaveStatus();
    } catch (error) {
      console.error('❌ 노트 복원 실패:', error);
      setShowRestoreDialog(false);
      alert('노트 복원에 실패했습니다.');
    }
  };
  
  // 복원 거절 핸들러
  const handleSkipRestore = () => {
    try {
      clearTempNote();
      
      // 이번 세션에서 복원 다이얼로그 처리했음을 기록
      sessionStorage.setItem('pomki_restore_dialog_handled', 'true');
      setShowRestoreDialog(false);
      console.log('❌ 임시 저장 데이터 무시 및 삭제');
      updateTempSaveStatus();
    } catch (error) {
      console.error('❌ 임시 데이터 삭제 실패:', error);
      setShowRestoreDialog(false);
    }
  };
  
  // 페이지 이탈 전 확인
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && (notes.trim() || taskName.trim())) {
        e.preventDefault();
        e.returnValue = '저장하지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, notes, taskName]);

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

  // 스마트 자동저장 함수 (20초 주기 + 20자 이상 즉시 저장)
  const smartAutoSave = useCallback((content: string, task: string, immediate: boolean = false) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    const performSave = () => {
      try {
        // 자동저장이 활성화되고 타이머가 실행 중일 때만 저장
        if (autoSaveEnabled && isRunning && (content.trim() || task.trim())) {
          const tempData: TempNoteData = {
            taskName: task,
            notes: content,
            timestamp: new Date().toISOString(),
            sessionId: `session-${Date.now()}`,
            autoSaveEnabled: autoSaveEnabled,
            lastModified: new Date().toISOString(),
          };
          saveTempNote(tempData);
          console.log('💾 백그라운드 임시 저장 완료 (사용자에게 알리지 않음)');
          updateTempSaveStatus(); // 저장 후 상태 업데이트
        }
      } catch (error) {
        console.error('❌ 자동 저장 실패:', error);
      }
    };
    
    if (immediate) {
      performSave();
    } else {
      // 20초 디바운스로 변경
      autoSaveTimeoutRef.current = setTimeout(performSave, 20000) as unknown as number;
    }
  }, [autoSaveEnabled, isRunning, updateTempSaveStatus]);

  // 에디터 내용 변경 핸들러 (스마트 자동저장 적용)
  const handleEditorChange = useCallback((content: string) => {
    try {
      setNotes(content);
      setHasUnsavedChanges(true);
      
      // 자동저장이 활성화된 경우 스마트 저장 실행
      if (autoSaveEnabled && isRunning && (content.trim() || taskName.trim())) {
        const currentContentLength = content.length + taskName.length;
        const lengthDiff = currentContentLength - lastContentLength;
        
        // 20자 이상 추가 입력 시 즉시 저장, 그렇지 않으면 20초 디바운스
        const shouldSaveImmediately = lengthDiff >= 20;
        
        if (shouldSaveImmediately) {
          console.log('📝 대량 입력 감지 (20자 이상), 즉시 임시 저장:', { lengthDiff, currentLength: currentContentLength });
        }
        
        smartAutoSave(content, taskName, shouldSaveImmediately);
        setLastContentLength(currentContentLength);
      }
    } catch (error) {
      console.error('❌ 에디터 변경 핸들러 오류:', error);
    }
  }, [autoSaveEnabled, isRunning, smartAutoSave, taskName, lastContentLength]);
  
  // 태스크 이름 변경 핸들러 (스마트 자동저장 적용)
  const handleTaskNameChange = useCallback((name: string) => {
    try {
      setTaskName(name);
      setHasUnsavedChanges(true);
      
      // 자동저장이 활성화된 경우 스마트 저장 실행
      if (autoSaveEnabled && isRunning && (name.trim() || notes.trim())) {
        const currentContentLength = notes.length + name.length;
        
        // 태스크명은 보통 짧으므로 20초 디바운스만 적용 (즉시 저장 조건 없음)
        smartAutoSave(notes, name, false);
        setLastContentLength(currentContentLength);
      }
    } catch (error) {
      console.error('❌ 태스크명 변경 핸들러 오류:', error);
    }
  }, [autoSaveEnabled, isRunning, smartAutoSave, notes, lastContentLength]);

  // 컴포넌트 언마운트 시 timeout 정리
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // 노트 임팩트 효과
  useEffect(() => {
    if (isRunning) {
      setNoteImpact(true);
      const timer = setTimeout(() => setNoteImpact(false), 600); // 0.6초 임팩트
      return () => clearTimeout(timer);
    }
  }, [isRunning]);

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

  // -------------------------------------------
  // 📊 학습 시간 실시간 누적 & 기록 로직
  // -------------------------------------------

  // ⏱️ 현재 모드(FOCUS/SHORT_BREAK 등)에서 경과한 초 누적용 ref
  const modeElapsedSecRef = useRef(0);
  // 이전 렌더에서의 남은 시간을 기록하여 diff 계산
  const prevTimeSecRef = useRef<number | null>(null);
  // 이전 모드 기록용 ref (모드 전환 감지)
  const prevModeRef = useRef(mode);

  // 1) tick마다 경과 시간 누적 (isRunning 상태에서만)
  useEffect(() => {
    const currentSec = currentTime.minutes * 60 + currentTime.seconds;
    if (isRunning && prevTimeSecRef.current !== null) {
      const diff = prevTimeSecRef.current - currentSec;
      if (diff > 0) {
        modeElapsedSecRef.current += diff; // 초 단위 누적
      }
      // 디버깅 로그
      console.log('[TICK]', {
        mode,
        diff,
        totalElapsedSec: modeElapsedSecRef.current,
      });
    }
    prevTimeSecRef.current = currentSec;
  }, [currentTime, isRunning]);

  // 🔄 누적된 시간을 서버에 기록하고 초기화하는 헬퍼
  const flushElapsed = useCallback(async (reason: string) => {
    console.log('[FLUSH START]', reason, 'elapsedSec', modeElapsedSecRef.current);
    const minutesSpent = Math.round(modeElapsedSecRef.current / 60);
    if (minutesSpent > 0) {
      try {
        const res = await recordStudyTime(minutesSpent);
        const totalMinutes = res?.totalMinutes;
        console.log(`✅ ${minutesSpent}분 학습 시간 기록 완료 (${reason})`, { totalMinutes });
        // Redux로 학습 시간 갱신
        dispatch(updateTodayStudyMinutes({ addedMinutes: minutesSpent, totalMinutes }));
      } catch (err) {
        console.error('❌ 학습 시간 기록 실패:', err);
      } finally {
        modeElapsedSecRef.current = 0; // 초기화
      }
    }
  }, [dispatch]);

  // 2) 모드 전환 시: 이전 모드의 누적 시간을 기록
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      flushElapsed('모드 전환');
      prevModeRef.current = mode;
      // prevTimeSec을 현재 모드의 시작 시점으로 재설정
      prevTimeSecRef.current = currentTime.minutes * 60 + currentTime.seconds;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // 3) 페이지 언마운트 시 누적 시간 기록
  useEffect(() => {
    return () => {
      flushElapsed('언마운트');
    };
  }, []);

  // 4) 브라우저 종료/새로고침(완전 언로드) 대비: sendBeacon 사용
  useEffect(() => {
    const handleBeforeUnload = () => {
      const minutesSpent = Math.round(modeElapsedSecRef.current / 60);
      if (minutesSpent > 0 && navigator.sendBeacon) {
        try {
          const blob = new Blob([JSON.stringify({ studyMinutes: minutesSpent })], {
            type: 'application/json',
          });
          navigator.sendBeacon('/api/stats/study-time', blob);
          // 누적 초기화 (다음 unload 중복 방지)
          modeElapsedSecRef.current = 0;
        } catch (err) {
          console.error('sendBeacon 실패:', err);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
    setShowResetDialog(true);
  };

  const handleConfirmReset = () => {
    // 리셋 전에 누적된 시간을 기록
    flushElapsed('리셋');
    reset();
    setHasTimerStarted(false);
    setShowResetDialog(false);
  };

  const handleCancelReset = () => {
    setShowResetDialog(false);
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

  // 수동 임시 저장 핸들러 (타이머 실행 중이 아닐 때)
  const handleManualTempSave = useCallback(() => {
    try {
      if (!autoSaveEnabled || isRunning) return;
      
      if (notes.trim() || taskName.trim()) {
        const tempData: TempNoteData = {
          taskName,
          notes,
          timestamp: new Date().toISOString(),
          sessionId: `session-${Date.now()}`,
          autoSaveEnabled,
          lastModified: new Date().toISOString(),
        };
        saveTempNote(tempData);
        console.log('📁 수동 임시 저장 완료:', tempData);
        updateTempSaveStatus(); // 저장 후 상태 업데이트
        // alert 대신 콘씔 로그만 (UI 방해 최소화)
      }
    } catch (error) {
      console.error('❌ 수동 임시 저장 실패:', error);
      alert('임시 저장에 실패했습니다.');
    }
  }, [autoSaveEnabled, isRunning, notes, taskName, updateTempSaveStatus]);

  // AI 노트 생성 핸들러 (실제 API 호출)
  const handleGenerateAI = async () => {
    if (!notes.trim()) {
      alert('먼저 노트에 내용을 작성해주세요.');
      return;
    }

    setAiLoading(true);
    setAiDialogOpen(true);
    
    try {
      const response = await enhanceNoteWithAI({
        noteTitle: taskName || '집중 세션 노트',
        noteContent: notes,
      });
      
      setAiResponse(response);
      setAiLoading(false);
    } catch (error) {
      console.error('AI 노트 생성 실패:', error);
      setAiLoading(false);
      setAiDialogOpen(false);
      alert('AI 노트 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // AI 생성 결과 적용 핸들러
  const handleApplyAI = (aiContent: string) => {
    try {
      setNotes(prevNotes => {
        const separator = prevNotes.trim() ? '\n\n--- AI 생성 내용 ---\n\n' : '';
        const newContent = prevNotes + separator + aiContent;
        
        // AI 생성은 대량 내용 추가이므로 즉시 저장
        if (autoSaveEnabled) {
          console.log('🤖 AI 생성 내용 적용, 즉시 임시 저장');
          smartAutoSave(newContent, taskName, true);
          setLastContentLength(newContent.length + taskName.length);
        }
        
        return newContent;
      });
      setHasGeneratedAI(true);
    } catch (error) {
      console.error('❌ AI 내용 적용 실패:', error);
      alert('AI 생성 내용 적용에 실패했습니다.');
    }
  };

  // 노트 수동 저장 핸들러
  const handleSaveNotes = async () => {
    try {
      if (!notes.trim() && !taskName.trim()) {
        alert('저장할 내용이 없습니다.');
        return;
      }

      await createNote({
        noteTitle: taskName || '집중 세션 노트',
        noteContent: notes,
        aiEnhanced: hasGeneratedAI,
      });

      // 저장 성공 시 localStorage에서 임시 데이터 삭제
      clearTempNote();
      setHasUnsavedChanges(false);
      updateTempSaveStatus();
      console.log('✅ 백엔드 저장 완료 - 임시 데이터 정리됨');
      
      // 성공 메시지와 액션 버튼이 함께 있는 토스트 표시
      dispatch(showToast({ 
        message: '노트가 성공적으로 저장되었습니다.', 
        severity: 'success',
        duration: 6000,
        action: '노트 목록으로',
        onAction: () => navigate('/note')
      }));
    } catch (error) {
      console.error('❌ 노트 저장 실패:', error);
      alert('노트 저장에 실패했습니다. 다시 시도해주세요.');
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

  // 버튼 활성화 조건 - useMemo 최적화
  const canGenerateAI = useMemo(() => notes.trim() && !aiLoading, [notes, aiLoading]);
  const canSave = useMemo(() => (notes.trim() || taskName.trim()), [notes, taskName]);

  // SVG 원의 중심과 반지름 계산 (반지름 기준) - useMemo 최적화
  const circleProps = useMemo(() => {
    const radius = 130; // 280px 원의 반지름에서 stroke-width 고려하여 조정
    const circumference = 2 * Math.PI * radius;
    return { radius, circumference };
  }, []);

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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <Text sx={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>
            세션 {sessionProgress.current + 1}/{sessionProgress.target}
          </Text>
          <Text sx={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>
            ·
          </Text>
          <Text sx={{ fontSize: '14px', fontWeight: 600, color: '#2563EB' }}>
            {mode === 'FOCUS' ? '집중시간' : '휴식시간'}
          </Text>
          <Text sx={{ 
            fontSize: '16px', 
            fontWeight: 700, 
            color: '#1A1A1A',
            fontFamily: "'Pretendard', monospace",
          }}>
            {formatTime(minutes, seconds)}
          </Text>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
            <IconButton 
              size="small" 
              sx={{ 
                color: isRunning ? '#EF4444' : '#2563EB',
                '&:hover': {
                  color: isRunning ? '#DC2626' : '#1D4ED8',
                },
                width: '28px',
                height: '28px',
              }}
              onClick={isRunning ? pause : handleStart}
            >
              {isRunning ? '⏸️' : '▶️'}
            </IconButton>
            
            <IconButton 
              size="small" 
              sx={{ 
                color: '#6B7280',
                '&:hover': {
                  color: '#374151',
                },
                width: '28px',
                height: '28px',
              }}
              onClick={handleReset}
            >
              ⏹️
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* 데스크톱 타이머 바 */}
      <Box sx={{ 
        display: { xs: 'none', sm: 'block' },
        padding: '16px 0',
        marginBottom: '24px',
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
        }}>
          <Text sx={{ fontSize: '16px', fontWeight: 500, color: '#6B7280' }}>
            세션 {sessionProgress.current + 1}/{sessionProgress.target}
          </Text>
          <Text sx={{ fontSize: '16px', fontWeight: 500, color: '#6B7280' }}>
            ·
          </Text>
          <Text sx={{ fontSize: '16px', fontWeight: 600, color: '#2563EB' }}>
            {mode === 'FOCUS' ? '집중시간' : '휴식시간'}
          </Text>
          <Text sx={{ 
            fontSize: '20px', 
            fontWeight: 700, 
            color: '#1A1A1A',
            fontFamily: "'Pretendard', monospace",
          }}>
            {formatTime(minutes, seconds)}
          </Text>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
            <IconButton 
              size="medium" 
              sx={{ 
                color: isRunning ? '#EF4444' : '#2563EB',
                '&:hover': {
                  color: isRunning ? '#DC2626' : '#1D4ED8',
                },
                width: '36px',
                height: '36px',
              }}
              onClick={isRunning ? pause : handleStart}
            >
              {isRunning ? '⏸️' : '▶️'}
            </IconButton>
            
            <IconButton 
              size="medium" 
              sx={{ 
                color: '#6B7280',
                '&:hover': {
                  color: '#374151',
                },
                width: '36px',
                height: '36px',
              }}
              onClick={handleReset}
            >
              ⏹️
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* 노트 제목과 자동저장 토글 */}
      <NotesHeader
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* 1행: 제목 */}
        <Box sx={{ width: '100%' }}>
          <NotesTitle>📝 집중 노트</NotesTitle>
        </Box>
        {/* 2행: 토글 + 확대버튼 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Text sx={{ fontSize: '12px', color: autoSaveEnabled ? '#10B981' : '#9CA3AF', whiteSpace: 'nowrap' }}>
              백그라운드 저장
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
          {/* 확대/축소 버튼 조건부 렌더링 및 hover 배경 제거 */}
          {!notesExpanded && (
            <IconButton
              size="small"
              onClick={() => setNotesExpanded(true)}
              sx={{
                color: '#6B7280',
                backgroundColor: 'transparent',
                borderRadius: '50%',
                width: 32,
                height: 32,
                ml: { xs: 0, sm: 1 },
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
              aria-label="노트 확대"
            >
              <ExpandIcon fontSize="small" />
            </IconButton>
          )}
          {notesExpanded && (
            <IconButton
              size="small"
              onClick={() => setNotesExpanded(false)}
              sx={{
                color: '#6B7280',
                backgroundColor: 'transparent',
                borderRadius: '50%',
                width: 32,
                height: 32,
                ml: { xs: 0, sm: 1 },
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
              aria-label="노트 축소"
            >
              <CompressIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </NotesHeader>

      {/* 통합된 작업 입력 영역 */}
      <TaskInput
        type="text"
        value={taskName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTaskNameChange(e.target.value)}
        disabled={!isRunning}
        placeholder={
          isRunning
            ? "이번 세션에서 주제나 목표를 기록해보세요..."
            : "타이머를 시작하면 입력할 수 있습니다"
        }
        aria-label={isRunning ? "현재 집중 중인 작업" : "이번 세션 집중 작업"}
        style={{ marginBottom: '12px' }}
      />
      
      {/* 노트 에디터 영역 */}
      <QuillEditor
        theme={"snow" as any}
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
                MenuProps={{ disablePortal: true }}
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
              {aiLoading ? (
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
              MenuProps={{ disablePortal: true }}
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
            {aiLoading ? (
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
            {/*{mode === 'FOCUS' ? '🍅 집중시간' : mode === 'SHORT_BREAK' ? '☕ 짧은 휴식' : '🛋️ 긴 휴식'}*/}
            {mode === 'FOCUS' ? '집중시간' :'짧은 휴식'}
          </ElapsedTime>
        </RunningHeader>
      ) : (
        <FocusTimeSection>
          <FocusTimeLabel>
            집중시간
          </FocusTimeLabel>
        </FocusTimeSection>
      )}

      <TimerCircle
        isRunning={isRunning}
        progress={progress}
        minutes={minutes}
        seconds={seconds}
      />

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
          <NotesHeader
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1, sm: 2 },
            }}
          >
            {/* 1행: 제목 */}
            <Box sx={{ width: '100%' }}>
              <NotesTitle>📝 집중 노트</NotesTitle>
            </Box>
            {/* 2행: 토글 + 확대버튼 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'space-between', sm: 'flex-end' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Text sx={{ fontSize: '12px', color: autoSaveEnabled ? '#10B981' : '#9CA3AF', whiteSpace: 'nowrap' }}>
                  백그라운드 저장
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
              {/* 확대/축소 버튼 조건부 렌더링 및 hover 배경 제거 */}
              {!notesExpanded && (
                <IconButton
                  size="small"
                  onClick={() => setNotesExpanded(true)}
                  sx={{
                    color: '#6B7280',
                    backgroundColor: 'transparent',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    ml: { xs: 0, sm: 1 },
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                  aria-label="노트 확대"
                >
                  <ExpandIcon fontSize="small" />
                </IconButton>
              )}
              {notesExpanded && (
                <IconButton
                  size="small"
                  onClick={() => setNotesExpanded(false)}
                  sx={{
                    color: '#6B7280',
                    backgroundColor: 'transparent',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    ml: { xs: 0, sm: 1 },
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                  aria-label="노트 축소"
                >
                  <CompressIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </NotesHeader>

          {/* 통합된 작업 입력 영역 */}
          <TaskInput
            type="text"
            value={taskName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTaskNameChange(e.target.value)}
            disabled={!isRunning}
            placeholder={
              isRunning
                ? "이번 세션에서 주제나 목표를 기록해보세요..."
                : "타이머를 시작하면 입력할 수 있습니다"
            }
            aria-label={isRunning ? "현재 집중 중인 작업" : "이번 세션 집중 작업"}
            style={{ marginBottom: '12px' }}
          />
          
          {/* 노트 에디터 영역 */}
          <QuillEditor
            theme={"snow" as any}
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
                MenuProps={{ disablePortal: true }}
                sx={{
                
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
              {aiLoading ? (
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

      {/* AI 다이얼로그 */}
      <LazyAIEnhanceDialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        onApply={handleApplyAI}
        aiResponse={aiResponse}
        loading={aiLoading}
      />

      {/* 복원 다이얼로그 */}
      <Modal
        open={showRestoreDialog}
        onClose={() => {
          // 다이얼로그를 그냥 닫으면 다음에 다시 나타나지 않게 처리
          sessionStorage.setItem('pomki_restore_dialog_handled', 'true');
          setShowRestoreDialog(false);
          console.log('🔒 복원 다이얼로그 무시됨 (이번 세션에서 다시 표시 안됨)');
        }}
        title="💾 이전 작성 내용 발견"
      >
        <Box sx={{ mb: 2 }}>
          <Text sx={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5 }}>
            이전에 작성하던 내용이 임시 저장되어 있습니다. 복원하시겠습니까?
          </Text>
          {tempSaveStatus.lastSaved && (
            <Text sx={{ fontSize: '12px', color: '#9CA3AF', mt: 1 }}>
              마지막 저장: {
                (() => {
                  try {
                    const date = new Date(tempSaveStatus.lastSaved);
                    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                  } catch (e) {
                    return '알 수 없음';
                  }
                })()
              }
            </Text>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleSkipRestore}
            sx={{ flex: 1 }}
          >
            삭제
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRestoreData}
            sx={{ flex: 1 }}
          >
            복원하기
          </Button>
        </Box>
      </Modal>

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
              min={1}
              max={120}
              step={1}
              boxWidth={100}
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
              심층 학습 (3세션 / 50분 / 10분)
            </PresetButton>
            <PresetButton onClick={() => handlePreset('pomodoro')}>
              포모도로 학습 (4세션 / 25분 / 5분)
            </PresetButton>
            <PresetButton onClick={() => handlePreset('quick')}>
              빠른 학습 (6세션 / 15분 / 3분)
            </PresetButton>
          </PresetsSection>
        </SettingsContainer>
      </Modal>

      {/* 리셋 확인 다이얼로그 */}
      <Modal
        open={showResetDialog}
        onClose={handleCancelReset}
        title="⚠️ 타이머 초기화"
      >
        <Box sx={{ mb: 2 }}>
          <Text sx={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5 }}>
            타이머를 초기화하시겠습니까? 현재 진행 상황이 모두 사라집니다.
          </Text>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCancelReset}
            sx={{ flex: 1 }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmReset}
            sx={{ flex: 1 }}
          >
            초기화
          </Button>
        </Box>
      </Modal>

      {/* Toast 알림 */}
      <Toast />
    </PageContainer>
  );
};

export default React.memo(TimerPage);
