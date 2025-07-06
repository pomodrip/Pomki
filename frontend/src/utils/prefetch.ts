interface PrefetchConfig {
  priority: 'high' | 'medium' | 'low';
  delay: number;
  condition?: () => boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface PrefetchItem {
  id: string;
  importFunction: () => Promise<any>;
  config: PrefetchConfig;
  status: 'pending' | 'loading' | 'loaded' | 'error';
}

class PrefetchManager {
  private items: Map<string, PrefetchItem> = new Map();
  private loadingItems: Set<string> = new Set();
  private observer: IntersectionObserver | null = null;
  private isOnline = true;

  constructor() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      this.isOnline = false;
      return;
    }
    
    this.isOnline = navigator.onLine;

    // 네트워크 상태 모니터링
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingItems();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Intersection Observer 설정 (뷰포트 기반 prefetch)
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const prefetchId = entry.target.getAttribute('data-prefetch-id');
            if (prefetchId) {
              this.load(prefetchId);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
  }

  /**
   * prefetch 아이템 등록
   */
  register(
    id: string,
    importFunction: () => Promise<any>,
    config: Partial<PrefetchConfig> = {}
  ): void {
    const finalConfig: PrefetchConfig = {
      priority: 'medium',
      delay: 0,
      ...config,
    };

    const item: PrefetchItem = {
      id,
      importFunction,
      config: finalConfig,
      status: 'pending',
    };

    this.items.set(id, item);

    // 조건이 맞으면 즉시 로드 스케줄링
    if (this.shouldLoad(item)) {
      this.scheduleLoad(id);
    }
  }

  /**
   * 특정 아이템 로드
   */
  async load(id: string): Promise<any> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Prefetch item not found: ${id}`);
    }

    if (item.status === 'loaded') {
      return Promise.resolve();
    }

    if (this.loadingItems.has(id)) {
      return new Promise((resolve) => {
        const checkStatus = () => {
          if (item.status === 'loaded') {
            resolve(undefined);
          } else {
            setTimeout(checkStatus, 100);
          }
        };
        checkStatus();
      });
    }

    this.loadingItems.add(id);
    item.status = 'loading';

    try {
      await item.importFunction();
      item.status = 'loaded';
      item.config.onSuccess?.();
      console.log(`✅ Prefetched: ${id}`);
    } catch (error) {
      item.status = 'error';
      item.config.onError?.(error as Error);
      console.warn(`❌ Prefetch failed: ${id}`, error);
    } finally {
      this.loadingItems.delete(id);
    }
  }

  /**
   * 로드 스케줄링
   */
  private scheduleLoad(id: string): void {
    const item = this.items.get(id);
    if (!item) return;

    const delay = this.calculateDelay(item.config.priority, item.config.delay);
    
    setTimeout(() => {
      if (this.shouldLoad(item)) {
        this.load(id);
      }
    }, delay);
  }

  /**
   * 우선순위별 지연 시간 계산
   */
  private calculateDelay(priority: PrefetchConfig['priority'], baseDelay: number): number {
    const priorityDelays = {
      high: 0,
      medium: 1000,
      low: 3000,
    };

    return baseDelay + priorityDelays[priority];
  }

  /**
   * 로드 조건 확인
   */
  private shouldLoad(item: PrefetchItem): boolean {
    if (!this.isOnline) return false;
    if (item.status !== 'pending') return false;
    if (item.config.condition && !item.config.condition()) return false;
    
    // 네트워크 상태 확인 (가능한 경우)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.saveData) return false; // 데이터 절약 모드
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return item.config.priority === 'high';
      }
    }

    return true;
  }

  /**
   * 대기 중인 아이템들 처리
   */
  private processPendingItems(): void {
    this.items.forEach((item, id) => {
      if (item.status === 'pending' && this.shouldLoad(item)) {
        this.scheduleLoad(id);
      }
    });
  }

  /**
   * 뷰포트 기반 prefetch 등록
   */
  observeElement(element: HTMLElement, prefetchId: string): void {
    if (!this.observer) return;
    
    element.setAttribute('data-prefetch-id', prefetchId);
    this.observer.observe(element);
  }

  /**
   * 뷰포트 기반 prefetch 해제
   */
  unobserveElement(element: HTMLElement): void {
    if (!this.observer) return;
    
    this.observer.unobserve(element);
  }

  /**
   * 통계 조회
   */
  getStats(): {
    total: number;
    loaded: number;
    loading: number;
    pending: number;
    error: number;
  } {
    const stats = {
      total: this.items.size,
      loaded: 0,
      loading: 0,
      pending: 0,
      error: 0,
    };

    this.items.forEach((item) => {
      stats[item.status]++;
    });

    return stats;
  }

  /**
   * 정리
   */
  cleanup(): void {
    this.observer?.disconnect();
    this.items.clear();
    this.loadingItems.clear();
  }
}

// 싱글톤 인스턴스
let prefetchManager: PrefetchManager | null = null;
if (typeof window !== 'undefined') {
  prefetchManager = new PrefetchManager();
}

// 편의 함수들
export const prefetch = {
  /**
   * 페이지 컴포넌트 prefetch
   */
  page: (
    name: string,
    importFunction: () => Promise<any>,
    config: Partial<PrefetchConfig> = {}
  ) => {
    prefetchManager?.register(`page-${name}`, importFunction, {
      priority: 'medium',
      ...config,
    });
  },

  /**
   * 컴포넌트 prefetch
   */
  component: (
    name: string,
    importFunction: () => Promise<any>,
    config: Partial<PrefetchConfig> = {}
  ) => {
    prefetchManager?.register(`component-${name}`, importFunction, {
      priority: 'low',
      ...config,
    });
  },

  /**
   * 중요한 리소스 prefetch
   */
  critical: (
    name: string,
    importFunction: () => Promise<any>,
    config: Partial<PrefetchConfig> = {}
  ) => {
    prefetchManager?.register(`critical-${name}`, importFunction, {
      priority: 'high',
      delay: 0,
      ...config,
    });
  },

  /**
   * 조건부 prefetch
   */
  conditional: (
    name: string,
    importFunction: () => Promise<any>,
    condition: () => boolean,
    config: Partial<PrefetchConfig> = {}
  ) => {
    prefetchManager?.register(name, importFunction, {
      priority: 'medium',
      condition,
      ...config,
    });
  },

  /**
   * 뷰포트 기반 prefetch
   */
  onVisible: (element: HTMLElement, prefetchId: string) => {
    prefetchManager?.observeElement(element, prefetchId);
  },

  /**
   * 수동 로드
   */
  load: (id: string) => prefetchManager?.load(id),

  /**
   * 통계 조회
   */
  getStats: () => prefetchManager?.getStats(),
};

// 사전 정의된 prefetch 설정
export const PREFETCH_CONFIGS = {
  // 로그인 후 즉시 필요한 페이지들
  CRITICAL_PAGES: [
    {
      name: 'dashboard',
      import: () => import('../pages/Dashboard/DashboardPage'),
      priority: 'high' as const,
    },
    {
      name: 'study-deck-list',
      import: () => import('../pages/Study/FlashcardDeckListPage'),
      priority: 'high' as const,
    },
  ],

  // 자주 사용되는 페이지들
  COMMON_PAGES: [
    {
      name: 'timer',
      import: () => import('../pages/Timer/TimerPage'),
      priority: 'medium' as const,
    },
    {
      name: 'note-list',
      import: () => import('../pages/Note/NoteListPage'),
      priority: 'medium' as const,
    },
    {
      name: 'profile',
      import: () => import('../pages/Profile/ProfilePage'),
      priority: 'medium' as const,
    },
  ],

  // 무거운 컴포넌트들
  HEAVY_COMPONENTS: [
    {
      name: 'react-quill',
      import: () => import('react-quill'),
      priority: 'low' as const,
    },
    {
      name: 'date-picker',
      import: () => import('@mui/x-date-pickers/DateCalendar'),
      priority: 'low' as const,
    },
  ],
} as const;

/**
 * 기본 prefetch 설정 적용
 */
export function initializePrefetch(): void {
  // 중요한 페이지들 prefetch
  PREFETCH_CONFIGS.CRITICAL_PAGES.forEach(({ name, import: importFn, priority }) => {
    prefetch.page(name, importFn, { priority });
  });

  // 일반 페이지들 prefetch (지연)
  PREFETCH_CONFIGS.COMMON_PAGES.forEach(({ name, import: importFn, priority }) => {
    prefetch.page(name, importFn, { priority, delay: 2000 });
  });

  // 무거운 컴포넌트들 prefetch (더 많은 지연)
  PREFETCH_CONFIGS.HEAVY_COMPONENTS.forEach(({ name, import: importFn, priority }) => {
    prefetch.component(name, importFn, { priority, delay: 5000 });
  });
}

export default prefetchManager; 