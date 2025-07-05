import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Container, styled, Paper, Chip } from '@mui/material';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import { useResponsive } from '../../hooks/useResponsive';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Button from '../../components/ui/Button';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import Badge from '@mui/material/Badge';
import 'dayjs/locale/ko';
import { getDashboardData, recordAttendance } from '../../api/statsApi';
import { checkTodayAttendance } from '../../api/analysisApi';
import type { DashboardStats } from '../../types/study';
import { useAppDispatch } from '../../hooks/useRedux';
import { showToast } from '../../store/slices/toastSlice';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

// 대한민국 법정 공휴일 예시 (2025년, 설날/추석 연휴 포함)
const holidays = [
  '2025-01-01', // 신정
  '2025-01-28', // 설날 연휴 시작
  '2025-01-29', // 설날
  '2025-01-30', // 설날 연휴 끝
  '2025-03-01', // 삼일절
  '2025-05-05', // 어린이날
  '2025-05-06', // 어린이날 대체공휴일 (월요일)
  '2025-05-12', // 부처님오신날
  '2025-06-06', // 현충일
  '2025-08-15', // 광복절
  '2025-10-03', // 개천절
  '2025-10-06', // 추석 연휴 시작
  '2025-10-07', // 추석
  '2025-10-08', // 추석 연휴 끝
  '2025-10-09', // 한글날
  '2025-12-25', // 성탄절
];

// 임시 출석/학습 현황 데이터 (실제 서비스에서는 API로 받아야 함)
const attendanceDays = [
  '2025-07-02', '2025-07-03', '2025-01-04',
  '2025-07-28', '2025-07-29', '2025-07-30', 
];
const studyDays = [
  '2025-07-04', '2025-07-05', // 학습 완료 예시
];

// 임시 학습 주기 데이터 (실제 서비스에서는 API로 받아야 함)
// const studyScheduleData = {
//   todayCards: 12, // 오늘 학습해야할 카드
//   within3DaysCards: 8, // 3일내 학습해야할 카드
//   overdueCards: 5, // 하루이상 지난 카드
// };

