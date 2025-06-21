import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Text, Flex } from '../../components/ui';
import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
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
    <Flex>
      <Text variant="h1" gutterBottom sx={{ mb: 3 }}>
                 대시보드
      </Text>

             {/* 오늘의 학습, 최근 활동 - 세로 배치 */}
      <Flex sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 3,
        mb: 4
      }}>
        <Card cardVariant="default" sx={{ backgroundColor: 'background.paper' }}>
          <Text variant="h3" gutterBottom>
                         오늘의 학습
          </Text>
          <ProgressBar
            value={65}
            showLabel
            label="Focus Time"
            sx={{ mb: 2 }}
          />
          <Text variant="body2" color="text.secondary">
                         65% 달성
          </Text>

        </Card>

        <Card cardVariant="default" sx={{ backgroundColor: 'background.paper', padding: 0 }}>
          <Accordion elevation={0} sx={{ ml: 0 }}>
            <AccordionSummary
                             expandIcon={<span>▼</span>}
              aria-controls="recent-activity-content"
              id="recent-activity-header"
            >
              <Text variant="h3">최근 활동</Text>
            </AccordionSummary>
            <AccordionDetails>
              <Flex sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Flex sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Flex>
                    <Text variant="subtitle1" sx={{ fontWeight: 600 }}>
                      포모도로 세션 완료
                    </Text>
                    <Text variant="body2" color="text.secondary">
                      25분 집중 학습
                    </Text>
                  </Flex>
                  <Text variant="caption" color="text.secondary">
                    2시간 전
                  </Text>
                </Flex>

                <Flex sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Flex>
                    <Text variant="subtitle1" sx={{ fontWeight: 600 }}>
                      플래시카드 학습
                    </Text>
                    <Text variant="body2" color="text.secondary">
                      영어 단어 20개 복습
                    </Text>
                  </Flex>
                  <Text variant="caption" color="text.secondary">
                    4시간 전
                  </Text>
                </Flex>

                <Flex sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0'
                }}>
                  <Flex>
                    <Text variant="subtitle1" sx={{ fontWeight: 600 }}>
                      노트 작성
                    </Text>
                    <Text variant="body2" color="text.secondary">
                      "React 컴포넌트 설계" 노트 생성
                    </Text>
                  </Flex>
                  <Text variant="caption" color="text.secondary">
                    6시간 전
                  </Text>
                </Flex>
              </Flex>
            </AccordionDetails>
          </Accordion>
        </Card>
      </Flex>

      {/* 통계, 캘린더 - 가로 배치 */}
      <Flex sx={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: 3,
        mb: 4
      }}>
        <Card cardVariant="default">
          <Text variant="h3" gutterBottom>
            통계
          </Text>
          <Flex sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          </Flex>
        </Card>
        <Card cardVariant="default" sx={{ backgroundColor: 'background.paper', padding: 0 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar defaultValue={dayjs('2022-04-17')} />
          </LocalizationProvider>
        </Card>
      </Flex>
    </Flex>
  );
};

export default DashboardPage;
