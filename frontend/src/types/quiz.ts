export type QuizType = 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'SHORT_ANSWER' | 'TRUE_FALSE';

export interface QuizItem {
  type: QuizType;
  question: string;
  options: string[];
  answer: string;
  // 유저가 생성 과정에서 수정할 수 있으므로, id는 아직 없을 수 있습니다.
  id?: string; 
}

export interface QuizGenerationRequest {
  noteTitle: string;
  noteContent: string;
}

// Redux 슬라이스에서 사용될 퀴즈 상태
export interface QuizState {
  quizzes: QuizItem[];
  loading: boolean;
  error: string | null;
} 