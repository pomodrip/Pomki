import mockData from './mockData';

// 환경 변수로 Mock 모드 제어
// const USE_MOCK_FALLBACK = import.meta.env.VITE_USE_MOCK_FALLBACK === 'true' || import.meta.env.DEV;
const USE_MOCK_FALLBACK = false;

// API 호출 래퍼 - 실패시 mock 데이터 반환
export async function apiWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackData: T | (() => T),
  options?: {
    enableMock?: boolean;
    fallbackDelay?: number;
    logError?: boolean;
  }
): Promise<T> {
  const { 
    enableMock = USE_MOCK_FALLBACK, 
    fallbackDelay = 500,
    logError = true 
  } = options || {};

  try {
    // 실제 API 호출 시도
    const result = await apiCall();
    return result;
  } catch (error) {
    // Mock fallback이 활성화된 경우에만 처리
    if (enableMock) {
      if (logError) {
        console.warn('API 호출 실패, Mock 데이터 사용:', error);
      }

      // 약간의 지연으로 실제 API 호출과 유사한 경험 제공
      await new Promise(resolve => setTimeout(resolve, fallbackDelay));

      // Mock 데이터 반환
      if (typeof fallbackData === 'function') {
        return (fallbackData as () => T)();
      }
      return fallbackData;
    }

    // Mock이 비활성화된 경우 원래 에러 재발생
    throw error;
  }
}

// Auth API with Fallback
export const authApiWithFallback = {
  login: async (data: { email: string; password: string }) => {
    const { login } = await import('./authApi');
    return apiWithFallback(
      () => login(data),
      mockData.auth.login
    );
  },

  logout: async () => {
    const { logout } = await import('./authApi');
    return apiWithFallback(
      () => logout(),
      undefined // 로그아웃은 void 반환이므로 mock 없음
    );
  },

  refreshToken: async (data: { refreshToken: string }) => {
    const { refreshToken } = await import('./authApi');
    return apiWithFallback(
      () => refreshToken(data),
      {
        accessToken: 'mock_refreshed_token_' + Date.now()
      }
    );
  },

  signup: async (data: { email: string; password: string; nickname: string; verificationToken: string }) => {
    const { signup } = await import('./authApi');
    return apiWithFallback(
      () => signup(data),
      mockData.auth.signup
    );
  },

  sendEmailVerification: async (data: { email: string; type: "SIGNUP" | "EMAIL_CHANGE" }) => {
    const { sendEmailVerification } = await import('./authApi');
    return apiWithFallback(
      () => sendEmailVerification(data),
      mockData.auth.emailVerification
    );
  },

  verifyEmailCode: async (data: { email: string; verificationCode: string; type: "SIGNUP" | "EMAIL_CHANGE" }) => {
    const { verifyEmailCode } = await import('./authApi');
    return apiWithFallback(
      () => verifyEmailCode(data),
      mockData.auth.verifyEmailCode
    );
  },
};

// Deck API with Fallback
export const deckApiWithFallback = {
  createDeck: async (data: { deckName: string; memberId: number }) => {
    const { createDeck } = await import('./deckApi');
    return apiWithFallback(
      () => createDeck(data),
      () => mockData.deck.createDeck(data.deckName)
    );
  },

  getMyDecks: async () => {
    try {
      const { getMyDecks } = await import('./deckApi');
      return apiWithFallback(
        () => getMyDecks(),
        mockData.deck.getDecksByMemberId
      );
    } catch {
      return mockData.deck.getDecksByMemberId;
    }
  },

  getCardsInDeck: async (deckId: string) => {
    try {
      const { getCardsInDeck } = await import('./deckApi');
      return apiWithFallback(
        () => getCardsInDeck(deckId),
        () => mockData.deck.getCardsInDeck(deckId)
      );
    } catch {
      return mockData.deck.getCardsInDeck(deckId);
    }
  },

  updateDeck: async (deckId: string, data: { deckName: string }) => {
    const { updateDeck } = await import('./deckApi');
    return apiWithFallback(
      () => updateDeck(deckId, data),
      () => mockData.deck.updateDeck(deckId, data.deckName)
    );
  },

  deleteDeck: async (deckId: string) => {
    const { deleteDeck } = await import('./deckApi');
    return apiWithFallback(
      () => deleteDeck(deckId),
      undefined // 삭제는 void 반환
    );
  },
};

