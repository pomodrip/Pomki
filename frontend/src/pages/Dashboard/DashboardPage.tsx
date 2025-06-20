import React from 'react';
import { Box, Typography } from '@mui/material';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import { useResponsive } from '../../hooks/useResponsive';
import { useLocation } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { isMobile } = useResponsive();
  const location = useLocation();

  console.log('DashboardPage - isMobile:', isMobile, 'pathname:', location.pathname);

  return (
    <Box>
      <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
        Pomki Project
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        애플리케이션이 정상적으로 실행되고있습니다.
      </Typography>

      {/* 디버깅 정보 표시 */}
      <Card cardVariant="outlined" sx={{ mb: 3, p: 2 }}>
        <Typography variant="h3" gutterBottom>
          현재 상태
        </Typography>
        <Typography variant="body2">
          • 현재 경로: {location.pathname}
        </Typography>
        <Typography variant="body2">
          • 모바일 여부: {isMobile ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2">
          • 하단 네비게이션이 보여야 함: {isMobile ? 'Yes' : 'No (현재 테스트로 항상 표시)'}
        </Typography>
      </Card>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: 3,
        mb: 4
      }}>
        <Card cardVariant="default">
          <Typography variant="h3" gutterBottom>
            Today's Progress
          </Typography>
          <ProgressBar 
            value={65} 
            showLabel 
            label="Focus Time"
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            65% of daily goal completed
          </Typography>
        </Card>

        <Card cardVariant="default">
          <Typography variant="h3" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="contained" fullWidth>
              Start Focus Session
            </Button>
            <Button variant="outlined" fullWidth>
              Create New Note
            </Button>
            <Button variant="text" fullWidth>
              View Statistics
            </Button>
          </Box>
        </Card>
      </Box>

      <Card cardVariant="outlined">
        <Typography variant="h3" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No recent activity to display. Start using Pomki to see your progress here!
        </Typography>
      </Card>

      {/* 디자인 시스템 테스트 섹션 */}
      {!isMobile && (
        <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="h2" gutterBottom>
            Design System Components
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2
          }}>
            <Card cardVariant="elevated">
              <Typography variant="h3">Elevated Card</Typography>
              <Typography variant="body2" color="text.secondary">
                This card uses the elevated variant with higher shadow.
              </Typography>
            </Card>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="contained" size="small">
                Contained
              </Button>
              <Button variant="outlined" size="small">
                Outlined
              </Button>
              <Button variant="text" size="small">
                Text Button
              </Button>
            </Box>
            
            <ProgressBar value={30} showLabel label="Sample Progress" />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
