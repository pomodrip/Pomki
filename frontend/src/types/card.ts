// 카드 덱
export interface CardDeck {
  deckId: string;
  memberId?: number;
  deckName: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  cardCnt: number;
  cards?: Card[];
}

// 카드
export interface Card {
  cardId: number;
  deckId: string;
  content: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  tags?: Tag[];
  isBookmarked?: boolean;
  stats?: CardStat;
}

// 카드 통계
export interface CardStat {
  cardStatId: number;
  cardId: number;
  reviewCount: number;
  correctCount: number;
  lastReviewedAt?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  nextReviewAt?: string;
}

// 카드 덱 생성 요청
export interface CreateDeckRequest {
  deckName: string;
}

// 카드 덱 업데이트 요청
export interface UpdateDeckRequest {
  deckName: string;
}

// 카드 생성 요청
export interface CreateCardRequest {
  deckId: string;
  content: string;
  answer: string;
  tagIds?: number[];
}

// 카드 업데이트 요청
export interface UpdateCardRequest {
  content: string;
  answer: string;
  tagIds?: number[];
}

// 카드 리스트 조회 요청
export interface GetCardsRequest {
  deckId: string;
  page?: number;
  size?: number;
  search?: string;
  tagId?: number;
}

// 카드 덱 리스트 조회 요청
export interface GetDecksRequest {
  page?: number;
  size?: number;
  search?: string;
}

// 카드 학습 결과
export interface StudyResult {
  cardId: number;
  isCorrect: boolean;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  responseTime: number;
}

// 학습 세션 요청
export interface StudySessionRequest {
  deckId: string;
  studyType: 'REVIEW' | 'NEW' | 'ALL';
  cardLimit?: number;
}

// 카드 AI 생성 요청
export interface GenerateCardsRequest {
  noteId?: string;
  content: string;
  cardCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

// 태그 (노트에서 재사용)
interface Tag {
  tagId: number;
  memberId: number;
  tagName: string;
}

// 플래시카드 생성을 위한 퀴즈 타입
export interface QuizQuestion {
  id: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuestionFeedback {
  questionId: string;
  feedback: string;
}

export interface FlashcardGenerationSession {
  id: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: Record<string, number>;
  selectedQuestions: Set<string>; // 플래시카드로 생성할 문제들
  feedback: string; // 전체 피드백
  questionFeedbacks: QuestionFeedback[]; // 문제별 피드백
  isCompleted: boolean;
}

export interface GenerationResult {
  success: boolean;
  deckId?: string;
  error?: string;
}
