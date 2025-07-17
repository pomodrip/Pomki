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
  backgroundColor: theme.palette.primary.main, // 진한 파란색으로 변경
  color: theme.palette.primary.contrastText, // 흰색 텍스트로 변경
  borderRadius: '999px', // 29. Pill-shaped Border Radius
  border: `1px solid ${theme.palette.primary.main}`,
  fontSize: theme.typography.caption.fontSize, // 21. caption (12px)
  fontWeight: 400,
  '&:hover': {
    backgroundColor: theme.palette.primary.main, // hover 시에도 같은 색상 유지
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

// Outlined 태그 스타일 (카드 내부용 - 테두리만 있고 배경 없음)
const OutlinedTag = styled(Chip)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  borderRadius: '999px', // 29. Pill-shaped Border Radius
  border: `1px solid ${theme.palette.primary.main}`,
  fontSize: theme.typography.caption.fontSize, // 21. caption (12px)
  fontWeight: 400,
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
  variant?: 'filled' | 'outlined';
}

const Tag: React.FC<TagProps> = ({ selected = false, variant = 'filled', ...props }) => {
  // variant가 outlined이면 OutlinedTag 사용
  if (variant === 'outlined') {
    return <OutlinedTag {...props} />;
  }
  
  // variant가 filled이면 기존 로직 사용
  const Component = selected ? SelectedTag : UnselectedTag;
  
  return <Component {...props} />;
};

export default Tag;
