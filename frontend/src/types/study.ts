export interface Flashcard {
  id: number;
  front: string;
  back: string;
  tags?: string[]; // 카드별 태그 (덱 태그와 분리)
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
