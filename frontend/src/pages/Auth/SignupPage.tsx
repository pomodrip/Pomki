import { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Box, Checkbox, Container, Typography, Alert, Paper } from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import { sendEmailVerification, verifyEmailCode, signup } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = async () => {
    if (!email) return;
    
    setIsRequestingCode(true);
    setError('');
    
    try {
      await sendEmailVerification({
        email,
        type: 'SIGNUP'
      });
      
      setIsCodeSent(true);
      // 선택적: 성공 메시지 표시
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      setError(error.response?.data?.message || '인증번호 전송에 실패했습니다.');
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    
    setIsVerifyingCode(true);
    setError('');
    
    try {
      const response = await verifyEmailCode({
        email,
        verificationCode,
        type: 'SIGNUP'
      });
      
      if (response.success && response.verificationToken) {
        setIsVerified(true);
        setVerificationToken(response.verificationToken);
      } else {
        setError(response.message || '인증에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Failed to verify code:', error);
      setError(error.response?.data?.message || '인증번호 확인에 실패했습니다.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !verificationToken) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setIsSigningUp(true);
    setError('');

    try {
      await signup({
        email,
        password,
        nickname: name,
        verificationToken
      });

      // 회원가입 성공 - 로그인 페이지로 이동하거나 다른 처리
      alert('회원가입이 완료되었습니다! 로그인해주세요.');
      navigate('/login');
      
    } catch (error: any) {
      console.error('Failed to signup:', error);
      setError(error.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <Container
    maxWidth="sm"
    sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: { xs: '24px 8px', sm: '32px 16px' },
      mt: 8,
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          padding: { xs: 3, sm: 4 }, 
          borderRadius: 2 
        }}
      >
        <Typography variant="h1" sx={{ mb: 8 }} style={{ textAlign: 'center' }}>회원가입</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" sx={{ mb: 2, ml: 1 }} style={{ textAlign: 'left' }}>이름</Typography>
        <Input 
          placeholder="홍길동" 
          fullWidth 
          sx={{ mb: 4 }} 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
            disabled={!email || isCodeSent || isRequestingCode}
            sx={{ flexShrink: 0, height: '47px' }}
          >
            {isRequestingCode ? '전송중...' : '인증번호 요청'}
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
              disabled={!verificationCode || isVerifyingCode}
              sx={{ flexShrink: 0 }}
            >
              {isVerifyingCode ? '확인중...' : '확인'}
            </Button>
          </Box>
        )}

        <Typography variant="body1" sx={{ mb: 2, ml: 1 }} style={{ textAlign: 'left' }}>비밀번호</Typography>
        <Input 
          type="password" 
          fullWidth 
          sx={{ mb: 4 }} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력해주세요"
        />
        <FormControlLabel control={<Checkbox defaultChecked />} label="서비스 개선을 위한 피드백 요청에 참여할 수 있어요. [선택]" sx={{ mb: 4 }} />
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          style={{ marginBottom: 32 }} 
          disabled={!isVerified || !name || !password || isSigningUp}
          onClick={handleSignup}
        >
          {isSigningUp ? '가입중...' : '회원가입'}
        </Button>
      </Paper>
    </Container>
  );
};

export default SignupPage;
