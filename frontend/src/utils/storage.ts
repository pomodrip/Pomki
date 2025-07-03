// localStorage 관리 유틸리티 함수들

// 키 상수 정의
export const STORAGE_KEYS = {
  TIMER_NOTES: 'pomki_timer_notes',
  STUDY_REVIEWS: 'pomki_study_reviews',
  STUDY_SESSION: 'pomki_study_session',
} as const;

// 타이머 노트 임시 저장 데이터 타입
export interface TempNoteData {
  taskName: string;
  notes: string;
  timestamp: string;
  sessionId: string;
}

// 학습 리뷰 데이터 타입
export interface StudyReview {
  cardId: number;
  difficulty: 'easy' | 'confuse' | 'hard';
  timestamp: string;
}

// 학습 세션 데이터 타입
export interface StudySession {
  deckId: string;
  reviews: StudyReview[];
  startTime: string;
  lastUpdate: string;
}

// 일반적인 localStorage 함수들
export const getFromStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`localStorage 읽기 오류 (${key}):`, error);
    return null;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`localStorage 저장 오류 (${key}):`, error);
    // 용량 부족 시 오래된 데이터 정리
    if (error instanceof DOMException && error.code === 22) {
      clearOldData();
      // 재시도
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (retryError) {
        console.error('localStorage 재시도 실패:', retryError);
      }
    }
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`localStorage 삭제 오류 (${key}):`, error);
  }
};

// 타이머 노트 관련 함수들
export const saveTempNote = (data: TempNoteData): void => {
  setToStorage(STORAGE_KEYS.TIMER_NOTES, data);
};

export const getTempNote = (): TempNoteData | null => {
  return getFromStorage<TempNoteData>(STORAGE_KEYS.TIMER_NOTES);
};

export const clearTempNote = (): void => {
  removeFromStorage(STORAGE_KEYS.TIMER_NOTES);
};

// 학습 세션 관련 함수들
export const saveStudySession = (data: StudySession): void => {
  setToStorage(STORAGE_KEYS.STUDY_SESSION, data);
};

export const getStudySession = (): StudySession | null => {
  return getFromStorage<StudySession>(STORAGE_KEYS.STUDY_SESSION);
};

export const clearStudySession = (): void => {
  removeFromStorage(STORAGE_KEYS.STUDY_SESSION);
};

// 학습 리뷰 추가
export const addStudyReview = (deckId: string, review: StudyReview): void => {
  const currentSession = getStudySession();
  
  if (currentSession && currentSession.deckId === deckId) {
    // 기존 세션에 추가
    currentSession.reviews.push(review);
    currentSession.lastUpdate = new Date().toISOString();
    saveStudySession(currentSession);
  } else {
    // 새로운 세션 생성
    const newSession: StudySession = {
      deckId,
      reviews: [review],
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    };
    saveStudySession(newSession);
  }
};

// 용량 관리 함수
export const clearOldData = (): void => {
  const keys = Object.values(STORAGE_KEYS);
  keys.forEach(key => {
    const data = getFromStorage<any>(key);
    if (data && data.timestamp) {
      const age = Date.now() - new Date(data.timestamp).getTime();
      // 7일 이상 된 데이터 삭제
      if (age > 7 * 24 * 60 * 60 * 1000) {
        removeFromStorage(key);
      }
    }
  });
};

// 전체 임시 데이터 정리
export const clearAllTempData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
};

// 용량 체크 함수
export const checkStorageSize = (): { used: number; available: number } => {
  let used = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      used += localStorage[key].length;
    }
  }
  
  // 대략적인 가용 용량 (5MB 기준)
  const available = 5 * 1024 * 1024 - used;
  
  return { used, available };
};
