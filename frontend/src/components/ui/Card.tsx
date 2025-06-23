import React from 'react';
import { Card as MuiCard, CardProps, styled } from '@mui/material';

// 48-53번 디자인 가이드 적용
const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius, // 28. Global Border Radius
  backgroundColor: theme.palette.background.paper, // 48. Card Background
  boxShadow: theme.shadows[1], // 49. Card Shadow
  border: `1px solid ${theme.palette.divider}`, // 50. Card Border
  padding: theme.spacing(2), // 51. Card Padding
  margin: `${theme.spacing(1)} 0`, // 52. Card Margin
  

  
  '&:last-child': {
    marginBottom: 0,
  },
  
  '&:first-of-type': {
    marginTop: 0,
  },
}));

interface CustomCardProps extends Omit<CardProps, 'variant'> {
  cardVariant?: 'default' | 'outlined' | 'elevated';
}

const Card: React.FC<CustomCardProps> = ({ cardVariant = 'default', children, ...props }) => {
  const muiVariant = cardVariant === 'outlined' ? 'outlined' : 'elevation';
  const elevation = cardVariant === 'elevated' ? 3 : 1;

  return (
    <StyledCard 
      variant={muiVariant}
      elevation={muiVariant === 'elevation' ? elevation : 0}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;
