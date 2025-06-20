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

// Flashcard (기존 Card 인터페이스와 호환성을 위해 추가)
export interface Flashcard {
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
  // SM-2 알고리즘용 속성들
  repetitions?: number;
  efactor?: number;
  interval?: number;
  dueDate?: string;
  nextReviewDate?: Date;
}

// 연습 성적 평가 - 숫자로 변경
export type PracticeGrade = 0 | 1 | 2 | 3 | 4 | 5;

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
