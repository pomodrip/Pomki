import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Switch, 
  FormControlLabel, 
  Slider, 
  Divider,
  Alert,
  Chip,
  styled
} from '@mui/material';
import { useTimer } from '../../hooks/useTimer';

const Container = styled(Box)(() => ({
  padding: '32px',
  maxWidth: '800px',
  margin: '0 auto',
  minHeight: '100vh',
}));

const SettingCard = styled(Card)(() => ({
  marginBottom: '24px',
  padding: '8px',
}));

const SettingRow = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 0',
  minHeight: '60px',
}));

const PresetChip = styled(Chip)(() => ({
  margin: '4px',
  cursor: 'pointer',
}));

const TimerSettingsPage: React.FC = () => {
  const {
    settings,
    isRunning,
    updateTimerSettings,
    error,
    clearTimerError,
  } = useTimer();

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleSettingChange = (key: string, value: number | boolean) => {
    updateTimerSettings({ [key]: value });
    setUnsavedChanges(true);
  };

  const handlePresetApply = (preset: Record<string, number | boolean>) => {
    updateTimerSettings(preset);
    setUnsavedChanges(false);
  };

  const presets = [
    {
      name: '클래식 포모도로',
      description: '25분 집중 + 5분 휴식',
      settings: {
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
      }
    },
    {
      name: '집중 학습',
      description: '50분 집중 + 10분 휴식',
      settings: {
        focusTime: 50,
        shortBreakTime: 10,
        longBreakTime: 30,
        longBreakInterval: 3,
        autoStartBreaks: false,
        autoStartPomodoros: false,
      }
    },
    {
      name: '빠른 작업',
      description: '15분 집중 + 3분 휴식',
      settings: {
        focusTime: 15,
        shortBreakTime: 3,
        longBreakTime: 10,
        longBreakInterval: 6,
        autoStartBreaks: true,
        autoStartPomodoros: false,
      }
    },
    {
      name: '자동 모드',
      description: '25분 집중 + 자동 시작',
      settings: {
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        longBreakInterval: 4,
        autoStartBreaks: true,
        autoStartPomodoros: true,
      }
    }
  ];

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        ⚙️ 타이머 설정
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => clearTimerError()}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {isRunning && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          타이머가 실행 중입니다. 일부 설정은 타이머 정지 후 변경 가능합니다.
        </Alert>
      )}

      {unsavedChanges && (
        <Alert severity="info" sx={{ mb: 3 }}>
          설정이 자동으로 저장되었습니다.
        </Alert>
      )}

      {/* 시간 설정 */}
      <SettingCard>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            ⏰ 시간 설정
          </Typography>
          
          <SettingRow>
            <Box>
              <Typography variant="h6">집중시간</Typography>
              <Typography variant="body2" color="text.secondary">
                작업에 집중하는 시간
              </Typography>
            </Box>
            <Box sx={{ width: '200px', textAlign: 'right' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {settings.focusTime}분
              </Typography>
              <Slider
                value={settings.focusTime}
                onChange={(_, value) => handleSettingChange('focusTime', value)}
                min={5}
                max={120}
                step={5}
                disabled={isRunning}
                valueLabelDisplay="auto"
                sx={{ width: '180px' }}
              />
            </Box>
          </SettingRow>

          <Divider />

          <SettingRow>
            <Box>
              <Typography variant="h6">짧은 휴식시간</Typography>
              <Typography variant="body2" color="text.secondary">
                집중시간 후 짧은 휴식
              </Typography>
            </Box>
            <Box sx={{ width: '200px', textAlign: 'right' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {settings.shortBreakTime}분
              </Typography>
              <Slider
                value={settings.shortBreakTime}
                onChange={(_, value) => handleSettingChange('shortBreakTime', value)}
                min={1}
                max={30}
                step={1}
                disabled={isRunning}
                valueLabelDisplay="auto"
                sx={{ width: '180px' }}
              />
            </Box>
          </SettingRow>

          <Divider />

          <SettingRow>
            <Box>
              <Typography variant="h6">긴 휴식시간</Typography>
              <Typography variant="body2" color="text.secondary">
                여러 세션 후 긴 휴식
              </Typography>
            </Box>
            <Box sx={{ width: '200px', textAlign: 'right' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {settings.longBreakTime}분
              </Typography>
              <Slider
                value={settings.longBreakTime}
                onChange={(_, value) => handleSettingChange('longBreakTime', value)}
                min={5}
                max={60}
                step={5}
                disabled={isRunning}
                valueLabelDisplay="auto"
                sx={{ width: '180px' }}
              />
            </Box>
          </SettingRow>

          <Divider />

          <SettingRow>
            <Box>
              <Typography variant="h6">긴 휴식 간격</Typography>
              <Typography variant="body2" color="text.secondary">
                몇 번의 집중시간 후 긴 휴식을 할지
              </Typography>
            </Box>
            <Box sx={{ width: '200px', textAlign: 'right' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {settings.longBreakInterval}회
              </Typography>
              <Slider
                value={settings.longBreakInterval}
                onChange={(_, value) => handleSettingChange('longBreakInterval', value)}
                min={2}
                max={10}
                step={1}
                disabled={isRunning}
                valueLabelDisplay="auto"
                sx={{ width: '180px' }}
              />
            </Box>
          </SettingRow>
        </CardContent>
      </SettingCard>

      {/* 자동화 설정 */}
      <SettingCard>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🤖 자동화 설정
          </Typography>
          
          <SettingRow>
            <Box>
              <Typography variant="h6">휴식시간 자동 시작</Typography>
              <Typography variant="body2" color="text.secondary">
                집중시간 완료 후 휴식시간을 자동으로 시작
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoStartBreaks}
                  onChange={(e) => handleSettingChange('autoStartBreaks', e.target.checked)}
                />
              }
              label=""
            />
          </SettingRow>

          <Divider />

          <SettingRow>
            <Box>
              <Typography variant="h6">집중시간 자동 시작</Typography>
              <Typography variant="body2" color="text.secondary">
                휴식시간 완료 후 집중시간을 자동으로 시작
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoStartPomodoros}
                  onChange={(e) => handleSettingChange('autoStartPomodoros', e.target.checked)}
                />
              }
              label=""
            />
          </SettingRow>
        </CardContent>
      </SettingCard>

      {/* 알림 설정 */}
      <SettingCard>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🔔 알림 설정
          </Typography>
          
          <SettingRow>
            <Box>
              <Typography variant="h6">사운드 알림</Typography>
              <Typography variant="body2" color="text.secondary">
                세션 완료 시 사운드 재생
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                />
              }
              label=""
            />
          </SettingRow>

          <Divider />

          <SettingRow>
            <Box>
              <Typography variant="h6">브라우저 알림</Typography>
              <Typography variant="body2" color="text.secondary">
                세션 완료 시 브라우저 알림 표시
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notificationEnabled}
                  onChange={(e) => handleSettingChange('notificationEnabled', e.target.checked)}
                />
              }
              label=""
            />
          </SettingRow>
        </CardContent>
      </SettingCard>

      {/* 프리셋 */}
      <SettingCard>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🎯 프리셋
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            미리 설정된 타이머 조합을 사용해보세요
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {presets.map((preset, index) => (
              <Card 
                key={index} 
                sx={{ 
                  p: 2, 
                  cursor: 'pointer', 
                  minWidth: '200px',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => handlePresetApply(preset.settings)}
              >
                <Typography variant="h6" gutterBottom>
                  {preset.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {preset.description}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <PresetChip 
                    label={`집중 ${preset.settings.focusTime}분`} 
                    size="small" 
                    variant="outlined" 
                  />
                  <PresetChip 
                    label={`휴식 ${preset.settings.shortBreakTime}분`} 
                    size="small" 
                    variant="outlined" 
                  />
                  {preset.settings.autoStartBreaks && (
                    <PresetChip 
                      label="자동 시작" 
                      size="small" 
                      color="primary" 
                    />
                  )}
                </Box>
              </Card>
            ))}
          </Box>
        </CardContent>
      </SettingCard>

      {/* 현재 설정 요약 */}
      <Card sx={{ backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 현재 설정 요약
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">집중 시간</Typography>
              <Typography variant="h6">{settings.focusTime}분</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">짧은 휴식</Typography>
              <Typography variant="h6">{settings.shortBreakTime}분</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">긴 휴식</Typography>
              <Typography variant="h6">{settings.longBreakTime}분</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">긴 휴식 간격</Typography>
              <Typography variant="h6">{settings.longBreakInterval}회 후</Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">활성화된 기능</Typography>
            <Box sx={{ mt: 1 }}>
              {settings.autoStartBreaks && (
                <Chip label="휴식 자동 시작" size="small" color="primary" sx={{ mr: 1, mb: 1 }} />
              )}
              {settings.autoStartPomodoros && (
                <Chip label="집중 자동 시작" size="small" color="primary" sx={{ mr: 1, mb: 1 }} />
              )}
              {settings.soundEnabled && (
                <Chip label="사운드 알림" size="small" color="secondary" sx={{ mr: 1, mb: 1 }} />
              )}
              {settings.notificationEnabled && (
                <Chip label="브라우저 알림" size="small" color="secondary" sx={{ mr: 1, mb: 1 }} />
              )}
              {!settings.autoStartBreaks && !settings.autoStartPomodoros && !settings.soundEnabled && !settings.notificationEnabled && (
                <Typography variant="body2" color="text.secondary">
                  활성화된 자동화 기능이 없습니다.
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TimerSettingsPage;
