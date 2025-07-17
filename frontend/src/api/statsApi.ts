import api from './index';
import type { DashboardStats } from '../types/study';
import type { ApiResponse } from '../types/api';

/**
 * 메인 대시보드에 필요한 모든 통계를 한번에 조회합니다.
 */
export const getDashboardData = async (): Promise<DashboardStats> => {
  const response = await api.get<ApiResponse<any>>('/api/stats/dashboard');
  const raw = (response.data as ApiResponse<any>).data;

  // 새로운 백엔드 구조(todayStudy) ↔ 구 구조(studyTime) 매핑
  if (raw.todayStudy) {
    const {
      totalFocusMinutes = 0,
      goalMinutes = raw.todayStudy.goalMinutes ?? 60,
    } = raw.todayStudy;

    raw.studyTime = {
      todayStudyMinutes: totalFocusMinutes,
      dailyGoalMinutes: 60,
    };
  }

  // 과거 구조에서 studyTime 필드가 이미 올바른 경우 그대로 유지
  return raw as DashboardStats;
};

/**
 * 오늘 날짜로 출석을 기록합니다.
 * 하루에 한 번만 기록됩니다.
 */
export const recordAttendance = async (): Promise<any> => {
  const response = await api.post('/api/stats/attendance');
  return response.data;
};

/**
 * 누적된 학습 시간을 분 단위로 기록합니다.
 * @param studyMinutes 학습 시간(분)
 */
export const recordStudyTime = async (studyMinutes: number): Promise<any> => {
  const response = await api.post('/api/stats/study-time', { studyMinutes });
  return response.data;
}; 