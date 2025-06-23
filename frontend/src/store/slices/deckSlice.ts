import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import * as studyApi from '../../api/studyApi';
import type {
  CardDeck,
  Card,
  CreateDeckRequest,
  UpdateDeckRequest,
} from '../../types/card';

/**
 * 🃏 Deck Slice - 카드 덱 상태관리
 * 
 * 기능:
 * - 덱 목록 조회/생성/수정/삭제
 * - 검색 및 필터링
 * - 북마크 관리
 */

// ==========================================
// 1. 상태 인터페이스
// ==========================================

interface DeckState {
  // 데이터
  decks: CardDeck[];
  selectedDeck: CardDeck | null;
  currentDeckCards: Card[]; // 현재 덱의 카드들
  
  // 상태
  loading: boolean;
  error: string | null;
  
  // 페이지네이션
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  
  // 필터
  filters: {
    searchQuery: string;
    showBookmarked: boolean;
    sortBy: 'deckName' | 'createdAt' | 'cardCnt';
    sortOrder: 'asc' | 'desc';
  };
}

// ==========================================
// 2. 초기 상태
// ==========================================

const initialState: DeckState = {
  decks: [],
  selectedDeck: null,
  currentDeckCards: [],
  loading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  pageSize: 10,
  filters: {
    searchQuery: '',
    showBookmarked: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

// ==========================================
// 3. 에러 처리 헬퍼
// ==========================================

const handleAsyncError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return '알 수 없는 오류가 발생했습니다.';
};

// ==========================================
// 4. Async Thunk 액션들
// ==========================================

// 덱 목록 조회 (백엔드 API에 맞게 수정)
export const fetchDecks = createAsyncThunk<
  CardDeck[],
  void,
  { state: RootState; rejectValue: string }
>('deck/fetchDecks', async (_, { rejectWithValue }) => {
  try {
    const decks = await studyApi.getDecks();
    return decks;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 단일 덱 조회
export const fetchDeck = createAsyncThunk<
  CardDeck,
  string,
  { state: RootState; rejectValue: string }
>('deck/fetchDeck', async (deckId, { rejectWithValue }) => {
  try {
    const deck = await studyApi.getDeck(deckId);
    return deck;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 덱 생성
export const createDeck = createAsyncThunk<
  CardDeck,
  CreateDeckRequest,
  { state: RootState; rejectValue: string }
>('deck/createDeck', async (data, { rejectWithValue }) => {
  try {
    const deck = await studyApi.createDeck(data);
    return deck;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 덱 수정
export const updateDeck = createAsyncThunk<
  CardDeck,
  { deckId: string; data: UpdateDeckRequest },
  { state: RootState; rejectValue: string }
>('deck/updateDeck', async ({ deckId, data }, { rejectWithValue }) => {
  try {
    const deck = await studyApi.updateDeck(deckId, data);
    return deck;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 덱 삭제
export const deleteDeck = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('deck/deleteDeck', async (deckId, { rejectWithValue }) => {
  try {
    await studyApi.deleteDeck(deckId);
    return deckId;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 덱의 카드 목록 조회
export const fetchCardsInDeck = createAsyncThunk<
  Card[],
  string,
  { state: RootState; rejectValue: string }
>('deck/fetchCardsInDeck', async (deckId, { rejectWithValue }) => {
  try {
    // Mock 데이터 반환 (실제 API 구현 시 교체)
    return [
      { cardId: 1, deckId, content: '질문 1', answer: '답변 1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isDeleted: false },
      { cardId: 2, deckId, content: '질문 2', answer: '답변 2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isDeleted: false },
    ];
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 카드 수정
export const updateCard = createAsyncThunk<
  Card,
  { cardId: string; data: Partial<Card> },
  { state: RootState; rejectValue: string }
>('deck/updateCard', async ({ cardId, data }, { rejectWithValue }) => {
  try {
    // Mock 응답 (실제 API 구현 시 교체)
    return { 
      cardId: parseInt(cardId), 
      deckId: data.deckId || '', 
      content: data.content || '', 
      answer: data.answer || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      ...data 
    };
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 카드 삭제
export const deleteCard = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('deck/deleteCard', async (cardId, { rejectWithValue }) => {
  try {
    // Mock 응답 (실제 API 구현 시 교체)
    return cardId;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// ==========================================
// 5. Slice 정의
// ==========================================

const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    // 에러 클리어
    clearError: (state) => {
      state.error = null;
    },
    
    // 선택된 덱 설정
    setSelectedDeck: (state, action: PayloadAction<CardDeck | null>) => {
      state.selectedDeck = action.payload;
    },
    
    // 필터 설정
    setFilters: (state, action: PayloadAction<Partial<DeckState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // 필터 초기화
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // 페이지 설정
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // 페이지 크기 설정
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 0; // 페이지 크기 변경 시 첫 페이지로
    },
    
    // 로딩 상태 수동 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // 덱 북마크 토글 (로컬 상태 업데이트)
    toggleDeckBookmark: (state, action: PayloadAction<string>) => {
      const deckId = action.payload;
      const deck = state.decks.find(d => d.deckId === deckId);
      if (deck) {
        // 북마크 상태는 API에 따라 다를 수 있으므로 임시로 처리
        // 실제로는 별도의 북마크 API가 필요할 수 있음
      }
      
      // 선택된 덱도 업데이트
      if (state.selectedDeck?.deckId === deckId) {
        // state.selectedDeck.isBookmarked = !state.selectedDeck.isBookmarked;
      }
    },

    // 현재 덱 설정 (문자열로 받아서 설정)
    setCurrentDeck: (state, action: PayloadAction<string>) => {
      const deckId = action.payload;
      const deck = state.decks.find(d => d.deckId === deckId);
      state.selectedDeck = deck || null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // 덱 목록 조회
      .addCase(fetchDecks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDecks.fulfilled, (state, action) => {
        state.loading = false;
        state.decks = action.payload;
        state.totalElements = action.payload.length;
        state.totalPages = Math.ceil(action.payload.length / state.pageSize);
        state.error = null;
      })
      .addCase(fetchDecks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '덱 목록을 불러오는데 실패했습니다.';
      })
      
      // 단일 덱 조회
      .addCase(fetchDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeck.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDeck = action.payload;
        state.error = null;
      })
      .addCase(fetchDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '덱을 불러오는데 실패했습니다.';
      })
      
      // 덱 생성
      .addCase(createDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeck.fulfilled, (state, action) => {
        state.loading = false;
        state.decks.unshift(action.payload); // 새 덱을 맨 앞에 추가
        state.totalElements += 1;
        state.error = null;
      })
      .addCase(createDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '덱 생성에 실패했습니다.';
      })
      
      // 덱 수정
      .addCase(updateDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeck.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.decks.findIndex(deck => deck.deckId === action.payload.deckId);
        if (index !== -1) {
          state.decks[index] = action.payload;
        }
        // 선택된 덱도 업데이트
        if (state.selectedDeck?.deckId === action.payload.deckId) {
          state.selectedDeck = action.payload;
        }
        state.error = null;
      })
      .addCase(updateDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '덱 수정에 실패했습니다.';
      })
      
      // 덱 삭제
      .addCase(deleteDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDeck.fulfilled, (state, action) => {
        state.loading = false;
        state.decks = state.decks.filter(deck => deck.deckId !== action.payload);
        // 선택된 덱이 삭제된 경우 초기화
        if (state.selectedDeck?.deckId === action.payload) {
          state.selectedDeck = null;
        }
        state.totalElements = Math.max(0, state.totalElements - 1);
        state.error = null;
      })
      .addCase(deleteDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '덱 삭제에 실패했습니다.';
      })
      
      // 카드 목록 조회
      .addCase(fetchCardsInDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardsInDeck.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeckCards = action.payload;
        state.error = null;
      })
      .addCase(fetchCardsInDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '카드 목록을 불러오는데 실패했습니다.';
      })

             // 카드 수정
       .addCase(updateCard.fulfilled, (state, action) => {
         const index = state.currentDeckCards.findIndex(card => card.cardId === action.payload.cardId);
         if (index !== -1) {
           state.currentDeckCards[index] = action.payload;
         }
       })

       // 카드 삭제
       .addCase(deleteCard.fulfilled, (state, action) => {
         state.currentDeckCards = state.currentDeckCards.filter(card => card.cardId.toString() !== action.payload);
       });
  },
});

// ==========================================
// 6. 액션과 리듀서 내보내기
// ==========================================

export const { 
  clearError, 
  setSelectedDeck, 
  setFilters, 
  clearFilters,
  setCurrentPage,
  setPageSize,
  setLoading,
  toggleDeckBookmark,
  setCurrentDeck,
} = deckSlice.actions;

export default deckSlice.reducer;

// ==========================================
// 7. Selector 함수들
// ==========================================

// 기본 selector들
export const selectDecks = (state: RootState) => state.deck.decks;
export const selectSelectedDeck = (state: RootState) => state.deck.selectedDeck;
export const selectDeckLoading = (state: RootState) => state.deck.loading;
export const selectDeckError = (state: RootState) => state.deck.error;
export const selectDeckFilters = (state: RootState) => state.deck.filters;
export const selectDeckPagination = (state: RootState) => ({
  currentPage: state.deck.currentPage,
  totalPages: state.deck.totalPages,
  totalElements: state.deck.totalElements,
  pageSize: state.deck.pageSize,
});

// 파생 상태 selector
export const selectFilteredDecks = (state: RootState) => {
  const decks = selectDecks(state);
  const filters = selectDeckFilters(state);
  
  let filteredDecks = [...decks];
  
  // 검색 필터링
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredDecks = filteredDecks.filter(deck =>
      deck.deckName.toLowerCase().includes(query)
    );
  }
  
  // 북마크 필터링
  if (filters.showBookmarked) {
    // 북마크 필드가 있다면 사용
    // filteredDecks = filteredDecks.filter(deck => deck.isBookmarked);
  }
  
  // 정렬
  filteredDecks.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    switch (filters.sortBy) {
      case 'deckName':
        aValue = a.deckName;
        bValue = b.deckName;
        break;
      case 'cardCnt':
        aValue = a.cardCnt;
        bValue = b.cardCnt;
        break;
      case 'createdAt':
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
  
  return filteredDecks;
};

// 통계 selector
export const selectDeckStats = (state: RootState) => {
  const decks = selectDecks(state);
  
  return {
    totalDecks: decks.length,
    totalCards: decks.reduce((sum, deck) => sum + deck.cardCnt, 0),
    // bookmarkedDecks: decks.filter(deck => deck.isBookmarked).length,
  };
}; 