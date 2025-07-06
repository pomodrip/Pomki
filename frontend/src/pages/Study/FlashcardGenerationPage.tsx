import React, { useState, useEffect } from 'react';
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
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArrowBackIosNew from '@mui/icons-material/ArrowBackIosNew';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import type { QuizItem } from '../../types/quiz';
import { createCard } from '../../store/slices/deckSlice';
import type { CardDeck } from '../../types/card';
import DeckSelectionDialog from '../../components/deck/DeckSelectionDialog';
import { useSnackbar } from '../../hooks/useSnackbar';
// import * as studyApi from '../../api/studyApi';

// ======================================================================
// 타입 정의: 이 페이지에서만 사용되는 로컬 타입
// ======================================================================
interface QuestionFeedback {
  questionId: string;
  feedback: string;
}

interface FlashcardGenerationSession {
  id: string;
  questions: QuizItem[]; // QuizItem 타입 사용
  currentQuestionIndex: number;
  userAnswers: Record<string, string>; // 문자열 답변 저장을 위해 string으로 변경
  selectedQuestions: Set<string>;
  feedback: string;
  questionFeedbacks: QuestionFeedback[];
  isCompleted: boolean;
}

const FlashcardGenerationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { noteId } = useParams<{ noteId: string }>();
  const { notes } = useAppSelector((state) => state.note);
  const [noteTitle, setNoteTitle] = useState('플래시카드 생성');
  
  const [isDeckDialogOpen, setDeckDialogOpen] = useState(false);
  const showSnackbar = useSnackbar();
  
  // 이전 페이지에서 전달받은 데이터 사용
  const receivedQuizzes: QuizItem[] = location.state?.quizzes || [];
  const receivedNoteTitle: string = location.state?.noteTitle || '플래시카드 생성';
  
  // 퀴즈에 임시 ID 부여 (상태 관리용)
  const quizzesWithId = React.useMemo(() => 
    receivedQuizzes.map((q, index) => ({
      ...q,
      id: q.id || `temp-id-${index}`,
    })), [receivedQuizzes]);

  const [session, setSession] = useState<FlashcardGenerationSession>({
    id: `session-${noteId || new Date().getTime()}`,
    questions: quizzesWithId,
    currentQuestionIndex: 0,
    userAnswers: {},
    selectedQuestions: new Set<string>(),
    feedback: '',
    questionFeedbacks: [],
    isCompleted: false,
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestionFeedback, setCurrentQuestionFeedback] = useState('');

  useEffect(() => {
    if (noteId) {
      const currentNote = notes.find(note => note.noteId === noteId);
      if (currentNote) {
        setNoteTitle(currentNote.noteTitle);
      }
    }
  }, [noteId, notes]);

  useEffect(() => {
    // 퀴즈 데이터가 없으면 노트 목록 페이지로 리다이렉트
    if (!receivedQuizzes || receivedQuizzes.length === 0) {
      console.warn('퀴즈 데이터가 없어 노트 목록 페이지로 돌아갑니다.');
      navigate('/note');
    }
  }, [receivedQuizzes, navigate]);

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;
  const isFirstQuestion = session.currentQuestionIndex === 0;
  
  const selectedQuestionsCount = session.selectedQuestions.size;
  const isCurrentQuestionSelected = currentQuestion && session.selectedQuestions.has(currentQuestion.id as string);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    if (!currentQuestion?.id) return; // 방어 코드
    setSession(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [currentQuestion.id as string]: answer,
      },
    }));
  };

  const handleQuestionSelect = (index: number) => {
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: index,
      isCompleted: false,
    }));
    
    const nextQuestionId = session.questions[index].id as string;
    const nextAnswer = session.userAnswers[nextQuestionId];
    const nextFeedback = session.questionFeedbacks.find(f => f.questionId === nextQuestionId)?.feedback || '';
    
    setSelectedAnswer(nextAnswer !== undefined ? nextAnswer : null);
    setCurrentQuestionFeedback(nextFeedback);
  };

  const handleNext = () => {
    if (!currentQuestion?.id) return; // 방어 코드
    const nextIndex = isLastQuestion ? 0 : session.currentQuestionIndex + 1;
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      isCompleted: false,
    }));
    
    const nextQuestionId = session.questions[nextIndex].id as string;
    const nextAnswer = session.userAnswers[nextQuestionId];
    const nextFeedback = session.questionFeedbacks.find(f => f.questionId === nextQuestionId)?.feedback || '';
    
    setSelectedAnswer(nextAnswer !== undefined ? nextAnswer : null);
    setCurrentQuestionFeedback(nextFeedback);
  };

  const handlePrevious = () => {
    const prevIndex = isFirstQuestion ? session.questions.length - 1 : session.currentQuestionIndex - 1;
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: prevIndex,
      isCompleted: false,
    }));
    
    const prevQuestionId = session.questions[prevIndex].id as string;
    const previousAnswer = session.userAnswers[prevQuestionId];
    const previousFeedback = session.questionFeedbacks.find(f => f.questionId === prevQuestionId)?.feedback || '';
    
    setSelectedAnswer(previousAnswer !== undefined ? previousAnswer : null);
    setCurrentQuestionFeedback(previousFeedback);
  };

  const handleQuestionSelection = () => {
    setSession(prev => {
      const newSelectedQuestions = new Set(prev.selectedQuestions);
      const questionId = currentQuestion.id as string;
      if (isCurrentQuestionSelected) {
        newSelectedQuestions.delete(questionId);
      } else {
        newSelectedQuestions.add(questionId);
      }
      return {
        ...prev,
        selectedQuestions: newSelectedQuestions,
      };
    });
  };

  const handleQuestionFeedbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFeedback = event.target.value;
    setCurrentQuestionFeedback(newFeedback);
    
    if (!currentQuestion?.id) return; // 방어 코드
    setSession(prev => {
      const existingFeedbackIndex = prev.questionFeedbacks.findIndex(
        f => f.questionId === currentQuestion.id
      );
      
      let newQuestionFeedbacks;
      if (existingFeedbackIndex >= 0) {
        newQuestionFeedbacks = [...prev.questionFeedbacks];
        newQuestionFeedbacks[existingFeedbackIndex] = {
          questionId: currentQuestion.id as string,
          feedback: newFeedback
        };
      } else {
        newQuestionFeedbacks = [
          ...prev.questionFeedbacks,
          { questionId: currentQuestion.id as string, feedback: newFeedback }
        ];
      }
      
      return {
        ...prev,
        questionFeedbacks: newQuestionFeedbacks
      };
    });
  };

  const generateFlashcards = async () => {
    if (session.selectedQuestions.size === 0) {
      showSnackbar('플래시카드로 만들 문제를 선택해주세요.', 'warning');
      return;
    }
    setDeckDialogOpen(true);
  };

  const handleDeckSelected = async (deck: CardDeck) => {
    setDeckDialogOpen(false);

    const selectedQuizData = session.questions
      .filter(q => session.selectedQuestions.has(q.id as string))
      .map(q => ({
        content: q.question,
        answer: q.answer,
      }));

    if (selectedQuizData.length === 0) {
      showSnackbar('선택된 문제가 없습니다.', 'warning');
      return;
    }

    try {
      // Promise.all을 사용하여 여러 카드를 병렬로 생성
      await Promise.all(
        selectedQuizData.map(cardData =>
          dispatch(
            createCard({
              deckId: deck.deckId,
              data: {
                deckId: deck.deckId,
                content: cardData.content,
                answer: cardData.answer,
              },
            })
          ).unwrap()
        )
      );
      
      showSnackbar(`${deck.deckName} 덱에 ${selectedQuizData.length}개의 카드가 생성되었습니다.`, 'success');
      navigate(`/flashcards/${deck.deckId}/cards`);
    } catch (error) {
      console.error('플래시카드 생성 실패:', error);
      showSnackbar('플래시카드 생성에 실패했습니다.', 'error');
    }
  };

  const handleGlobalFeedbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSession(prev => ({
      ...prev,
      feedback: event.target.value,
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const currentFeedback =
      session.questionFeedbacks.find(
        (f) => f.questionId === (currentQuestion?.id ?? '')
      )?.feedback || '';
    setCurrentQuestionFeedback(currentFeedback);
  }, [session.currentQuestionIndex, session.questionFeedbacks, currentQuestion?.id]);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 컨텍스트 헤더 (뒤로가기 + 제목) */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2,
          height: 72,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
        }}
      >
        {/* 뒤로가기 버튼 */}
        <IconButton 
          onClick={handleBack}
          sx={{ 
            position: 'absolute',
            left: 16,
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <ArrowBackIosNew />
        </IconButton>
        
        {/* 중앙 제목 */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h6" fontWeight={600} noWrap>
            {receivedNoteTitle}
          </Typography>
        </Box>
      </Box>

      {/* 메인 컨텐츠 */}
      <Box 
        sx={{ 
          flex: 1,
          height: `calc(100vh - ${isMobile ? 72 : 72}px)`,
          overflow: 'hidden',
        }}
      >
        {isMobile ? (
          // 모바일/태블릿 레이아웃 (1컬럼)
          <Box 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              pb: 12,
            }}
          >
            <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, overflow: 'auto' }}>
              {/* 네비게이션 (아래로 이동) */}
              <Box 
                sx={{ 
                  display: 'none', /* 상단 네비게이션은 숨김 처리 */
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mt: 3,
                  mb: 3,
                  py: 1,
                }}
              >
                <IconButton 
                  onClick={handlePrevious}
                  size="medium"
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    boxShadow: 1,
                  }}
                >
                  <ArrowBack />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body1" fontWeight={600} color="primary.main">
                    {session.currentQuestionIndex + 1}/{session.questions.length}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {session.questions.map((question, index) => {
                      const isSelected = session.selectedQuestions.has(question.id as string);
                      const isCurrent = index === session.currentQuestionIndex;
                      
                      return (
                        <Box
                          key={index}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: isCurrent 
                              ? 'primary.main' 
                              : isSelected 
                                ? 'warning.main' 
                                : 'grey.300',
                            boxShadow: isCurrent ? 1 : 0,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

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
                  <ArrowForward />
                </IconButton>
              </Box>

              {/* 현재 진행도 */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                {session.currentQuestionIndex + 1} / {session.questions.length}
              </Typography>

              {/* 질문 */}
              <Typography variant="h5" fontWeight={600} sx={{ mb: 4, textAlign: 'center' }}>
                {currentQuestion?.question}
              </Typography>

              {/* ======================================= */}
              {/* 퀴즈 유형별 렌더링                   */}
              {/* ======================================= */}
              
              {/* MULTIPLE_CHOICE */}
              {currentQuestion?.type === 'MULTIPLE_CHOICE' && (
                <RadioGroup
                  value={selectedAnswer || ''}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  sx={{ mb: 3 }}
                >
                  {currentQuestion.options.map((option, index) => (
                    <Paper
                      key={index}
                      elevation={selectedAnswer === option ? 3 : 1}
                      sx={{
                        mb: 1.5,
                        border: '2px solid',
                        borderColor: selectedAnswer === option ? 'primary.main' : 'grey.200',
                        borderRadius: 2,
                        bgcolor: selectedAnswer === option ? 'primary.50' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: selectedAnswer === option ? 'primary.100' : 'primary.25',
                          transform: 'translateY(-1px)',
                          boxShadow: 2,
                        }
                      }}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      <FormControlLabel
                        value={option}
                        control={
                          <Radio
                            size="small"
                            sx={{
                              color: selectedAnswer === option ? 'primary.main' : 'grey.400',
                              '&.Mui-checked': {
                                color: 'primary.main',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: { xs: '0.85rem', sm: '0.95rem' },
                              lineHeight: 1.4,
                              color: selectedAnswer === option ? 'text.primary' : 'text.secondary',
                              fontWeight: selectedAnswer === option ? 600 : 400,
                            }
                          }
                          >
                            {option}
                          </Typography>
                        }
                        sx={{ p: 1.5, pl: 2, width: '100%', m: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              )}

              {/* FILL_IN_THE_BLANK / SHORT_ANSWER */}
              {(currentQuestion?.type === 'FILL_IN_THE_BLANK' || currentQuestion?.type === 'SHORT_ANSWER') && (
                <TextField
                  fullWidth
                  variant="outlined"
                  label={currentQuestion.type === 'FILL_IN_THE_BLANK' ? "빈칸에 들어갈 말을 입력하세요" : "답변을 입력하세요"}
                  value={selectedAnswer || ''}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}
                />
              )}
              
              {/* 네비게이션 + 문제 선택 버튼 (한 줄) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  mb: 3,
                }}
              >
                {/* 이전 */}
                <IconButton
                  onClick={handlePrevious}
                  size="medium"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    boxShadow: 1,
                  }}
                >
                  <ArrowBack />
                </IconButton>

                {/* 진행률 (숨김) */}
                {/**
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  {session.currentQuestionIndex + 1}/{session.questions.length}
                </Typography>
                */}

                {/* 문제 선택 */}
                <Button
                  variant={isCurrentQuestionSelected ? 'outlined' : 'contained'}
                  startIcon={isCurrentQuestionSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlank />}
                  onClick={handleQuestionSelection}
                  sx={{
                    borderRadius: '20px',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                  }}
                >
                  {isCurrentQuestionSelected ? '선택 해제' : '이 문제 선택'}
                </Button>

                {/* 다음 */}
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
                  <ArrowForward />
                </IconButton>
              </Box>
              
              {/* 피드백 입력란 */}
              <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, mb: 2 }}>
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
                    <TextField
                      placeholder="예: 더 자세한 설명이 필요해요"
                      value={currentQuestionFeedback}
                      onChange={handleQuestionFeedbackChange}
                      variant="outlined"
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.85rem',
                          bgcolor: 'grey.50',
                          borderRadius: 2,
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
                      value={session.feedback}
                      onChange={handleGlobalFeedbackChange}
                      variant="outlined"
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.85rem',
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* 모바일 하단 고정 버튼 */}
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'background.paper',
                borderTop: '2px solid',
                borderColor: 'divider',
                p: 2,
                pb: 3,
                zIndex: 1100,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <Button
                variant="contained"
                fullWidth
                startIcon={<AutoAwesome />}
                onClick={generateFlashcards}
                disabled={selectedQuestionsCount === 0}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                    color: 'grey.500',
                  }
                }}
              >
                {selectedQuestionsCount === 0 
                  ? '문제를 선택해주세요' 
                  : `플래시카드 생성 (${selectedQuestionsCount}개)`
                }
              </Button>
              
              {selectedQuestionsCount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, gap: 1, flexWrap: 'wrap' }}>
                  {session.questions.map((question, index) => {
                    const isSelected = session.selectedQuestions.has(question.id as string);
                    return isSelected ? (
                      <Chip
                        key={index}
                        label={`Q${index + 1}`}
                        size="small"
                        color="warning"
                        variant="filled"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    ) : null;
                  })}
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          // 데스크탑 2컬럼 레이아웃
          <Box 
            sx={{ 
              height: '100%',
              py: 4,
              px: 5,
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                gap: 4,
                height: '100%',
              }}
            >
              {/* 왼쪽 컬럼: 문제 영역 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 네비게이션 */}
                <Box 
                  sx={{ 
                    display: 'none', /* 상단 네비게이션은 숨김 처리 */
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mt: 4,
                    mb: 3,
                  }}
                >
                  <IconButton 
                    onClick={handlePrevious}
                    size="large"
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      boxShadow: 2,
                    }}
                  >
                    <ArrowBack />
                  </IconButton>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {session.currentQuestionIndex + 1}/{session.questions.length}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {session.questions.map((question, index) => {
                        const isSelected = session.selectedQuestions.has(question.id as string);
                        const isCurrent = index === session.currentQuestionIndex;
                        
                        return (
                          <Box
                            key={index}
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: isCurrent 
                                ? 'primary.main' 
                                : isSelected 
                                  ? 'warning.main' 
                                  : 'grey.300',
                              boxShadow: isCurrent ? 2 : 0,
                              transform: isCurrent ? 'scale(1.3)' : 'scale(1)',
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>

                  <IconButton 
                    onClick={handleNext}
                    size="large"
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      boxShadow: 2,
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </Box>

                {/* 현재 진행도 */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  {session.currentQuestionIndex + 1} / {session.questions.length}
                </Typography>

                {/* 질문 */}
                <Typography variant="h5" fontWeight={600} sx={{ mb: 4, textAlign: 'center' }}>
                  {currentQuestion?.question}
                </Typography>

                {/* ======================================= */}
                {/* 퀴즈 유형별 렌더링                   */}
                {/* ======================================= */}
                
                {/* MULTIPLE_CHOICE */}
                {currentQuestion?.type === 'MULTIPLE_CHOICE' && (
                  <RadioGroup
                    value={selectedAnswer || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    sx={{ mb: 3 }}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <Paper
                        key={index}
                        elevation={selectedAnswer === option ? 3 : 1}
                        sx={{
                          mb: 1.5,
                          border: '2px solid',
                          borderColor: selectedAnswer === option ? 'primary.main' : 'grey.200',
                          borderRadius: 2,
                          bgcolor: selectedAnswer === option ? 'primary.50' : 'background.paper',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: selectedAnswer === option ? 'primary.100' : 'primary.25',
                            transform: 'translateY(-1px)',
                            boxShadow: 2,
                          }
                        }}
                        onClick={() => handleAnswerSelect(option)}
                      >
                        <FormControlLabel
                          value={option}
                          control={
                            <Radio
                              size="small"
                              sx={{
                                color: selectedAnswer === option ? 'primary.main' : 'grey.400',
                                '&.Mui-checked': {
                                  color: 'primary.main',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body1"
                              sx={{
                                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                                lineHeight: 1.4,
                                color: selectedAnswer === option ? 'text.primary' : 'text.secondary',
                                fontWeight: selectedAnswer === option ? 600 : 400,
                              }
                            }
                            >
                              {option}
                            </Typography>
                          }
                          sx={{ p: 1.5, pl: 2, width: '100%', m: 0 }}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                )}

                {/* FILL_IN_THE_BLANK / SHORT_ANSWER */}
                {(currentQuestion?.type === 'FILL_IN_THE_BLANK' || currentQuestion?.type === 'SHORT_ANSWER') && (
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={currentQuestion.type === 'FILL_IN_THE_BLANK' ? "빈칸에 들어갈 말을 입력하세요" : "답변을 입력하세요"}
                    value={selectedAnswer || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
                  />
                )}
                {/* 네비게이션 + 문제 선택 버튼 (한 줄) */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: 2,
                    mt: 4,
                    mb: 3,
                  }}
                >
                  <IconButton 
                    onClick={handlePrevious}
                    size="large"
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      boxShadow: 2,
                    }}
                  >
                    <ArrowBack />
                  </IconButton>

                  {/* 진행률 (숨김) */}
                  {/**
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {session.currentQuestionIndex + 1}/{session.questions.length}
                  </Typography>
                  */}

                  <Button
                    variant={isCurrentQuestionSelected ? 'outlined' : 'contained'}
                    startIcon={isCurrentQuestionSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlank />}
                    onClick={handleQuestionSelection}
                    sx={{
                      borderRadius: '20px',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                    }}
                  >
                    {isCurrentQuestionSelected ? '선택 해제' : '이 문제 선택하기'}
                  </Button>

                  <IconButton 
                    onClick={handleNext}
                    size="large"
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      boxShadow: 2,
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </Box>
              </Box>

              {/* 오른쪽 컬럼: 피드백 및 생성 버튼 */}
              <Box sx={{ flex: '0 0 420px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 피드백 섹션 (숨김) */}
                {/**
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EditNoteIcon color="action" sx={{ mr: 1.5, fontSize: '1.5rem' }}/>
                    <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                      피드백 (선택사항)
                    </Typography>
                  </Box>
                  
                  <Stack spacing={3} sx={{ flex: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary" 
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        이 문제에 대한 피드백
                      </Typography>
                      <TextField
                        placeholder="예: 더 자세한 설명이 필요해요"
                        value={currentQuestionFeedback}
                        onChange={handleQuestionFeedbackChange}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.95rem',
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary" 
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        전체적인 피드백
                      </Typography>
                      <TextField
                        placeholder="예: 실무 예시를 더 포함해주세요"
                        value={session.feedback}
                        onChange={handleGlobalFeedbackChange}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.95rem',
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>
                */}

                {/* 생성 버튼 */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'primary.50',
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<AutoAwesome />}
                    onClick={generateFlashcards}
                    disabled={selectedQuestionsCount === 0}
                    sx={{
                      py: 2.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1.2rem',
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        bgcolor: 'grey.300',
                        color: 'grey.500',
                      }
                    }}
                  >
                    {selectedQuestionsCount === 0 
                      ? '문제를 선택해주세요' 
                      : `플래시카드 생성 (${selectedQuestionsCount}개)`
                    }
                  </Button>
                  
                  {selectedQuestionsCount > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 2, 
                      gap: 1, 
                      flexWrap: 'wrap' 
                    }}>
                      {session.questions.map((question, index) => {
                        const isSelected = session.selectedQuestions.has(question.id as string);
                        return isSelected ? (
                          <Chip
                            key={index}
                            label={`Q${index + 1}`}
                            size="medium"
                            color="warning"
                            variant="filled"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.9rem',
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <DeckSelectionDialog
        open={isDeckDialogOpen}
        onClose={() => setDeckDialogOpen(false)}
        onDeckSelected={handleDeckSelected}
      />
    </Box>
  );
};

export default FlashcardGenerationPage; 