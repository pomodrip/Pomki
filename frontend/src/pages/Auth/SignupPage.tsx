import React from "react";
import styled from "styled-components";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Box, Checkbox, Container, Typography } from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';


const SignupPage = () => {


  return (
    <Container
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: { xs: '24px 8px', sm: '32px 16px' },
      }}>
        <Typography variant="h1" sx={{ mb: 8 }} style={{ textAlign: 'left' }}>회원가입</Typography>
        <Typography variant="body1" sx={{ mb: 2, ml: 1 }} style={{ textAlign: 'left' }}>이름</Typography>
        <Input  fullWidth sx={{ mb: 4 }} />
        <Typography variant="body1" sx={{ mb: 2, ml: 1 }} style={{ textAlign: 'left' }}>이메일</Typography>
        <Input  fullWidth sx={{ mb: 4 }} />
        <Typography variant="body1" sx={{ mb: 2, ml: 1 }} style={{ textAlign: 'left' }}>비밀번호</Typography>
        <Input  fullWidth sx={{ mb: 4 }} />
        <FormControlLabel control={<Checkbox defaultChecked />} label="서비스 개선을 위한 피드백 요청에 참여할 수 있어요. [선택]" sx={{ mb: 4 }} />
        <Button variant="contained" color="primary" fullWidth style={{ marginBottom: 32 }}>회원가입</Button>
    </Container>
  );
};

export default SignupPage;
