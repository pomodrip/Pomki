import React from 'react';
import { Chip, ChipProps, styled } from '@mui/material';

// 선택되지 않은 태그 스타일
const UnselectedTag = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100], // 73. Learning Goal Tag (선택 안됨)
  color: theme.palette.text.primary,
  borderRadius: '999px', // 29. Pill-shaped Border Radius
  border: 'none',
  fontSize: theme.typography.caption.fontSize, // 21. caption (12px)
  fontWeight: 400,
  '&:hover': {
    backgroundColor: theme.palette.grey[300],
  },
  // Z Fold 5와 같은 작은 화면에서 태그 크기 조정
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.65rem',
    height: 18,
    '& .MuiChip-label': {
      paddingLeft: theme.spacing(0.4),
      paddingRight: theme.spacing(0.4),
    },
  },
}));

// 선택된 태그 스타일
const SelectedTag = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light, // 74. Learning Goal Tag (선택됨)
  color: theme.palette.primary.main,
  borderRadius: '999px', // 29. Pill-shaped Border Radius
  border: `1px solid ${theme.palette.primary.main}`,
  fontSize: theme.typography.caption.fontSize, // 21. caption (12px)
  fontWeight: 400,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
  // Z Fold 5와 같은 작은 화면에서 태그 크기 조정
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.65rem',
    height: 18,
    '& .MuiChip-label': {
      paddingLeft: theme.spacing(0.4),
      paddingRight: theme.spacing(0.4),
    },
  },
}));

export interface TagProps extends Omit<ChipProps, 'variant'> {
  selected?: boolean;
}

const Tag: React.FC<TagProps> = ({ selected = false, ...props }) => {
  const Component = selected ? SelectedTag : UnselectedTag;
  
  return <Component {...props} />;
};

export default Tag;
