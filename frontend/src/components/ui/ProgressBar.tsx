import React from 'react';
import { LinearProgress, LinearProgressProps, styled, Box, Typography } from '@mui/material';

// 퀴즈용 진행률 바
const QuizProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: '8px', // 77. Quiz Progress Bar Height
  borderRadius: '4px', // 78. Quiz Progress Bar borderRadius
  backgroundColor: theme.palette.grey[300],
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
}));

// 대시보드용 진행률 바
const DashboardProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: '10px', // 95. Dashboard Progress Bar Height
  borderRadius: '5px',
  backgroundColor: theme.palette.grey[300],
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '5px',
  },
}));

export interface ProgressBarProps extends Omit<LinearProgressProps, 'variant'> {
  variant?: 'quiz' | 'dashboard';
  showLabel?: boolean;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  variant = 'dashboard', 
  showLabel = false, 
  label,
  value = 0,
  ...props 
}) => {
  const Component = variant === 'quiz' ? QuizProgressBar : DashboardProgressBar;

  return (
    <Box sx={{ width: '100%' }}>
      {showLabel && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      )}
      <Component variant="determinate" value={value} {...props} />
    </Box>
  );
};

export default ProgressBar;
