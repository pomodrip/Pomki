import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TimerPhase = 'configuring' | 'running' | 'paused' | 'break';

interface TimerSettings {
  sessions: number;
  focusMinutes: number;
  breakMinutes: number;
}

interface TimerState {
  phase: TimerPhase;
  settings: TimerSettings;
  currentSession: number;
  remainingSeconds: number;
}

const initialState: TimerState = {
  phase: 'configuring',
  settings: {
    sessions: 4,
    focusMinutes: 25,
    breakMinutes: 5,
  },
  currentSession: 1,
  remainingSeconds: 25 * 60,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setSettings(state, action: PayloadAction<Partial<TimerSettings>>) {
      state.settings = { ...state.settings, ...action.payload };
      if (state.phase === 'configuring') {
        state.remainingSeconds = state.settings.focusMinutes * 60;
      }
    },
    startTimer(state) {
      state.phase = 'running';
      state.remainingSeconds = state.settings.focusMinutes * 60;
      state.currentSession = 1;
    },
    pauseTimer(state) {
      if (state.phase === 'running') {
        state.phase = 'paused';
      }
    },
    resumeTimer(state) {
      if (state.phase === 'paused') {
        state.phase = 'running';
      }
    },
    resetTimer(state) {
      state.phase = 'configuring';
      state.currentSession = 1;
      state.remainingSeconds = state.settings.focusMinutes * 60;
    },
    tick(state) {
      if (state.phase === 'running' || state.phase === 'break') {
        state.remainingSeconds -= 1;
      }
    },
    finishFocusSession(state) {
      state.phase = 'break';
      state.remainingSeconds = state.settings.breakMinutes * 60;
    },
    finishBreakSession(state) {
      if (state.currentSession < state.settings.sessions) {
        state.currentSession += 1;
        state.phase = 'running';
        state.remainingSeconds = state.settings.focusMinutes * 60;
      } else {
        // 모든 세션 완료
        state.phase = 'configuring';
        state.currentSession = 1;
        state.remainingSeconds = state.settings.focusMinutes * 60;
      }
    },
  },
});

export const {
  setSettings,
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  tick,
  finishFocusSession,
  finishBreakSession,
} = timerSlice.actions;

export default timerSlice.reducer;
