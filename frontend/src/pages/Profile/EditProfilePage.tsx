import React, { useState, useEffect } from 'react';
import { Box, Container, styled, Typography, TextField } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useResponsive } from '../../hooks/useResponsive';
import { RootState, AppDispatch } from '../../store/store';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const EditProfilePage: React.FC = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // 폼 상태
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 사용자 정보로 초기화
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nickname: user.nickname || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // 입력 값 변경 핸들러
  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // 프로필 업데이트 핸들러
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      // TODO: API 호출로 프로필 업데이트 로직 구현
      console.log('프로필 업데이트:', formData);
      
      // 성공 시 프로필 페이지로 이동
      navigate('/profile');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
        프로필 편집
      </Typography>

      {/* 통합된 프로필 편집 카드 */}
      <Card cardVariant="default" sx={{ backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* 기본 정보 편집 섹션 */}
          <Box>
            <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
              기본 정보
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 닉네임 */}
              <TextField
                label="닉네임"
                value={formData.nickname}
                onChange={handleInputChange('nickname')}
                fullWidth
                variant="outlined"
              />

              {/* 이메일 */}
              <TextField
                label="이메일"
                value={formData.email}
                onChange={handleInputChange('email')}
                fullWidth
                variant="outlined"
                type="email"
              />
            </Box>
          </Box>

          {/* 구분선 */}
          <Box sx={{ 
            height: '1px', 
            backgroundColor: 'divider',
            opacity: 0.12
          }} />

          {/* 비밀번호 변경 섹션 */}
          <Box>
            <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
              비밀번호 변경
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              비밀번호를 변경하려면 현재 비밀번호를 입력해주세요.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 현재 비밀번호 */}
              <TextField
                label="현재 비밀번호"
                value={formData.currentPassword}
                onChange={handleInputChange('currentPassword')}
                fullWidth
                variant="outlined"
                type="password"
              />

              {/* 새 비밀번호 */}
              <TextField
                label="새 비밀번호"
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                fullWidth
                variant="outlined"
                type="password"
              />

              {/* 새 비밀번호 확인 */}
              <TextField
                label="새 비밀번호 확인"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                fullWidth
                variant="outlined"
                type="password"
                error={formData.newPassword !== formData.confirmPassword && formData.confirmPassword.length > 0}
                helperText={
                  formData.newPassword !== formData.confirmPassword && formData.confirmPassword.length > 0
                    ? '비밀번호가 일치하지 않습니다.'
                    : ''
                }
              />
            </Box>
          </Box>

          {/* 구분선 */}
          <Box sx={{ 
            height: '1px', 
            backgroundColor: 'divider',
            opacity: 0.12
          }} />

          {/* 액션 버튼들 섹션 */}
          <Box>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 2
            }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                취소
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateProfile}
                disabled={isLoading || (formData.newPassword !== formData.confirmPassword && formData.newPassword.length > 0)}
                sx={{ py: 1.5 }}
              >
                {isLoading ? '저장 중...' : '저장'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>
    </StyledContainer>
  );
};

export default EditProfilePage;
