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
  autoSaveEnabled: boolean;
  lastModified: string;
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
    const result = item ? JSON.parse(item) : null;
    
    if (result) {
      console.log(`📥 localStorage 읽기 성공 [${key}]:`, {
        dataSize: `${item?.length || 0} bytes`,
        timestamp: result.timestamp || 'N/A',
        preview: typeof result === 'object' ? Object.keys(result) : result
      });
    }
    
    return result;
  } catch (error) {
    console.error(`❌ localStorage 읽기 오류 (${key}):`, error);
    return null;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    const jsonString = JSON.stringify(value);
    const dataSize = jsonString.length;
    
    localStorage.setItem(key, jsonString);
    
    console.log(`💾 localStorage 저장 완료 [${key}]:`, {
      dataSize: `${dataSize} bytes`,
      timestamp: new Date().toISOString(),
      preview: typeof value === 'object' && value !== null ? Object.keys(value as object) : value,
      storageUsage: getStorageUsageInfo()
    });
    
  } catch (error) {
    console.error(`❌ localStorage 저장 오류 (${key}):`, error);
    
    // 용량 부족 시 오래된 데이터 정리
    if (error instanceof DOMException && error.code === 22) {
      console.warn('🧹 localStorage 용량 부족으로 오래된 데이터 정리 시작...');
      clearOldData();
      
      // 재시도
      try {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`✅ localStorage 재시도 저장 성공 [${key}]`);
      } catch (retryError) {
        console.error('❌ localStorage 재시도 실패:', retryError);
        throw retryError;
      }
    }
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️ localStorage 삭제 완료 [${key}]`);
  } catch (error) {
    console.error(`❌ localStorage 삭제 오류 (${key}):`, error);
  }
};

// 저장소 사용량 정보 조회
export const getStorageUsageInfo = () => {
  const { used, available } = checkStorageSize();
  const usagePercent = Math.round((used / (used + available)) * 100);
  
  return {
    used: `${Math.round(used / 1024)} KB`,
    available: `${Math.round(available / 1024)} KB`,
    usagePercent: `${usagePercent}%`
  };
};

// 타이머 노트 관련 함수들
export const saveTempNote = (data: TempNoteData): void => {
  const enhancedData = {
    ...data,
    lastModified: new Date().toISOString(),
  };
  
  console.log('📝 임시 노트 저장 시작:', {
    taskName: data.taskName || '(제목 없음)',
    notesLength: `${data.notes.length} 글자`,
    autoSaveEnabled: data.autoSaveEnabled,
    sessionId: data.sessionId
  });
  
  setToStorage(STORAGE_KEYS.TIMER_NOTES, enhancedData);
};

export const getTempNote = (): TempNoteData | null => {
  const result = getFromStorage<TempNoteData>(STORAGE_KEYS.TIMER_NOTES);
  
  if (result) {
    const lastModified = result.lastModified || result.timestamp;
    if (lastModified) {
      const lastModifiedTime = new Date(lastModified).getTime();
      if (!isNaN(lastModifiedTime)) {
        const timeAgo = Math.round((Date.now() - lastModifiedTime) / 1000);
        console.log(`🔄 임시 노트 복원: ${Math.max(0, timeAgo)}초 전 데이터`);
      } else {
        console.log(`🔄 임시 노트 복원: 시간 정보 없음`);
      }
    } else {
      console.log(`🔄 임시 노트 복원: 시간 정보 없음`);
    }
  }
  
  return result;
};

export const clearTempNote = (): void => {
  console.log('🧹 임시 노트 정리 완료 (백엔드 저장 성공)');
  removeFromStorage(STORAGE_KEYS.TIMER_NOTES);
};

// 학습 세션 관련 함수들
export const saveStudySession = (data: StudySession): void => {
  console.log('🎯 학습 세션 저장:', {
    deckId: data.deckId,
    reviewCount: data.reviews.length,
    startTime: data.startTime,
    lastUpdate: data.lastUpdate
  });
  
  setToStorage(STORAGE_KEYS.STUDY_SESSION, data);
};

export const getStudySession = (): StudySession | null => {
  return getFromStorage<StudySession>(STORAGE_KEYS.STUDY_SESSION);
};

export const clearStudySession = (): void => {
  console.log('🧹 학습 세션 정리 완료 (백엔드 전송 성공)');
  removeFromStorage(STORAGE_KEYS.STUDY_SESSION);
};

// 학습 리뷰 추가
export const addStudyReview = (deckId: string, review: StudyReview): void => {
  const currentSession = getStudySession();
  
  console.log('📊 학습 리뷰 추가:', {
    deckId,
    cardId: review.cardId,
    difficulty: review.difficulty,
    timestamp: review.timestamp
  });
  
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
  console.log('🧹 오래된 데이터 정리 시작...');
  
  const keys = Object.values(STORAGE_KEYS);
  let deletedCount = 0;
  
  keys.forEach(key => {
    const data = getFromStorage<any>(key);
    if (data && data.timestamp) {
      const age = Date.now() - new Date(data.timestamp).getTime();
      const daysOld = Math.round(age / (24 * 60 * 60 * 1000));
      
      // 7일 이상 된 데이터 삭제
      if (age > 7 * 24 * 60 * 60 * 1000) {
        console.log(`🗑️ 오래된 데이터 삭제 [${key}]: ${daysOld}일 전 데이터`);
        removeFromStorage(key);
        deletedCount++;
      }
    }
  });
  
  console.log(`✅ 데이터 정리 완료: ${deletedCount}개 항목 삭제`);
};

// 전체 임시 데이터 정리
export const clearAllTempData = (): void => {
  console.log('🧹 모든 임시 데이터 정리 시작...');
  
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
  
  console.log('✅ 모든 임시 데이터 정리 완료');
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

// 임시 저장 상태 체크
export const getTempSaveStatus = (): {
  hasTempData: boolean;
  lastSaved: string | null;
  timeSinceLastSave: number | null;
} => {
  const tempNote = getTempNote();
  
  if (!tempNote) {
    return {
      hasTempData: false,
      lastSaved: null,
      timeSinceLastSave: null
    };
  }
  
  // lastModified 유효성 검사
  const lastModified = tempNote.lastModified || tempNote.timestamp;
  if (!lastModified) {
    console.warn('⚠️ 임시 노트에 유효한 시간 정보가 없습니다:', tempNote);
    return {
      hasTempData: true,
      lastSaved: null,
      timeSinceLastSave: null
    };
  }
  
  const lastModifiedTime = new Date(lastModified).getTime();
  if (isNaN(lastModifiedTime)) {
    console.warn('⚠️ 유효하지 않은 날짜 형식:', lastModified);
    return {
      hasTempData: true,
      lastSaved: lastModified,
      timeSinceLastSave: null
    };
  }
  
  const timeSinceLastSave = Math.round((Date.now() - lastModifiedTime) / 1000);
  
  return {
    hasTempData: true,
    lastSaved: lastModified,
    timeSinceLastSave: Math.max(0, timeSinceLastSave) // 음수 방지
  };
};
