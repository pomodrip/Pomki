import type { Card, CreateCardRequest, SearchCard, UpdateCardRequest } from '../types/card';
import * as cardApi from '../api/cardApi';

// 🎯 카드 서비스 인터페이스 정의
export interface ICardService {
  getCard(cardId: number): Promise<Card>;
  createCard(deckId: string, data: CreateCardRequest): Promise<Card>;
  updateCard(cardId: number, data: UpdateCardRequest): Promise<Card>;
  deleteCard(cardId: number): Promise<void>;
  searchCards(keyword: string): Promise<SearchCard[]>;
}

// 🎭 Mock 카드 서비스 구현
class MockCardService implements ICardService {
  private cards: Card[] = [
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
  ];
  private nextCardId = 10;

  // Mock 덱 데이터 (deckName을 가져오기 위해)
  private mockDecks = [
    { deckId: 'deck-uuid-1', deckName: 'JavaScript 기초' },
    { deckId: 'deck-uuid-2', deckName: 'React 심화' },
  ];

  async getCard(cardId: number): Promise<Card> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const card = this.cards.find(c => c.cardId === cardId && !c.isDeleted);
    if (!card) {
      throw new Error('카드를 찾을 수 없습니다.');
    }
    return card;
  }

  async createCard(deckId: string, data: CreateCardRequest): Promise<Card> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newCard: Card = {
      cardId: this.nextCardId++,
      content: data.content,
      answer: data.answer,
      deckId,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.cards.push(newCard);
    return newCard;
  }

  async updateCard(cardId: number, data: UpdateCardRequest): Promise<Card> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cardIndex = this.cards.findIndex(c => c.cardId === cardId);
    if (cardIndex === -1) {
      throw new Error('카드를 찾을 수 없습니다.');
    }
    
    this.cards[cardIndex] = {
      ...this.cards[cardIndex],
      content: data.content,
      answer: data.answer,
      updatedAt: new Date().toISOString()
    };
    
    return this.cards[cardIndex];
  }

  async deleteCard(cardId: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cardIndex = this.cards.findIndex(c => c.cardId === cardId);
    if (cardIndex !== -1) {
      this.cards[cardIndex].isDeleted = true;
      this.cards[cardIndex].updatedAt = new Date().toISOString();
    }
  }

  async searchCards(keyword: string): Promise<SearchCard[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const filteredCards = this.cards.filter(card => 
      !card.isDeleted && 
      (card.content.toLowerCase().includes(keyword.toLowerCase()) || 
       card.answer.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    // Card를 SearchCard로 변환
    return filteredCards.map(card => {
      const deck = this.mockDecks.find(d => d.deckId === card.deckId);
      return {
        ...card,
        deckName: deck?.deckName || '알 수 없는 덱'
      };
    });
  }
}

// 🌐 실제 API 카드 서비스 구현
class RealCardService implements ICardService {
  private mockService = new MockCardService();

  async getCard(cardId: number): Promise<Card> {
    try {
      return await cardApi.getCard(cardId);
    } catch (error) {
      console.warn('⚠️ Real API (getCard) 실패! Mock 데이터로 대체합니다.', error);
      return this.mockService.getCard(cardId);
    }
  }

  async createCard(deckId: string, data: CreateCardRequest): Promise<Card> {
    try {
      return await cardApi.createCard(deckId, data);
    } catch (error) {
      console.warn('⚠️ Real API (createCard) 실패! Mock 데이터로 대체합니다.', error);
      return this.mockService.createCard(deckId, data);
    }
  }

  async updateCard(cardId: number, data: UpdateCardRequest): Promise<Card> {
    try {
      return await cardApi.updateCard(cardId, data);
    } catch (error) {
      console.warn('⚠️ Real API (updateCard) 실패! Mock 데이터로 대체합니다.', error);
      return this.mockService.updateCard(cardId, data);
    }
  }

  async deleteCard(cardId: number): Promise<void> {
    try {
      await cardApi.deleteCard(cardId);
    } catch (error) {
      console.warn('⚠️ Real API (deleteCard) 실패! Mock 동작으로 대체합니다.', error);
      return this.mockService.deleteCard(cardId);
    }
  }

  async searchCards(keyword: string): Promise<SearchCard[]> {
    try {
      return await cardApi.searchCards(keyword);
    } catch (error) {
      console.warn('⚠️ Real API (searchCards) 실패! Mock 데이터로 대체합니다.', error);
      return this.mockService.searchCards(keyword);
    }
  }
}

// 🏭 Factory 함수
export const createCardService = (): ICardService => {
  // VITE_USE_MOCK_DATA 환경 변수를 사용하여 Mock/Real 모드 결정
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  
  console.log(`[CardService] Mode: ${useMockData ? 'MOCK' : 'REAL (with Mock Fallback)'}`);
  
  return useMockData ? new MockCardService() : new RealCardService();
};

// 🎯 싱글톤 인스턴스
export const cardService = createCardService();

// 🔄 개발 중 Hot Reload를 위한 강제 재생성
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔄 CardService Hot Reload');
  });
} 