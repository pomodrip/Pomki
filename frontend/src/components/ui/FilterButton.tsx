import React from 'react';
import { styled } from '@mui/material/styles';
import Button from './Button';

interface FilterButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  endIcon?: React.ReactNode;
  minWidth?: string;
  [key: string]: any;
}

const StyledFilterButton = styled(Button)<{ minWidth?: string }>(({ theme, minWidth = '100px' }) => ({
  borderRadius: theme.spacing(2),
  color: theme.palette.primary.main,
  borderColor: theme.palette.primary.main,
  minWidth: minWidth,
  whiteSpace: 'nowrap',
}));

const FilterButton: React.FC<FilterButtonProps> = ({ 
  children, 
  onClick, 
  endIcon, 
  minWidth = '100px',
  ...props 
}) => {
  return (
    <StyledFilterButton
      variant="outlined"
      onClick={onClick}
      endIcon={endIcon}
      minWidth={minWidth}
      {...props}
    >
      {children}
    </StyledFilterButton>
  );
};

export default FilterButton; 