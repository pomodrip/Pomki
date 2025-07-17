import React, { lazy, Suspense } from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { Box } from '@mui/material';

// 로딩 플레이스홀더 컴포넌트
const IconPlaceholder: React.FC<SvgIconProps> = ({ fontSize = 'medium', ...props }) => {
  const getSize = () => {
    switch (fontSize) {
      case 'small': return 20;
      case 'large': return 35;
      case 'inherit': return '1em';
      default: return 24;
    }
  };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        width: getSize(),
        height: getSize(),
        backgroundColor: 'action.disabled',
        borderRadius: '2px',
        opacity: 0.3,
        ...props.sx,
      }}
    />
  );
};

// 아이콘 이름과 실제 컴포넌트 매핑
const iconImports: Record<string, () => Promise<{ default: React.ComponentType<SvgIconProps> }>> = {
  // 자주 사용되는 아이콘들
  Add: () => import('@mui/icons-material/Add'),
  Edit: () => import('@mui/icons-material/Edit'),
  Delete: () => import('@mui/icons-material/Delete'),
  Search: () => import('@mui/icons-material/Search'),
  Clear: () => import('@mui/icons-material/Clear'),
  Close: () => import('@mui/icons-material/Close'),
  
  // 네비게이션 아이콘들
  ArrowBack: () => import('@mui/icons-material/ArrowBack'),
  ArrowForward: () => import('@mui/icons-material/ArrowForward'),
  ArrowBackIosNew: () => import('@mui/icons-material/ArrowBackIosNew'),
  
  // 북마크 아이콘들
  Bookmark: () => import('@mui/icons-material/Bookmark'),
  BookmarkBorder: () => import('@mui/icons-material/BookmarkBorder'),
  
  // 기타 자주 사용되는 아이콘들
  FilterList: () => import('@mui/icons-material/FilterList'),
  Info: () => import('@mui/icons-material/Info'),
  Save: () => import('@mui/icons-material/Save'),
  Settings: () => import('@mui/icons-material/Settings'),
  
  // 미디어 컨트롤 아이콘들
  PlayArrow: () => import('@mui/icons-material/PlayArrow'),
  Pause: () => import('@mui/icons-material/Pause'),
  Stop: () => import('@mui/icons-material/Stop'),
  
  // 테마 아이콘들
  Brightness4: () => import('@mui/icons-material/Brightness4'),
  Brightness7: () => import('@mui/icons-material/Brightness7'),
  
  // 체크박스 아이콘들
  CheckBox: () => import('@mui/icons-material/CheckBox'),
  CheckBoxOutlineBlank: () => import('@mui/icons-material/CheckBoxOutlineBlank'),
  CheckCircle: () => import('@mui/icons-material/CheckCircle'),
  
  // 알림 및 상태 아이콘들
  Error: () => import('@mui/icons-material/Error'),
  Warning: () => import('@mui/icons-material/Warning'),
  NotificationsNone: () => import('@mui/icons-material/NotificationsNone'),
  
  // 확장/축소 아이콘들
  ExpandMore: () => import('@mui/icons-material/ExpandMore'),
  OpenInFull: () => import('@mui/icons-material/OpenInFull'),
  CloseFullscreen: () => import('@mui/icons-material/CloseFullscreen'),
  
  // 교육 관련 아이콘들
  School: () => import('@mui/icons-material/School'),
  Quiz: () => import('@mui/icons-material/Quiz'),
  EditNote: () => import('@mui/icons-material/EditNote'),
  AutoAwesome: () => import('@mui/icons-material/AutoAwesome'),
  
  // 기타
  ContentCopy: () => import('@mui/icons-material/ContentCopy'),
  Menu: () => import('@mui/icons-material/Menu'),
  ChevronRight: () => import('@mui/icons-material/ChevronRight'),
  Visibility: () => import('@mui/icons-material/Visibility'),
  VisibilityOff: () => import('@mui/icons-material/VisibilityOff'),
};

interface LazyIconProps extends SvgIconProps {
  name: keyof typeof iconImports;
  fallback?: React.ReactNode;
}

const LazyIcon: React.FC<LazyIconProps> = ({ name, fallback, ...iconProps }) => {
  const iconImport = iconImports[name];
  
  if (!iconImport) {
    console.warn(`LazyIcon: Icon "${name}" not found in iconImports`);
    return fallback || <IconPlaceholder {...iconProps} />;
  }

  const IconComponent = lazy(iconImport);

  return (
    <Suspense fallback={fallback || <IconPlaceholder {...iconProps} />}>
      <IconComponent {...iconProps} />
    </Suspense>
  );
};

export default LazyIcon; 