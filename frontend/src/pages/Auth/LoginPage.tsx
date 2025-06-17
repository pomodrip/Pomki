import React, { useState } from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { loginUser } from '../../store/slices/authSlice';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        backgroundColor: 'background.default',
      }}
    >
      {/* 토마토 아이콘 */}
      <Box
        sx={{
          width: '80px',
          height: '80px',
          backgroundColor: 'primary.main',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          mb: 3,
        }}
      >
        🍅
      </Box>

      <Typography variant="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Welcome to Pomki
      </Typography>

      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Input
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={!!errors.email}
            helperText={errors.email}
          />
          
          <Input
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!errors.password}
            helperText={errors.password}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={status === 'loading'}
            sx={{ mt: 3, mb: 2 }}
          >
            {status === 'loading' ? 'Signing in...' : 'Sign In'}
          </Button>

          {error && (
            <Typography color="error" variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <MuiLink component={Link} to="/signup" color="primary">
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default LoginPage;
