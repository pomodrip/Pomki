import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Button,
  TextField,
  Container,
  Stack,
  DialogContentText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Tag from '../../components/ui/Tag';
import Modal from '../../components/ui/Modal';

// 예시 플래시카드 데이터
const flashcards = [
  {
    id: 1,
    question: 'React에서 사용자 인터페이스를 구성하는 기본 단위란 무엇인가요?',
    answer: '컴포넌트',
    tags: ['React', '컴포넌트', 'Frontend'],
  },
  {
    id: 2,
    question: 'JSX란 무엇인가요?',
    answer: 'JavaScript XML의 줄임말로, React에서 UI를 작성하기 위한 문법 확장',
    tags: ['React', 'JSX', 'Frontend'],
  },
  {
    id: 3,
    question: 'useState Hook의 용도는?',
    answer: '함수형 컴포넌트에서 상태를 관리하기 위한 Hook',
    tags: ['React', 'Hook', 'useState'],
  },
  {
    id: 4,
    question: 'useEffect Hook은 언제 사용하나요?',
    answer: '컴포넌트의 생명주기와 관련된 작업을 수행할 때',
    tags: ['React', 'Hook', 'useEffect'],
  },
  {
    id: 5,
    question: 'Props란 무엇인가요?',
    answer: '부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법',
    tags: ['React', 'Props', 'Frontend'],
  },
];

type Difficulty = 'easy' | 'confusing' | 'hard' | null;

const FlashcardPracticePage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

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
            py: 2,
          }}
        >
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            React 이해도
          </Typography>
        </Box>

        {/* 진행률 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {currentCardIndex + 1}/{flashcards.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: '#1976d2',
              },
            }}
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
            variant="h6" 
            textAlign="center"
            sx={{ 
              lineHeight: 1.6,
              fontSize: showAnswer ? '1.5rem' : '1.25rem',
              fontWeight: showAnswer ? 700 : 500,
            }}
          >
            {showAnswer ? currentCard.answer : currentCard.question}
          </Typography>
        </Card>

        {/* 태그들 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Tags
          </Typography>
          <Stack direction="row" spacing={1}>
            {currentCard.tags.map((tag, index) => (
              <Tag key={index} label={tag} size="small" />
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
                  borderRadius: 2,
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
                  borderRadius: 2,
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
                  borderRadius: 2,
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
            sx={{ 
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' },
              '&:disabled': { backgroundColor: '#fafafa' },
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
                  backgroundColor: index === currentCardIndex ? '#1976d2' : '#e0e0e0',
                }}
              />
            ))}
          </Stack>
          
          <IconButton 
            onClick={handleNext}
            sx={{ 
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* 하단 입력창 */}
        <TextField
          fullWidth
          placeholder="답을 입력하신 다음 카드를 클릭해보세요."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
                     }}
         />

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
