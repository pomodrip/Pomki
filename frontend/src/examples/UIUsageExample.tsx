import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useUI, useTheme, useNotifications, useResponsiveUI } from '../hooks/useUI';

/**
 * 🎨 UI Slice 사용 예제 컴포넌트
 * 
 * uiSlice의 모든 기능을 시연하는 예제입니다.
 * 실제 프로젝트에서는 이런 식으로 사용하시면 됩니다.
 */
const UIUsageExample: React.FC = () => {
  // 🎨 테마 관리 예제
  const ThemeExample = () => {
    const { theme, toggleTheme, isDark, isLight } = useTheme();

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎨 테마 관리
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>현재 테마: {theme}</Typography>
          <Chip 
            label={isDark ? 'Dark' : 'Light'} 
            color={isDark ? 'secondary' : 'primary'} 
          />
          <Button variant="outlined" onClick={toggleTheme}>
            테마 변경
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          상태: isDark={isDark.toString()}, isLight={isLight.toString()}
        </Typography>
      </Paper>
    );
  };

  // 🔔 알림 시스템 예제
  const NotificationExample = () => {
    const { 
      notifications, 
      count, 
      success, 
      error, 
      warning, 
      info,
      clear 
    } = useNotifications();

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔔 알림 시스템 ({count}개)
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button 
            variant="contained" 
            color="success" 
            size="small"
            onClick={() => success('성공!', '작업이 완료되었습니다.')}
          >
            성공 알림
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            size="small"
            onClick={() => error('오류!', '문제가 발생했습니다.')}
          >
            에러 알림
          </Button>
          <Button 
            variant="contained" 
            color="warning" 
            size="small"
            onClick={() => warning('경고!', '주의가 필요합니다.')}
          >
            경고 알림
          </Button>
          <Button 
            variant="contained" 
            color="info" 
            size="small"
            onClick={() => info('정보', '새로운 업데이트가 있습니다.')}
          >
            정보 알림
          </Button>
          <Button variant="outlined" size="small" onClick={clear}>
            모두 지우기
          </Button>
        </Stack>

        {notifications.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              현재 알림들:
            </Typography>
            {notifications.slice(0, 3).map((notification) => (
              <Alert 
                key={notification.id} 
                severity={notification.type} 
                sx={{ mb: 1 }}
              >
                <strong>{notification.title}</strong>
                {notification.message && `: ${notification.message}`}
              </Alert>
            ))}
          </Box>
        )}
      </Paper>
    );
  };

  // 📱 반응형 상태 예제
  const ResponsiveExample = () => {
    const { 
      isMobile, 
      screenSize, 
      isXs, 
      isSm, 
      isMd, 
      isLg, 
      isXl 
    } = useResponsiveUI();

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📱 반응형 상태
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={`모바일: ${isMobile ? 'Yes' : 'No'}`} 
            color={isMobile ? 'primary' : 'default'}
          />
          <Chip 
            label={`화면 크기: ${screenSize}`} 
            color="secondary"
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          브레이크포인트: XS={isXs.toString()}, SM={isSm.toString()}, MD={isMd.toString()}, LG={isLg.toString()}, XL={isXl.toString()}
        </Typography>
      </Paper>
    );
  };

  // 🎛️ 전체 UI 상태 예제
  const FullUIExample = () => {
    const {
      sidebarOpen,
      bottomNavVisible,
      globalLoading,
      toggleSidebarState,
      toggleBottomNavigation,
      showGlobalLoading,
      hideGlobalLoading,
    } = useUI();

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🎛️ UI 컨트롤
        </Typography>
        
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch 
                checked={sidebarOpen} 
                onChange={toggleSidebarState}
              />
            }
            label="사이드바 열기"
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={bottomNavVisible} 
                onChange={toggleBottomNavigation}
              />
            }
            label="바텀 네비게이션 표시"
          />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => showGlobalLoading('로딩 중...')}
              disabled={globalLoading}
            >
              전역 로딩 시작
            </Button>
            <Button
              variant="outlined"
              onClick={hideGlobalLoading}
              disabled={!globalLoading}
            >
              전역 로딩 종료
            </Button>
            {globalLoading && <CircularProgress size={20} />}
          </Box>
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🎨 UI Slice 사용 예제
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        이 예제는 uiSlice의 모든 기능을 시연합니다. 
        각 섹션의 버튼들을 클릭해보세요!
      </Typography>

      <ThemeExample />
      <NotificationExample />
      <ResponsiveExample />
      <FullUIExample />

      <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          💡 사용법 팁
        </Typography>
        <Typography variant="body2" component="div">
          <strong>기본 사용:</strong>
          <pre style={{ fontSize: '12px', margin: '8px 0' }}>
{`import { useUI } from '../hooks/useUI';

const MyComponent = () => {
  const { theme, showSuccess, isMobile } = useUI();
  
  return (
    <div>
      <button onClick={() => showSuccess('완료!')}>
        알림 보내기
      </button>
    </div>
  );
};`}
          </pre>
          
          <strong>특화된 훅 사용:</strong>
          <pre style={{ fontSize: '12px', margin: '8px 0' }}>
{`import { useTheme, useNotifications } from '../hooks/useUI';

// 테마만 필요한 경우
const { theme, toggleTheme } = useTheme();

// 알림만 필요한 경우  
const { success, error } = useNotifications();`}
          </pre>
        </Typography>
      </Paper>
    </Box>
  );
};

export default UIUsageExample; 