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
    deckName: 'React 기초 개념',
    memberId: 1,
    cardCnt: 5,
    isDeleted: false,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    deckId: 'deck-uuid-2',
    deckName: '회계 기초',
    memberId: 1,
    cardCnt: 2,
    isDeleted: false,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    deckId: 'deck-uuid-3',
    deckName: '시스템 개발 방법론',
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
      answer: 'Facebook에서 개발한 JavaScript 라이브러리로, 사용자 인터페이스를 구축하기 위한 컴포넌트 기반 라이브러리입니다.',
      deckId: 'deck-uuid-1',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    },
    {
      cardId: 2,
      content: 'JSX란?',
      answer: 'JavaScript XML의 줄임말로 React에서 사용하는 문법입니다. HTML과 유사한 문법으로 JavaScript 안에서 UI를 작성할 수 있게 해줍니다.',
      deckId: 'deck-uuid-1',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    },
    {
      cardId: 3,
      content: 'useState Hook이란?',
      answer: 'React에서 함수형 컴포넌트에 상태를 추가할 수 있게 해주는 Hook입니다.',
      deckId: 'deck-uuid-1',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    },
    {
      cardId: 4,
      content: 'useEffect Hook의 역할은?',
      answer: '컴포넌트가 렌더링될 때 특정 작업을 수행할 수 있게 해주는 Hook입니다. 생명주기 메서드를 대체합니다.',
      deckId: 'deck-uuid-1',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    },
    {
      cardId: 5,
      content: 'Props란?',
      answer: '부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법입니다. Properties의 줄임말입니다.',
      deckId: 'deck-uuid-1',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    }
  ],
  'deck-uuid-2': [
    {
      cardId: 6,
      content: '손익계산서란?',
      answer: '일정 기간 동안 기업의 수익과 비용을 보여주는 재무제표입니다. 기업의 경영성과를 나타냅니다.',
      deckId: 'deck-uuid-2',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    },
    {
      cardId: 7,
      content: '대차대조표란?',
      answer: '특정 시점에서 기업의 자산, 부채, 자본의 상태를 보여주는 재무제표입니다.',
      deckId: 'deck-uuid-2',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    }
  ],
  'deck-uuid-3': [
    {
      cardId: 8,
      content: 'SDLC란?',
      answer: 'System Development Life Cycle의 줄임말로, 시스템 개발 생명주기를 의미합니다.',
      deckId: 'deck-uuid-3',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    },
    {
      cardId: 9,
      content: '애자일 방법론이란?',
      answer: '소프트웨어 개발에서 빠른 반복과 피드백을 통해 점진적으로 개발하는 방법론입니다.',
      deckId: 'deck-uuid-3',
      isDeleted: false,
      createdAt: '2024-01-15T10:30:00',
      updatedAt: '2024-01-15T10:30:00'
    }
  ]
};

// 🎭 Mock 서비스 구현
class MockDeckService implements IDeckService {
  private decks: CardDeck[];
  private cards: { [deckId: string]: Card[] };
  //private nextCardId = 10;
  private nextDeckId = 4;

  constructor() {
    // 🎯 Mock 데이터를 깊은 복사하여 수정 가능하도록 만듭니다.
    this.decks = JSON.parse(JSON.stringify(mockDecks));
    this.cards = JSON.parse(JSON.stringify(mockCards));
  }

  async getDecks(memberId: number): Promise<CardDeck[]> {
    console.log('🎭 MockDeckService: getDecks 호출', { memberId });
    // 실제 API 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = this.decks.filter(deck => deck.memberId === memberId && !deck.isDeleted);
    console.log('🎭 MockDeckService: getDecks 결과', result);
    return result;
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
    
    let updatedDeck: CardDeck | null = null;
    this.decks = this.decks.map(deck => {
      if (deck.deckId === deckId) {
        updatedDeck = {
          ...deck,
          deckName: data.deckName,
          updatedAt: new Date().toISOString(),
        };
        return updatedDeck;
      }
      return deck;
    });

    if (!updatedDeck) {
      throw new Error('덱을 찾을 수 없습니다.');
    }
    
    return updatedDeck;
  }

  async deleteDeck(deckId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.decks = this.decks.map(deck => {
      if (deck.deckId === deckId) {
        // isDeleted 플래그만 변경된 새 객체 반환 (소프트 삭제)
        return { ...deck, isDeleted: true, updatedAt: new Date().toISOString() };
      }
      return deck;
    });
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
  // 🎯 강제로 Mock 데이터 사용 (개발 중)
  const useMockData = true; // import.meta.env.VITE_USE_MOCK_DATA !== 'false';
  
  console.log(`🎯 Deck Service Mode: ${useMockData ? 'MOCK' : 'REAL'}`);
  console.log(`🎯 환경 변수 VITE_USE_MOCK_DATA:`, import.meta.env.VITE_USE_MOCK_DATA);
  
  return useMockData ? new MockDeckService() : new RealDeckService();
};

// 🎯 싱글톤 인스턴스 (전역에서 동일한 서비스 사용)
export const deckService = createDeckService();

// 🔄 개발 중 Hot Reload를 위한 강제 재생성
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔄 DeckService Hot Reload');
  });
} 