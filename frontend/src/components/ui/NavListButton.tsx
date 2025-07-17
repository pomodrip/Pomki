import React from 'react';
import { Typography, SxProps, styled } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface NavListButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  sx?: SxProps;
}

const StyledNavListButton = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  width: '100%',
  marginBottom: theme.spacing(2),
  transition: 'background 0.2s',
}));

const NavListButton: React.FC<NavListButtonProps> = ({ children, onClick, icon, sx }) => (
  <StyledNavListButton onClick={onClick} sx={sx}>
    <Typography variant="body1">{children}</Typography>
    {icon ?? <ChevronRightIcon />}
  </StyledNavListButton>
);

export default NavListButton; 