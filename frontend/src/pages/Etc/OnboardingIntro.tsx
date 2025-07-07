import { Box, styled, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex } from '../../components/ui';
import { useAppDispatch } from '../../hooks/useRedux';
import { markIntroductionAsSeen } from '../../api/userApi';
import { updateUser } from '../../store/slices/authSlice';
import { tomato } from '../../assets/icons';

// Placeholder images for a professional look
const placeholders = {
  hero: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop',
  ai: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop',
  timer: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2070&auto=format&fit=crop',
  dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
};

const OnboardingIntro = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleStart = async () => {
    try {
      await markIntroductionAsSeen();
      dispatch(updateUser({ hasSeenIntroduction: true }));
      navigate('/timer', { replace: true });
    } catch (error) {
      console.error("Failed to mark introduction as seen:", error);
      navigate('/timer', { replace: true });
    }
  };

  return (
    <OnboardingWrapper>
      {/* Hero Section */}
      <HeroSection>
        <img src={tomato} alt="Pomki Logo" width="60px" style={{ marginBottom: '16px' }} />
        <Typography variant="h2" component="h1" fontWeight={700} sx={{ mb: 2 }}>
          학습의 모든 과정을 하나의 도구로
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mb: 4 }}>
          Pomki는 AI 기반 플래시카드 생성부터 뽀모도로 타이머, 학습 노트, 성장 분석까지, 당신의 잠재력을 최대로 이끌어낼 완벽한 학습 파트너입니다.
        </Typography>
        <Button onClick={handleStart} variant="contained" size="large">
          지금 바로 시작하기
        </Button>
      </HeroSection>

      {/* Feature 1: AI Flashcards */}
      <FeatureSection>
        <FeatureImage src={placeholders.ai} alt="AI-generated flashcards" />
        <FeatureContent>
          <Typography variant="overline" color="primary">AI 기반 학습</Typography>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ mt: 1, mb: 2 }}>
            노트만 하세요, 암기는 AI가 도울게요
          </Typography>
          <Typography variant="body1" color="text.secondary">
            복잡한 내용을 학습 노트에 정리하기만 하면, Pomki의 AI가 핵심 내용을 파악하여 중요한 질문과 답변으로 구성된 플래시카드를 자동으로 생성해줍니다. 더 이상 카드 만드느라 시간 낭비하지 마세요.
          </Typography>
        </FeatureContent>
      </FeatureSection>

      {/* Feature 2: Smart Timer */}
      <FeatureSection swap>
        <FeatureContent>
          <Typography variant="overline" color="primary">스마트 집중 관리</Typography>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ mt: 1, mb: 2 }}>
            집중과 휴식의 완벽한 리듬
          </Typography>
          <Typography variant="body1" color="text.secondary">
            과학적인 뽀모도로 기법으로 학습 효율을 극대화하세요. 커스터마이징 가능한 타이머로 나만의 집중 사이클을 만들고, 각 세션의 목표를 설정하여 몰입도를 높일 수 있습니다.
          </Typography>
        </FeatureContent>
        <FeatureImage src={placeholders.timer} alt="Smart Pomodoro Timer" />
      </FeatureSection>
      
      {/* Feature 3: Analytics Dashboard */}
      <FeatureSection>
        <FeatureImage src={placeholders.dashboard} alt="Analytics Dashboard" />
        <FeatureContent>
          <Typography variant="overline" color="primary">데이터 기반 성장</Typography>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ mt: 1, mb: 2 }}>
            당신의 노력을 한눈에
          </Typography>
          <Typography variant="body1" color="text.secondary">
            학습 시간, 집중도, 퀴즈 성과 등 모든 기록이 대시보드에 자동으로 쌓입니다. 데이터를 통해 자신의 학습 패턴을 파악하고, 더 나은 전략을 세워 꾸준히 성장하는 자신을 발견하세요.
          </Typography>
        </FeatureContent>
      </FeatureSection>

      {/* Final CTA Section */}
      <CtaSection>
        <Typography variant="h3" component="h2" fontWeight={700} sx={{ mb: 2, color: 'white' }}>
          이제, 똑똑하게 학습할 시간
        </Typography>
        <Button onClick={handleStart} variant="contained" size="large" sx={{ backgroundColor: 'white', color: 'primary.main', '&:hover': { backgroundColor: 'grey.200' }}}>
          Pomki로 학습 효율 높이기
        </Button>
      </CtaSection>

      <Footer>
        <Typography variant="body2" color="text.secondary">
          © Pomki. ALL RIGHTS RESERVED
        </Typography>
      </Footer>
    </OnboardingWrapper>
  );
};

export default OnboardingIntro;

const OnboardingWrapper = styled(Box)({
  backgroundColor: '#fff',
});

const HeroSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '70vh',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: theme.palette.grey[50],
}));

const FeatureSection = styled(Box)<{ swap?: boolean }>(({ theme, swap }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  alignItems: 'center',
  gap: theme.spacing(8),
  margin: '0 auto',
  padding: theme.spacing(10, 4),
  maxWidth: '1200px',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    textAlign: 'center',
    gap: theme.spacing(4),
    padding: theme.spacing(6, 2),
  },
  flexDirection: swap ? 'row-reverse' : 'row',
}));

const FeatureContent = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    order: 2,
  },
}));

const FeatureImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  borderRadius: '16px',
  objectFit: 'cover',
  maxHeight: '400px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  [theme.breakpoints.down('md')]: {
    order: 1,
    maxHeight: '300px',
  },
}));

const CtaSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(10, 4),
  textAlign: 'center',
  backgroundColor: theme.palette.primary.main,
  backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
}));

const Footer = styled('footer')(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.grey[100],
}));
