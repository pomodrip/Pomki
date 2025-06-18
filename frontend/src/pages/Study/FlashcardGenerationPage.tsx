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
  Chip,
  Stack,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowForward, ArrowBack, AutoAwesome, Bookmark, BookmarkBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { QuizQuestion, FlashcardGenerationSession } from '../../types/card';
import { studyApi } from '../../api/studyApi';

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
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
  
  // 선택된 문제 수 계산
  const selectedQuestionsCount = session.selectedQuestions.size;
  const isCurrentQuestionSelected = session.selectedQuestions.has(currentQuestion.id);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    // 답변 즉시 저장
    setSession(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [currentQuestion.id]: answerIndex,
      },
    }));
  };

  const handleNext = () => {
    // 순환 네비게이션: 마지막 문제에서 다음 버튼 클릭 시 첫 번째 문제로
    const nextIndex = isLastQuestion ? 0 : session.currentQuestionIndex + 1;
    
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      isCompleted: false,
    }));
    
    // 다음 문제의 답변과 피드백 복원
    const nextQuestionId = session.questions[nextIndex].id;
    const nextAnswer = session.userAnswers[nextQuestionId];
    const nextFeedback = session.questionFeedbacks.find(f => f.questionId === nextQuestionId)?.feedback || '';
    
    setSelectedAnswer(nextAnswer !== undefined ? nextAnswer : null);
    setCurrentQuestionFeedback(nextFeedback);
  };

  const handlePrevious = () => {
    // 순환 네비게이션: 첫 번째 문제에서 이전 버튼 클릭 시 마지막 문제로
    const prevIndex = isFirstQuestion ? session.questions.length - 1 : session.currentQuestionIndex - 1;
    
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: prevIndex,
      isCompleted: false,
    }));
    
    // 이전 문제의 답변과 피드백 복원
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
    
    // 문제별 피드백 업데이트
    setSession(prev => {
      const existingFeedbackIndex = prev.questionFeedbacks.findIndex(
        f => f.questionId === currentQuestion.id
      );
      
      let newQuestionFeedbacks;
      if (existingFeedbackIndex >= 0) {
        // 기존 피드백 업데이트
        newQuestionFeedbacks = [...prev.questionFeedbacks];
        newQuestionFeedbacks[existingFeedbackIndex] = {
          questionId: currentQuestion.id,
          feedback: newFeedback
        };
      } else {
        // 새 피드백 추가
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
    console.log('플래시카드 생성 중...', {
      selectedQuestions: Array.from(session.selectedQuestions),
      answers: session.userAnswers,
      globalFeedback: session.feedback,
      questionFeedbacks: session.questionFeedbacks,
      session: session
    });
    
    try {
      // 백엔드 API 호출
      const result = await studyApi.createFlashcardsFromQuiz({
        sessionId: session.id,
        answers: session.userAnswers,
        globalFeedback: session.feedback,
        questionFeedbacks: session.questionFeedbacks
      });
      
      if (result.success) {
        console.log('플래시카드 생성 성공:', result.deckId);
        navigate('/study/flashcard-decks');
      } else {
        console.error('플래시카드 생성 실패:', result.error);
        // TODO: 에러 스낵바 표시
      }
    } catch (error) {
      console.error('플래시카드 생성 중 오류:', error);
      // TODO: 에러 스낵바 표시
    }
  };

  const handleGlobalFeedbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSession(prev => ({
      ...prev,
      feedback: event.target.value,
    }));
  };

  // 현재 문제의 피드백 초기화
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
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        pb: isMobile ? 12 : 0, // 모바일에서만 하단 버튼 공간 확보
      }}
    >
      {/* 컴팩트한 헤더 */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton 
          onClick={() => navigate(-1)}
          size="small"
        >
          <ArrowBack />
        </IconButton>
        
        {/* 제목과 선택 버튼을 함께 배치 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            React 이해도
          </Typography>
          <IconButton
            onClick={handleQuestionSelection}
            size="small"
            sx={{ 
              color: isCurrentQuestionSelected ? 'warning.main' : 'grey.400',
              '&:hover': {
                bgcolor: isCurrentQuestionSelected ? 'warning.50' : 'grey.50'
              }
            }}
          >
            {isCurrentQuestionSelected ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Box>
        
        <Box /> {/* 균형을 위한 빈 공간 */}
      </Box>

      {/* 메인 컨텐츠 - 반응형 컨테이너 */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1, 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 'auto' : 'calc(100vh - 80px)', // 데스크탑에서는 헤더 제외한 전체 높이
        }}
      >
        {/* 상단 네비게이션 바 */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: { xs: 2, md: 3 },
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

          {/* 중앙 진행 표시 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body1" fontWeight={600} color="primary.main">
              {session.currentQuestionIndex + 1}/{session.questions.length}
            </Typography>
            {/* 페이지 인디케이터 */}
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

        {/* 컨텐츠 영역 - 태블릿/데스크탑에서 2컬럼, 모바일에서 1컬럼 */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 4 },
            flex: 1,
            minHeight: 0, // flex 컨테이너에서 overflow 허용
          }}
        >
          {/* 왼쪽: 질문과 선택지 */}
          <Box 
            sx={{ 
              flex: { md: 2 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 질문 */}
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 2, md: 3 }, 
                fontWeight: 600, 
                lineHeight: 1.4,
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                textAlign: 'center',
                color: 'text.primary',
              }}
            >
              {currentQuestion.question}
            </Typography>

            {/* 선택지 - 스크롤 가능 영역 */}
            <Box 
              sx={{ 
                flex: 1,
                overflow: 'auto',
                pr: { md: 1 }, // 데스크탑에서만 우측 패딩
              }}
            >
              <RadioGroup 
                value={selectedAnswer?.toString() || ''} 
                onChange={(e) => handleAnswerSelect(Number(e.target.value))}
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
                        p: { xs: 1.5, md: 2 },
                        width: '100%',
                        '& .MuiFormControlLabel-label': {
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          lineHeight: 1.4,
                          color: selectedAnswer === index ? 'primary.main' : 'text.primary',
                          fontWeight: selectedAnswer === index ? 500 : 400,
                        },
                      }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </Box>
          </Box>

          {/* 오른쪽: 피드백과 생성 버튼 (데스크탑/태블릿) 또는 하단 (모바일) */}
          <Box 
            sx={{ 
              flex: { md: 1 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* 피드백 섹션 */}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                flex: { md: 1 },
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                📝 피드백 (선택사항)
              </Typography>
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
                    multiline={!isMobile}
                    rows={!isMobile ? 2 : 1}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.85rem',
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                        '&.Mui-focused': {
                          bgcolor: 'background.paper',
                        }
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
                    multiline={!isMobile}
                    rows={!isMobile ? 2 : 1}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.85rem',
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                        '&.Mui-focused': {
                          bgcolor: 'background.paper',
                        }
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* 데스크탑/태블릿용 생성 버튼 */}
            {!isMobile && (
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
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
              </Paper>
            )}
          </Box>
        </Box>
      </Container>

      {/* 모바일용 하단 고정 생성 버튼 */}
      {isMobile && (
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
      )}
    </Box>
  );
};

export default FlashcardGenerationPage; 