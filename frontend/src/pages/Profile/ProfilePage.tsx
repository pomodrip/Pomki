
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { logoutUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store/store';
import { Box, Typography, Paper, Container } from '@mui/material';

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
      // Optional: Show an error message to the user
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
