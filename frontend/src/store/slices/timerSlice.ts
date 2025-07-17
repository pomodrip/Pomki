import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import * as timerApi from '../../api/timerApi';
import type { 
  TimerSession, 
  TimerSettings, 
  TimerStats,
  StartTimerRequest 
} from '../../api/timerApi';

/**
 * ⏰ Timer Slice - 포모도로 타이머 상태관리
 * 
 * 기능:
 * - 포모도로 타이머 시작/일시정지/정지
 * - 집중 세션 관리
 * - 타이머 설정 관리
 * - 통계 데이터 관리
 * 
 * 참고:
 * - https://medium.com/@machadogj/timers-in-react-with-redux-apps-9a5a722162e8
 * - https://diegocasmo.github.io/2020-10-18-create-a-simple-react-timer-component/
 */

// ==========================================
// 1. 타입 정의
// ==========================================

export type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

// Time Entry 패턴 (Diego Castillo 가이드 참고)
export interface TimeEntry {
  startedAt: number;    // Unix timestamp (ms)
  elapsedMs: number | null;  // null이면 진행 중, 숫자면 완료된 시간
}

export interface PomodoroSession {
  sessionId: string;
  mode: TimerMode;
  duration: number;     // 총 시간 (초 단위)
  remainingTime: number; // 남은 시간 (초 단위)
  timeEntries: TimeEntry[];
  status: TimerStatus;
  createdAt: string;
  completedAt?: string;
  noteId?: string;
  tags?: string[];
}

// ==========================================
// 2. 상태 인터페이스
// ==========================================

interface TimerState {
  // 현재 세션
  currentSession: PomodoroSession | null;
  
  // 타이머 상태
  status: TimerStatus;
  mode: TimerMode;
  isRunning: boolean;
  
  // 포모도로 사이클
  completedSessions: number;
  targetSessions: number;
  currentCycle: number; // 현재 사이클 (1부터 시작)
  
  // 설정
  settings: TimerSettings;
  
  // 통계
  stats: TimerStats | null;
  
  // 로딩 및 에러
  loading: boolean;
  error: string | null;
  
  // UI 상태
  showSettings: boolean;
  notificationEnabled: boolean;
  
  // 마지막 틱 시간 (성능 최적화용)
  lastTick: number;
}

// ==========================================
// 3. 초기 상태
// ==========================================

const defaultSettings: TimerSettings = {
  focusTime: 20,          // 20분
  shortBreakTime: 10,      // 10분
  longBreakTime: 15,      // 15분
  longBreakInterval: 4,   // 4번의 포커스 후 긴 휴식
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationEnabled: true,
};

const initialState: TimerState = {
  currentSession: null,
  status: 'IDLE',
  mode: 'FOCUS',
  isRunning: false,
  completedSessions: 0,
  targetSessions: 2,  // 2세션
  currentCycle: 1,
  settings: defaultSettings,
  stats: null,
  loading: false,
  error: null,
  showSettings: false,
  notificationEnabled: true,
  lastTick: 0,
};

// ==========================================
// 4. 유틸리티 함수들
// ==========================================

// Time Entry 관련 유틸리티 (Diego Castillo 패턴)
const createTimeEntry = (startTime: number = Date.now()): TimeEntry => ({
  startedAt: startTime,
  elapsedMs: null,
});

const stopTimeEntry = (timeEntry: TimeEntry, endTime: number = Date.now()): TimeEntry => ({
  ...timeEntry,
  elapsedMs: endTime - timeEntry.startedAt,
});

const isTimeEntryRunning = (timeEntry: TimeEntry): boolean => timeEntry.elapsedMs === null;

// 총 경과 시간 계산
const getTotalElapsedMs = (timeEntries: TimeEntry[]): number => {
  const now = Date.now();
  return timeEntries.reduce((total, entry) => {
    if (isTimeEntryRunning(entry)) {
      return total + (now - entry.startedAt);
    }
    return total + (entry.elapsedMs || 0);
  }, 0);
};

// 다음 모드 결정 – 간단히 집중 ↔ 휴식 반복
const getNextMode = (currentMode: TimerMode): TimerMode => {
  return currentMode === 'FOCUS' ? 'SHORT_BREAK' : 'FOCUS';
};

