import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlashcardDeck, Flashcard, StudyFilters } from '../../types/study';

interface StudyState {
  decks: FlashcardDeck[];
  loading: boolean;
  error: string | null;
  filters: StudyFilters;
  deckBookmarks: { [key: number]: boolean };
}

// 태그 앞에 # 붙이기
function normalizeTags(tags: string[]): string[] {
  return tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
}
function normalizeCardTags(tags?: string[]): string[] {
  if (!tags) return [];
  return tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
}

// Mock 데이터: 카드별 tags 필드 추가
const mockDecks: FlashcardDeck[] = [
  {
    id: 1,
    category: '코딩',
    title: 'React 이해도',
    isBookmarked: true,
    tags: ['#코딩', '#Frontend'],
    flashcards: [
      { id: 1, front: 'React란 무엇인가?', back: 'Facebook에서 개발한 JavaScript 라이브러리', tags: ['#React'] },
      { id: 2, front: 'JSX란?', back: 'JavaScript XML의 줄임말로 React에서 사용하는 문법', tags: ['#JSX'] },
      { id: 3, front: 'useState란?', back: 'React에서 상태를 관리하기 위한 Hook', tags: ['#Hook'] },
      { id: 4, front: 'useEffect란?', back: '컴포넌트의 생명주기와 부수 효과를 관리하는 Hook', tags: ['#Hook'] },
      { id: 5, front: 'Virtual DOM이란?', back: 'React에서 실제 DOM을 추상화한 가상 DOM', tags: ['#DOM'] }
    ]
  },
  {
    id: 2,
    category: '회계',
    title: '손익계산서',
    isBookmarked: false,
    tags: ['#회계', '#재무'],
    flashcards: [
      { id: 6, front: '손익계산서란?', back: '일정 기간 동안 기업의 수익과 비용을 보여주는 재무제표', tags: ['#재무'] },
      { id: 7, front: '매출액이란?', back: '기업이 상품이나 서비스를 판매하여 얻은 총 수입', tags: ['#매출'] }
    ]
  },
  {
    id: 3,
    category: '정보처리기사',
    title: '1.시스템 개발 생명주기(SDLC)',
    isBookmarked: true,
    tags: ['#정보처리기사', '#자격증'],
    flashcards: [
      { id: 8, front: 'SDLC란?', back: '시스템 개발 생명주기(System Development Life Cycle)', tags: ['#SDLC'] },
      { id: 9, front: '요구사항 분석 단계에서 하는 일은?', back: '사용자의 요구사항을 수집하고 분석하는 단계', tags: ['#분석'] }
    ]
  },
];

const initialState: StudyState = {
  decks: mockDecks,
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    selectedTags: [],
    showBookmarked: false,
  },
  deckBookmarks: {
    1: true,
    2: false,
    3: true,
  },
};

const studySlice = createSlice({
  name: 'study',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<StudyFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        searchQuery: '',
        selectedTags: [],
        showBookmarked: false,
      };
    },
    toggleDeckBookmark: (state, action: PayloadAction<number>) => {
      const deckId = action.payload;
      // 기존 값이 없으면 false로 초기화 후 토글
      const currentValue = state.deckBookmarks[deckId] || false;
      state.deckBookmarks[deckId] = !currentValue;
      const deck = state.decks.find(d => d.id === deckId);
      if (deck) deck.isBookmarked = state.deckBookmarks[deckId];
    },
    addDeck: (state, action: PayloadAction<FlashcardDeck>) => {
      // 덱의 태그만 normalize, 카드의 태그는 카드 생성/수정에서 따로 처리
      const deckWithNormalizedTags = {
        ...action.payload,
        tags: normalizeTags(action.payload.tags),
        flashcards: action.payload.flashcards.map(card => ({
          ...card,
          tags: normalizeCardTags(card.tags),
        })),
      };
      state.decks.unshift(deckWithNormalizedTags);
      state.deckBookmarks[deckWithNormalizedTags.id] = deckWithNormalizedTags.isBookmarked;
    },
    updateDeck: (state, action: PayloadAction<FlashcardDeck>) => {
      const index = state.decks.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        // 덱 태그만 업데이트, 카드 태그는 그대로
        const deckWithNormalizedTags = {
          ...state.decks[index],
          ...action.payload,
          tags: normalizeTags(action.payload.tags),
          flashcards: state.decks[index].flashcards,
        };
        state.decks[index] = deckWithNormalizedTags;
        state.deckBookmarks[deckWithNormalizedTags.id] = deckWithNormalizedTags.isBookmarked;
      }
    },
    deleteDeck: (state, action: PayloadAction<number>) => {
      const deckId = action.payload;
      state.decks = state.decks.filter(d => d.id !== deckId);
      delete state.deckBookmarks[deckId];
    },
    updateCard: (state, action: PayloadAction<{ deckId: number; card: Flashcard }>) => {
      const deck = state.decks.find(d => d.id === action.payload.deckId);
      if (deck) {
        const idx = deck.flashcards.findIndex(c => c.id === action.payload.card.id);
        if (idx !== -1) {
          deck.flashcards[idx] = {
            ...action.payload.card,
            tags: normalizeCardTags(action.payload.card.tags),
          };
        }
      }
    },
    deleteCard: (state, action: PayloadAction<{ deckId: number; cardId: number }>) => {
      const deck = state.decks.find(d => d.id === action.payload.deckId);
      if (deck) {
        deck.flashcards = deck.flashcards.filter(c => c.id !== action.payload.cardId);
      }
    },
  },
});

export const {
  setFilters,
  clearFilters,
  toggleDeckBookmark,
  addDeck,
  updateDeck,
  deleteDeck,
  updateCard,
  deleteCard,
} = studySlice.actions;

export default studySlice.reducer;
