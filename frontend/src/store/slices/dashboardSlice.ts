import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { getDashboardData, recordAttendance as recordAttendanceApi } from '../../api/statsApi';
import { checkTodayAttendance } from '../../api/analysisApi';
import type { DashboardStats } from '../../types/study';
import { showToast } from './toastSlice';
import { showErrorSnackbar } from './snackbarSlice';


// ==========================================
// 1. 상태 인터페이스
// ==========================================

interface DashboardState {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  hasAttendedToday: boolean;
}

// ==========================================
// 2. 초기 상태
// ==========================================

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
  hasAttendedToday: false,
};

// ==========================================
// 3. Async Thunk 액션들
// ==========================================

// 대시보드 데이터 조회
export const fetchDashboardData = createAsyncThunk<
  { data: DashboardStats; hasAttendedToday: boolean },
  void,
  { state: RootState; rejectValue: string }
>('dashboard/fetchDashboardData', async (_, { rejectWithValue }) => {
  try {
    // API 응답을 any 타입으로 받습니다.
    const [apiData, attendanceStatus]: [any, { attended: boolean }] = await Promise.all([
      getDashboardData(),
      checkTodayAttendance(),
    ]);

    // 프론트엔드 타입에 맞게 데이터 구조를 변환합니다.
    const transformedData: DashboardStats = {
      studyTime: {
        todayStudyMinutes: apiData.todayStudy.totalFocusMinutes,
        dailyGoalMinutes: apiData.todayStudy.goalMinutes,
      },
      attendance: {
        consecutiveDays: apiData.weeklyStats.currentStreak,
        attendedDates: apiData.attendanceDates,
      },
      review: {
        todayCount: apiData.reviewStats.todayReviewCards,
        upcomingCount: apiData.reviewStats.upcoming3DaysCards,
        overdueCount: apiData.reviewStats.overdueCards,
      },
    };

    return { data: transformedData, hasAttendedToday: attendanceStatus.attended };
  } catch (error: any) {
    return rejectWithValue(error?.message ?? '대시보드 데이터를 불러오지 못했습니다.');
  }
});

// 출석 기록 (완료 후 데이터 새로고침)
export const recordAttendanceThunk = createAsyncThunk<
  void,
  void,
  { state: RootState; rejectValue: string }
>('dashboard/recordAttendance', async (_, { dispatch, rejectWithValue }) => {
  try {
    await recordAttendanceApi();
    dispatch(showToast({ message: '출석 체크 완료!', severity: 'success' }));
    dispatch(fetchDashboardData());
  } catch (error: any) {
    dispatch(
      showToast({ message: '출석 처리에 실패했습니다. 이미 출석했을 수 있습니다.', severity: 'error' })
    );
    return rejectWithValue(error?.message ?? '출석 처리에 실패했습니다.');
  }
});

// ==========================================
// 4. Slice
// ==========================================

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // 학습 시간 갱신 (TimerPage → Dashboard)
    updateTodayStudyMinutes: (
      state,
      action: PayloadAction<{ addedMinutes?: number; totalMinutes?: number }>,
    ) => {
      if (!state.data) {
        // 아직 데이터가 없으면 초기화 후 설정
        const minutes = action.payload.totalMinutes ?? action.payload.addedMinutes ?? 0;
        state.data = {
          studyTime: {
            todayStudyMinutes: minutes,
            dailyGoalMinutes: 60,
          },
          attendance: {
            consecutiveDays: 0,
            attendedDates: [],
          },
          review: {
            todayCount: 0,
            upcomingCount: 0,
            overdueCount: 0,
          },
        } as DashboardStats;
        return;
      }

      if (action.payload.totalMinutes !== undefined) {
        state.data.studyTime.todayStudyMinutes = action.payload.totalMinutes;
      } else if (action.payload.addedMinutes !== undefined) {
        state.data.studyTime.todayStudyMinutes += action.payload.addedMinutes;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        if (state.data) {
          state.data.studyTime.dailyGoalMinutes = 60;
        }
        state.hasAttendedToday = action.payload.hasAttendedToday;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
        showErrorSnackbar({ message: action.payload ?? '대시보드 데이터를 불러오는데 실패했습니다.' });
      })
      .addCase(recordAttendanceThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

// ==========================================
// 5. 액션 & 셀렉터
// ==========================================

export const { updateTodayStudyMinutes } = dashboardSlice.actions;

export const selectDashboardData = (state: RootState) => state.dashboard.data;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectDashboardHasAttendedToday = (state: RootState) => state.dashboard.hasAttendedToday;

// ==========================================
// 6. 리듀서
// ==========================================

export default dashboardSlice.reducer; 