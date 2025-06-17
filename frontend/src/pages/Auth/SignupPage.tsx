import React, { useState } from "react";
import styled from "styled-components";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Box, Checkbox, Container, Typography } from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';


const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleRequestCode = () => {
    // TODO: Implement API call to send verification code
    console.log(`Requesting verification code for ${email}`);
    setIsCodeSent(true);
  };

  const handleVerifyCode = () => {
    // TODO: Implement API call to verify code
    console.log(`Verifying code ${verificationCode}`);
    // For now, let's use a mock verification
    if (verificationCode) {
      setIsVerified(true);
    }
  };

  return (
    <Container
    maxWidth="xs"
    sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: { xs: '24px 8px', sm: '32px 16px' },
    }}>
        <Typography variant="h1" sx={{ mb: 8 }} style={{ textAlign: 'left' }}>회원가입</Typography>
        <Typography variant="body1" sx={{ mb: 2, ml: 1 }} style={{ textAlign: 'left' }}>이름</Typography>
        <Input placeholder="홍길동" fullWidth sx={{ mb: 4 }} />
        <Typography variant="body1" sx={{ mb: 2, ml: 1 }} style={{ textAlign: 'left' }}>이메일</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%', mb: isCodeSent && !isVerified ? 2 : 4 }}>
          <Input  
            fullWidth
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isCodeSent}
          />

          {isVerified ? (
            <Typography variant="body1" color="primary" sx={{ mt: 1, ml: 1, flexShrink: 0}}>
              인증완료
            </Typography>
          ):<Button 
            variant="outlined"
            onClick={handleRequestCode}
            disabled={!email || isCodeSent}
            sx={{ flexShrink: 0 }}
          >
            인증번호 요청
          </Button>}
        </Box>

        {isCodeSent && !isVerified && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%', mb: 4 }}>
            <Input
              fullWidth
              placeholder="인증번호를 입력해주세요"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <Button 
              variant="outlined"
              onClick={handleVerifyCode}
              disabled={!verificationCode}
              sx={{ flexShrink: 0 }}
            >
              확인
            </Button>
          </Box>
        )}



        <Typography variant="body1" sx={{ mb: 2, ml: 1 }} style={{ textAlign: 'left' }}>비밀번호</Typography>
        <Input type="password" fullWidth sx={{ mb: 4 }} />
        <FormControlLabel control={<Checkbox defaultChecked />} label="서비스 개선을 위한 피드백 요청에 참여할 수 있어요. [선택]" sx={{ mb: 4 }} />
        <Button variant="contained" color="primary" fullWidth style={{ marginBottom: 32 }} disabled={!isVerified}>회원가입</Button>
    </Container>
  );
};

export default SignupPage;
