import { Box, styled } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Text } from '../../components/ui';
import { useAppDispatch } from '../../hooks/useRedux';
import { markIntroductionAsSeen } from '../../api/userApi';
import { updateUser } from '../../store/slices/authSlice';

const OnboardingIntro = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleStart = async () => {
    try {
      // 1. 서버에 "소개 페이지 봤음" 상태 전송
      await markIntroductionAsSeen();
      
      // 2. Redux 스토어의 사용자 상태 업데이트
      dispatch(updateUser({ hasSeenIntroduction: true }));

      // 3. 대시보드로 이동
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Failed to mark introduction as seen:", error);
      // 에러가 발생하더라도 일단 대시보드로 이동시켜서 사용자 경험을 막지 않음
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <OnboardingWrapper>
      <Section color="#F0F6FF">
        <Header>
          <Text variant="h4" fontWeight="bold">
            OneTime
          </Text>
          <Text
            onClick={() => navigate('/login')}
            style={{ cursor: 'pointer' }}
          >
            로그인
          </Text>
        </Header>
        <Flex direction="column" align="center" gap={2} style={{ flex: 1 }}>
          <Text variant="h4" fontWeight="bold">
            일정을 쉽고 빠르게
          </Text>
          <Text>
            링크 공유 한 번으로 여러 사람과 일정을 정리하고, 가장 적합한 시간을
            찾아보세요.
          </Text>
          <img
            src="https://i.imgur.com/uGgT51j.png"
            alt="schedule management"
            width="80%"
          />
          <Button onClick={handleStart}>시작하기</Button>
        </Flex>
      </Section>

      <Section>
        <Flex direction="column" align="center" gap={2}>
          <Text variant="h3" fontWeight="bold">
            가능한 시간은 더 명확하게, 선택은 더 간편하게
          </Text>
          <Text>
            가능한 시간을 가늠하기 어려우신가요? 그렇다면 '안되는 시간'을
            지워보세요.
          </Text>
          <img
            src="https://i.imgur.com/2wn43aC.png"
            alt="time selection"
            width="80%"
          />
        </Flex>
      </Section>

      <Section>
        <Flex direction="column" align="center" gap={2}>
          <Text variant="h3" fontWeight="bold">
            내 일정에 맞게 자동으로 시간 조율, <br />더 이상 고민하지 마세요!
          </Text>
          <Flex justify="center" gap={4} style={{ width: '100%' }}>
            <FeatureBox>
              <Text variant="h6" fontWeight="bold">
                내 스케줄 등록
              </Text>
              <Text>
                단 한 번 등록으로 반복 작업 없이 간편하게 내 스케줄을 미리
                등록하면 불가능한 시간은 자동으로 제외돼요.
              </Text>
            </FeatureBox>
            <FeatureBox>
              <Text variant="h6" fontWeight="bold">
                QR 코드 생성
              </Text>
              <Text>
                오프라인에서는 QR코드로 쉽고 빠른 일정관리 오프라인에서는 링크
                공유 필요 없이 QR코드 하나로 시간을 조율해보세요.
              </Text>
            </FeatureBox>
          </Flex>
          <img
            src="https://i.imgur.com/9v6Tsyn.png"
            alt="auto scheduling"
            width="60%"
          />
        </Flex>
      </Section>

      <Section color="#4A4A7F" style={{ color: 'white' }}>
        <Flex direction="column" align="center" gap={2}>
          <img
            src="https://i.imgur.com/w2C3z7G.png"
            alt="clock"
            width="100px"
          />
          <Text variant="h4" fontWeight="bold">
            원타임에서 더 이상 스트레스 없는 간편한 일정조율을 경험하세요
          </Text>
          <Button onClick={handleStart} color="secondary">
            이벤트 생성하기
          </Button>
        </Flex>
      </Section>

      <Footer>
        <Text variant="h6" fontWeight="bold">
          OneTime
        </Text>
        <Text>@OneTime. ALL RIGHTS RESERVED</Text>
        <Flex gap={2}>
          <Text>버그 및 불편사항 제보</Text>
          <Text>개인정보처리방침</Text>
          <Text>서비스 이용약관</Text>
        </Flex>
      </Footer>
    </OnboardingWrapper>
  );
};

export default OnboardingIntro;

const OnboardingWrapper = styled(Box)({
  textAlign: 'center',
});

const Section = styled(Box)<{ color?: string }>(({ color, theme }) => ({
  padding: '4rem 2rem',
  backgroundColor: color || theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}));

const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 1rem 2rem',
});

const FeatureBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  padding: '2rem',
  borderRadius: '16px',
  flex: 1,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const Footer = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.grey[400],
  padding: '4rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
}));