// 모드별 시간 가져오기
const getDurationForMode = (mode: TimerMode, settings: TimerSettings): number => {
  switch (mode) {
    case 'FOCUS':
      return settings.focusTime * 60;
    case 'SHORT_BREAK':
      return settings.shortBreakTime * 60;
    case 'LONG_BREAK':
      return settings.longBreakTime * 60;
    default:
      return settings.focusTime * 60;
  }
};

// 에러 처리
const handleAsyncError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return '타이머 작업에 실패했습니다.';
};

// ==========================================
// 5. Async Thunk 액션들
// ==========================================

// 타이머 세션 시작 (API 연동)
export const startTimerSession = createAsyncThunk<
  TimerSession,
  StartTimerRequest,
  { state: RootState; rejectValue: string }
>('timer/startSession', async (request, { rejectWithValue }) => {
  try {
    const session = await timerApi.startTimerSession(request);
    return session;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 타이머 세션 완료 (API 연동)
export const completeTimerSession = createAsyncThunk<
  TimerSession,
  string,
  { state: RootState; rejectValue: string }
>('timer/completeSession', async (sessionId, { rejectWithValue }) => {
  try {
    const session = await timerApi.completeTimerSession(sessionId);
    return session;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 타이머 설정 저장 (API 연동)
export const saveTimerSettings = createAsyncThunk<
  TimerSettings,
  TimerSettings,
  { state: RootState; rejectValue: string }
>('timer/saveSettings', async (settings, { rejectWithValue }) => {
  try {
    const savedSettings = await timerApi.saveTimerSettings(settings);
    return savedSettings;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 타이머 설정 로드 (API 연동)
export const loadTimerSettings = createAsyncThunk<
  TimerSettings,
  void,
  { state: RootState; rejectValue: string }
>('timer/loadSettings', async (_, { rejectWithValue }) => {
  try {
    const settings = await timerApi.getTimerSettings();
    return settings;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 타이머 통계 로드 (API 연동)
export const loadTimerStats = createAsyncThunk<
  TimerStats,
  void,
  { state: RootState; rejectValue: string }
>('timer/loadStats', async (_, { rejectWithValue }) => {
  try {
    const stats = await timerApi.getTimerStats();
    return stats;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// ==========================================
// 6. Slice 정의
// ==========================================

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    // 타이머 시작
    startTimer: (state) => {
      // 만약 이전 사이클이 이미 완료되어 세션 카운트가 목표에 도달했다면
      // 새로운 사이클을 시작하기 전에 값들을 초기화한다.
      if (state.completedSessions >= state.targetSessions) {
        state.completedSessions = 0;
        state.currentCycle += 1;
      }

      // 완료된 세션 객체가 남아있는 경우 초기화하여 새 세션을 만들 수 있게 한다.
      if (state.currentSession && state.currentSession.status === 'COMPLETED') {
        state.currentSession = null;
      }

      // 항상 새 사이클은 FOCUS 모드로 시작한다.
      state.mode = 'FOCUS';
      const now = Date.now();
      const duration = getDurationForMode(state.mode, state.settings);
      
      if (!state.currentSession) {
        // 새 세션 시작
        state.currentSession = {
          sessionId: `session_${now}`,
          mode: state.mode,
          duration,
          remainingTime: duration,
          timeEntries: [createTimeEntry(now)],
          status: 'RUNNING',
          createdAt: new Date().toISOString(),
        };
      } else if (state.currentSession.status === 'PAUSED') {
        // 일시정지된 세션 재개
        state.currentSession.timeEntries.push(createTimeEntry(now));
        state.currentSession.status = 'RUNNING';
      }
      
      state.isRunning = true;
      state.status = 'RUNNING';
      state.lastTick = now;
    },

    // 타이머 일시정지
    pauseTimer: (state) => {
      if (state.currentSession && state.isRunning) {
        const now = Date.now();
        const lastEntry = state.currentSession.timeEntries[state.currentSession.timeEntries.length - 1];
        
        if (lastEntry && isTimeEntryRunning(lastEntry)) {
          // 마지막 time entry 정지
          state.currentSession.timeEntries[state.currentSession.timeEntries.length - 1] = 
            stopTimeEntry(lastEntry, now);
        }
        
        state.currentSession.status = 'PAUSED';
        state.isRunning = false;
        state.status = 'PAUSED';
      }
    },

    // 타이머 정지 (초기화)
    stopTimer: (state) => {
      state.currentSession = null;
      state.isRunning = false;
      state.status = 'IDLE';
      state.mode = 'FOCUS';
      state.lastTick = 0;
    },

    // 타이머 틱 (1초마다 호출)
    tick: (state) => {
      if (!state.currentSession || !state.isRunning) return;
      
      const now = Date.now();

      // CPU 지연 등으로 인해 tick 간격이 약간 달라도, UI 는 항상 1초씩 감소하도록 한다.
      // 언제나 1초씩 감소시킨다.
      state.currentSession.remainingTime = Math.max(0, state.currentSession.remainingTime - 1);
      state.lastTick = now;

      // 시간 종료 체크
      if (state.currentSession.remainingTime === 0) {
        state.currentSession.status = 'COMPLETED';
        state.currentSession.completedAt = new Date().toISOString();
        state.isRunning = false;
        state.status = 'COMPLETED';
        
        // 다음 세션 모드 결정 및 세션 카운트 업데이트
        const upcomingMode = getNextMode(state.mode);

        if (upcomingMode === 'FOCUS') {
          // 휴식이 끝나고 집중으로 돌아올 때 세션 카운트 +1
          state.completedSessions += 1;
        }
        
        state.mode = upcomingMode;

        // 두 번째 세션 이후 완료 여부 확인
        if (state.completedSessions >= state.targetSessions && upcomingMode === 'FOCUS') {
          // 목표 세션을 모두 완료했다면 타이머를 완전히 정지시키고
          // 다음 사이클을 위해 currentSession 을 정리한다.
          state.status = 'IDLE';
          state.currentSession = null;
          state.isRunning = false;
          return;
        }

        // 새 세션 객체 생성하여 즉시 시작
        const duration = getDurationForMode(upcomingMode, state.settings);
        state.currentSession = {
          sessionId: `session_${Date.now()}`,
          mode: upcomingMode,
          duration,
          remainingTime: duration,
          timeEntries: [createTimeEntry(Date.now())],
          status: 'RUNNING',
          createdAt: new Date().toISOString(),
        };
        state.isRunning = true;
        state.status = 'RUNNING';
      }
    },

    // 모드 변경
    setMode: (state, action: PayloadAction<TimerMode>) => {
      if (!state.isRunning) {
        state.mode = action.payload;
        state.currentSession = null; // 새 모드로 변경 시 현재 세션 초기화
      }
    },

    // 목표 세션 수 설정
    setTargetSessions: (state, action: PayloadAction<number>) => {
      state.targetSessions = action.payload;
    },

    // 설정 업데이트 (로컬)
    updateSettings: (state, action: PayloadAction<Partial<TimerSettings> & { targetSessions?: number }>) => {
      // 분 단위 설정 값을 병합
      state.settings = { ...state.settings, ...action.payload };
      // targetSessions 값이 넘어오면 별도 상태에 반영
      if ((action.payload as any).targetSessions !== undefined) {
        state.targetSessions = (action.payload as any).targetSessions;
      }
      // 새 설정이 적용되면 기존 세션/진행 상태를 초기화하여 변경 사항을 즉시 반영한다.
      state.currentSession = null;
      state.completedSessions = 0;
      state.mode = 'FOCUS';
      state.status = 'IDLE';
      state.isRunning = false;
      state.lastTick = 0;
    },

    // 설정 모달 토글
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },

    // 알림 토글
    toggleNotification: (state) => {
      state.notificationEnabled = !state.notificationEnabled;
    },

    // 에러 클리어
    clearError: (state) => {
      state.error = null;
    },

    // 세션 초기화 (새 사이클 시작)
    resetSession: (state) => {
      state.currentSession = null;
      state.completedSessions = 0;
      state.currentCycle += 1;
      state.mode = 'FOCUS';
      state.isRunning = false;
      state.status = 'IDLE';
    },

    /*
    // 현재 세션에 노트 연결 – 현재 컴포넌트/페이지에서 호출되지 않아 주석 처리
    attachNoteToSession: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        state.currentSession.noteId = action.payload;
      }
    },

    // 현재 세션에 태그 추가 – 현재 호출처가 없어 주석 처리
    addTagToSession: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        const tags = state.currentSession.tags || [];
        if (!tags.includes(action.payload)) {
          state.currentSession.tags = [...tags, action.payload];
        }
      }
    },
    */
  },

  extraReducers: (builder) => {
    builder
      // 타이머 세션 시작 (API)
      .addCase(startTimerSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTimerSession.fulfilled, (state, action) => {
        state.loading = false;
        // API 응답을 현재 세션에 반영
        if (state.currentSession) {
          state.currentSession.sessionId = action.payload.sessionId;
        }
      })
      .addCase(startTimerSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '세션 시작에 실패했습니다.';
      })

      // 타이머 세션 완료 (API)
      .addCase(completeTimerSession.fulfilled, (state, action) => {
        // API 완료 처리
        if (state.currentSession && state.currentSession.sessionId === action.payload.sessionId) {
          state.currentSession = null;
        }
      })

      // 설정 저장 (API)
      .addCase(saveTimerSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })

      // 설정 로드 (API)
      .addCase(loadTimerSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })

      // 통계 로드 (API)
      .addCase(loadTimerStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadTimerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(loadTimerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '통계 로드에 실패했습니다.';
      });
  },
});

// ==========================================
// 7. 액션과 리듀서 내보내기
// ==========================================

export const {
  startTimer,
  pauseTimer,
  stopTimer,
  tick,
  setMode,
  setTargetSessions,
  updateSettings,
  toggleSettings,
  toggleNotification,
  clearError,
  resetSession,
} = timerSlice.actions;

export default timerSlice.reducer;

// ==========================================
// 8. Selector 함수들
// ==========================================

// 기본 selector들
export const selectCurrentSession = (state: RootState) => state.timer.currentSession;
export const selectTimerStatus = (state: RootState) => state.timer.status;
export const selectTimerMode = (state: RootState) => state.timer.mode;
export const selectIsRunning = (state: RootState) => state.timer.isRunning;
export const selectCompletedSessions = (state: RootState) => state.timer.completedSessions;
export const selectTargetSessions = (state: RootState) => state.timer.targetSessions;
export const selectTimerSettings = (state: RootState) => state.timer.settings;
export const selectTimerStats = (state: RootState) => state.timer.stats;
export const selectTimerLoading = (state: RootState) => state.timer.loading;
export const selectTimerError = (state: RootState) => state.timer.error;
export const selectShowSettings = (state: RootState) => state.timer.showSettings;

// 파생 상태 selector들 (memoized)
export const selectCurrentTime = createSelector(
  [(state: RootState) => state.timer.currentSession, (state: RootState) => state.timer.settings.focusTime],
  (session, focusTime) => {
    if (!session) {
      // 타이머가 정지 상태이면 기본 집중 시간 표시
      return { minutes: focusTime, seconds: 0 };
    }

    const totalSeconds = session.remainingTime;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return { minutes, seconds };
  }
);

export const selectProgress = (state: RootState) => {
  const session = state.timer.currentSession;
  if (!session) return 0;
  
  const elapsed = session.duration - session.remainingTime;
  return (elapsed / session.duration) * 100;
};

export const selectIsCompleted = (state: RootState) => {
  return state.timer.status === 'COMPLETED';
};

export const selectCanStart = (state: RootState) => {
  return !state.timer.isRunning && state.timer.status !== 'COMPLETED';
};

export const selectCanPause = (state: RootState) => {
  return state.timer.isRunning;
};

export const selectSessionProgress = createSelector(
  [
    (state: RootState) => state.timer.completedSessions,
    (state: RootState) => state.timer.targetSessions,
    (state: RootState) => state.timer.currentCycle,
  ],
  (completedSessions, targetSessions, currentCycle) => ({
    current: completedSessions,
    target: targetSessions,
    cycle: currentCycle,
  })
);

// 총 경과 시간 (현재 세션)
export const selectTotalElapsed = (state: RootState) => {
  const session = state.timer.currentSession;
  if (!session) return 0;
  
  const totalMs = getTotalElapsedMs(session.timeEntries);
  return Math.floor(totalMs / 1000);
};

// 모드별 설정 시간
export const selectModeSettings = (state: RootState) => {
  const settings = state.timer.settings;
  return {
    focus: settings.focusTime * 60,
    shortBreak: settings.shortBreakTime * 60,
    longBreak: settings.longBreakTime * 60,
  };
};

// 다음 세션 정보 (memoized)
export const selectNextSessionInfo = createSelector(
  [(state: RootState) => state.timer.mode, (state: RootState) => state.timer.settings],
  (mode, settings) => {
    const nextMode = getNextMode(mode);
    const duration = getDurationForMode(nextMode, settings);
    
    return {
      mode: nextMode,
      duration,
    };
  }
);
