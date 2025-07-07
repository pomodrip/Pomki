import api from './index';

// 종합 프로필 통계
export interface MemberSummary {
  level: number;
  totalStudyDays: number;
  consecutiveAttendanceDays: number;
  // 추가적인 요약 정보
}

// 총 누적 학습 시간
export interface TotalStudyTime {
  totalMinutes: number;
  totalHours: number;
}

// 오늘 출석 여부
export interface TodayAttendance {
  attended: boolean;
}

/**
 * 사용자의 종합 프로필 통계를 조회합니다.
 */
export const getMemberSummary = async (): Promise<MemberSummary> => {
  const response = await api.get<MemberSummary>('/api/analysis/member/summary');
  return response.data;
};

/**
 * 사용자의 전체 누적 학습 시간을 조회합니다.
 */
export const getTotalStudyTime = async (): Promise<TotalStudyTime> => {
  const response = await api.get<TotalStudyTime>('/api/analysis/member/study-time/total');
  return response.data;
};

/**
 * 오늘 출석했는지 여부를 간단히 확인합니다.
 */
export const checkTodayAttendance = async (): Promise<TodayAttendance> => {
  const response = await api.get<TodayAttendance>('/api/analysis/member/attendance/today');
  return response.data;
}; 