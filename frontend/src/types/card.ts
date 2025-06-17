export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  deckId: string;
  difficulty: number; // SM-2 알고리즘의 난이도 (기본값: 2.5)
  efactor: number; // SM-2 알고리즘의 E-Factor (기본값: 2.5)
  interval: number; // 다음 복습까지의 간격 (일)
  repetitions: number; // 연속 정답 횟수
  nextReviewDate: Date; // 다음 복습 날짜
  dueDate?: string; // ISO 문자열로 된 만료 날짜 (옵션)
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description?: string;
  cards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

export type PracticeGrade = 0 | 1 | 2 | 3 | 4 | 5; // SM-2 알고리즘 등급 (0: 완전 틀림, 5: 완벽)

export interface PracticeSession {
  id: string;
  deckId: string;
  startedAt: Date;
  completedAt?: Date;
  totalCards: number;
  correctAnswers: number;
  results: PracticeResult[];
}

export interface PracticeResult {
  cardId: string;
  grade: PracticeGrade;
  responseTime: number; // milliseconds
  answeredAt: Date;
}

export interface StudyStats {
  totalStudyTime: number;
  cardsStudied: number;
  averageGrade: number;
  streak: number; // 연속 학습 일수
}

// 플래시카드 생성을 위한 퀴즈 타입
export interface QuizQuestion {
  id: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface FlashcardGenerationSession {
  id: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: Record<string, number>;
  feedback: string;
  isCompleted: boolean;
}

export interface GenerationResult {
  success: boolean;
  deckId?: string;
  error?: string;
}
