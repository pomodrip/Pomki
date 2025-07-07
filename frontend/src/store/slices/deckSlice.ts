import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { deckService } from '../../services/deckService';
import { cardService } from '../../services/cardService';
import type {
  CardDeck,
  Card,
  CreateDeckRequest,
  UpdateDeckRequest,
  UpdateCardRequest,
  CreateCardRequest,
  AddCardTagRequest,
} from '../../types/card';
import { createSelector } from '@reduxjs/toolkit';

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
  
  // 카드 필터
  cardFilters: {
    searchQuery: string;
    showBookmarkedOnly: boolean;
    selectedTags: string[];
    sortBy: 'content' | 'createdAt' | 'updatedAt';
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
  cardFilters: {
    searchQuery: '',
    showBookmarkedOnly: false,
    selectedTags: [],
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

// 덱 목록 조회
export const fetchDecks = createAsyncThunk<
  CardDeck[],
  void,
  { state: RootState; rejectValue: string }
>('deck/fetchDecks', async (_, { getState }) => {
  const { user } = (getState() as RootState).auth;
  const decks = await deckService.getDecks(user!.memberId!);
  return decks;
});

// 단일 덱 조회 (이 Thunk는 현재 페이지에서 사용되지 않지만, 일관성을 위해 수정)
// 참고: getDeckById는 deckService에 없으므로, getDecks에서 필터링하는 방식으로 대체하거나
// deckService에 추가해야 합니다. 여기서는 getDecks를 활용합니다.
export const fetchDeck = createAsyncThunk<
  CardDeck | undefined,
  string,
  { state: RootState; rejectValue: string }
>('deck/fetchDeck', async (deckId, { getState }) => {
  const { user } = (getState() as RootState).auth;
  const decks = await deckService.getDecks(user!.memberId!);
  return decks.find(d => d.deckId === deckId);
});

// 덱 생성
export const createDeck = createAsyncThunk<
  CardDeck,
  CreateDeckRequest,
  { state: RootState; rejectValue: string }
>('deck/createDeck', async (data) => {
  const deck = await deckService.createDeck(data);
  return deck;
});

// 덱 수정
export const updateDeck = createAsyncThunk<
  CardDeck,
  { deckId: string; data: UpdateDeckRequest },
  { state: RootState; rejectValue: string }
>('deck/updateDeck', async ({ deckId, data }) => {
  const deck = await deckService.updateDeck(deckId, data);
  return deck;
});

// 덱 삭제
export const deleteDeck = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('deck/deleteDeck', async (deckId) => {
  await deckService.deleteDeck(deckId);
  return deckId;
});

// 덱의 카드 목록 조회
export const fetchCardsInDeck = createAsyncThunk<
  Card[],
  string,
  { state: RootState; rejectValue: string }
>('deck/fetchCardsInDeck', async (deckId) => {
  const cards = await deckService.getCardsInDeck(deckId);
  return cards;
});

// 카드 생성
export const createCard = createAsyncThunk<
  Card,
  { deckId: string; data: CreateCardRequest },
  { state: RootState; rejectValue: string }
>('deck/createCard', async ({ deckId, data }, { rejectWithValue }) => {
  try {
    return await cardService.createCard(deckId, data);
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 카드 수정
export const updateCard = createAsyncThunk<
  Card,
  { cardId: number; data: UpdateCardRequest },
  { state: RootState; rejectValue: string }
>('deck/updateCard', async ({ cardId, data }, { rejectWithValue }) => {
  try {
    return await cardService.updateCard(cardId, data);
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 카드 삭제
export const deleteCard = createAsyncThunk<
  number,
  number,
  { state: RootState; rejectValue: string }
>('deck/deleteCard', async (cardId, { rejectWithValue }) => {
  try {
    await cardService.deleteCard(cardId);
    return cardId;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 카드에 태그 추가
export const addCardTags = createAsyncThunk<
  { cardId: number; addedTags: string[] },
  AddCardTagRequest,
  { state: RootState; rejectValue: string }
>('deck/addCardTags', async (data, { getState, rejectWithValue }) => {
  try {
    // 현재 카드의 기존 태그 확인
    const state = getState() as RootState;
    const currentCard = state.deck.currentDeckCards.find(card => card.cardId === data.cardId);
    const existingTags = currentCard?.tags || [];
    
    // 중복되지 않는 새 태그만 필터링
    const newTags = data.tagNames.filter(tag => !existingTags.includes(tag));
    
    if (newTags.length === 0) {
      // 추가할 새 태그가 없으면 조기 반환
      return { cardId: data.cardId, addedTags: [] };
    }
    
    // 실제로 추가할 태그만으로 API 호출
    await cardService.addCardTags({ ...data, tagNames: newTags });
    return { cardId: data.cardId, addedTags: newTags };
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 카드에서 태그 제거
export const removeCardTag = createAsyncThunk<
  { cardId: number; removedTag: string },
  { cardId: number; tagName: string },
  { state: RootState; rejectValue: string }
>('deck/removeCardTag', async ({ cardId, tagName }, { rejectWithValue }) => {
  try {
    await cardService.removeCardTag(cardId, tagName);
    return { cardId, removedTag: tagName };
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 카드 북마크 토글
export const toggleCardBookmark = createAsyncThunk<
  { cardId: number; bookmarked: boolean },
  number,
  { state: RootState; rejectValue: string }
>('deck/toggleCardBookmark', async (cardId, { getState, rejectWithValue }) => {
  try {
    // 현재 카드의 북마크 상태 확인
    const state = getState() as RootState;
    const currentCard = state.deck.currentDeckCards.find(card => card.cardId === cardId);
    const currentBookmarked = currentCard?.bookmarked || false;
    const newBookmarked = !currentBookmarked;
    
    // API 호출
    await cardService.toggleBookmark(cardId, newBookmarked);
    
    return { cardId, bookmarked: newBookmarked };
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
    
    // 카드 필터 설정
    setCardFilters: (state, action: PayloadAction<Partial<DeckState['cardFilters']>>) => {
      state.cardFilters = { ...state.cardFilters, ...action.payload };
    },
    
    // 카드 필터 초기화
    clearCardFilters: (state) => {
      state.cardFilters = initialState.cardFilters;
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
    
    // 카드 북마크 토글 (로컬 상태 업데이트)
    toggleCardBookmarkLocal: (state, action: PayloadAction<number>) => {
      const cardId = action.payload;
      const cardIndex = state.currentDeckCards.findIndex(card => card.cardId === cardId);
      if (cardIndex !== -1) {
        state.currentDeckCards[cardIndex].bookmarked = !state.currentDeckCards[cardIndex].bookmarked;
        state.currentDeckCards[cardIndex].updatedAt = new Date().toISOString();
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

        // 기존 상태와 병합하여 cardCnt가 로컬에서 더 최신이라면 유지
        const mergedDecks = action.payload.map((apiDeck) => {
          const localDeck = state.decks.find((d) => d.deckId === apiDeck.deckId);
          if (localDeck && localDeck.cardCnt !== undefined) {
            return {
              ...apiDeck,
              // 서버 값과 로컬 값 중 더 큰 값을 사용 (로컬이 앞서 있을 가능성)
              cardCnt: Math.max(apiDeck.cardCnt, localDeck.cardCnt),
            };
          }
          return apiDeck;
        });

        state.decks = mergedDecks;
        state.totalElements = mergedDecks.length;
        state.totalPages = Math.ceil(mergedDecks.length / state.pageSize);
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
        state.selectedDeck = action.payload ?? null;
        state.loading = false;
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
        // 안전장치: payload가 배열인지 확인
        const fetchedCards = Array.isArray(action.payload) ? action.payload : [];
        state.currentDeckCards = fetchedCards;

        // ✅ 덱의 카드 개수를 실제 카드 개수와 동기화
        const deckId = action.meta.arg; // thunk 인자로 전달된 deckId
        const actualCnt = fetchedCards.filter(card => !card.isDeleted).length;

        // decks 배열 내 해당 덱 cardCnt 업데이트
        const deckIndex = state.decks.findIndex(deck => deck.deckId === deckId);
        if (deckIndex !== -1) {
          state.decks[deckIndex].cardCnt = actualCnt;
        }

        // 선택된 덱이 현재 덱인 경우 cardCnt 업데이트
        if (state.selectedDeck?.deckId === deckId) {
          state.selectedDeck.cardCnt = actualCnt;
        }

        state.error = null;
      })
      .addCase(fetchCardsInDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '카드 목록을 불러오는데 실패했습니다.';
        // 에러 시 빈 배열로 초기화
        state.currentDeckCards = [];
      })

       // 카드 생성
       .addCase(createCard.fulfilled, (state, action) => {
         state.currentDeckCards.push(action.payload);
         // 해당 덱의 카드 수 증가
         const deckIndex = state.decks.findIndex(deck => deck.deckId === action.payload.deckId);
         if (deckIndex !== -1) {
           state.decks[deckIndex].cardCnt += 1;
         }
         if (state.selectedDeck?.deckId === action.payload.deckId) {
           state.selectedDeck.cardCnt += 1;
         }
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
         // 먼저 삭제될 카드 정보를 찾기
         const deletedCard = state.currentDeckCards.find(card => card.cardId === action.payload);
         
         // 카드 목록에서 제거
         state.currentDeckCards = state.currentDeckCards.filter(card => card.cardId !== action.payload);
         
         // 해당 덱의 카드 수 감소
         if (deletedCard) {
           const deckIndex = state.decks.findIndex(deck => deck.deckId === deletedCard.deckId);
           if (deckIndex !== -1) {
             state.decks[deckIndex].cardCnt -= 1;
           }
           if (state.selectedDeck?.deckId === deletedCard.deckId) {
             state.selectedDeck.cardCnt -= 1;
           }
         }
       })

       // 카드 태그 추가
       .addCase(addCardTags.fulfilled, (state, action) => {
         const { cardId, addedTags } = action.payload;
         const cardIndex = state.currentDeckCards.findIndex(card => card.cardId === cardId);
         
         if (cardIndex !== -1 && addedTags.length > 0) {
           const existingTags = state.currentDeckCards[cardIndex].tags || [];
           // 중복 방지를 위해 한 번 더 필터링 (안전장치)
           const uniqueNewTags = addedTags.filter(tag => !existingTags.includes(tag));
           state.currentDeckCards[cardIndex].tags = [...existingTags, ...uniqueNewTags];
           state.currentDeckCards[cardIndex].updatedAt = new Date().toISOString();
         }
       })
       .addCase(addCardTags.rejected, (state, action) => {
         state.error = action.payload || '태그 추가에 실패했습니다.';
       })

       // 카드 태그 제거
       .addCase(removeCardTag.fulfilled, (state, action) => {
         const { cardId, removedTag } = action.payload;
         const cardIndex = state.currentDeckCards.findIndex(card => card.cardId === cardId);
         
         if (cardIndex !== -1) {
           const existingTags = state.currentDeckCards[cardIndex].tags || [];
           state.currentDeckCards[cardIndex].tags = existingTags.filter(tag => tag !== removedTag);
           state.currentDeckCards[cardIndex].updatedAt = new Date().toISOString();
         }
       })
       .addCase(removeCardTag.rejected, (state, action) => {
         state.error = action.payload || '태그 제거에 실패했습니다.';
       })

       // 카드 북마크 토글 - loading 상태를 변경하지 않음 (UI 깜빡임 방지)
       .addCase(toggleCardBookmark.fulfilled, (state, action) => {
         const { cardId, bookmarked } = action.payload;
         const cardIndex = state.currentDeckCards.findIndex(card => card.cardId === cardId);
         
         if (cardIndex !== -1) {
           state.currentDeckCards[cardIndex].bookmarked = bookmarked;
           state.currentDeckCards[cardIndex].updatedAt = new Date().toISOString();
         }
         state.error = null;
       })
       .addCase(toggleCardBookmark.rejected, (state, action) => {
         state.error = action.payload || '북마크 토글에 실패했습니다.';
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
  setCardFilters,
  clearCardFilters,
  setCurrentPage,
  setPageSize,
  setLoading,
  toggleCardBookmarkLocal,
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
export const selectCardFilters = (state: RootState) => state.deck.cardFilters;
export const selectDeckPagination = (state: RootState) => ({
  currentPage: state.deck.currentPage,
  totalPages: state.deck.totalPages,
  totalElements: state.deck.totalElements,
  pageSize: state.deck.pageSize,
});

// 파생 상태 selector
export const selectFilteredDecks = createSelector(
  [(state: RootState) => state.deck.decks, (state: RootState) => state.deck.filters],
  (decks, filters) => {
    const { searchQuery, showBookmarked, sortBy, sortOrder } = filters;
    return decks
      .filter(deck => {
        const matchesSearch = searchQuery.trim() === '' || deck.deckName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBookmark = !showBookmarked || (deck as any).bookmarked === true;
        return matchesSearch && matchesBookmark;
      })
      .sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        const compare = aVal.toString().localeCompare(bVal.toString());
        return sortOrder === 'asc' ? compare : -compare;
      });
  }
);

// 통계 selector
export const selectDeckStats = (state: RootState) => {
  const decks = selectDecks(state);
  const cards = selectCurrentDeckCards(state);
  
  return {
    totalDecks: decks.length,
    totalCards: decks.reduce((sum, deck) => sum + deck.cardCnt, 0),
    bookmarkedCards: cards.filter(card => card.bookmarked).length,
  };
};

// 현재 덱 카드 관련 selector
export const selectCurrentDeckCards = (state: RootState) => state.deck.currentDeckCards;

// 북마크된 카드만 필터링하는 selector
export const selectBookmarkedCards = (state: RootState) => {
  const cards = selectCurrentDeckCards(state);
  return cards.filter(card => card.bookmarked);
};

// 카드 필터링 selector (상태 기반)
export const selectFilteredCards = createSelector(
  [(state: RootState) => state.deck.currentDeckCards, (state: RootState) => state.deck.cardFilters],
  (cards, cardFilters) => {
    const { searchQuery, showBookmarkedOnly, selectedTags, sortBy, sortOrder } = cardFilters;
    return cards
      .filter(card => {
        const matchesSearch = searchQuery.trim() === '' || card.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBookmark = !showBookmarkedOnly || card.bookmarked === true;
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => card.tags.includes(tag));
        return matchesSearch && matchesBookmark && matchesTags;
      })
      .sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        const compare = aVal.toString().localeCompare(bVal.toString());
        return sortOrder === 'asc' ? compare : -compare;
      });
  }
); 