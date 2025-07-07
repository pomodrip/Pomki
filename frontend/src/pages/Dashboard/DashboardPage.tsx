import React, { useEffect, useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Container, styled, Paper } from '@mui/material';
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
import { getTodayCardsCount, getWithin3DaysCardsCount, getOverdueCardsCount } from '../../api/studyApi';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(10),
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
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
    <StyledContainer maxWidth="md">
      <HeaderBox>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
      </HeaderBox>

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
          <Typography variant="h3" gutterBottom>
            오늘의 학습
          </Typography>
          <ProgressBar
            value={65}
            showLabel
            label="Focus Time"
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            65% 달성
          </Typography>

        </Card>

        <Card cardVariant="default" sx={{ backgroundColor: 'background.paper', padding: 0 }}>
          <Accordion elevation={0} sx={{ ml: 0 }}>
            <AccordionSummary
              expandIcon={<span>▼</span>}
              aria-controls="recent-activity-content"
              id="recent-activity-header"
            >
              <Typography variant="h3">최근 활동</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      포모도로 세션 완료
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      25분 집중 학습
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    2시간 전
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      플래시카드 학습
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      영어 단어 20개 복습
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    4시간 전
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0'
                }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      노트 작성
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      "React 컴포넌트 설계" 노트 생성
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    6시간 전
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
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
                  width: 12, 
                  height: 40, 
                  backgroundColor: '#4caf50',
                  borderRadius: 1
                }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {/* 오늘 복습 */}
                    오늘 학습해야할 카드
                  </Typography>
                  {/* <Typography variant="caption" color="text.secondary">
                    오늘 학습해야할 카드
                  </Typography> */}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {todayCards === null ? '...' : todayCards}
              </Typography>
            </Box>

            {/* 3일내 학습해야할 카드 */}
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
                  width: 12, 
                  height: 40, 
                  backgroundColor: '#ff9800',
                  borderRadius: 1
                }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {/* 3일 이내 복습 */}
                    3일내 학습해야할 카드
                  </Typography>
                  {/* <Typography variant="caption" color="text.secondary">
                    3일내 학습해야할 카드
                  </Typography> */}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {within3DaysCards === null ? '...' : within3DaysCards}
              </Typography>
            </Box>

            {/* 하루이상 지난 카드 */}
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
                  width: 12, 
                  height: 40, 
                  backgroundColor: '#f44336',
                  borderRadius: 1
                }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    복습 미완료 or 하루이상 지난 카드
                  </Typography>
                  {/* <Typography variant="caption" color="text.secondary">
                    복습 미완료 or 하루이상 지난 카드
                  </Typography> */}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                {overdueCards === null ? '...' : overdueCards}
              </Typography>
            </Box>
          </Box>
        </Card>
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
      </Box>
    </StyledContainer>
  );
};

export default DashboardPage;
