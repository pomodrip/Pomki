import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ui/ProgressBar';
import { QuizQuestion, FlashcardGenerationSession } from '../../types/card';

// 샘플 퀴즈 데이터
const sampleQuestions: QuizQuestion[] = [
  {
    id: '1',
    title: 'React 이해도',
    question: 'React의 자동적 인터페이스를 구성하는 단위는 무엇인가?',
    options: ['컴포넌트', '자식', '프롭스', '스테이트'],
    correctAnswer: 0,
  },
  {
    id: '2', 
    title: 'React 이해도',
    question: 'React의 장점 방식에 대한 설명 중 가장 올바른 것은 무엇인가요?',
    options: [
      '상태를 이용하여 UI를 동적으로 변경하고 이벤트를 핸들링합니다.',
      '상태를 이용하여 UI를 정적으로 변경하고 이벤트를 핸들링합니다.',
      '상태를 이용하여 UI를 동적으로 변경하고 이벤트를 핸들링하지 않습니다.',
      '상태를 이용하지 않고 UI를 동적으로 변경하고 이벤트를 핸들링합니다.',
    ],
    correctAnswer: 0,
  },
  {
    id: '3',
    title: 'React 이해도',
    question: '아래 중 가상 DOM에 대한 설명으로 옳은 것은 무엇인가?',
    options: [
      '가상 DOM은 현재 위치에 보이는 요소에 대한 자바스크립트 객체의 복사본입니다.',
      '가상 DOM은 실제 DOM을 직접 조작하여 위명을 갱신합니다.',
      '가상 DOM은 실제 DOM의 변경을 감지하여 위명을 갱신합니다.',
      '가상 DOM은 실제 DOM과 독립적으로 유지하여 화면을 갱신합니다.',
    ],
    correctAnswer: 0,
  },
  {
    id: '4',
    title: 'React 이해도',
    question: '이벤트 핸들링에 대한 설명으로 올바른 것은?',
    options: [
      '이벤트 핸들러는 이벤트가 발생했을 때 호출되는 함수입니다.',
      '이벤트 핸들러는 이벤트의 전파를 막습니다.',
      '이벤트 핸들러는 이벤트의 전파를 막습니다.',
      '이벤트 핸들러는 이벤트의 전파를 막습니다.',
    ],
    correctAnswer: 0,
  },
  {
    id: '5',
    title: 'React 이해도',
    question: '이러한 상황에서 자식을 위한 최적의 방법은 무엇가요?',
    options: [
      '자식을 생성하고 자식의 상태를 유지하기 위한 이벤트 핸들러를 사용합니다.',
      '자식을 생성하고 자식의 상태를 유지하기 위한 이벤트 핸들러를 사용합니다.',
      '자식을 생성하고 자식의 상태를 유지하기 위한 이벤트 핸들러를 사용합니다.',
      '자식을 생성하고 자식의 상태를 유지하기 위한 이벤트 핸들러를 사용합니다.',
    ],
    correctAnswer: 0,
  },
];

const FlashcardGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<FlashcardGenerationSession>({
    id: 'session-1',
    questions: sampleQuestions,
    currentQuestionIndex: 0,
    userAnswers: {},
    feedback: '',
    isCompleted: false,
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showCreateButton, setShowCreateButton] = useState(false);

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;
  const hasAnsweredQuestions = Object.keys(session.userAnswers).length > 0;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newUserAnswers = {
      ...session.userAnswers,
      [currentQuestion.id]: selectedAnswer,
    };

    setSession(prev => ({
      ...prev,
      currentQuestionIndex: isLastQuestion ? prev.currentQuestionIndex : prev.currentQuestionIndex + 1,
      userAnswers: newUserAnswers,
    }));

    // 마지막 질문에서 답변하면 생성 버튼 표시
    if (isLastQuestion) {
      setShowCreateButton(true);
    }
    
    setSelectedAnswer(null);
  };

  const handleCreateFlashcards = () => {
    // 여기서 실제 플래시카드 생성 API 호출
    console.log('플래시카드 생성 중...', session.userAnswers);
    navigate('/study/flashcard-decks');
  };

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSession(prev => ({
      ...prev,
      feedback: event.target.value,
    }));
  };

  const handleShowErrorDialog = () => {
    setShowErrorDialog(true);
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const handleDirectCreate = () => {
    setShowErrorDialog(false);
    navigate('/study/flashcard-create-direct');
  };

  const handleGoToNotes = () => {
    setShowErrorDialog(false);
    navigate('/notes');
  };

  return (
    <Box sx={{ px: 2, pb: 10 }}>
      {/* 진행률 표시 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {session.currentQuestionIndex + 1}/{session.questions.length}
        </Typography>
        <ProgressBar variant="quiz" value={progress} />
      </Box>

      {/* 질문 영역 */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, lineHeight: 1.4 }}>
          {currentQuestion.question}
        </Typography>

        {/* 선택지 */}
        <RadioGroup 
          value={selectedAnswer?.toString() || ''} 
          onChange={(e) => handleAnswerSelect(Number(e.target.value))}
        >
          {currentQuestion.options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={index.toString()}
              control={<Radio />}
              label={option}
              sx={{
                mb: 1,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.95rem',
                  lineHeight: 1.4,
                },
              }}
            />
          ))}
        </RadioGroup>
      </Paper>

      {/* 하단 네비게이션 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <IconButton 
          onClick={() => {
            if (session.currentQuestionIndex > 0) {
              setSession(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex - 1,
              }));
              setSelectedAnswer(null);
              setShowCreateButton(false);
            }
          }}
          disabled={session.currentQuestionIndex === 0}
        >
          <ArrowBack />
        </IconButton>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: session.questions.length }, (_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === session.currentQuestionIndex ? 'primary.main' : 'grey.300',
              }}
            />
          ))}
        </Box>

        <IconButton 
          onClick={() => {
            if (session.currentQuestionIndex < session.questions.length - 1) {
              setSession(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex + 1,
              }));
              setSelectedAnswer(null);
              setShowCreateButton(false);
            }
          }}
          disabled={session.currentQuestionIndex === session.questions.length - 1}
        >
          <ArrowBack sx={{ transform: 'rotate(180deg)' }} />
        </IconButton>
      </Box>

      {/* 피드백 입력 */}
      <TextField
        fullWidth
        placeholder="피드백 추가연더 정확한 생성 가능합니다."
        value={session.feedback}
        onChange={handleFeedbackChange}
        variant="outlined"
        size="small"
        sx={{ mb: 3 }}
      />

      {/* 선택/생성 버튼 */}
      {!showCreateButton ? (
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleNext}
          disabled={selectedAnswer === null}
          sx={{ mb: 2 }}
        >
          선택
        </Button>
      ) : (
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleCreateFlashcards}
          disabled={!hasAnsweredQuestions}
          sx={{ mb: 2 }}
        >
          플래시 카드 생성
        </Button>
      )}

      {/* 에러 다이얼로그 트리거 버튼 (개발용) */}
      <Button
        fullWidth
        variant="outlined"
        size="large"
        onClick={handleShowErrorDialog}
        sx={{ mb: 2 }}
      >
        콘텐츠 분석 실패 시나리오 (개발용)
      </Button>

      {/* 에러 다이얼로그 */}
      <Dialog 
        open={showErrorDialog} 
        onClose={handleCloseErrorDialog}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create flashcards
          <IconButton onClick={handleCloseErrorDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
            콘텐츠를 분석하기 어렵습니다.
            <br />
            학습노트를 수정하거나 직접 단원이주세요.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleDirectCreate}
          >
            직접 생성
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoToNotes}
          >
            노트로 이동
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={handleCloseErrorDialog}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlashcardGenerationPage; 