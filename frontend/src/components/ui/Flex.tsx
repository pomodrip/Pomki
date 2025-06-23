import React from 'react';
import { styled } from '@mui/material/styles';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number | string;
  
  // Component type
  component?: 'div' | 'main' | 'section' | 'article' | 'header' | 'footer' | 'aside' | 'nav';
  
  // Spacing props (theme.spacing 기반)
  p?: number | string;
  m?: number | string;
  px?: number | string;
  py?: number | string;
  mx?: number | string;
  my?: number | string;
  pt?: number | string;
  pb?: number | string;
  pl?: number | string;
  pr?: number | string;
  mt?: number | string;
  mb?: number | string;
  ml?: number | string;
  mr?: number | string;
  
  // Size props
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  
  // Flex props
  flex?: number | string;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  
  // Other props
  bg?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
  zIndex?: number;
  sx?: any;
}

const StyledFlex = styled('div')<FlexProps>(({ 
  theme, 
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  wrap = 'nowrap',
  gap,
  p, m, px, py, mx, my,
  pt, pb, pl, pr, mt, mb, ml, mr,
  width, height, minWidth, minHeight, maxWidth, maxHeight,
  flex, flexGrow, flexShrink, flexBasis,
  bg, position, top, bottom, left, right, zIndex, sx
}) => {
  const getSpacing = (value: number | string | undefined) => {
    if (value === undefined) return undefined;
    if (typeof value === 'number') return theme.spacing(value);
    return value;
  };

  return {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap,
    gap: getSpacing(gap),
    
    // Padding
    padding: getSpacing(p),
    paddingTop: getSpacing(pt || py),
    paddingBottom: getSpacing(pb || py),
    paddingLeft: getSpacing(pl || px),
    paddingRight: getSpacing(pr || px),
    
    // Margin
    margin: getSpacing(m),
    marginTop: getSpacing(mt || my),
    marginBottom: getSpacing(mb || my),
    marginLeft: getSpacing(ml || mx),
    marginRight: getSpacing(mr || mx),
    
    // Size
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    
    // Flex properties
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    
    // Background & Position
    backgroundColor: bg,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
    
    // Custom styles
    ...sx,
  };
});

const Flex: React.FC<FlexProps> = ({ children, component = 'div', ...props }) => {
  return <StyledFlex as={component} {...props}>{children}</StyledFlex>;
};

export default Flex; 