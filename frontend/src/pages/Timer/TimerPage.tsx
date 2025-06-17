import React from 'react';
import { Box, Typography } from '@mui/material';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useLocation } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';

const TimerPage: React.FC = () => {
  const location = useLocation();
  const { isMobile } = useResponsive();

  console.log('TimerPage - isMobile:', isMobile, 'pathname:', location.pathname);

  return (
    <Box>
      <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
        Focus Timer
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        포모도로 타이머와 집중 세션을 관리하세요.
      </Typography>

      <Card cardVariant="default" sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h2" gutterBottom>
          25:00
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Focus Session Ready
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained">
            Start
          </Button>
          <Button variant="outlined">
            Reset
          </Button>
        </Box>
      </Card>

      <Card cardVariant="outlined" sx={{ mt: 3 }}>
        <Typography variant="h3" gutterBottom>
          Timer Stats
        </Typography>
        <Typography variant="body2" color="text.secondary">
          타이머 통계와 히스토리가 여기에 표시됩니다.
        </Typography>
      </Card>
    </Box>
  );
};

export default TimerPage;
