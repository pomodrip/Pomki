import React, { lazy, Suspense } from 'react';
import { Box, styled } from '@mui/material';
import CircularProgress from './CircularProgress';
import { DateCalendarProps } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

// DateCalendar를 동적으로 로드
const DateCalendar = lazy(() => 
  import('@mui/x-date-pickers/DateCalendar').then(module => ({ 
    default: module.DateCalendar 
  }))
);

// 로딩 컴포넌트
const CalendarLoadingFallback = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '320px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

interface LazyDateCalendarProps extends DateCalendarProps<dayjs.Dayjs> {
  loadingHeight?: string | number;
  fallbackComponent?: React.ReactNode;
}

const LazyDateCalendar: React.FC<LazyDateCalendarProps> = ({
  loadingHeight = '320px',
  fallbackComponent,
  ...calendarProps
}) => {
  const LoadingComponent = fallbackComponent || (
    <CalendarLoadingFallback sx={{ minHeight: loadingHeight }}>
      <CircularProgress size={40} />
    </CalendarLoadingFallback>
  );

  return (
    <Suspense fallback={LoadingComponent}>
      <DateCalendar {...calendarProps} />
    </Suspense>
  );
};

export default LazyDateCalendar; 