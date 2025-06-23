import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { CardDeck, Card, CreateDeckRequest, UpdateDeckRequest } from '../../types/card';
import { deckService } from '../../services/deckService';
import { cardService } from '../../services/cardService';

// 🎯 덱 슬라이스 상태 정의
interface DeckState {
  decks: CardDeck[];
  currentDeckCards: Card[];
  loading: boolean;
  error: string | null;
  currentDeckId: string | null;
}

const initialState: DeckState = {
  decks: [],
  currentDeckCards: [],
  loading: false,
  error: null,
  currentDeckId: null,
};

// 🌐 비동기 액션들 (Thunk)

// 덱 목록 가져오기
export const fetchDecks = createAsyncThunk<CardDeck[], number, { rejectValue: string }>(
  'deck/fetchDecks',
  async (memberId, { rejectWithValue }) => {
    try {
      return await deckService.getDecks(memberId);
    } catch (error) {
      const e = error as Error;
      return rejectWithValue(e.message || '덱 목록을 가져오는데 실패했습니다.');
    }
  }
);

// 덱 생성
export const createDeck = createAsyncThunk<CardDeck, CreateDeckRequest, { rejectValue: string }>(
  'deck/createDeck',
  async (data, { rejectWithValue }) => {
    try {
      return await deckService.createDeck(data);
    } catch (error) {
      const e = error as Error;
      return rejectWithValue(e.message || '덱 생성에 실패했습니다.');
    }
  }
);

// 덱 수정
export const updateDeck = createAsyncThunk<CardDeck, { deckId: string; data: UpdateDeckRequest }, { rejectValue: string }>(
  'deck/updateDeck',
  async ({ deckId, data }, { rejectWithValue }) => {
    try {
      return await deckService.updateDeck(deckId, data);
    } catch (error) {
      const e = error as Error;
      return rejectWithValue(e.message || '덱 수정에 실패했습니다.');
    }
  }
);

// 덱 삭제
export const deleteDeck = createAsyncThunk<string, string, { rejectValue: string }>(
  'deck/deleteDeck',
  async (deckId, { rejectWithValue }) => {
    try {
      await deckService.deleteDeck(deckId);
      return deckId;
    } catch (error) {
      const e = error as Error;
      return rejectWithValue(e.message || '덱 삭제에 실패했습니다.');
    }
  }
);

// 덱 내 카드 목록 가져오기
export const fetchCardsInDeck = createAsyncThunk<{ deckId: string; cards: Card[] }, string, { rejectValue: string }>(
  'deck/fetchCardsInDeck',
  async (deckId, { rejectWithValue }) => {
    try {
      const cards = await deckService.getCardsInDeck(deckId);
      return { deckId, cards };
    } catch (error) {
      const e = error as Error;
      return rejectWithValue(e.message || '카드 목록을 가져오는데 실패했습니다.');
    }
  }
);

// 카드 생성
export const createCard = createAsyncThunk<Card, { deckId: string; data: { content: string; answer: string } }, { rejectValue: string }>(
  'deck/createCard',
  async ({ deckId, data }, { rejectWithValue }) => {
    try {
      return await cardService.createCard(deckId, data);
    } catch (error) {
      const e = error as Error;
      return rejectWithValue(e.message || '카드 생성에 실패했습니다.');
    }
  }
);

// 카드 수정
export const updateCard = createAsyncThunk<Card, { cardId: number; data: { content: string; answer: string } }, { rejectValue: string }>(
  'deck/updateCard',
  async ({ cardId, data }, { rejectWithValue }) => {
    try {
      return await cardService.updateCard(cardId, data);
    } catch (error) {
      const e = error as Error;
      return rejectWithValue(e.message || '카드 수정에 실패했습니다.');
    }
  }
);

// 카드 삭제
export const deleteCard = createAsyncThunk<number, number, { rejectValue: string }>(
  'deck/deleteCard',
  async (cardId, { rejectWithValue }) => {
    try {
      await cardService.deleteCard(cardId);
      return cardId;
    } catch (error) {
      const e = error as Error;
      return rejectWithValue(e.message || '카드 삭제에 실패했습니다.');
    }
  }
);

// 🎯 덱 슬라이스 정의
const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    // 현재 덱 설정
    setCurrentDeck: (state, action: PayloadAction<string>) => {
      state.currentDeckId = action.payload;
    },
    // 에러 클리어
    clearError: (state) => {
      state.error = null;
    },
    // 현재 덱 카드 초기화
    clearCurrentDeckCards: (state) => {
      state.currentDeckCards = [];
      state.currentDeckId = null;
    }
  },
  extraReducers: (builder) => {
    // 덱 목록 가져오기
    builder
      .addCase(fetchDecks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDecks.fulfilled, (state, action) => {
        state.loading = false;
        state.decks = action.payload;
      })
      .addCase(fetchDecks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 덱 생성
    builder
      .addCase(createDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeck.fulfilled, (state, action) => {
        state.loading = false;
        state.decks.unshift(action.payload);
      })
      .addCase(createDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 덱 수정
    builder
      .addCase(updateDeck.fulfilled, (state, action) => {
        const index = state.decks.findIndex(deck => deck.deckId === action.payload.deckId);
        if (index !== -1) {
          state.decks[index] = action.payload;
        }
      })
      .addCase(updateDeck.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // 덱 삭제
    builder
      .addCase(deleteDeck.fulfilled, (state, action) => {
        state.decks = state.decks.filter(deck => deck.deckId !== action.payload);
      })
      .addCase(deleteDeck.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // 카드 목록 가져오기
    builder
      .addCase(fetchCardsInDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardsInDeck.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeckId = action.payload.deckId;
        state.currentDeckCards = action.payload.cards;
      })
      .addCase(fetchCardsInDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 카드 생성
    builder
      .addCase(createCard.fulfilled, (state, action) => {
        state.currentDeckCards.push(action.payload);
        // 해당 덱의 카드 수 증가
        const deck = state.decks.find(d => d.deckId === action.payload.deckId);
        if (deck) {
          deck.cardCnt += 1;
        }
      })
      .addCase(createCard.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // 카드 수정
    builder
      .addCase(updateCard.fulfilled, (state, action) => {
        const index = state.currentDeckCards.findIndex(card => card.cardId === action.payload.cardId);
        if (index !== -1) {
          state.currentDeckCards[index] = action.payload;
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // 카드 삭제
    builder
      .addCase(deleteCard.fulfilled, (state, action) => {
        const deletedCard = state.currentDeckCards.find(card => card.cardId === action.payload);
        if (deletedCard) {
          state.currentDeckCards = state.currentDeckCards.filter(card => card.cardId !== action.payload);
          // 해당 덱의 카드 수 감소
          const deck = state.decks.find(d => d.deckId === deletedCard.deckId);
          if (deck && deck.cardCnt > 0) {
            deck.cardCnt -= 1;
          }
        }
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentDeck, clearError, clearCurrentDeckCards } = deckSlice.actions;
export default deckSlice.reducer; 