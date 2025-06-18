import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import { useResponsive } from '../../hooks/useResponsive';
import { useLocation } from 'react-router-dom';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const DashboardPage: React.FC = () => {
  const { isMobile } = useResponsive();
  const location = useLocation();

  console.log('DashboardPage - isMobile:', isMobile, 'pathname:', location.pathname);

  return (
    <Box>
      <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
        대시보드
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
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

        <Card cardVariant="default">
          <Typography variant="h3" gutterBottom>
            통계
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          </Box>
        </Card>
        <Card cardVariant="default" sx={{ backgroundColor: 'background.paper', padding: 0 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar defaultValue={dayjs('2022-04-17')} />
          </LocalizationProvider>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;
