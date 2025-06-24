import React, { useState, useEffect } from 'react';
import { Box, Container, styled, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useResponsive } from '../../hooks/useResponsive';
import { RootState, AppDispatch } from '../../store/store';
import { updateMember } from '../../api/userApi';
import { updateUser } from '../../store/slices/authSlice';
import { showSnackbar } from '../../store/slices/snackbarSlice';
import type { UpdateMemberRequest } from '../../types/user';

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
    email: ''
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
      // 유효성 검사
      if (!formData.nickname.trim()) {
        dispatch(showSnackbar({
          message: '닉네임을 입력해주세요.',
          severity: 'error'
        }));
        setIsLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        dispatch(showSnackbar({
          message: '이메일을 입력해주세요.',
          severity: 'error'
        }));
        setIsLoading(false);
        return;
      }

      // 이메일 변경 여부 확인
      const emailChanged = user?.email !== formData.email;

      // API 요청 데이터 구성
      const updateData = {
        currentEmail: user?.email || '',
        nickname: formData.nickname,
        emailChanged
      } as UpdateMemberRequest;

      // API 호출
      const response = await updateMember(updateData);
      
      // Redux 스토어 업데이트
      dispatch(updateUser({
        nickname: response.memberNickname,
        email: response.memberEmail
      }));

      // 성공 메시지
      dispatch(showSnackbar({
        message: '프로필이 성공적으로 업데이트되었습니다.',
        severity: 'success'
      }));
      
      // 성공 시 프로필 페이지로 이동
      navigate('/profile');
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      
      // 에러 메시지 표시
      const errorMessage = error.response?.data?.message || '프로필 업데이트에 실패했습니다.';
      dispatch(showSnackbar({
        message: errorMessage,
        severity: 'error'
      }));
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
              <Input
                placeholder="닉네임"
                value={formData.nickname}
                onChange={handleInputChange('nickname')}
                fullWidth
              />

              {/* 이메일 */}
              <Input
                placeholder="이메일"
                value={formData.email}
                onChange={handleInputChange('email')}
                fullWidth
                type="email"
              />
            </Box>
          </Box>



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
                disabled={isLoading}
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
