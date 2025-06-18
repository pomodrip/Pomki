import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlashcardDeck, StudyFilters } from '../../types/study';

interface StudyState {
  decks: FlashcardDeck[];
  loading: boolean;
  error: string | null;
  filters: StudyFilters;
  deckBookmarks: { [key: number]: boolean };
}

// Mock 데이터
const mockDecks: FlashcardDeck[] = [
  {
    id: 1,
    category: '코딩',
    title: 'React 이해도',
    isBookmarked: true,
    tags: ['코딩', 'Frontend'],
    flashcards: [
      { id: 1, front: 'React란 무엇인가?', back: 'Facebook에서 개발한 JavaScript 라이브러리' },
      { id: 2, front: 'JSX란?', back: 'JavaScript XML의 줄임말로 React에서 사용하는 문법' },
      { id: 3, front: 'useState란?', back: 'React에서 상태를 관리하기 위한 Hook' },
      { id: 4, front: 'useEffect란?', back: '컴포넌트의 생명주기와 부수 효과를 관리하는 Hook' },
      { id: 5, front: 'Virtual DOM이란?', back: 'React에서 실제 DOM을 추상화한 가상 DOM' }
    ]
  },
  {
    id: 2,
    category: '회계',
    title: '손익계산서',
    isBookmarked: false,
    tags: ['회계', '재무'],
    flashcards: [
      { id: 6, front: '손익계산서란?', back: '일정 기간 동안 기업의 수익과 비용을 보여주는 재무제표' },
      { id: 7, front: '매출액이란?', back: '기업이 상품이나 서비스를 판매하여 얻은 총 수입' }
    ]
  },
  {
    id: 3,
    category: '정보처리기사',
    title: '1.시스템 개발 생명주기(SDLC)',
    isBookmarked: true,
    tags: ['정보처리기사', '자격증'],
    flashcards: [
      { id: 8, front: 'SDLC란?', back: '시스템 개발 생명주기(System Development Life Cycle)' },
      { id: 9, front: '요구사항 분석 단계에서 하는 일은?', back: '사용자의 요구사항을 수집하고 분석하는 단계' }
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
      state.deckBookmarks[deckId] = !state.deckBookmarks[deckId];
      
      // decks 배열의 isBookmarked도 업데이트
      const deck = state.decks.find(d => d.id === deckId);
      if (deck) {
        deck.isBookmarked = state.deckBookmarks[deckId];
      }
    },
    addDeck: (state, action: PayloadAction<FlashcardDeck>) => {
      state.decks.unshift(action.payload);
      state.deckBookmarks[action.payload.id] = action.payload.isBookmarked;
    },
    updateDeck: (state, action: PayloadAction<FlashcardDeck>) => {
      const index = state.decks.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.decks[index] = action.payload;
        state.deckBookmarks[action.payload.id] = action.payload.isBookmarked;
      }
    },
    deleteDeck: (state, action: PayloadAction<number>) => {
      const deckId = action.payload;
      state.decks = state.decks.filter(d => d.id !== deckId);
      delete state.deckBookmarks[deckId];
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
} = studySlice.actions;

export default studySlice.reducer;
