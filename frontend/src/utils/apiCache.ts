interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  ttl: number;
  maxSize: number;
  storage: 'memory' | 'localStorage' | 'sessionStorage';
}

class ApiCache {
  private memoryCache = new Map<string, CacheItem<any>>();
  private defaultConfig: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    storage: 'memory',
  };

  private getStorage(storage: CacheConfig['storage']) {
    switch (storage) {
      case 'localStorage':
        return localStorage;
      case 'sessionStorage':
        return sessionStorage;
      default:
        return null;
    }
  }

  private generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `api_cache_${url}_${paramString}`;
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private cleanupMemoryCache(): void {
    if (this.memoryCache.size <= this.defaultConfig.maxSize) return;

    // Remove expired items first
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
      }
    }

    // If still over limit, remove oldest items
    if (this.memoryCache.size > this.defaultConfig.maxSize) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.memoryCache.size - this.defaultConfig.maxSize);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  set<T>(
    url: string,
    data: T,
    config: Partial<CacheConfig> = {},
    params?: Record<string, any>
  ): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = this.generateKey(url, params);
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: finalConfig.ttl,
    };

    if (finalConfig.storage === 'memory') {
      this.memoryCache.set(key, cacheItem);
      this.cleanupMemoryCache();
    } else {
      const storage = this.getStorage(finalConfig.storage);
      if (storage) {
        try {
          storage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
          console.warn('Failed to save to storage:', error);
          // Fallback to memory cache
          this.memoryCache.set(key, cacheItem);
        }
      }
    }
  }

  get<T>(
    url: string,
    config: Partial<CacheConfig> = {},
    params?: Record<string, any>
  ): T | null {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = this.generateKey(url, params);

    let cacheItem: CacheItem<T> | null = null;

    if (finalConfig.storage === 'memory') {
      cacheItem = this.memoryCache.get(key) || null;
    } else {
      const storage = this.getStorage(finalConfig.storage);
      if (storage) {
        try {
          const stored = storage.getItem(key);
          if (stored) {
            cacheItem = JSON.parse(stored);
          }
        } catch (error) {
          console.warn('Failed to read from storage:', error);
          return null;
        }
      }
    }

    if (!cacheItem) return null;

    if (this.isExpired(cacheItem)) {
      this.delete(url, config, params);
      return null;
    }

    return cacheItem.data;
  }

  delete(
    url: string,
    config: Partial<CacheConfig> = {},
    params?: Record<string, any>
  ): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = this.generateKey(url, params);

    if (finalConfig.storage === 'memory') {
      this.memoryCache.delete(key);
    } else {
      const storage = this.getStorage(finalConfig.storage);
      if (storage) {
        storage.removeItem(key);
      }
    }
  }

  clear(storage?: CacheConfig['storage']): void {
    if (!storage || storage === 'memory') {
      this.memoryCache.clear();
    }
    
    if (!storage || storage === 'localStorage') {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('api_cache_'));
        keys.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear localStorage cache:', error);
      }
    }
    
    if (!storage || storage === 'sessionStorage') {
      try {
        const keys = Object.keys(sessionStorage).filter(key => key.startsWith('api_cache_'));
        keys.forEach(key => sessionStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear sessionStorage cache:', error);
      }
    }
  }

  // 캐시 상태 조회
  getStats(): {
    memorySize: number;
    localStorageSize: number;
    sessionStorageSize: number;
  } {
    let localStorageSize = 0;
    let sessionStorageSize = 0;

    try {
      localStorageSize = Object.keys(localStorage).filter(key => key.startsWith('api_cache_')).length;
    } catch (error) {
      console.warn('Failed to get localStorage stats:', error);
    }

    try {
      sessionStorageSize = Object.keys(sessionStorage).filter(key => key.startsWith('api_cache_')).length;
    } catch (error) {
      console.warn('Failed to get sessionStorage stats:', error);
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageSize,
      sessionStorageSize,
    };
  }
}

// 싱글톤 인스턴스 생성
const apiCache = new ApiCache();

// 캐시 설정 프리셋
export const CACHE_CONFIGS = {
  // 짧은 캐시 (1분) - 자주 변경되는 데이터
  SHORT: {
    ttl: 1 * 60 * 1000,
    storage: 'memory' as const,
  },
  // 중간 캐시 (5분) - 일반적인 API 응답
  MEDIUM: {
    ttl: 5 * 60 * 1000,
    storage: 'memory' as const,
  },
  // 긴 캐시 (30분) - 자주 변경되지 않는 데이터
  LONG: {
    ttl: 30 * 60 * 1000,
    storage: 'sessionStorage' as const,
  },
  // 영구 캐시 (24시간) - 거의 변경되지 않는 데이터
  PERSISTENT: {
    ttl: 24 * 60 * 60 * 1000,
    storage: 'localStorage' as const,
  },
} as const;

export default apiCache; 