export interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  id: number;
  category: string;
  title: string;
  isBookmarked: boolean;
  tags: string[];
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