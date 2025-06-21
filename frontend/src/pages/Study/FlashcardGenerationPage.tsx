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
import {
  ArrowForward,
  ArrowBack,
  AutoAwesome,
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { QuizQuestion, FlashcardGenerationSession } from '../../types/card';
import { useAppSelector } from '../../hooks/useRedux';
// import * as studyApi from '../../api/studyApi';

// 품질 개선된 퀴즈 데이터
const sampleQuestions: QuizQuestion[] = [
  {
    id: '1',
    title: 'React 이해도',
    question: 'React의 자료적 인터페이스를 구성하는 단위는 무엇인가?',
    options: ['컴포넌트', '자식', '프롭스', '스테이트'],
    correctAnswer: 0,
  },
  {
    id: '2', 
    title: 'React 이해도',
    question: 'React의 작동 방식에 대한 설명 중 가장 올바른 것은 무엇인가요?',
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
    question: '아래 중 가상 DOM에 대한 설명으로 올바른 것은 무엇인가?',
    options: [
      '가상 DOM은 현재 화면에 보이는 요소에 대한 자바스크립트 객체의 복사본입니다.',
      '가상 DOM은 실제 DOM을 직접 조작하여 화면을 갱신합니다.',
      '가상 DOM은 실제 DOM의 변경을 감지하여 화면을 갱신합니다.',
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
      '이벤트 핸들러는 항상 이벤트의 전파를 막습니다.',
      '이벤트 핸들러는 DOM 요소에 직접 바인딩해야 합니다.',
      '이벤트 핸들러는 HTML 속성으로만 정의할 수 있습니다.',
    ],
    correctAnswer: 0,
  },
  {
    id: '5',
    title: 'React 이해도',
    question: 'React Hook을 사용할 때 주의사항으로 올바른 것은?',
    options: [
      'Hook은 함수 컴포넌트의 최상위에서만 호출해야 합니다.',
      'Hook은 클래스 컴포넌트에서도 사용할 수 있습니다.',
      'Hook은 조건문 안에서 호출해도 문제없습니다.',
      'Hook은 반복문 안에서 자유롭게 사용할 수 있습니다.',
    ],
    correctAnswer: 0,
  },
];

const FlashcardGenerationPage: React.FC = () => {
  // const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { noteId } = useParams<{ noteId: string }>();
  const { notes } = useAppSelector((state) => state.note);
  const [noteTitle, setNoteTitle] = useState('플래시카드 생성');
  
  useEffect(() => {
    if (noteId) {
      const currentNote = notes.find(note => note.noteId === noteId);
      if (currentNote) {
        setNoteTitle(currentNote.noteTitle);
      }
    }
  }, [noteId, notes]);

  const [session, setSession] = useState<FlashcardGenerationSession>({
    id: 'session-1',
    questions: sampleQuestions,
    currentQuestionIndex: 0,
    userAnswers: {},
    selectedQuestions: new Set<string>(),
    feedback: '',
    questionFeedbacks: [],
    isCompleted: false,
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [currentQuestionFeedback, setCurrentQuestionFeedback] = useState('');

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;
  const isFirstQuestion = session.currentQuestionIndex === 0;
  
  const selectedQuestionsCount = session.selectedQuestions.size;
  const isCurrentQuestionSelected = session.selectedQuestions.has(currentQuestion.id);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setSession(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [currentQuestion.id]: answerIndex,
      },
    }));
  };

  const handleNext = () => {
    const nextIndex = isLastQuestion ? 0 : session.currentQuestionIndex + 1;
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      isCompleted: false,
    }));
    
    const nextQuestionId = session.questions[nextIndex].id;
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
    
    const prevQuestionId = session.questions[prevIndex].id;
    const previousAnswer = session.userAnswers[prevQuestionId];
    const previousFeedback = session.questionFeedbacks.find(f => f.questionId === prevQuestionId)?.feedback || '';
    
    setSelectedAnswer(previousAnswer !== undefined ? previousAnswer : null);
    setCurrentQuestionFeedback(previousFeedback);
  };

  const handleQuestionSelection = () => {
    setSession(prev => {
      const newSelectedQuestions = new Set(prev.selectedQuestions);
      if (isCurrentQuestionSelected) {
        newSelectedQuestions.delete(currentQuestion.id);
      } else {
        newSelectedQuestions.add(currentQuestion.id);
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
    
    setSession(prev => {
      const existingFeedbackIndex = prev.questionFeedbacks.findIndex(
        f => f.questionId === currentQuestion.id
      );
      
      let newQuestionFeedbacks;
      if (existingFeedbackIndex >= 0) {
        newQuestionFeedbacks = [...prev.questionFeedbacks];
        newQuestionFeedbacks[existingFeedbackIndex] = {
          questionId: currentQuestion.id,
          feedback: newFeedback
        };
      } else {
        newQuestionFeedbacks = [
          ...prev.questionFeedbacks,
          { questionId: currentQuestion.id, feedback: newFeedback }
        ];
      }
      
      return {
        ...prev,
        questionFeedbacks: newQuestionFeedbacks
      };
    });
  };

  const generateFlashcards = async () => {
    // TODO: API 스펙 확인 및 수정 필요. 현재는 studyApi에 createFlashcardsFromQuiz가 없음.
    console.log("플래시카드 생성 기능은 현재 비활성화되어 있습니다.", {
      sessionId: session.id,
      answers: session.userAnswers,
      globalFeedback: session.feedback,
      questionFeedbacks: session.questionFeedbacks,
    });
    alert("플래시카드 생성 기능은 현재 개발 중입니다.");
    // navigate('/study/flashcard-decks'); // 임시로 비활성화
  };

  const handleGlobalFeedbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSession(prev => ({
      ...prev,
      feedback: event.target.value,
    }));
  };

  React.useEffect(() => {
    const currentFeedback = session.questionFeedbacks.find(
      f => f.questionId === currentQuestion.id
    )?.feedback || '';
    setCurrentQuestionFeedback(currentFeedback);
  }, [session.currentQuestionIndex, session.questionFeedbacks, currentQuestion.id]);

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
      {/* 컨텍스트 헤더 (제목) */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 2,
          height: 72,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={600} noWrap>
          {noteTitle}
        </Typography>
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
              {/* 네비게이션 */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
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
                      const isSelected = session.selectedQuestions.has(question.id);
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
                            transition: 'all 0.2s',
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

              {/* 질문 */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  lineHeight: 1.4,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  textAlign: 'center',
                  color: 'text.primary',
                }}
              >
                {currentQuestion.question}
              </Typography>

              {/* 플래시카드 선택 버튼 */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', my: { xs: 1.5, sm: 2 } }}>
                <Button
                  variant={isCurrentQuestionSelected ? 'contained' : 'outlined'}
                  onClick={handleQuestionSelection}
                  size="small"
                  startIcon={isCurrentQuestionSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlank />}
                  sx={{ borderRadius: '20px', px: 2, textTransform: 'none', fontSize: '0.8rem' }}
                >
                  {isCurrentQuestionSelected ? '선택됨' : '이 문제 선택'}
                </Button>
              </Box>

              {/* 선택지 */}
              <RadioGroup 
                value={selectedAnswer?.toString() || ''} 
                onChange={(e) => handleAnswerSelect(Number(e.target.value))}
                sx={{ mb: 3 }}
              >
                {currentQuestion.options.map((option, index) => (
                  <Paper
                    key={index}
                    elevation={selectedAnswer === index ? 2 : 0}
                    sx={{
                      mb: 1.5,
                      border: '2px solid',
                      borderColor: selectedAnswer === index ? 'primary.main' : 'grey.200',
                      borderRadius: 2,
                      bgcolor: selectedAnswer === index ? 'primary.50' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: selectedAnswer === index ? 'primary.100' : 'primary.25',
                        transform: 'translateY(-1px)',
                        boxShadow: 1,
                      }
                    }}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <FormControlLabel
                      value={index.toString()}
                      control={
                        <Radio 
                          size="small"
                          sx={{ 
                            color: selectedAnswer === index ? 'primary.main' : 'grey.400',
                            '&.Mui-checked': {
                              color: 'primary.main',
                            }
                          }} 
                        />
                      }
                      label={option}
                      sx={{
                        m: 0,
                        p: 1.5,
                        width: '100%',
                        '& .MuiFormControlLabel-label': {
                          fontSize: { xs: '0.85rem', sm: '0.95rem' },
                          lineHeight: 1.4,
                          color: selectedAnswer === index ? 'primary.main' : 'text.primary',
                          fontWeight: selectedAnswer === index ? 500 : 400,
                        },
                      }}
                    />
                  </Paper>
                ))}
              </RadioGroup>

              {/* 피드백 섹션 */}
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
                    const isSelected = session.selectedQuestions.has(question.id);
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
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
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
                        const isSelected = session.selectedQuestions.has(question.id);
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
                              transition: 'all 0.3s',
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

                {/* 질문 */}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    mb: 4, 
                    fontWeight: 600, 
                    lineHeight: 1.4,
                    textAlign: 'center',
                    color: 'text.primary',
                  }}
                >
                  {currentQuestion.question}
                </Typography>

                {/* 플래시카드 선택 버튼 */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', my: 4 }}>
                  <Button
                    variant={isCurrentQuestionSelected ? 'contained' : 'outlined'}
                    size="large"
                    onClick={handleQuestionSelection}
                    startIcon={isCurrentQuestionSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlank />}
                    sx={{ borderRadius: '20px', px: 4, py: 1, textTransform: 'none' }}
                  >
                    {isCurrentQuestionSelected ? '선택됨' : '이 문제 선택'}
                  </Button>
                </Box>

                {/* 선택지 - 스크롤 가능 */}
                <Box sx={{ flex: 1, overflow: 'auto', pr: 2 }}>
                  <RadioGroup 
                    value={selectedAnswer?.toString() || ''} 
                    onChange={(e) => handleAnswerSelect(Number(e.target.value))}
                  >
                    <Stack spacing={2}>
                      {currentQuestion.options.map((option, index) => (
                        <Paper
                          key={index}
                          elevation={selectedAnswer === index ? 3 : 1}
                          sx={{
                            border: '3px solid',
                            borderColor: selectedAnswer === index ? 'primary.main' : 'grey.200',
                            borderRadius: 3,
                            bgcolor: selectedAnswer === index ? 'primary.50' : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: selectedAnswer === index ? 'primary.100' : 'primary.25',
                              transform: 'translateY(-2px)',
                              boxShadow: 4,
                            }
                          }}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <FormControlLabel
                            value={index.toString()}
                            control={
                              <Radio 
                                size="medium"
                                sx={{ 
                                  color: selectedAnswer === index ? 'primary.main' : 'grey.400',
                                  '&.Mui-checked': {
                                    color: 'primary.main',
                                  }
                                }} 
                              />
                            }
                            label={option}
                            sx={{
                              m: 0,
                              p: 3,
                              width: '100%',
                              '& .MuiFormControlLabel-label': {
                                fontSize: '1.1rem',
                                lineHeight: 1.5,
                                color: selectedAnswer === index ? 'primary.main' : 'text.primary',
                                fontWeight: selectedAnswer === index ? 600 : 400,
                              },
                            }}
                          />
                        </Paper>
                      ))}
                    </Stack>
                  </RadioGroup>
                </Box>
              </Box>

              {/* 오른쪽 컬럼: 피드백 및 생성 버튼 */}
              <Box sx={{ flex: '0 0 420px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 피드백 섹션 */}
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
                        const isSelected = session.selectedQuestions.has(question.id);
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
    </Box>
  );
};

export default FlashcardGenerationPage; 