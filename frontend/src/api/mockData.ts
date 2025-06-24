// Mock 데이터 - API 실패시 fallback으로 사용
export const mockData = {
  // Auth 관련 Mock 데이터
  auth: {
    login: {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      member: {
        memberId: 1,
        email: 'mock@example.com',
        nickname: 'Mock User',
        isEmailVerified: true,
        socialLogin: false,
      }
    },
    
    emailVerification: {
      success: true,
      message: '인증 이메일이 전송되었습니다.',
      data: null,
    },
    
    verifyEmailCode: {
      success: true,
      message: '이메일 인증이 완료되었습니다.',
      verificationToken: 'mock_verification_token_' + Date.now(),
    },
    
    signup: {
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: null,
    },
  },

  // Deck 관련 Mock 데이터
  deck: {
    createDeck: (deckName: string) => ({
      deckId: 'deck_' + Date.now(),
      deckName: deckName || 'Mock Deck',
      memberId: 1,
      cardCnt: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    
    getDecksByMemberId: [
      {
        deckId: 'deck_1',
        deckName: '영어 단어',
        memberId: 1,
        cardCnt: 10,
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        deckId: 'deck_2',
        deckName: '일본어 단어',
        memberId: 1,
        cardCnt: 10,
        isDeleted: false,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        deckId: 'deck_3',
        deckName: '프로그래밍 용어',
        memberId: 1,
        cardCnt: 10,
        isDeleted: false,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      },
    ],
    
    // 덱별 카드 더미데이터
    getCardsInDeck: (deckId: string) => {
      const cardData: { [key: string]: any[] } = {
        'deck_1': [ // 영어 단어
          { cardId: 1, content: 'Hello', answer: '안녕하세요', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
          { cardId: 2, content: 'Goodbye', answer: '안녕히 가세요', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T01:00:00Z', updatedAt: '2024-01-01T01:00:00Z' },
          { cardId: 3, content: 'Thank you', answer: '감사합니다', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T02:00:00Z', updatedAt: '2024-01-01T02:00:00Z' },
          { cardId: 4, content: 'Please', answer: '부탁합니다', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T03:00:00Z', updatedAt: '2024-01-01T03:00:00Z' },
          { cardId: 5, content: 'Sorry', answer: '미안합니다', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T04:00:00Z', updatedAt: '2024-01-01T04:00:00Z' },
          { cardId: 6, content: 'Yes', answer: '네', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T05:00:00Z', updatedAt: '2024-01-01T05:00:00Z' },
          { cardId: 7, content: 'No', answer: '아니요', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T06:00:00Z', updatedAt: '2024-01-01T06:00:00Z' },
          { cardId: 8, content: 'Good morning', answer: '좋은 아침', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T07:00:00Z', updatedAt: '2024-01-01T07:00:00Z' },
          { cardId: 9, content: 'Good night', answer: '좋은 밤', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
          { cardId: 10, content: 'How are you?', answer: '어떻게 지내세요?', deckId: 'deck_1', isDeleted: false, createdAt: '2024-01-01T09:00:00Z', updatedAt: '2024-01-01T09:00:00Z' }
        ],
        'deck_2': [ // 일본어 단어
          { cardId: 11, content: 'こんにちは', answer: '안녕하세요', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
          { cardId: 12, content: 'ありがとう', answer: '감사합니다', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T01:00:00Z', updatedAt: '2024-01-02T01:00:00Z' },
          { cardId: 13, content: 'すみません', answer: '실례합니다', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T02:00:00Z', updatedAt: '2024-01-02T02:00:00Z' },
          { cardId: 14, content: 'はい', answer: '네', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T03:00:00Z', updatedAt: '2024-01-02T03:00:00Z' },
          { cardId: 15, content: 'いいえ', answer: '아니요', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T04:00:00Z', updatedAt: '2024-01-02T04:00:00Z' },
          { cardId: 16, content: 'おはよう', answer: '좋은 아침', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T05:00:00Z', updatedAt: '2024-01-02T05:00:00Z' },
          { cardId: 17, content: 'おやすみ', answer: '안녕히 주무세요', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T06:00:00Z', updatedAt: '2024-01-02T06:00:00Z' },
          { cardId: 18, content: 'さようなら', answer: '안녕히 가세요', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T07:00:00Z', updatedAt: '2024-01-02T07:00:00Z' },
          { cardId: 19, content: 'お元気ですか', answer: '어떻게 지내세요?', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T08:00:00Z', updatedAt: '2024-01-02T08:00:00Z' },
          { cardId: 20, content: 'がんばって', answer: '힘내세요', deckId: 'deck_2', isDeleted: false, createdAt: '2024-01-02T09:00:00Z', updatedAt: '2024-01-02T09:00:00Z' }
        ],
        'deck_3': [ // 프로그래밍 용어
          { cardId: 21, content: 'function', answer: '함수', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-03T00:00:00Z' },
          { cardId: 22, content: 'variable', answer: '변수', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T01:00:00Z', updatedAt: '2024-01-03T01:00:00Z' },
          { cardId: 23, content: 'array', answer: '배열', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T02:00:00Z', updatedAt: '2024-01-03T02:00:00Z' },
          { cardId: 24, content: 'object', answer: '객체', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T03:00:00Z', updatedAt: '2024-01-03T03:00:00Z' },
          { cardId: 25, content: 'loop', answer: '반복문', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T04:00:00Z', updatedAt: '2024-01-03T04:00:00Z' },
          { cardId: 26, content: 'condition', answer: '조건문', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T05:00:00Z', updatedAt: '2024-01-03T05:00:00Z' },
          { cardId: 27, content: 'class', answer: '클래스', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T06:00:00Z', updatedAt: '2024-01-03T06:00:00Z' },
          { cardId: 28, content: 'method', answer: '메소드', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T07:00:00Z', updatedAt: '2024-01-03T07:00:00Z' },
          { cardId: 29, content: 'parameter', answer: '매개변수', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T08:00:00Z', updatedAt: '2024-01-03T08:00:00Z' },
          { cardId: 30, content: 'return', answer: '반환', deckId: 'deck_3', isDeleted: false, createdAt: '2024-01-03T09:00:00Z', updatedAt: '2024-01-03T09:00:00Z' }
        ]
      };
      
      return cardData[deckId] || [];
    },
    
    updateDeck: (deckId: string, deckName: string) => ({
      deckId,
      deckName: deckName || 'Updated Mock Deck',
      memberId: 1,
      cardCnt: 10,
      isDeleted: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    }),
  },

  // Timer 관련 Mock 데이터
  timer: {
    getTimerStats: {
      totalFocusTime: 7200, // 2시간 (초 단위)
      totalSessions: 8,
      averageSessionTime: 900, // 15분
      todayFocusTime: 1800, // 30분
      streak: 5,
      weeklyStats: [
        { date: '2024-01-01', focusTime: 1800 },
        { date: '2024-01-02', focusTime: 2400 },
        { date: '2024-01-03', focusTime: 1200 },
        { date: '2024-01-04', focusTime: 1800 },
        { date: '2024-01-05', focusTime: 0 },
        { date: '2024-01-06', focusTime: 3600 },
        { date: '2024-01-07', focusTime: 1800 },
      ],
    },
  },

  // 기타 Mock 데이터들
  user: {
    getProfile: {
      memberId: 1,
      email: 'mock@example.com',
      nickname: 'Mock User',
      isEmailVerified: true,
      socialLogin: false,
    },
  },

  note: {
    getNotes: [
      {
        noteId: 'note_1',
        title: 'Mock Note 1',
        content: '이것은 첫 번째 Mock 노트입니다.',
        memberId: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  },

  ad: {
    getAds: [
      {
        adId: 'ad_1',
        title: 'Premium 플랜 무료 체험',
        description: '프리미엄 기능을 7일간 무료로 체험해보세요!',
        imageUrl: null,
        link: '/premium',
        type: 'banner',
        isActive: true,
      },
    ],
  },
};

export default mockData; 