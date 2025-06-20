import React from 'react';
import { CircularProgress, CircularProgressProps, Box, styled } from '@mui/material';

const SpinnerContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export interface SpinnerProps extends CircularProgressProps {
  fullScreen?: boolean;
  overlay?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  fullScreen = false, 
  overlay = false, 
  size = 40,
  ...props 
}) => {
  const spinner = <CircularProgress size={size} {...props} />;

  if (fullScreen) {
    return (
      <SpinnerContainer
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: overlay ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
          zIndex: 9999,
        }}
      >
        {spinner}
      </SpinnerContainer>
    );
  }

  return <SpinnerContainer>{spinner}</SpinnerContainer>;
};

export default Spinner;
