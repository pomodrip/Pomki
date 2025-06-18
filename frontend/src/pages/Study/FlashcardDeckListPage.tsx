import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
} from '@mui/material';
import { ArrowBackIos, Add, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { FlashcardDeck } from '../../types/card';

// 샘플 플래시카드 덱 데이터
const sampleDecks: FlashcardDeck[] = [
  {
    id: 'deck-1',
    title: 'React 이해도 플래시카드',
    description: '방금 생성한 React 기초 개념 플래시카드',
    cards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'deck-2',
    title: 'JavaScript 기초',
    description: 'JavaScript 변수, 함수, 객체 개념',
    cards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const FlashcardDeckListPage: React.FC = () => {
  const navigate = useNavigate();
  const [decks] = useState<FlashcardDeck[]>(sampleDecks);

  const handleCreateNew = () => {
    navigate('/study/flashcard-generation');
  };

  const handlePractice = (deckId: string) => {
    navigate(`/study/flashcard-practice/${deckId}`);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 헤더 */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ mr: 1 }}
          >
            <ArrowBackIos />
          </IconButton>
          <Typography variant="h3" fontWeight={600}>
            플래시카드
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNew}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          새로 만들기
        </Button>
      </Box>

      {/* 메인 컨텐츠 */}
      <Box sx={{ flex: 1, p: 3 }}>
        {decks.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: 400,
              textAlign: 'center',
            }}
          >
            <Typography variant="h2" sx={{ mb: 2, color: 'text.secondary' }}>
              📚
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              아직 플래시카드가 없어요
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              새로운 플래시카드를 만들어 학습을 시작해보세요!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleCreateNew}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
              }}
            >
              첫 번째 플래시카드 만들기
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {decks.map((deck) => (
              <Card 
                key={deck.id}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 1,
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" sx={{ mb: 1, fontSize: '1.25rem' }}>
                        {deck.title}
                      </Typography>
                      {deck.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {deck.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={`${deck.cards.length}개 카드`}
                          size="small"
                          sx={{ bgcolor: 'grey.100' }}
                        />
                        <Chip
                          label="새로 생성"
                          size="small"
                          color="primary"
                          sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
                        />
                      </Box>
                    </Box>
                    
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handlePractice(deck.id)}
                      sx={{
                        borderRadius: 2,
                        ml: 2,
                      }}
                    >
                      학습하기
                    </Button>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    {deck.createdAt.toLocaleDateString('ko-KR')} 생성
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FlashcardDeckListPage;
