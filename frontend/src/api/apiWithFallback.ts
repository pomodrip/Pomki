import mockData from './mockData';

// 환경 변수로 Mock 모드 제어
const USE_MOCK_FALLBACK = import.meta.env.VITE_USE_MOCK_FALLBACK === 'true' || import.meta.env.DEV;

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

  getDecksByMemberId: async (memberId: number) => {
    const { getDecksByMemberId } = await import('./deckApi');
    return apiWithFallback(
      () => getDecksByMemberId(memberId),
      mockData.deck.getDecksByMemberId
    );
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

// 예시: User API with Fallback
export const userApiWithFallback = {
  getProfile: async () => {
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
};

// 예시: Timer API with Fallback
export const timerApiWithFallback = {
  getTimerStats: async () => {
    try {
      const { getTimerStats } = await import('./timerApi');
      return apiWithFallback(
        () => getTimerStats(),
        () => ({
          totalFocusTime: Math.floor(mockData.timer.getTimerStats.totalFocusTime / 60), // 초를 분으로 변환
          totalSessions: mockData.timer.getTimerStats.totalSessions,
          completedSessions: mockData.timer.getTimerStats.totalSessions - 1,
          averageSessionLength: Math.floor(mockData.timer.getTimerStats.averageSessionTime / 60), // 초를 분으로 변환
          streakDays: mockData.timer.getTimerStats.streak,
          dailyGoal: 120, // 2시간 목표
          dailyProgress: Math.floor(mockData.timer.getTimerStats.todayFocusTime / 60), // 초를 분으로 변환
          weeklyStats: mockData.timer.getTimerStats.weeklyStats.map(stat => ({
            date: stat.date,
            focusTime: Math.floor(stat.focusTime / 60), // 초를 분으로 변환
            sessions: 2 // 기본 세션 수
          }))
        })
      );
    } catch {
      return {
        totalFocusTime: Math.floor(mockData.timer.getTimerStats.totalFocusTime / 60),
        totalSessions: mockData.timer.getTimerStats.totalSessions,
        completedSessions: mockData.timer.getTimerStats.totalSessions - 1,
        averageSessionLength: Math.floor(mockData.timer.getTimerStats.averageSessionTime / 60),
        streakDays: mockData.timer.getTimerStats.streak,
        dailyGoal: 120,
        dailyProgress: Math.floor(mockData.timer.getTimerStats.todayFocusTime / 60),
        weeklyStats: mockData.timer.getTimerStats.weeklyStats.map(stat => ({
          date: stat.date,
          focusTime: Math.floor(stat.focusTime / 60),
          sessions: 2
        }))
      };
    }
  },
};

// 예시: Note API with Fallback
export const noteApiWithFallback = {
  getNotes: async () => {
    try {
      const { getNotes } = await import('./noteApi');
      return apiWithFallback(
        () => getNotes(),
        () => ({
          content: mockData.note.getNotes.map(note => ({
            noteId: note.noteId,
            memberId: note.memberId,
            noteTitle: note.title,
            noteContent: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          })),
          totalElements: mockData.note.getNotes.length,
          totalPages: 1,
          size: mockData.note.getNotes.length,
          number: 0,
          first: true,
          last: true,
          empty: false
        })
      );
    } catch {
      return {
        content: mockData.note.getNotes.map(note => ({
          noteId: note.noteId,
          memberId: note.memberId,
          noteTitle: note.title,
          noteContent: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        })),
        totalElements: mockData.note.getNotes.length,
        totalPages: 1,
        size: mockData.note.getNotes.length,
        number: 0,
        first: true,
        last: true,
        empty: false
      };
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
        }
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

// 예시: Ad API with Fallback
export const adApiWithFallback = {
  getAds: async () => {
    try {
      const { getActiveAds } = await import('./adApi');
      return apiWithFallback(
        () => getActiveAds(),
        [{
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
        }]
      );
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