import React, { useState, useMemo, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  IconButton,
  Container,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card as MuiCard,
  Button,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  EditNote as EditNoteIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useNavigationKeyboardShortcuts, useDialogKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { fetchCardsInDeck, setCurrentDeck } from '../../store/slices/deckSlice';
import { showToast } from '../../store/slices/toastSlice';
import { deckApiWithFallback } from '../../api/apiWithFallback';
import type { Card } from '../../types/card';

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

const FlashcardCard = styled(MuiCard)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  minHeight: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: theme.spacing(3),
  transition: 'all 0.2s',
  position: 'relative', // 태그를 절대 위치로 배치하기 위해
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const TagChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.65rem', // 더 작은 글자 크기
  height: 20, // 더 작은 높이
  marginRight: theme.spacing(0.5),
  '& .MuiChip-label': {
    padding: theme.spacing(0, 0.5), // 패딩 조정
  },
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
  const dispatch = useAppDispatch();
  
  // 🎯 deckSlice에서 데이터 가져오기
  const { decks, currentDeckCards, loading } = useAppSelector(
    (state) => state.deck
  );

  // 🎯 API Fallback을 위한 상태
  const [fallbackCards, setFallbackCards] = useState<Card[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [currentQuestionFeedback, setCurrentQuestionFeedback] = useState('');
  const [globalFeedback, setGlobalFeedback] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // 🎯 각 카드별 난이도 선택 결과 저장용 상태 추가
  const [cardDifficultyResults, setCardDifficultyResults] = useState<Array<{
    cardId: number;
    difficulty: Difficulty;
    timestamp: string;
  }>>([]);

  // 🎯 deckId로 현재 덱 찾기
  const currentDeck = useMemo(() => {
    return decks.find(deck => deck.deckId === deckId);
  }, [decks, deckId]);

  // 🎯 컴포넌트 마운트 시 카드 데이터 로드
  useEffect(() => {
    if (deckId) {
      dispatch(setCurrentDeck(deckId));
      dispatch(fetchCardsInDeck(deckId));
      
      // API Fallback으로 카드 데이터 로드
      const loadCardsWithFallback = async () => {
        setFallbackLoading(true);
        try {
          const fallbackData = await deckApiWithFallback.getCardsInDeck(deckId);
          setFallbackCards(fallbackData);
          console.log('✅ API Fallback으로 카드 목록 로드:', fallbackData);
        } catch (error) {
          console.error('❌ API Fallback 카드 로드 실패:', error);
        } finally {
          setFallbackLoading(false);
        }
      };

      loadCardsWithFallback();
    }
  }, [dispatch, deckId]);

  // 🎯 Redux와 Fallback 카드를 합치기
  const combinedCards = useMemo(() => {
    const cardMap = new Map<number, Card>();
    
    // Redux 카드 추가
    currentDeckCards.forEach(card => {
      cardMap.set(card.cardId, card);
    });
    
    // Fallback 카드 추가 (중복되지 않는 경우만)
    fallbackCards.forEach(card => {
      if (!cardMap.has(card.cardId)) {
        cardMap.set(card.cardId, card);
      }
    });
    
    return Array.from(cardMap.values());
  }, [currentDeckCards, fallbackCards]);

  // 🎯 API 데이터를 UI에 맞게 변환
  const flashcards = useMemo(() => {
    if (!currentDeck && fallbackCards.length === 0) return [];
    return combinedCards.map(card => ({
      ...card,
      id: card.cardId,
      question: card.content, // content -> question
      answer: card.answer,   // answer -> answer
      tags: [`#카드${card.cardId}`, '#학습'], // FlashCardListPage와 동일한 태그
    }));
  }, [currentDeck, combinedCards, fallbackCards.length]);

  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

  // 🎯 카드 변경 시 이전에 선택했던 난이도 복원
  useEffect(() => {
    if (currentCard) {
      const previousSelection = cardDifficultyResults.find(
        result => result.cardId === currentCard.cardId
      );
      setSelectedDifficulty(previousSelection?.difficulty || null);
    }
  }, [currentCardIndex, currentCard, cardDifficultyResults]);

  const handleCardClick = () => {
    setShowAnswer(!showAnswer);
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    const newDifficulty = selectedDifficulty === difficulty ? null : difficulty;
    setSelectedDifficulty(newDifficulty);
    
    // 🎯 콘솔에 deckId와 선택한 난이도 출력
    console.log('=== 난이도 선택 결과 ===');
    console.log('Deck ID:', deckId);
    console.log('Card ID:', currentCard?.cardId);
    console.log('Card Index:', currentCardIndex + 1);
    console.log('Selected Difficulty:', newDifficulty);
    console.log('Timestamp:', new Date().toISOString());
    
    // 🎯 선택된 난이도가 있을 때만 결과 배열에 저장
    if (newDifficulty && currentCard) {
      const newResult = {
        cardId: currentCard.cardId,
        difficulty: newDifficulty,
        timestamp: new Date().toISOString()
      };
      
      setCardDifficultyResults(prev => {
        // 같은 카드의 이전 선택 제거 후 새로운 선택 추가
        const filtered = prev.filter(result => result.cardId !== currentCard.cardId);
        const updated = [...filtered, newResult];
        
        return updated;
      });
    } else if (!newDifficulty && currentCard) {
      // 난이도 선택 해제 시 해당 카드 결과 제거
      setCardDifficultyResults(prev => {
        const filtered = prev.filter(result => result.cardId !== currentCard.cardId);
        return filtered;
      });
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      // 🎯 난이도 선택은 useEffect에서 자동으로 복원됨
    }
  };

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      // 🎯 난이도 선택은 useEffect에서 자동으로 복원됨
    } else {
      setShowCompletionDialog(true);
    }
  };

  const handleCompletionConfirm = () => {
    try {
      setShowCompletionDialog(false);
      
      // 🎯 학습 완료 시 전체 결과 콘솔 출력
      console.log('=== 학습 완료 - 전체 결과 ==='); 

      const study_data = {
        deckId: deckId,
        cardDifficultyResults
      }
      console.log('study_data:', study_data);

      // 학습 완료 토스트 알림
      dispatch(showToast({
        message: `학습을 완료했습니다! (${flashcards.length}개 카드)`,
        severity: 'success',
        duration: 4000
      }));
      
      // 상태 초기화
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setSelectedDifficulty(null);
      setCurrentQuestionFeedback('');
      setGlobalFeedback('');
      setIsFeedbackOpen(false);
      // 🎯 난이도 결과도 초기화
      setCardDifficultyResults([]);
      
      console.log('학습 완료 - 덱 목록으로 이동');
      navigate('/study');
    } catch (error) {
      console.error('학습 완료 처리 중 오류:', error);
      // 에러 토스트
      dispatch(showToast({
        message: '학습 완료 처리 중 오류가 발생했습니다.',
        severity: 'error'
      }));
      // 에러가 발생해도 기본 동작은 수행
      navigate('/study');
    }
  };

  const handleCompletionCancel = () => {
    setShowCompletionDialog(false);
    
    // 계속 학습 토스트 알림
    dispatch(showToast({
      message: '학습을 계속 진행합니다!',
      severity: 'info',
      duration: 2000
    }));
    
    console.log('학습 계속 진행');
  };

  // 🎯 플래시카드 네비게이션 키보드 단축키
  useNavigationKeyboardShortcuts(
    handlePrevious,
    handleNext,
    {
      enabled: flashcards.length > 0,
      isActive: () => !showCompletionDialog && !isFeedbackOpen
    }
  );
  
  // 🎯 학습 완료 다이얼로그 키보드 단축키
  useDialogKeyboardShortcuts(
    handleCompletionConfirm,
    handleCompletionCancel,
    {
      enabled: showCompletionDialog
    }
  );

  const getDifficultyButtonStyle = (difficulty: Difficulty) => {
    const isSelected = selectedDifficulty === difficulty;
    switch (difficulty) {
      case 'easy':
        return {
          backgroundColor: isSelected ? '#4caf50' : 'transparent',
          color: isSelected ? 'white' : '#4caf50',
          border: '2px solid #4caf50',
        };
      case 'confusing':
        return {
          backgroundColor: isSelected ? '#ff9800' : 'transparent',
          color: isSelected ? 'white' : '#ff9800',
          border: '2px solid #ff9800',
        };
      case 'hard':
        return {
          backgroundColor: isSelected ? '#f44336' : 'transparent',
          color: isSelected ? 'white' : '#f44336',
          border: '2px solid #f44336',
        };
      default:
        return {};
    }
  };

  return (
    <StyledContainer maxWidth="md">
      {/* 헤더 */}
      <HeaderBox>
        <Typography variant="h5" fontWeight="bold">
          {currentDeck?.deckName}
        </Typography>
      </HeaderBox>

      {/* API Fallback 정보 표시 */}
      {fallbackCards.length > 0 && (
        <Box 
          sx={{ 
            mb: 2, 
            p: 2, 
            backgroundColor: '#e3f2fd', 
            border: '1px solid #2196f3',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <InfoIcon color="primary" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              🎉 API Fallback 시스템 작동 중!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fallbackCards.length}개의 Mock 카드를 사용하여 학습 기능을 체험하고 있습니다.
            </Typography>
          </Box>
        </Box>
      )}

      {(loading || fallbackLoading) && <Typography>카드를 불러오는 중...</Typography>}

      {!loading && !fallbackLoading && flashcards.length > 0 && (
        <>
          {/* 진행률: 상단에만 표시 (미니멀리즘 적용) */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {currentCardIndex + 1}/{flashcards.length}
            </Typography>
            <ProgressBar>
              <ProgressFill value={progress} />
            </ProgressBar>
          </Box>
          
          {/* 플래시카드 */}
          <FlashcardCard onClick={handleCardClick}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 카드 내용 */}
              <Typography
                variant={showAnswer ? "body2" : "h5"}
                textAlign="center"
                sx={{
                  lineHeight: 1.6,
                  fontWeight: showAnswer ? 700 : 500,
                  mb: !showAnswer ? 2 : 0,
                }}
              >
                {showAnswer ? currentCard.answer : currentCard.question}
              </Typography>
              
              {/* 태그들 - 카드 하단에 고정 */}
              {!showAnswer && (
                <Box sx={{ 
                  position: 'absolute',
                  bottom: theme => theme.spacing(2.5), // 카드 바닥에서 조금 더 위로
                  left: theme => theme.spacing(3),
                  right: theme => theme.spacing(3),
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 0.5, 
                  justifyContent: 'center'
                }}>
                  {currentCard.tags.slice(0, 3).map((tag, index) => (
                    <TagChip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))}
                  {currentCard.tags.length > 3 && (
                    <TagChip 
                      label={`+${currentCard.tags.length - 3}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              )}
            </Box>
          </FlashcardCard>

          {/* 네비게이션: 이전/다음 버튼만 (미니멀리즘 적용) */}
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
            <Tooltip title="← 방향키: 이전 카드" arrow placement="top">
              <span>
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
              </span>
            </Tooltip>

            {/* 중앙: 진행률 표시 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              {/* 진행률 숫자 */}
              <Typography
                variant="body2"
                color="primary.main"
                fontWeight={600}
                sx={{ fontSize: '0.875rem' }}
              >
                {currentCardIndex + 1}/{flashcards.length}
              </Typography>
              
              {/* 동그라미 인디케이터 - 페이지네이션 필요 없어서 일단 주석처리 */}
              {/* {flashcards.length <= 10 && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {flashcards.map((_, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: idx === currentCardIndex ? 'primary.main' : 'grey.300',
                        boxShadow: idx === currentCardIndex ? 1 : 0,
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </Box>
              )} */}
            </Box>

            {/* 다음 버튼 */}
            <Tooltip title="→ 방향키: 다음 카드" arrow placement="top">
              <span>
                <IconButton
                  onClick={handleNext}
                  disabled={!selectedDifficulty}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: selectedDifficulty ? 'primary.main' : 'grey.300',
                    color: selectedDifficulty ? 'white' : 'grey.500',
                    '&:hover': { 
                      bgcolor: selectedDifficulty ? 'primary.dark' : 'grey.300'
                    },
                    '&:disabled': {
                      bgcolor: 'grey.300',
                      color: 'grey.500',
                    },
                    boxShadow: selectedDifficulty ? 1 : 0,
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* 난이도 선택 버튼들 (항상 표시) */}
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
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  피드백 (선택사항)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    이 문제에 대한 피드백
                  </Typography>
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
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    전체적인 피드백
                  </Typography>
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
        </>
      )}

      {!loading && !fallbackLoading && !flashcards.length && (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="text.secondary">
            {currentDeck || fallbackCards.length > 0
              ? '이 덱에는 카드가 없습니다.'
              : '덱을 찾을 수 없습니다.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/study')}
            sx={{ mt: 2 }}
          >
            덱 목록으로 돌아가기
          </Button>
        </Box>
      )}

      {/* 학습 완료 다이얼로그 */}
      <Dialog open={showCompletionDialog} onClose={handleCompletionCancel}>
        <DialogTitle>
          학습 완료
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            학습이 완료되었습니다. 덱 목록으로 이동하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompletionCancel}>계속 학습</Button>
          <Button onClick={handleCompletionConfirm} variant="contained">
            덱 목록으로
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default FlashcardPracticePage;
