import React, { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Tag, Button, IconButton, Card, Text } from '../../components/ui';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  EditNote as EditNoteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useRedux';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}));

const FlashcardCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  minHeight: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: theme.spacing(3),
}));

const TagChip = styled(Tag)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
  marginRight: theme.spacing(0.5),
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 8,
  backgroundColor: theme.palette.grey[200],
  borderRadius: 4,
  overflow: 'hidden',
  marginBottom: theme.spacing(1),
}));

const ProgressFill = styled(Box)<{ value: number }>(({ theme, value }) => ({
  height: '100%',
  backgroundColor: theme.palette.primary.main,
  width: `${value}%`,
  transition: 'width 0.3s ease',
}));

type Difficulty = 'easy' | 'confusing' | 'hard' | null;

const FlashcardPracticePage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const { decks } = useAppSelector((state) => state.study);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [currentQuestionFeedback, setCurrentQuestionFeedback] = useState('');
  const [globalFeedback, setGlobalFeedback] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // 현재 덱 찾기
  const currentDeck = useMemo(() => {
    return decks.find(deck => deck.id === parseInt(deckId || '0'));
  }, [decks, deckId]);

  // 플래시카드 목록 (Redux에서 가져옴)
  const flashcards = useMemo(() => {
    if (!currentDeck) return [];
    return currentDeck.flashcards.map(card => ({
      ...card,
      question: card.front,
      answer: card.back,
      tags: card.tags ?? [],
    }));
  }, [currentDeck]);

  // 덱이나 카드가 없는 경우 처리
  if (!currentDeck || flashcards.length === 0) {
    return (
      <StyledContainer maxWidth="md">
        <HeaderBox>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Text variant="h5" fontWeight="bold">
            학습하기
          </Text>
        </HeaderBox>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
        >
          <Text variant="h6" color="text.secondary" gutterBottom>
            {!currentDeck ? '덱을 찾을 수 없습니다' : '학습할 카드가 없습니다'}
          </Text>
          <Button
            variant="contained"
            onClick={() => navigate('/study')}
            sx={{ mt: 2 }}
          >
            덱 목록으로 이동
          </Button>
        </Box>
      </StyledContainer>
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
    }
  };

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setSelectedDifficulty(null);
    } else {
      setShowCompletionDialog(true);
    }
  };

  const handleCompletionConfirm = () => {
    setShowCompletionDialog(false);
    navigate('/study');
  };

  const handleCompletionCancel = () => {
    setShowCompletionDialog(false);
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
    <StyledContainer maxWidth="md">
      {/* 헤더 */}
      <HeaderBox>
        <Text variant="h5" fontWeight="bold">
          {currentDeck.title}
        </Text>
      </HeaderBox>

      {/* 진행률 */}
      <Box sx={{ mb: 3 }}>
        <Text variant="body2" sx={{ mb: 1 }}>
          {currentCardIndex + 1}/{flashcards.length}
        </Text>
        <ProgressBar>
          <ProgressFill value={progress} />
        </ProgressBar>
      </Box>
      

      {/* 플래시카드 */}
      <FlashcardCard onClick={handleCardClick}>
        <Text
          variant={showAnswer ? "h4" : "h5"}
          sx={{
            textAlign: 'center',
            lineHeight: 1.6,
            fontWeight: showAnswer ? 700 : 500,
          }}
        >
          {showAnswer ? currentCard.answer : currentCard.question}
        </Text>
      </FlashcardCard>

      {/* 태그들 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {currentCard.tags.map((tag, index) => (
            <TagChip
              key={index}
              label={tag}
              variant="outlined"
            />
          ))}
        </Box>
      </Box>

      

      {/* 네비게이션(이전/다음) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderRadius: 3,
          mb: 4,
        }}
      >
        {/* 이전 버튼 */}
        <IconButton
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          sx={{
            width: 44,
            height: 44,
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
          <ArrowBackIcon />
        </IconButton>

        {/* 중앙: 인디케이터 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Text
            variant="body1"
            color="primary.main"
            fontWeight={600}
            sx={{ minWidth: 40, textAlign: 'center', mr: 1 }}
          >
            {currentCardIndex + 1}/{flashcards.length}
          </Text>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {flashcards.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: idx === currentCardIndex ? 'primary.main' : 'grey.300',
                  boxShadow: idx === currentCardIndex ? 1 : 0,
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* 다음 버튼 */}
        <IconButton
          onClick={handleNext}
          sx={{
            width: 44,
            height: 44,
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
          <ArrowForwardIcon />
        </IconButton>

      </Box>

      {/* 난이도 선택 버튼들 (답변이 보일 때만) */}
      {showAnswer && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
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
          </Box>
        </Box>
      )}

      {/* 피드백 섹션 (아코디언 드롭다운) */}
      <Accordion
        expanded={isFeedbackOpen}
        onChange={() => setIsFeedbackOpen(prev => !prev)}
        elevation={1}
        sx={{ borderRadius: 2, mb: 2, boxShadow: 1, '&:before': { display: 'none' } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ minHeight: 0, '& .MuiAccordionSummary-content': { my: 0.5 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditNoteIcon color="action" sx={{ mr: 1, fontSize: '1.2rem' }} />
            <Text variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
              피드백 (선택사항)
            </Text>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Text variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                이 문제에 대한 피드백
              </Text>
              <TextField
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
              <Text variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                전체적인 피드백
              </Text>
              <TextField
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
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 학습 완료 다이얼로그 */}
      <Dialog
        open={showCompletionDialog}
        onClose={handleCompletionCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          학습 완료
        </DialogTitle>
        <DialogContent>
          <Text color="text.secondary">
            학습이 완료되었습니다. 덱 목록으로 이동하시겠습니까?
          </Text>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompletionCancel} variant="outlined">
            아니오
          </Button>
          <Button onClick={handleCompletionConfirm} variant="contained">
            네
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default FlashcardPracticePage;
