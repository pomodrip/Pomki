import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { logoutUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store/store';
import { Box, Typography, Paper, Container } from '@mui/material';
import { useNotifications, useUI } from '../../hooks/useUI';

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { success, error } = useNotifications();
  const { showGlobalLoading, hideGlobalLoading } = useUI();

  const handleLogout = async () => {
    try {
      showGlobalLoading('로그아웃 중...');
      await dispatch(logoutUser()).unwrap();
      success('로그아웃 완료', '성공적으로 로그아웃되었습니다.');
      navigate('/login');
    } catch (err) {
      error('로그아웃 실패', '로그아웃 중 오류가 발생했습니다.');
      console.error('Failed to logout:', err);
    } finally {
      hideGlobalLoading();
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 4, 
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Here you can manage your profile settings.
        </Typography>
        
        <Box sx={{ width: '100%' }}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
