import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Tag from '../components/ui/Tag';
import TimerWidget from '../components/common/TimerWidget';
import { useAppDispatch } from '../hooks/useRedux';
import { showToast } from '../store/slices/toastSlice';

// 임시 페이지 컴포넌트들
const LoginPage = () => <div>Login Page</div>;
const SignupPage = () => <div>Signup Page</div>;

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  
  const handleToastTest = () => {
    dispatch(showToast({
      message: '디자인 시스템이 정상적으로 작동합니다!',
      severity: 'success'
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" gutterBottom>
        🍅 Pomki - 학습의 새로운 차원
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        디자인 시스템과 공통 컴포넌트 테스트 페이지입니다.
      </Typography>

      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* 버튼 테스트 */}
        <Card>
          <Typography variant="h3" gutterBottom>버튼 테스트</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={handleToastTest}>
              Primary Button
            </Button>
            <Button variant="outlined">Outlined Button</Button>
            <Button variant="text">Text Button</Button>
          </Box>
        </Card>

        {/* 입력 필드 테스트 */}
        <Card>
          <Typography variant="h3" gutterBottom>입력 필드 테스트</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <Input placeholder="이메일을 입력하세요" fullWidth />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Input variant="pin" />
              <Input variant="pin" />
              <Input variant="pin" />
              <Input variant="pin" />
            </Box>
          </Box>
        </Card>

        {/* 태그 테스트 */}
        <Card>
          <Typography variant="h3" gutterBottom>태그 테스트</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tag label="React" />
            <Tag label="TypeScript" selected />
            <Tag label="Material UI" />
            <Tag label="Redux" selected />
          </Box>
        </Card>

        {/* 타이머 위젯 테스트 */}
        <Card>
          <Typography variant="h3" gutterBottom>타이머 위젯 테스트</Typography>
          <TimerWidget mode="pomodoro" sessionCount={1} totalSessions={4} />
        </Card>
      </Box>
    </Container>
  );
};

const NoteListPage = () => <div>Note List Page</div>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* 기본 라우트 */}
      <Route path="/" element={<Navigate replace to="/dashboard" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/notes" element={<NoteListPage />} />
      
      {/* 404 페이지 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;