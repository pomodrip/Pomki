import type { AxiosResponse } from 'axios';
import api from './index';
import type { ApiResponse } from '../types/api';

// 타이머 세션 타입
export interface TimerSession {
  sessionId: string;
  type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  duration: number; // 분 단위
  startTime: string;
  endTime?: string;
  isCompleted: boolean;
  noteId?: string;
  tags?: string[];
}

// 타이머 세션 시작 요청
export interface StartTimerRequest {
  type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  duration: number;
  noteId?: string;
  tags?: string[];
}

// 타이머 설정
export interface TimerSettings {
  focusTime: number; // 분
  shortBreakTime: number; // 분
  longBreakTime: number; // 분
  longBreakInterval: number; // 몇 번의 포커스 후 긴 휴식
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationEnabled: boolean;
}

// 타이머 통계
export interface TimerStats {
  totalFocusTime: number; // 분
  totalSessions: number;
  completedSessions: number;
  averageSessionLength: number;
  streakDays: number;
  dailyGoal: number;
  dailyProgress: number;
  weeklyStats: Array<{
    date: string;
    focusTime: number;
    sessions: number;
  }>;
}

// 타이머 세션 시작
export const startTimerSession = async (data: StartTimerRequest): Promise<TimerSession> => {
  const response: AxiosResponse<TimerSession> = await api.post('/api/timer/sessions', data);
  return response.data;
};

// 타이머 세션 완료
export const completeTimerSession = async (sessionId: string): Promise<TimerSession> => {
  const response: AxiosResponse<TimerSession> = await api.put(`/api/timer/sessions/${sessionId}/complete`);
  return response.data;
};

// 타이머 세션 취소
export const cancelTimerSession = async (sessionId: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete(`/api/timer/sessions/${sessionId}`);
  return response.data;
};

// 현재 활성 세션 조회
export const getActiveSession = async (): Promise<TimerSession | null> => {
  const response: AxiosResponse<TimerSession | null> = await api.get('/api/timer/sessions/active');
  return response.data;
};

// 타이머 세션 히스토리 조회
export const getTimerHistory = async (params: {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  type?: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
} = {}): Promise<{
  content: TimerSession[];
  totalElements: number;
  totalPages: number;
}> => {
  const response = await api.get('/api/timer/sessions/history', { params });
  return response.data;
};

// 타이머 설정 조회
export const getTimerSettings = async (): Promise<TimerSettings> => {
  const response: AxiosResponse<TimerSettings> = await api.get('/api/timer/settings');
  return response.data;
};

// 타이머 설정 업데이트
export const updateTimerSettings = async (settings: Partial<TimerSettings>): Promise<TimerSettings> => {
  const response: AxiosResponse<TimerSettings> = await api.put('/api/timer/settings', settings);
  return response.data;
};

// 타이머 통계 조회
export const getTimerStats = async (period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<TimerStats> => {
  const response: AxiosResponse<TimerStats> = await api.get('/api/timer/stats', { params: { period } });
  return response.data;
};

// 일일 목표 설정
export const setDailyGoal = async (goalMinutes: number): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.put('/api/timer/daily-goal', { goalMinutes });
  return response.data;
};
