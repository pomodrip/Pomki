import React, { lazy, Suspense } from 'react';
import { Box, styled } from '@mui/material';
import CircularProgress from './CircularProgress';

// ReactQuill을 동적으로 로드
const ReactQuill = lazy(() => import('react-quill'));

// ReactQuill 스타일시트도 동적으로 로드
const loadQuillStyles = () => {
  if (typeof window !== 'undefined') {
    import('react-quill/dist/quill.snow.css');
  }
};

// 로딩 컴포넌트
const QuillLoadingFallback = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

// LazyReactQuill Props 타입 정의 (any를 사용하여 타입 오류 방지)
interface LazyReactQuillProps {
  value?: string;
  onChange?: (content: string, delta?: any, source?: any, editor?: any) => void;
  placeholder?: string;
  modules?: any;
  formats?: string[];
  theme?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  tabIndex?: number;
  bounds?: string | HTMLElement;
  scrollingContainer?: string | HTMLElement;
  loadingHeight?: string | number;
  fallbackComponent?: React.ReactNode;
  [key: string]: any; // 추가 props 허용
}

const LazyReactQuill: React.FC<LazyReactQuillProps> = ({
  loadingHeight = '200px',
  fallbackComponent,
  ...quillProps
}) => {
  // 컴포넌트가 마운트될 때 스타일시트 로드
  React.useEffect(() => {
    loadQuillStyles();
  }, []);

  const LoadingComponent = fallbackComponent || (
    <QuillLoadingFallback sx={{ minHeight: loadingHeight }}>
      <CircularProgress size={40} />
    </QuillLoadingFallback>
  );

  return (
    <Suspense fallback={LoadingComponent}>
      <ReactQuill {...(quillProps as any)} />
    </Suspense>
  );
};

export default LazyReactQuill; 