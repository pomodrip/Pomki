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
        cardCnt: 25,
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        deckId: 'deck_2',
        deckName: '일본어 단어',
        memberId: 1,
        cardCnt: 30,
        isDeleted: false,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        deckId: 'deck_3',
        deckName: '프로그래밍 용어',
        memberId: 1,
        cardCnt: 15,
        isDeleted: false,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      },
    ],
    
    getCardsInDeck: [
      {
        cardId: 1,
        content: 'Hello',
        answer: '안녕하세요',
        deckId: 'deck_1',
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
      },
      {
        cardId: 2,
        content: 'Goodbye',
        answer: '안녕히 가세요',
        deckId: 'deck_1',
        isDeleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T14:00:00Z',
      },
    ],
    
    updateDeck: (deckId: string, deckName: string) => ({
      deckId,
      deckName: deckName || 'Updated Mock Deck',
      memberId: 1,
      cardCnt: 5,
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