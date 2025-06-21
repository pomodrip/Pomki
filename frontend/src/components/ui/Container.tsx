import React from 'react';
import { styled } from '@mui/material/styles';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false | number | string;
  fixed?: boolean;
  disableGutters?: boolean;
  sx?: any;
}

const StyledContainer = styled('div')<ContainerProps>(({ 
  theme, 
  maxWidth = 'lg',
  fixed,
  disableGutters,
  sx
}) => {
  const getMaxWidth = () => {
    if (maxWidth === false) return '100%';
    if (typeof maxWidth === 'number') return `${maxWidth}px`;
    if (typeof maxWidth === 'string' && !['xs', 'sm', 'md', 'lg', 'xl'].includes(maxWidth)) {
      return maxWidth;
    }
    
    // Breakpoint values
    const breakpointValues = {
      xs: 444,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    };
    
    return `${breakpointValues[maxWidth as keyof typeof breakpointValues]}px`;
  };

  return {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: disableGutters ? 0 : theme.spacing(2),
    paddingRight: disableGutters ? 0 : theme.spacing(2),
    maxWidth: getMaxWidth(),
    
    // Responsive behavior
    [theme.breakpoints.up('sm')]: {
      paddingLeft: disableGutters ? 0 : theme.spacing(3),
      paddingRight: disableGutters ? 0 : theme.spacing(3),
    },
    
    // Custom styles
    ...sx,
  };
});

const Container: React.FC<ContainerProps> = ({ children, ...props }) => {
  return <StyledContainer {...props}>{children}</StyledContainer>;
};

export default Container; 