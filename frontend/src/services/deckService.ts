import type { CardDeck, Card, CreateDeckRequest, UpdateDeckRequest } from '../types/card';
import * as deckApi from '../api/deckApi';

// 🎯 덱 서비스 인터페이스 정의
export interface IDeckService {
  getDecks(memberId: number): Promise<CardDeck[]>;
  createDeck(data: CreateDeckRequest): Promise<CardDeck>;
  updateDeck(deckId: string, data: UpdateDeckRequest): Promise<CardDeck>;
  deleteDeck(deckId: string): Promise<void>;
  getCardsInDeck(deckId: string): Promise<Card[]>;
}

// 🎭 Mock 데이터 (기존 데이터 활용)
const mockDecks: CardDeck[] = [
  {
    deckId: 'deck-uuid-1',
    deckName: 'React 이해도',
    memberId: 1,
    cardCnt: 5,
    isDeleted: false,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    deckId: 'deck-uuid-2',
    deckName: '손익계산서',
    memberId: 1,
    cardCnt: 2,
    isDeleted: false,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    deckId: 'deck-uuid-3',
    deckName: '1.시스템 개발 생명주기(SDLC)',
    memberId: 1,
    cardCnt: 2,
    isDeleted: false,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  }
];

const mockCards: { [deckId: string]: Card[] } = {
  'deck-uuid-1': [
    {
      cardId: 1,
      content: 'React란 무엇인가?',
      answer: 'Facebook에서 개발한 JavaScript 라이브러리',
      deckId: 'deck-uuid-1',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    },
    {
      cardId: 2,
      content: 'JSX란?',
      answer: 'JavaScript XML의 줄임말로 React에서 사용하는 문법',
      deckId: 'deck-uuid-1',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    }
  ],
  'deck-uuid-2': [
    {
      cardId: 3,
      content: '손익계산서란?',
      answer: '일정 기간 동안 기업의 수익과 비용을 보여주는 재무제표',
      deckId: 'deck-uuid-2',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    }
  ]
};

// 🎭 Mock 서비스 구현
class MockDeckService implements IDeckService {
  private decks: CardDeck[] = [...mockDecks];
  private cards: { [deckId: string]: Card[] } = { ...mockCards };
  private nextCardId = 10;
  private nextDeckId = 4;

  async getDecks(memberId: number): Promise<CardDeck[]> {
    // 실제 API 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.decks.filter(deck => deck.memberId === memberId && !deck.isDeleted);
  }

  async createDeck(data: CreateDeckRequest): Promise<CardDeck> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newDeck: CardDeck = {
      deckId: `deck-uuid-${this.nextDeckId++}`,
      deckName: data.deckName,
      memberId: 1, // 현재 로그인한 사용자로 가정
      cardCnt: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.decks.unshift(newDeck);
    this.cards[newDeck.deckId] = [];
    return newDeck;
  }

  async updateDeck(deckId: string, data: UpdateDeckRequest): Promise<CardDeck> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const deckIndex = this.decks.findIndex(deck => deck.deckId === deckId);
    if (deckIndex === -1) {
      throw new Error('덱을 찾을 수 없습니다.');
    }
    
    this.decks[deckIndex] = {
      ...this.decks[deckIndex],
      deckName: data.deckName,
      updatedAt: new Date().toISOString()
    };
    
    return this.decks[deckIndex];
  }

  async deleteDeck(deckId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const deckIndex = this.decks.findIndex(deck => deck.deckId === deckId);
    if (deckIndex !== -1) {
      this.decks[deckIndex].isDeleted = true;
      this.decks[deckIndex].updatedAt = new Date().toISOString();
    }
  }

  async getCardsInDeck(deckId: string): Promise<Card[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.cards[deckId] || [];
  }
}

// 🌐 실제 API 서비스 구현
class RealDeckService implements IDeckService {
  async getDecks(memberId: number): Promise<CardDeck[]> {
    return await deckApi.getDecksByMemberId(memberId);
  }

  async createDeck(data: CreateDeckRequest): Promise<CardDeck> {
    return await deckApi.createDeck(data);
  }

  async updateDeck(deckId: string, data: UpdateDeckRequest): Promise<CardDeck> {
    return await deckApi.updateDeck(deckId, data);
  }

  async deleteDeck(deckId: string): Promise<void> {
    return await deckApi.deleteDeck(deckId);
  }

  async getCardsInDeck(deckId: string): Promise<Card[]> {
    return await deckApi.getCardsInDeck(deckId);
  }
}

// 🏭 Factory 함수 - 환경에 따라 서비스 선택
export const createDeckService = (): IDeckService => {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  
  console.log(`🎯 Deck Service Mode: ${useMockData ? 'MOCK' : 'REAL'}`);
  
  return useMockData ? new MockDeckService() : new RealDeckService();
};

// 🎯 싱글톤 인스턴스 (전역에서 동일한 서비스 사용)
export const deckService = createDeckService(); 