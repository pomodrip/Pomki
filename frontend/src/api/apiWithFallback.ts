import { AxiosError } from 'axios';
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
  login: async (data: any) => {
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

  refreshToken: async (data: any) => {
    const { refreshToken } = await import('./authApi');
    return apiWithFallback(
      () => refreshToken(data),
      {
        accessToken: 'mock_refreshed_token_' + Date.now()
      }
    );
  },

  signup: async (data: any) => {
    const { signup } = await import('./authApi');
    return apiWithFallback(
      () => signup(data),
      mockData.auth.signup
    );
  },

  sendEmailVerification: async (data: any) => {
    const { sendEmailVerification } = await import('./authApi');
    return apiWithFallback(
      () => sendEmailVerification(data),
      mockData.auth.emailVerification
    );
  },

  verifyEmailCode: async (data: any) => {
    const { verifyEmailCode } = await import('./authApi');
    return apiWithFallback(
      () => verifyEmailCode(data),
      mockData.auth.verifyEmailCode
    );
  },
};

// Deck API with Fallback
export const deckApiWithFallback = {
  createDeck: async (data: any) => {
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
    const { getCardsInDeck } = await import('./deckApi');
    return apiWithFallback(
      () => getCardsInDeck(deckId),
      mockData.deck.getCardsInDeck
    );
  },

  updateDeck: async (deckId: string, data: any) => {
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

// 기타 API들은 실제 함수가 있을 때 추가
// 예시: User API with Fallback
export const userApiWithFallback = {
  getProfile: async () => {
    try {
      const { getProfile } = await import('./userApi');
      return apiWithFallback(
        () => getProfile(),
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
        mockData.timer.getTimerStats
      );
    } catch {
      return mockData.timer.getTimerStats;
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
        mockData.note.getNotes
      );
    } catch {
      return mockData.note.getNotes;
    }
  },

  createNote: async (data: any) => {
    try {
      const { createNote } = await import('./noteApi');
      return apiWithFallback(
        () => createNote(data),
        {
          noteId: 'note_' + Date.now(),
          ...data,
          memberId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch {
      return {
        noteId: 'note_' + Date.now(),
        ...data,
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
      const { getAds } = await import('./adApi');
      return apiWithFallback(
        () => getAds(),
        mockData.ad.getAds
      );
    } catch {
      return mockData.ad.getAds;
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