export interface Flashcard {
  id: number;
  front: string;
  back: string;
  tags?: string[]; // 카드별 태그 (덱 태그와 분리)

  // SM-2 알고리즘 관련 필드
  repetitions?: number;
  efactor?: number;
  interval?: number;
  dueDate?: string;
  nextReviewDate?: Date;
}

export interface FlashcardDeck {
  id: number;
  category: string;
  title: string;
  isBookmarked: boolean;
  tags: string[]; // 덱 태그
  flashcards: Flashcard[];
}

export interface StudyFilters {
  searchQuery: string;
  selectedTags: string[];
  showBookmarked: boolean;
}

export type PracticeGrade = 0 | 1 | 2 | 3 | 4 | 5;

export type ReviewDifficulty = 'easy' | 'confuse' | 'hard';

export interface ReviewResult {
  cardId: number;
  difficulty: ReviewDifficulty;
}

export interface CreateDeckRequest {
  title: string;
  category: string;
  tags?: string[];
  flashcards?: Flashcard[];
}

export interface UpdateDeckRequest {
  id: number;
  title?: string;
  category?: string;
  tags?: string[];
  isBookmarked?: boolean;
  flashcards?: Flashcard[];
}

export interface DashboardStats {
  studyTime: {
    todayStudyMinutes: number;
    dailyGoalMinutes: number;
  };
  attendance: {
    consecutiveDays: number;
    attendedDates: string[];
  };
  review: {
    todayCount: number;
    upcomingCount: number;
    overdueCount: number;
  };
}