const DashboardPage: React.FC = () => {
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // DateCalendar에서 사용할 커스텀 Day 컴포넌트
  const CustomDay = (props: PickersDayProps<dayjs.Dayjs>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    // 백엔드 응답 구조 호환 처리
    const attendedDates = (
      // 1) 새로운 구조: attendance.attendedDates
      dashboardData?.attendance?.attendedDates ??
      // 2) 기존 구조: attendanceDates 루트 필드
      (dashboardData as any)?.attendanceDates ??
      []
    ) as string[];
    const dateStr = day.format('YYYY-MM-DD');
    const isSunday = day.day() === 0;
    const isSaturday = day.day() === 6;
    const isHoliday = holidays.includes(dateStr);
    let color = undefined;
    if (isSunday || isSaturday || isHoliday) color = 'red';

    let icon = null;
    if (!outsideCurrentMonth) {
      if (attendedDates.includes(dateStr)) icon = '🌱';
      // studyDays는 현재 사용되지 않음
    }

    return (
      <Badge
        overlap="circular"
        badgeContent={icon}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} sx={{ color }} />
      </Badge>
    );
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [data, attendanceStatus] = await Promise.all([
        getDashboardData(),
        checkTodayAttendance(),
      ]);
      setDashboardData(data);
      setHasAttendedToday(attendanceStatus.attended);
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
      dispatch(showToast({ message: '데이터를 불러오는 데 실패했습니다.', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchDashboardData();
    // 대시보드 실시간 갱신 이벤트 리스너 등록
    const refreshHandler = () => fetchDashboardData();
    window.addEventListener('refresh-dashboard', refreshHandler);

    const updateHandler = (e: any) => {
      const { totalMinutes, addedMinutes } = e.detail || {};
      setDashboardData(prev => {
        if (!prev) return prev;
        const current = prev.studyTime?.todayStudyMinutes ?? 0;
        const newTotal = totalMinutes ?? current + (addedMinutes || 0);
        return {
          ...prev,
          studyTime: {
            ...prev.studyTime,
            todayStudyMinutes: newTotal,
          },
        } as DashboardStats;
      });
    };
    window.addEventListener('update-focus-time', updateHandler);

    return () => {
      window.removeEventListener('refresh-dashboard', refreshHandler);
      window.removeEventListener('update-focus-time', updateHandler);
    };
  }, [fetchDashboardData]);

  const handleAttendance = async () => {
    try {
      await recordAttendance();
      dispatch(showToast({ message: '출석 체크 완료!', severity: 'success' }));
      await fetchDashboardData(); // 데이터 새로고침
    } catch (error) {
      console.error('출석 기록 실패:', error);
      dispatch(showToast({ message: '출석 처리에 실패했습니다. 이미 출석했을 수 있습니다.', severity: 'error' }));
    }
  };

  console.log('DashboardPage - isMobile:', isMobile, 'pathname:', location.pathname);

  const studyProgress = (dashboardData?.studyTime?.todayStudyMinutes && dashboardData?.studyTime?.dailyGoalMinutes)
    ? (dashboardData.studyTime.todayStudyMinutes / dashboardData.studyTime.dailyGoalMinutes) * 100
    : 0;

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
        대시보드
      </Typography>

      {/* 개발자 도구 - 개발 환경에서만 표시 */}
      {import.meta.env.DEV && (
        <Paper sx={{ p: 3, mb: 3, }} >
          <Typography variant="h2" gutterBottom>
            🔧 개발자 도구
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            API Fallback 시스템을 테스트해보세요!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/api-fallback')}
            >
              API Fallback 테스트
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/ad')}
            >
              광고 시스템 예제
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/study')}
            >
              📚 학습 페이지에서 확인
            </Button>
          </Box>
        </Paper>
      )}

      {/* 오늘의 학습, 최근 활동 - 세로 배치 */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 3,
        mb: 4
      }}>
        <Card cardVariant="default" sx={{ backgroundColor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3" gutterBottom>
              오늘의 학습 목표
            </Typography>
            <Chip label={`${dashboardData?.studyTime?.todayStudyMinutes ?? 0}분 / ${dashboardData?.studyTime?.dailyGoalMinutes ?? 60}분`} color="primary" />
          </Box>
          <ProgressBar
            value={studyProgress > 100 ? 100 : studyProgress}
            showLabel
            label="Focus Time"
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {Math.round(studyProgress)}% 달성
          </Typography>
        </Card>

        <Card cardVariant="default" sx={{ backgroundColor: 'background.paper' }}>
           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3">출석 체크</Typography>
            <Chip label={`연속 ${dashboardData?.attendance?.consecutiveDays ?? 0}일`} color="secondary" />
          </Box>
          <Button 
            onClick={handleAttendance} 
            disabled={hasAttendedToday}
            fullWidth
            variant="contained"
          >
            {hasAttendedToday ? '오늘 출석 완료! 🎉' : '출석하고 포인트 받기'}
          </Button>
        </Card>
      </Box>

      {/* 통계, 캘린더 - 가로 배치 */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: 3,
        mb: 4
      }}>
        <Card cardVariant="default">
          <Typography variant="h3" gutterBottom>
            복습 일정 관리
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 오늘 학습해야할 카드 */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 1,
              border: '1px solid #c8e6c9'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  backgroundColor: '#4caf50' 
                }} />
                <Typography variant="body1">오늘 복습할 카드</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {loading ? '...' : `${dashboardData?.review?.todayCount ?? 0}개`}
              </Typography>
            </Box>

            {/* 3일 내 학습해야할 카드 */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 1,
              border: '1px solid #ffcc02'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  backgroundColor: '#ff9800' 
                }} />
                <Typography variant="body1">3일 내 복습 카드</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                 {loading ? '...' : `${dashboardData?.review?.upcomingCount ?? 0}개`}
              </Typography>
            </Box>
            
            {/* 밀린 카드 */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 1,
              border: '1px solid #ffcdd2'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  backgroundColor: '#f44336' 
                }} />
                <Typography variant="body1">밀린 카드</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                 {loading ? '...' : `${dashboardData?.review?.overdueCount ?? 0}개`}
              </Typography>
            </Box>
          </Box>
        </Card>
        <Card cardVariant="default">
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
            <DateCalendar
              value={dayjs()}
              slots={{ day: CustomDay }}
              readOnly
            />
          </LocalizationProvider>
        </Card>
      </Box>
    </StyledContainer>
  );
};

export default DashboardPage;
