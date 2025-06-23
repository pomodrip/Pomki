import type { Card, CreateCardRequest, UpdateCardRequest } from '../types/card';
import * as cardApi from '../api/cardApi';

// 🎯 카드 서비스 인터페이스 정의
export interface ICardService {
  getCard(cardId: number): Promise<Card>;
  createCard(deckId: string, data: CreateCardRequest): Promise<Card>;
  updateCard(cardId: number, data: UpdateCardRequest): Promise<Card>;
  deleteCard(cardId: number): Promise<void>;
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
}

// 🌐 실제 API 카드 서비스 구현
class RealCardService implements ICardService {
  async getCard(cardId: number): Promise<Card> {
    return await cardApi.getCard(cardId);
  }

  async createCard(deckId: string, data: CreateCardRequest): Promise<Card> {
    return await cardApi.createCard(deckId, data);
  }

  async updateCard(cardId: number, data: UpdateCardRequest): Promise<Card> {
    return await cardApi.updateCard(cardId, data);
  }

  async deleteCard(cardId: number): Promise<void> {
    return await cardApi.deleteCard(cardId);
  }
}

// 🏭 Factory 함수
export const createCardService = (): ICardService => {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  
  console.log(`🃏 Card Service Mode: ${useMockData ? 'MOCK' : 'REAL'}`);
  
  return useMockData ? new MockCardService() : new RealCardService();
};

// 🎯 싱글톤 인스턴스
export const cardService = createCardService(); 