import type { Card, CreateCardRequest, SearchCard, UpdateCardRequest, AddCardTagRequest, CreateCardsRequest } from '../types/card';
import * as cardApi from '../api/cardApi';
import { deckService } from './deckService';

// 🎯 카드 서비스 인터페이스 정의
export interface ICardService {
  getCard(cardId: number): Promise<Card>;
  createCard(deckId: string, data: CreateCardRequest): Promise<Card>;
  createMultipleCards(deckId: string, data: CreateCardsRequest): Promise<Card[]>;
  updateCard(cardId: number, data: UpdateCardRequest): Promise<Card>;
  deleteCard(cardId: number): Promise<void>;
  searchCards(keyword: string): Promise<SearchCard[]>;
  addCardTags(data: AddCardTagRequest): Promise<void>;
  removeCardTag(cardId: number, tagName: string): Promise<void>;
  toggleBookmark(cardId: number, bookmarked: boolean): Promise<void>;
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
      updatedAt: '2024-01-15T10:30:00',
      deckName: '',
      tags: ['React', 'JavaScript', 'Frontend'],
      bookmarked: false
    },
    {
      cardId: 2,
      content: 'JSX란?',
      answer: 'JavaScript XML의 줄임말로 React에서 사용하는 문법',
      deckId: 'deck-uuid-1',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00',
      deckName: '',
      tags: ['React', 'JSX'],
      bookmarked: true
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
      updatedAt: new Date().toISOString(),
      deckName: '',
      tags: [],
      bookmarked: false
    };
    
    this.cards.push(newCard);

    // === MockDeckService 데이터 동기화 ===
    // deckService가 Mock 모드일 때, 같은 메모리 내의 cards 배열을 업데이트하여
    // getDecks 호출 시 cardCnt가 정확히 계산되도록 합니다.
    const dsAny = deckService as any;
    if ('cards' in dsAny) {
      if (!dsAny.cards) dsAny.cards = {};
      if (!dsAny.cards[deckId]) dsAny.cards[deckId] = [];
      dsAny.cards[deckId].push({ ...newCard });
    } else if ('mockService' in dsAny && dsAny.mockService && 'cards' in dsAny.mockService) {
      const mockSvc = dsAny.mockService as any;
      if (!mockSvc.cards[deckId]) mockSvc.cards[deckId] = [];
      mockSvc.cards[deckId].push({ ...newCard });
    }
    return newCard;
  }

  async createMultipleCards(deckId: string, data: CreateCardsRequest): Promise<Card[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const deck = this.mockDecks.find(d => d.deckId === deckId);
    if (!deck) {
        throw new Error('덱을 찾을 수 없습니다.');
    }

    const createdCards: Card[] = data.cards.map(cardData => {
        const newCard: Card = {
            cardId: this.nextCardId++,
            content: cardData.content,
            answer: cardData.answer,
            deckId,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deckName: deck.deckName,
            tags: [],
            bookmarked: false
        };
        this.cards.push(newCard);
        return newCard;
    });

    const dsAny = deckService as any;
    if ('cards' in dsAny) {
        if (!dsAny.cards) dsAny.cards = {};
        if (!dsAny.cards[deckId]) dsAny.cards[deckId] = [];
        dsAny.cards[deckId].push(...createdCards);
    } else if ('mockService' in dsAny && dsAny.mockService && 'cards' in dsAny.mockService) {
        const mockSvc = dsAny.mockService as any;
        if (!mockSvc.cards[deckId]) mockSvc.cards[deckId] = [];
        mockSvc.cards[deckId].push(...createdCards);
    }

    return createdCards;
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

  async addCardTags(data: AddCardTagRequest): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cardIndex = this.cards.findIndex(c => c.cardId === data.cardId && !c.isDeleted);
    if (cardIndex === -1) {
      throw new Error('카드를 찾을 수 없습니다.');
    }
    
    // 기존 태그와 중복되지 않는 새 태그만 추가
    const existingTags = this.cards[cardIndex].tags || [];
    const newTags = data.tagNames.filter(tag => !existingTags.includes(tag));
    
    this.cards[cardIndex].tags = [...existingTags, ...newTags];
    this.cards[cardIndex].updatedAt = new Date().toISOString();
  }

  async removeCardTag(cardId: number, tagName: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cardIndex = this.cards.findIndex(c => c.cardId === cardId && !c.isDeleted);
    if (cardIndex === -1) {
      throw new Error('카드를 찾을 수 없습니다.');
    }
    
    // 지정된 태그 제거
    const existingTags = this.cards[cardIndex].tags || [];
    this.cards[cardIndex].tags = existingTags.filter(tag => tag !== tagName);
    this.cards[cardIndex].updatedAt = new Date().toISOString();
  }

  async toggleBookmark(cardId: number, bookmarked: boolean): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cardIndex = this.cards.findIndex(c => c.cardId === cardId && !c.isDeleted);
    if (cardIndex === -1) {
      throw new Error('카드를 찾을 수 없습니다.');
    }
    
    // 북마크 상태 업데이트
    this.cards[cardIndex].bookmarked = bookmarked;
    this.cards[cardIndex].updatedAt = new Date().toISOString();
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

  async createMultipleCards(deckId: string, data: CreateCardsRequest): Promise<Card[]> {
    try {
      return await cardApi.createMultipleCards(deckId, data);
    } catch (error) {
      console.warn('⚠️ Real API (createMultipleCards) 실패! Mock 데이터로 대체합니다.', error);
      return this.mockService.createMultipleCards(deckId, data);
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

  async addCardTags(data: AddCardTagRequest): Promise<void> {
    try {
      await cardApi.addCardTags(data);
    } catch (error) {
      console.warn('⚠️ Real API (addCardTags) 실패! Mock 동작으로 대체합니다.', error);
      return this.mockService.addCardTags(data);
    }
  }

  async removeCardTag(cardId: number, tagName: string): Promise<void> {
    try {
      await cardApi.removeCardTag(cardId, tagName);
    } catch (error) {
      console.warn('⚠️ Real API (removeCardTag) 실패! Mock 동작으로 대체합니다.', error);
      return this.mockService.removeCardTag(cardId, tagName);
    }
  }

  async toggleBookmark(cardId: number, bookmarked: boolean): Promise<void> {
    try {
      if (bookmarked) {
        await cardApi.addCardBookmark(cardId);
      } else {
        await cardApi.removeCardBookmark(cardId);
      }
    } catch (error) {
      console.warn('⚠️ Real API (toggleBookmark) 실패! Mock 동작으로 대체합니다.', error);
      return this.mockService.toggleBookmark(cardId, bookmarked);
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