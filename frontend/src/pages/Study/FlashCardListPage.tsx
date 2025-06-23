import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const FlashCardListPage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          플래시카드 목록
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          덱 ID: {deckId}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          이 페이지는 현재 새로운 덱 관리 시스템에 맞게 재구현 중입니다.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/flashcards')}
          sx={{ mt: 2 }}
        >
          덱 목록으로 돌아가기
        </Button>
      </Box>
    </Container>
  );
};

export default FlashCardListPage;
