import React, { useEffect, useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Container, Paper, Grid, Alert } from '@mui/material';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import { useResponsive } from '../../hooks/useResponsive';
import { useLocation, useNavigate } from 'react-router-dom';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Button from '../../components/ui/Button';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import Badge from '@mui/material/Badge';
import 'dayjs/locale/ko';
import { getTodayCardsCount, getWithin3DaysCardsCount, getOverdueCardsCount } from '../../api/studyApi';

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

function CustomDay(props: PickersDayProps<dayjs.Dayjs>) {
  const { day, outsideCurrentMonth, ...other } = props;
  const dateStr = day.format('YYYY-MM-DD');
  const isSunday = day.day() === 0;
  const isSaturday = day.day() === 6;
  const isHoliday = holidays.includes(dateStr);
  let color = undefined;
  if (isSunday || isSaturday || isHoliday) color = 'red';

  // 아이콘: 학습(🍅)이 출석(🌱)보다 우선
  let icon = null;
  if (!outsideCurrentMonth) {
    if (attendanceDays.includes(dateStr)) icon = '🌱';
    if (studyDays.includes(dateStr)) icon = '🍅';
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
}

const DashboardPage: React.FC = () => {
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();

  // 복습 일정 관리 API 연동
  const [todayCards, setTodayCards] = useState<number | null>(null);
  const [within3DaysCards, setWithin3DaysCards] = useState<number | null>(null);
  const [overdueCards, setOverdueCards] = useState<number | null>(null);

  useEffect(() => {
    getTodayCardsCount().then(setTodayCards);
    getWithin3DaysCardsCount().then(setWithin3DaysCards);
    getOverdueCardsCount().then(setOverdueCards);
  }, []);

  console.log('DashboardPage - isMobile:', isMobile, 'pathname:', location.pathname);

  return (
    <Container sx={{ pt: 2, pb: 10 }}>
      {location.state?.from === '/signup' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          회원가입이 완료되었습니다! Pomki에 오신 것을 환영합니다.
        </Alert>
      )}

      {/* 학습 목표 및 진행률 */}
      <Card cardVariant="default" sx={{ mb: 2 }}>
        <Typography variant="h3" gutterBottom>
          학습 목표 및 진행률
        </Typography>
        <ProgressBar value={75} showLabel label="일일 목표" />
        <Box sx={{ mt: 1, textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            75% 달성 (6/8시간)
          </Typography>
        </Box>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
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
                backgroundColor: 'success.lightest',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'success.light'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 40, 
                    backgroundColor: 'success.main',
                    borderRadius: 1
                  }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      오늘 학습해야할 카드
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {todayCards === null ? '...' : todayCards}
                </Typography>
              </Box>

              {/* 3일내 학습해야할 카드 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                backgroundColor: 'warning.lightest',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'warning.light'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 40, 
                    backgroundColor: 'warning.main',
                    borderRadius: 1
                  }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      3일내 학습해야할 카드
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {within3DaysCards === null ? '...' : within3DaysCards}
                </Typography>
              </Box>

              {/* 하루이상 지난 카드 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                backgroundColor: 'error.lightest',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'error.light'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 40, 
                    backgroundColor: 'error.main',
                    borderRadius: 1
                  }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      복습 미완료 or 하루이상 지난 카드
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {overdueCards === null ? '...' : overdueCards}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card cardVariant="default" sx={{ backgroundColor: 'background.paper', padding: 0 }}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="ko"
              localeText={{
                calendarWeekNumberHeaderText: '주',
                previousMonth: '이전 달',
                nextMonth: '다음 달',
                openPreviousView: '이전 보기',
                openNextView: '다음 보기',
                start: '시작',
                end: '끝',
                cancelButtonLabel: '취소',
                clearButtonLabel: '지우기',
                okButtonLabel: '확인',
                todayButtonLabel: '오늘',
              }}
            >
              <DateCalendar
                defaultValue={dayjs()}
                slots={{ day: CustomDay }}
                dayOfWeekFormatter={(date) => date.locale('ko').format('dd')}
              />
            </LocalizationProvider>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
