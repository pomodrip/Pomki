import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Phone as MobileIcon,
  Computer as DesktopIcon,
} from '@mui/icons-material';
import { useUI, useTheme, useNotifications, useResponsiveUI } from '../hooks/useUI';

/**
 * 🎨 확장된 UI 시스템 사용 예제 
 * 
 * 새로운 기능들:
 * - 테마 프리셋 선택
 * - 커스텀 알림 (액션 버튼 포함)
 * - 접근성 설정
 * - 알림 설정
 * - 로딩 스택 관리
 */
const UIUsageExample: React.FC = () => {
  const { 
    ui, 
    notificationSettings,
    showGlobalLoading, 
    hideGlobalLoading,
    processQueue,
  } = useUI();
  const { 
    toggleTheme, 
    isDark, 
  } = useTheme();
  const { 
    count, 
    success, 
    error, 
    warning, 
    info, 
    notify, 
    clear 
  } = useNotifications();
  const { 
    isMobile, 
    screenSize, 
    isXs, 
    isSm, 
    isMd, 
    isLg, 
    isXl 
  } = useResponsiveUI();

  const [customTitle, setCustomTitle] = useState('커스텀 알림');
  const [customMessage, setCustomMessage] = useState('이것은 커스텀 메시지입니다.');
  const [loadingText, setLoadingText] = useState('로딩 중...');

  // 1. 테마 관리 예제
  const handleThemePresetChange = (presetId: string) => {
    success('테마 변경', `${presetId} 테마가 적용되었습니다.`);
  };

  // 2. 확장된 알림 예제
  const showCustomNotification = () => {
    notify({
      type: 'info',
      title: customTitle,
      message: customMessage,
      duration: 6000,
      actions: [
        {
          label: '확인',
          action: () => success('확인됨', '알림을 확인했습니다.'),
          variant: 'contained',
          color: 'primary',
        },
        {
          label: '더보기',
          action: () => info('더보기', '추가 정보를 표시합니다.'),
          variant: 'outlined',
          color: 'secondary',
        },
      ],
    });
  };

  const showPersistentNotification = () => {
    notify({
      type: 'warning',
      title: '중요한 알림',
      message: '이 알림은 지속됩니다.',
      duration: 0, // 수동으로 닫아야 함
      persist: true,
      actions: [
        {
          label: '처리',
          action: () => {
            success('처리 완료', '작업이 처리되었습니다.');
          },
          variant: 'contained',
          color: 'warning',
        },
      ],
    });
  };

  const showMultipleNotifications = () => {
    const types = ['success', 'error', 'warning', 'info'] as const;
    
    types.forEach((type, index) => {
      setTimeout(() => {
        notify({
          type,
          title: `${type.toUpperCase()} 알림 ${index + 1}`,
          message: `이것은 ${type} 타입의 알림입니다.`,
          duration: 4000 + (index * 1000),
        });
      }, index * 200);
    });
  };

  // 3. 로딩 스택 테스트
  const testLoadingStack = () => {
    showGlobalLoading('첫 번째 작업 중...');
    
    setTimeout(() => {
      showGlobalLoading('두 번째 작업 중...');
    }, 1000);
    
    setTimeout(() => {
      showGlobalLoading('세 번째 작업 중...');
    }, 2000);
    
    setTimeout(() => {
      hideGlobalLoading();
    }, 3000);
    
    setTimeout(() => {
      hideGlobalLoading();
    }, 4000);
    
    setTimeout(() => {
      hideGlobalLoading();
      success('완료', '모든 작업이 완료되었습니다.');
    }, 5000);
  };

  const themePresets = [
    { id: 'pomki-default', name: 'Pomki 기본', color: '#2563EB' },
    { id: 'forest', name: '포레스트', color: '#059669' },
    { id: 'sunset', name: '선셋', color: '#DC2626' },
    { id: 'ocean', name: '오션', color: '#0EA5E9' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        🎨 확장된 UI 시스템 예제
      </Typography>
      
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        새로운 테마 프리셋, 알림 시스템, 접근성 기능들을 체험해보세요
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 상단 섹션 */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3 
        }}>
          {/* 현재 상태 표시 */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 현재 UI 상태
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    테마: <Chip label={isDark ? '다크 모드' : '라이트 모드'} size="small" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    화면 크기: <Chip label={screenSize.toUpperCase()} size="small" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    기기: <Chip 
                      icon={isMobile ? <MobileIcon /> : <DesktopIcon />}
                      label={isMobile ? '모바일' : '데스크톱'} 
                      size="small" 
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    알림 수: <Chip label={count} color="primary" size="small" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    로딩 중: <Chip 
                      label={ui.globalLoading ? '예' : '아니오'} 
                      color={ui.globalLoading ? 'warning' : 'success'} 
                      size="small" 
                    />
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    화면 크기: {isXs && 'XS'} {isSm && 'SM'} {isMd && 'MD'} {isLg && 'LG'} {isXl && 'XL'}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Box>

          {/* 테마 관리 */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PaletteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  테마 관리
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={toggleTheme}
                    startIcon={isDark ? <LightModeIcon /> : <DarkModeIcon />}
                    fullWidth
                  >
                    {isDark ? '라이트 모드로 변경' : '다크 모드로 변경'}
                  </Button>

                  <Divider>테마 프리셋</Divider>

                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 1 
                  }}>
                    {themePresets.map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outlined"
                        onClick={() => handleThemePresetChange(preset.id)}
                        sx={{
                          bgcolor: preset.color,
                          color: 'white',
                          '&:hover': {
                            bgcolor: preset.color,
                            opacity: 0.8,
                          },
                        }}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* 확장된 알림 시스템 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              확장된 알림 시스템
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2 
            }}>
              {/* 기본 알림 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>기본 알림</Typography>
                <Stack spacing={1}>
                  <Button variant="contained" color="success" onClick={() => success('성공!', '작업이 성공했습니다.')}>
                    성공 알림
                  </Button>
                  <Button variant="contained" color="error" onClick={() => error('오류!', '문제가 발생했습니다.')}>
                    오류 알림
                  </Button>
                  <Button variant="contained" color="warning" onClick={() => warning('경고!', '주의가 필요합니다.')}>
                    경고 알림
                  </Button>
                  <Button variant="contained" color="info" onClick={() => info('정보', '유용한 정보입니다.')}>
                    정보 알림
                  </Button>
                </Stack>
              </Box>

              {/* 고급 알림 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>고급 알림</Typography>
                <Stack spacing={1}>
                  <Button variant="outlined" onClick={showMultipleNotifications}>
                    여러 알림 표시
                  </Button>
                  <Button variant="outlined" onClick={showPersistentNotification}>
                    지속적 알림
                  </Button>
                  <Button variant="outlined" color="error" onClick={clear}>
                    모든 알림 지우기
                  </Button>
                  <Button variant="outlined" onClick={processQueue}>
                    큐 처리
                  </Button>
                </Stack>
              </Box>

              {/* 커스텀 알림 */}
              <Box sx={{ flex: 2 }}>
                <Typography variant="subtitle2" gutterBottom>커스텀 알림</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="알림 제목"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="알림 메시지"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <Button variant="contained" onClick={showCustomNotification}>
                    액션 버튼이 있는 알림 표시
                  </Button>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 하단 섹션 */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3 
        }}>
          {/* 로딩 관리 */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  로딩 관리
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    label="로딩 텍스트"
                    value={loadingText}
                    onChange={(e) => setLoadingText(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      onClick={() => showGlobalLoading(loadingText)}
                    >
                      로딩 시작
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => hideGlobalLoading()}
                    >
                      로딩 중지
                    </Button>
                  </Box>

                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={testLoadingStack}
                  >
                    로딩 스택 테스트
                  </Button>

                  {ui.loadingStack && ui.loadingStack.length > 0 && (
                    <Alert severity="info">
                      <Typography variant="body2">
                        로딩 스택: {ui.loadingStack.join(' → ')}
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* 알림 설정 */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  알림 설정
                </Typography>

                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={notificationSettings.enabled} />}
                    label="알림 활성화"
                  />
                  
                  <FormControlLabel
                    control={<Switch checked={notificationSettings.sound} />}
                    label="알림 소리"
                  />

                  <FormControl size="small" fullWidth>
                    <InputLabel>알림 위치</InputLabel>
                    <Select value={notificationSettings.position} label="알림 위치">
                      <MenuItem value="top-right">우상단</MenuItem>
                      <MenuItem value="top-left">좌상단</MenuItem>
                      <MenuItem value="bottom-right">우하단</MenuItem>
                      <MenuItem value="bottom-left">좌하단</MenuItem>
                    </Select>
                  </FormControl>

                  <Typography variant="body2" color="text.secondary">
                    최대 표시 개수: {notificationSettings.maxVisible}개
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* 사용법 가이드 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📚 사용법 가이드
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>기본 사용법:</strong>
            </Typography>
            
            <Box component="pre" sx={{ 
              bgcolor: 'grey.100', 
              p: 2, 
              borderRadius: 1, 
              overflow: 'auto',
              fontSize: '0.875rem',
            }}>
{`// 기본 훅 사용
const { theme, toggleTheme } = useTheme();
const { success, error } = useNotifications();
const { isMobile, screenSize } = useResponsiveUI();

// 알림 표시
success('제목', '메시지');

// 액션 버튼이 있는 알림
notify({
  type: 'info',
  title: '확인 필요',
  message: '작업을 계속하시겠습니까?',
  actions: [
    { 
      label: '확인', 
      action: () => console.log('확인됨'),
      variant: 'contained'
    }
  ]
});

// 테마 변경
toggleTheme();`}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default UIUsageExample; 