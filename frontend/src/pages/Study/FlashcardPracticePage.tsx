import React, { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  IconButton,
  Container,
  Stack,
  DialogContentText,
  Paper,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Tag from '../../components/ui/Tag';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ProgressBar from '../../components/ui/ProgressBar';
import { useAppSelector } from '../../hooks/useRedux';

const TagChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
  marginRight: theme.spacing(0.5),
}));

type Difficulty = 'easy' | 'confusing' | 'hard' | null;

const FlashcardPracticePage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const { decks } = useAppSelector((state) => state.study);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [currentQuestionFeedback, setCurrentQuestionFeedback] = useState('');
  const [globalFeedback, setGlobalFeedback] = useState('');

  // 현재 덱 찾기
  const currentDeck = useMemo(() => {
    return decks.find(deck => deck.id === parseInt(deckId || '0'));
  }, [decks, deckId]);

  // 플래시카드 목록 (Redux에서 가져옴)
  const flashcards = useMemo(() => {
    if (!currentDeck) return [];
    return currentDeck.flashcards.map(card => ({
      ...card,
      question: card.front, // front를 question으로 매핑
      answer: card.back,    // back을 answer로 매핑
      tags: currentDeck.tags, // 덱의 태그를 카드 태그로 사용
    }));
  }, [currentDeck]);

  // 덱이나 카드가 없는 경우 처리
  if (!currentDeck || flashcards.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', pb: 2 }}>
        <Container maxWidth="md" sx={{ px: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 2,
            }}
          >
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h2" sx={{ fontWeight: 600 }}>
              학습하기
            </Typography>
          </Box>
          
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            py={8}
          >
            <Typography variant="h2" color="text.secondary" gutterBottom>
              {!currentDeck ? '덱을 찾을 수 없습니다' : '학습할 카드가 없습니다'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/study')}
              sx={{ mt: 2 }}
            >
              덱 목록으로 이동
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

  const handleCardClick = () => {
    setShowAnswer(!showAnswer);
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty);
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setSelectedDifficulty(null);
      setUserAnswer('');
    }
  };

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setSelectedDifficulty(null);
      setUserAnswer('');
    } else {
      // 마지막 카드면 완료 다이얼로그 표시
      setShowCompletionDialog(true);
    }
  };

  const handleCompletionConfirm = () => {
    setShowCompletionDialog(false);
    navigate('/study'); // 덱 목록으로 이동
  };

  const handleCompletionCancel = () => {
    setShowCompletionDialog(false);
    // 그대로 현재 페이지에 남음
  };

  const getDifficultyButtonStyle = (difficulty: Difficulty) => {
    const isSelected = selectedDifficulty === difficulty;
    
    switch (difficulty) {
      case 'easy':
        return {
          backgroundColor: isSelected ? '#4caf50' : 'transparent',
          color: isSelected ? 'white' : '#4caf50',
          border: `1px solid #4caf50`,
          '&:hover': {
            backgroundColor: isSelected ? '#45a049' : 'rgba(76, 175, 80, 0.1)',
          },
        };
      case 'confusing':
        return {
          backgroundColor: isSelected ? '#ff9800' : 'transparent',
          color: isSelected ? 'white' : '#ff9800',
          border: `1px solid #ff9800`,
          '&:hover': {
            backgroundColor: isSelected ? '#f57c00' : 'rgba(255, 152, 0, 0.1)',
          },
        };
      case 'hard':
        return {
          backgroundColor: isSelected ? '#f44336' : 'transparent',
          color: isSelected ? 'white' : '#f44336',
          border: `1px solid #f44336`,
          '&:hover': {
            backgroundColor: isSelected ? '#d32f2f' : 'rgba(244, 67, 54, 0.1)',
          },
        };
      default:
        return {};
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 2 }}>
      <Container maxWidth="md" sx={{ px: 2 }}>
        {/* 헤더 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 2,
          }}
        >
          <Typography variant="h2" sx={{ fontWeight: 600 }}>
            {currentDeck.title}
          </Typography>
        </Box>

        {/* 진행률 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {currentCardIndex + 1}/{flashcards.length}
          </Typography>
          <ProgressBar
            variant="quiz"
            value={progress}
          />
        </Box>

        {/* 플래시카드 */}
        <Card 
          sx={{ 
            mb: 3, 
            minHeight: 200, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            p: 3,
          }}
          onClick={handleCardClick}
        >
          <Typography 
            variant={showAnswer ? "h2" : "h3"}
            textAlign="center"
            sx={{ 
              lineHeight: 1.6,
              fontWeight: showAnswer ? 700 : 500,
            }}
          >
            {showAnswer ? currentCard.answer : currentCard.question}
          </Typography>
        </Card>

        {/* 태그들 */}
        <Box sx={{ mb: 3 }}>
          {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Tags
          </Typography> */}
          <Stack direction="row" spacing={1}>
            {currentCard.tags.map((tag, index) => (
              <TagChip
                key={index}
                label={tag}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

        {/* 난이도 선택 버튼들 (답변이 보일 때만) */}
        {showAnswer && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => handleDifficultySelect('easy')}
                sx={{
                  ...getDifficultyButtonStyle('easy'),
                  px: 3,
                  py: 1,
                }}
              >
                Easy
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleDifficultySelect('confusing')}
                sx={{
                  ...getDifficultyButtonStyle('confusing'),
                  px: 3,
                  py: 1,
                }}
              >
                Confusing
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleDifficultySelect('hard')}
                sx={{
                  ...getDifficultyButtonStyle('hard'),
                  px: 3,
                  py: 1,
                }}
              >
                Hard
              </Button>
            </Stack>
          </Box>
        )}

        {/* 네비게이션 버튼들 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton 
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            size="medium"
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { 
                bgcolor: 'grey.300',
                color: 'grey.500',
              },
              boxShadow: 1,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          
          {/* 페이지 인디케이터 */}
          <Stack direction="row" spacing={1}>
            {flashcards.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === currentCardIndex ? 'primary.main' : 'grey.300',
                  boxShadow: index === currentCardIndex ? 1 : 0,
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </Stack>
          
          <IconButton 
            onClick={handleNext}
            size="medium"
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              boxShadow: 1,
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* 피드백 섹션 */}
        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <EditNoteIcon color="action" sx={{ mr: 1, fontSize: '1.2rem' }} />
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
              피드백 (선택사항)
            </Typography>
          </Box>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                이 문제에 대한 피드백
              </Typography>
              <Input
                placeholder="예: 더 자세한 설명이 필요해요"
                value={currentQuestionFeedback}
                onChange={(e) => setCurrentQuestionFeedback(e.target.value)}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.85rem',
                  }
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                전체적인 피드백
              </Typography>
              <Input
                placeholder="예: 실무 예시를 더 포함해주세요"
                value={globalFeedback}
                onChange={(e) => setGlobalFeedback(e.target.value)}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.85rem',
                  }
                }}
              />
            </Box>
          </Stack>
        </Paper>

        {/* 학습 완료 다이얼로그 */}
        <Modal
          open={showCompletionDialog}
          onClose={handleCompletionCancel}
          title="학습 완료"
          showCloseButton={false}
          actions={
            <>
              <Button onClick={handleCompletionCancel} variant="outlined">
                아니오
              </Button>
              <Button onClick={handleCompletionConfirm} variant="contained">
                네
              </Button>
            </>
          }
        >
          <DialogContentText sx={{ color: 'text.secondary' }}>
            학습이 완료되었습니다. 덱 목록으로 이동하시겠습니까?
          </DialogContentText>
        </Modal>
      </Container>
    </Box>
  );
};

export default FlashcardPracticePage;