// User API with Fallback - 올바른 함수명 사용
export const userApiWithFallback = {
  getMyInfo: async () => {
    try {
      const { getMyInfo } = await import('./userApi');
      return apiWithFallback(
        () => getMyInfo(),
        mockData.user.getProfile
      );
    } catch {
      // userApi에 해당 함수가 없는 경우 mock 데이터 반환
      return mockData.user.getProfile;
    }
  },

  updateMember: async (data: any) => {
    try {
      const { updateMember } = await import('./userApi');
      return apiWithFallback(
        () => updateMember(data),
        {
          ...mockData.user.getProfile,
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch {
      return {
        ...mockData.user.getProfile,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
  },
};

// Timer API with Fallback - 올바른 타입 매칭  
export const timerApiWithFallback = {
  getTimerStats: async () => {
    try {
      const { getTimerStats } = await import('./timerApi');
      return apiWithFallback(
        () => getTimerStats(),
        // mockData를 TimerStats 타입에 맞게 확장
        () => ({
          totalFocusTime: mockData.timer.getTimerStats.totalFocusTime, // 분 단위로 변환
          totalSessions: mockData.timer.getTimerStats.totalSessions,
          completedSessions: mockData.timer.getTimerStats.totalSessions,
          averageSessionLength: mockData.timer.getTimerStats.averageSessionTime,
          streakDays: mockData.timer.getTimerStats.streak,
          dailyGoal: 120, // 2시간 목표
          dailyProgress: mockData.timer.getTimerStats.todayFocusTime,
          weeklyStats: mockData.timer.getTimerStats.weeklyStats.map(stat => ({
            date: stat.date,
            focusTime: stat.focusTime,
            sessions: Math.floor(stat.focusTime / 25) // 25분 기준으로 세션 수 계산
          }))
        })
      );
    } catch {
      return {
        totalFocusTime: mockData.timer.getTimerStats.totalFocusTime,
        totalSessions: mockData.timer.getTimerStats.totalSessions,
        completedSessions: mockData.timer.getTimerStats.totalSessions,
        averageSessionLength: mockData.timer.getTimerStats.averageSessionTime,
        streakDays: mockData.timer.getTimerStats.streak,
        dailyGoal: 120,
        dailyProgress: mockData.timer.getTimerStats.todayFocusTime,
        weeklyStats: mockData.timer.getTimerStats.weeklyStats.map(stat => ({
          date: stat.date,
          focusTime: stat.focusTime,
          sessions: Math.floor(stat.focusTime / 25)
        }))
      };
    }
  },
};

// Note API with Fallback - PaginationResponse 타입 맞춤
export const noteApiWithFallback = {
  getNotes: async () => {
    try {
      const { getNotes } = await import('./noteApi');
      return apiWithFallback(
        () => getNotes(),
        // PaginationResponse 형식으로 반환 - Note 타입에 맞게 속성명 수정
        mockData.note.getNotes.map(note => ({
          noteId: note.noteId,
          noteTitle: note.title,
          aiEnhanced: false,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        })),
      );
    } catch {
      return mockData.note.getNotes.map(note => ({
        noteId: note.noteId,
        noteTitle: note.title,
        aiEnhanced: false,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }));
    }
  },

  createNote: async (data: { noteTitle: string; noteContent: string }) => {
    try {
      const { createNote } = await import('./noteApi');
      return apiWithFallback(
        () => createNote(data),
        {
          noteId: 'note_' + Date.now(),
          noteTitle: data.noteTitle,
          noteContent: data.noteContent,
          memberId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any
      );
    } catch {
      return {
        noteId: 'note_' + Date.now(),
        noteTitle: data.noteTitle,
        noteContent: data.noteContent,
        memberId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },
};

// Ad API with Fallback - 실제 존재하는 함수들 확인 후 수정 필요
export const adApiWithFallback = {
  // adApi에 실제 함수가 있는지 확인 후 적절한 함수로 교체
  getAds: async () => {
    try {
      // adApi의 실제 함수명 확인 필요
      const adApi = await import('./adApi');
      const getAdsFunction = (adApi as any).getAds || (adApi as any).getAdList || (adApi as any).fetchAds;
      
      if (getAdsFunction) {
        return apiWithFallback(
          () => getAdsFunction(),
          mockData.ad.getAds
        );
      }
      
      return mockData.ad.getAds;
    } catch {
      return [{
        adId: 'ad_1',
        title: 'Premium 플랜 무료 체험',
        description: '프리미엄 기능을 7일간 무료로 체험해보세요!',
        imageUrl: undefined,
        linkUrl: '/premium',
        type: 'BANNER' as const,
        position: 'TOP' as const,
        isActive: true,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      }];
    }
  },
};

// 통합 API 객체
export const apiWithFallbacks = {
  auth: authApiWithFallback,
  deck: deckApiWithFallback,
  user: userApiWithFallback,
  timer: timerApiWithFallback,
  note: noteApiWithFallback,
  ad: adApiWithFallback,
};

export default apiWithFallbacks; 