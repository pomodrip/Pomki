import apiCache, { CACHE_CONFIGS } from './apiCache';

interface CachedApiOptions {
  cacheConfig?: keyof typeof CACHE_CONFIGS;
  forceRefresh?: boolean;
  params?: Record<string, any>;
}

/**
 * 캐시된 API 호출 함수
 * @param key - 캐시 키로 사용할 고유 식별자
 * @param apiFunction - 실제 API 호출 함수
 * @param options - 캐시 옵션
 */
export async function cachedApiCall<T>(
  key: string,
  apiFunction: () => Promise<T>,
  options: CachedApiOptions = {}
): Promise<T> {
  const { cacheConfig = 'MEDIUM', forceRefresh = false, params } = options;
  
  // 강제 새로고침이 아닌 경우 캐시에서 조회
  if (!forceRefresh) {
    const cachedData = apiCache.get<T>(key, CACHE_CONFIGS[cacheConfig], params);
    if (cachedData !== null) {
      console.log(`🎯 Cache hit for ${key}`);
      return cachedData;
    }
  }

  // 캐시에 없거나 강제 새로고침인 경우 API 호출
  console.log(`🌐 API call for ${key}`);
  try {
    const data = await apiFunction();
    
    // 성공한 경우 캐시에 저장
    apiCache.set(key, data, CACHE_CONFIGS[cacheConfig], params);
    
    return data;
  } catch (error) {
    // API 호출 실패 시 캐시된 데이터라도 반환 (stale-while-revalidate 패턴)
    const staleData = apiCache.get<T>(key, { ...CACHE_CONFIGS[cacheConfig], ttl: Infinity }, params);
    if (staleData !== null) {
      console.warn(`⚠️ API call failed for ${key}, returning stale data`);
      return staleData;
    }
    
    // 캐시된 데이터도 없으면 에러 전파
    throw error;
  }
}

/**
 * 특정 키의 캐시 무효화
 */
export function invalidateCache(key: string, params?: Record<string, any>): void {
  apiCache.delete(key, {}, params);
  console.log(`🗑️ Cache invalidated for ${key}`);
}

/**
 * 패턴에 맞는 캐시 무효화
 */
export function invalidateCachePattern(pattern: string): void {
  // 메모리 캐시에서 패턴 매칭
  const stats = apiCache.getStats();
  console.log(`🗑️ Invalidating cache pattern: ${pattern}, found ${stats.memorySize} memory items`);
  
  // 실제 구현에서는 캐시 키를 순회하며 패턴 매칭 필요
  // 현재는 전체 캐시 클리어
  apiCache.clear();
}

/**
 * 캐시 프리워밍 - 자주 사용되는 데이터를 미리 로드
 */
export async function preloadCache<T>(
  key: string,
  apiFunction: () => Promise<T>,
  cacheConfig: keyof typeof CACHE_CONFIGS = 'LONG'
): Promise<void> {
  try {
    const data = await apiFunction();
    apiCache.set(key, data, CACHE_CONFIGS[cacheConfig]);
    console.log(`🔥 Preloaded cache for ${key}`);
  } catch (error) {
    console.warn(`⚠️ Failed to preload cache for ${key}:`, error);
  }
}

/**
 * 캐시 통계 조회
 */
export function getCacheStats() {
  return apiCache.getStats();
}

/**
 * 캐시 전체 클리어
 */
export function clearAllCache(): void {
  apiCache.clear();
  console.log('🧹 All cache cleared');
}

// 자주 사용되는 API 캐시 키 상수
export const CACHE_KEYS = {
  // 사용자 관련
  USER_PROFILE: 'user_profile',
  USER_PREFERENCES: 'user_preferences',
  
  // 덱 관련
  DECK_LIST: 'deck_list',
  DECK_DETAILS: 'deck_details',
  DECK_CARDS: 'deck_cards',
  
  // 노트 관련
  NOTE_LIST: 'note_list',
  NOTE_DETAILS: 'note_details',
  
  // 통계 관련
  DASHBOARD_STATS: 'dashboard_stats',
  STUDY_STATS: 'study_stats',
  
  // 설정 관련
  APP_CONFIG: 'app_config',
  TIMER_SETTINGS: 'timer_settings',
} as const;

// 캐시 설정 매핑
export const CACHE_KEY_CONFIGS: Record<string, keyof typeof CACHE_CONFIGS> = {
  [CACHE_KEYS.USER_PROFILE]: 'LONG',
  [CACHE_KEYS.USER_PREFERENCES]: 'PERSISTENT',
  [CACHE_KEYS.DECK_LIST]: 'MEDIUM',
  [CACHE_KEYS.DECK_DETAILS]: 'MEDIUM',
  [CACHE_KEYS.DECK_CARDS]: 'SHORT',
  [CACHE_KEYS.NOTE_LIST]: 'MEDIUM',
  [CACHE_KEYS.NOTE_DETAILS]: 'LONG',
  [CACHE_KEYS.DASHBOARD_STATS]: 'SHORT',
  [CACHE_KEYS.STUDY_STATS]: 'MEDIUM',
  [CACHE_KEYS.APP_CONFIG]: 'PERSISTENT',
  [CACHE_KEYS.TIMER_SETTINGS]: 'PERSISTENT',
};

/**
 * 캐시 키별 최적화된 API 호출 
 */
export async function optimizedApiCall<T>(
  cacheKey: keyof typeof CACHE_KEYS,
  apiFunction: () => Promise<T>,
  options: Omit<CachedApiOptions, 'cacheConfig'> = {}
): Promise<T> {
  const cacheConfig = CACHE_KEY_CONFIGS[CACHE_KEYS[cacheKey]] || 'MEDIUM';
  
  return cachedApiCall(
    CACHE_KEYS[cacheKey],
    apiFunction,
    { ...options, cacheConfig }
  );
} 