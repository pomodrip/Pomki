import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  startTimer,
  pauseTimer,
  stopTimer,
  tick,
  setMode,
  updateSettings,
  clearError,
  resetSession,
  /* attachNoteToSession, */
  /* addTagToSession, */
  selectCurrentSession,
  selectTimerStatus,
  selectTimerMode,
  selectIsRunning,
  selectCurrentTime,
  selectProgress,
  selectSessionProgress,
  selectTimerSettings,
  selectCanStart,
  selectCanPause,
  selectIsCompleted,
  selectNextSessionInfo,
  selectTimerError,
  type TimerMode,
} from '../store/slices/timerSlice';
import { showNotification } from '@/utils/notificationUtils';

/**
 * 🎯 useTimer Hook - 타이머 상태관리 통합 Hook
 * 
 * Redux 기반 타이머 상태를 컴포넌트에서 쉽게 사용할 수 있도록 하는 Hook
 * 
 * 기능:
 * - 타이머 제어 (시작/일시정지/정지)
 * - 자동 틱 처리
 * - 상태 정보 제공
 * - 설정 관리
 */

export interface UseTimerResult {
  // 상태
  currentSession: ReturnType<typeof selectCurrentSession>;
  status: ReturnType<typeof selectTimerStatus>;
  mode: TimerMode;
  isRunning: boolean;
  currentTime: { minutes: number; seconds: number };
  progress: number;
  sessionProgress: { current: number; target: number; cycle: number };
  settings: ReturnType<typeof selectTimerSettings>;
  error: string | null;
  
  // 상태 확인
  canStart: boolean;
  canPause: boolean;
  isCompleted: boolean;
  nextSessionInfo: { mode: TimerMode; duration: number };
  
  // 액션들
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  changeMode: (mode: TimerMode) => void;
  updateTimerSettings: (settings: Partial<ReturnType<typeof selectTimerSettings>>) => void;
  /* attachNote?: (noteId: string) => void; */
  /* addTag?: (tag: string) => void; */
  clearTimerError: () => void;
}

export const useTimer = (options?: {
  autoTick?: boolean; // 자동으로 1초마다 틱 처리 (기본: true)
  tickInterval?: number; // 틱 간격 (기본: 1000ms)
  notify?: boolean; // 세션 완료 알림 활성화 (기본: false)
}): UseTimerResult => {
  const dispatch = useAppDispatch();
  const { autoTick = false, tickInterval = 1000, notify = false } = options || {};

  // Redux 상태 선택
  const currentSession = useAppSelector(selectCurrentSession);
  const status = useAppSelector(selectTimerStatus);
  const mode = useAppSelector(selectTimerMode);
  const isRunning = useAppSelector(selectIsRunning);
  const currentTime = useAppSelector(selectCurrentTime);
  const progress = useAppSelector(selectProgress);
  const sessionProgress = useAppSelector(selectSessionProgress);
  const settings = useAppSelector(selectTimerSettings);
  const canStart = useAppSelector(selectCanStart);
  const canPause = useAppSelector(selectCanPause);
  const isCompleted = useAppSelector(selectIsCompleted);
  const nextSessionInfo = useAppSelector(selectNextSessionInfo);
  const error = useAppSelector(selectTimerError);

  // 액션 함수들
  const start = useCallback(() => {
    dispatch(startTimer());
  }, [dispatch]);

  const pause = useCallback(() => {
    dispatch(pauseTimer());
  }, [dispatch]);

  const stop = useCallback(() => {
    dispatch(stopTimer());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetSession());
  }, [dispatch]);

  const changeMode = useCallback((newMode: TimerMode) => {
    dispatch(setMode(newMode));
  }, [dispatch]);

  const updateTimerSettings = useCallback((newSettings: Partial<ReturnType<typeof selectTimerSettings>>) => {
    dispatch(updateSettings(newSettings));
  }, [dispatch]);

  /*
  const attachNote = useCallback((noteId: string) => {
    dispatch(attachNoteToSession(noteId));
  }, [dispatch]);

  const addTag = useCallback((tag: string) => {
    dispatch(addTagToSession(tag));
  }, [dispatch]);
  */

  const clearTimerError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 자동 틱 처리
  useEffect(() => {
    if (!autoTick || !isRunning) return;

    const interval = setInterval(() => {
      dispatch(tick());
    }, tickInterval);

    return () => clearInterval(interval);
  }, [autoTick, isRunning, tickInterval, dispatch]);

  // 세션 완료 시 알림
  const prevModeRef = useRef<TimerMode>(mode);
  const prevIsRunningRef = useRef<boolean>(isRunning);

  useEffect(() => {
    if (!notify) return; // 알림 비활성화 시 아무 것도 하지 않음

    const prevMode = prevModeRef.current;
    const prevIsRunning = prevIsRunningRef.current;

    // 세션이 진행 중이었고(mode 변경 발생) → 세션 완료로 간주
    if (prevIsRunning && isRunning && mode !== prevMode) {
      const completedMode = prevMode;
      const completedModeText =
        completedMode === 'FOCUS'
          ? '집중시간'
          : completedMode === 'SHORT_BREAK'
          ? '짧은 휴식'
          : '긴 휴식';

      const nextModeText = mode === 'FOCUS' ? '집중시간' : '휴식시간';

      const nextDurationMinutes = Math.round(nextSessionInfo.duration / 60);

      showNotification(`${completedModeText} 완료!`, {
        body: `${nextDurationMinutes}분 ${nextModeText}이 시작됩니다.`,
        icon: '/logo192.png',
        data: { innerLink: '/timer' },
        tag: 'timer',
      });
    }

    // 레퍼런스 업데이트
    prevModeRef.current = mode;
    prevIsRunningRef.current = isRunning;
  }, [mode, isRunning, nextSessionInfo, notify]);

  return {
    // 상태
    currentSession,
    status,
    mode,
    isRunning,
    currentTime,
    progress,
    sessionProgress,
    settings,
    error,
    
    // 상태 확인
    canStart,
    canPause,
    isCompleted,
    nextSessionInfo,
    
    // 액션들
    start,
    pause,
    stop,
    reset,
    changeMode,
    updateTimerSettings,
    /* attachNote, */
    /* addTag, */
    clearTimerError,
  };
};

/**
 * 🎯 useTimerStats - 타이머 통계 관리 Hook
 * 
 * 타이머 사용 통계를 로컬 계산으로 제공
 */
export const useTimerStats = () => {
  const sessionProgress = useAppSelector(selectSessionProgress);
  const currentTime = useAppSelector(selectCurrentTime);
  const isRunning = useAppSelector(selectIsRunning);
  const settings = useAppSelector(selectTimerSettings);

  // 오늘의 집중시간 계산 (현재 세션 포함)
  const todayFocusTime = useCallback(() => {
    const completedMinutes = sessionProgress.current * settings.focusTime;
    const currentSessionMinutes = isRunning 
      ? Math.floor((settings.focusTime * 60 - (currentTime.minutes * 60 + currentTime.seconds)) / 60)
      : 0;
    
    return completedMinutes + currentSessionMinutes;
  }, [sessionProgress.current, settings.focusTime, isRunning, currentTime]);

  // 목표 달성률 계산
  const goalProgress = useCallback(() => {
    const dailyGoal = 240; // 4시간 (기본값)
    const completed = todayFocusTime();
    return Math.min((completed / dailyGoal) * 100, 100);
  }, [todayFocusTime]);

  return {
    todayFocusTime: todayFocusTime(),
    goalProgress: goalProgress(),
    completedSessions: sessionProgress.current,
    currentCycle: sessionProgress.cycle,
  };
}; 