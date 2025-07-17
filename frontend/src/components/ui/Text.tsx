import React from 'react';
import { styled } from '@mui/material/styles';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'caption' | 'button';
  component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  color?: 'primary' | 'secondary' | 'text.primary' | 'text.secondary' | 'error.main' | 'success.main' | string;
  gutterBottom?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold' | 'lighter' | number;
  sx?: any;
}

const StyledText = styled('span')<TextProps>(({ theme, variant, color, gutterBottom, align, fontWeight, sx }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'h1':
        return theme.typography.h1;
      case 'h2':
        return theme.typography.h2;
      case 'h3':
        return theme.typography.h3;
      case 'h4':
        return theme.typography.h4;
      case 'h5':
        return theme.typography.h5;
      case 'h6':
        return theme.typography.h6;
      case 'body1':
        return theme.typography.body1;
      case 'body2':
        return theme.typography.body2;
      case 'subtitle1':
        return theme.typography.subtitle1;
      case 'caption':
        return theme.typography.caption;
      case 'button':
        return theme.typography.button;
      default:
        return theme.typography.body1;
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'text.primary':
        return theme.palette.text.primary;
      case 'text.secondary':
        return theme.palette.text.secondary;
      case 'error.main':
        return theme.palette.error.main;
      case 'success.main':
        return theme.palette.success.main;
      default:
        return color || 'inherit';
    }
  };

  return {
    ...getVariantStyles(),
    color: getColor(),
    fontWeight: fontWeight,
    marginBottom: gutterBottom ? '0.35em' : 0,
    textAlign: align,
    margin: 0,
    padding: 0,
    display: 'block',
    ...sx,
  };
});

const Text: React.FC<TextProps> = ({ 
  variant = 'body1', 
  component, 
  children,
  ...props 
}) => {
  const getComponent = () => {
    if (component) return component;
    
    switch (variant) {
      case 'h1':
        return 'h1';
      case 'h2':
        return 'h2';
      case 'h3':
        return 'h3';
      case 'h4':
        return 'h4';
      case 'h5':
        return 'h5';
      case 'h6':
        return 'h6';
      case 'body1':
      case 'body2':
        return 'p';
      case 'subtitle1':
      case 'caption':
      case 'button':
        return 'span';
      default:
        return 'p';
    }
  };

  return (
    <StyledText
      as={getComponent()}
      variant={variant}
      {...props}
    >
      {children}
    </StyledText>
  );
};

export default Text; 