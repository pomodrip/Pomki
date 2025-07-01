import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
// import { useResponsive } from '../../hooks/useResponsive';
import { logoutUser } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store/store';
import MembershipBadge from '../../components/common/MembershipBadge';
import NavListButton from '../../components/ui/NavListButton';


const ProfilePage: React.FC = () => {
  // const { isMobile } = useResponsive();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated, status } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      // showGlobalLoading('로그아웃 중...');
      await dispatch(logoutUser()).unwrap();
      //success('로그아웃 완료', '성공적으로 로그아웃되었습니다.');
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleMembershipManagement = () => {
    navigate('/membership/premium');
  };

  // 디버깅용 로그
  React.useEffect(() => {
    console.log('ProfilePage - Redux 상태:', {
      isAuthenticated,
      status,
      user,
      userKeys: user ? Object.keys(user) : 'user is null'
    });
  }, [isAuthenticated, status, user]);

  // 로그인하지 않은 사용자 처리
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ pt: 2, pb: 10 }}>
        <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
          프로필
        </Typography>
        <Card cardVariant="default" sx={{ backgroundColor: 'background.paper', textAlign: 'center', py: 6 }}>
          <Typography variant="h3" gutterBottom>
            로그인이 필요합니다
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            프로필 정보를 확인하려면 로그인해주세요.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
          >
            로그인하러 가기
          </Button>
        </Card>
      </Container>
    );
  }

  // 로딩 중 표시
  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ pt: 2, pb: 10 }}>
        <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
          프로필
        </Typography>
        <Card cardVariant="default" sx={{ backgroundColor: 'background.paper', textAlign: 'center', py: 6 }}>
          <Typography variant="body1">
            사용자 정보를 불러오는 중...
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ pt: 2, pb: 10 }}>
      <Typography variant="h1" gutterBottom sx={{ mb: 3 }}>
        프로필
      </Typography>

      {/* 통합된 프로필 카드 */}
      <Card cardVariant="default" sx={{ backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
            사용자 정보
          </Typography>
          {/* 프로필 정보 섹션 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3 }}>
            {/* 사용자 이름 */}
            <Typography variant="h2" sx={{ fontWeight: 600 }}>
              {user?.nickname || '사용자명'}
            </Typography>

            {/* 멤버십 뱃지 */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MembershipBadge membership="premium" size="medium" />
            </Box>

            {/* 이메일 */}
            <Typography variant="body1" color="text.secondary">
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>

          {/* 구분선 */}
          <Box sx={{
            height: '1px',
            backgroundColor: 'divider',
            opacity: 0.12
          }} />

          {/* 멤버십 섹션 */}
          <Box>
            <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
              멤버십
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* 멤버십 관리 버튼 */}
              <NavListButton onClick={handleMembershipManagement}>
                멤버십 관리
              </NavListButton>
            </Box>
          </Box>

          {/* 구분선 */}
          <Box sx={{
            height: '1px',
            backgroundColor: 'divider',
            opacity: 0.12
          }} />

          {/* 개발자 도구 섹션 */}
          {import.meta.env.DEV && (
            <>
              {/* 구분선 */}
              <Box sx={{
                height: '1px',
                backgroundColor: 'divider',
                opacity: 0.12
              }} />
              
              <Box>
                <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
                  개발자 도구 🔧
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 2
                }}>
                  <NavListButton onClick={() => navigate('/api-fallback')}>
                    API Fallback 테스트
                  </NavListButton>
                  <NavListButton onClick={() => navigate('/ad')}>
                    광고 시스템 예제
                  </NavListButton>
                </Box>
              </Box>
            </>
          )}

          {/* 구분선 */}
          <Box sx={{
            height: '1px',
            backgroundColor: 'divider',
            opacity: 0.12
          }} />

          {/* 액션 버튼들 섹션 */}
          <Box>
            <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
              계정 관리
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 2
            }}>
            <NavListButton onClick={handleEditProfile}>
              프로필 편집
            </NavListButton>
            <NavListButton onClick={handleLogout} sx={{ color: 'error.main' }}>
              로그아웃
            </NavListButton>
            </Box>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default ProfilePage;
