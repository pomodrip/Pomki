import React from 'react';
import { CircularProgress as MuiCircularProgress, CircularProgressProps, styled } from '@mui/material';

export interface CustomCircularProgressProps extends CircularProgressProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'data-testid'?: string;
}

const StyledCircularProgress = styled(MuiCircularProgress)<CustomCircularProgressProps>(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const CircularProgress: React.FC<CustomCircularProgressProps> = ({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'data-testid': dataTestId,
  variant = 'indeterminate',
  ...props
}) => {
  // 접근성을 위한 기본 aria-label 제공
  const defaultAriaLabel = ariaLabel || ariaLabelledBy ? undefined : '로딩 중';

  return (
    <StyledCircularProgress
      variant={variant}
      aria-label={ariaLabel || defaultAriaLabel}
      aria-labelledby={ariaLabelledBy}
      data-testid={dataTestId}
      {...props}
    />
  );
};

export default CircularProgress;