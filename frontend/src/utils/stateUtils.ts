// 상태 업데이트를 위한 헬퍼 유틸리티들

// 배열에서 특정 조건에 맞는 항목 업데이트
export function updateItemInArray<T>(
  array: T[],
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): T[] {
  return array.map(item => predicate(item) ? updater(item) : item);
}

// 배열에서 특정 ID로 항목 업데이트
export function updateItemById<T extends { id: string | number }>(
  array: T[],
  id: string | number,
  updater: (item: T) => T
): T[] {
  return updateItemInArray(array, item => item.id === id, updater);
}

// 배열에서 특정 조건에 맞는 항목 제거
export function removeItemFromArray<T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] {
  return array.filter(item => !predicate(item));
}

// 배열에서 특정 ID로 항목 제거
export function removeItemById<T extends { id: string | number }>(
  array: T[],
  id: string | number
): T[] {
  return removeItemFromArray(array, item => item.id === id);
}

// 배열의 맨 앞에 새 항목 추가 (최신 항목을 맨 위에 표시할 때 사용)
export function prependToArray<T>(array: T[], newItem: T): T[] {
  return [newItem, ...array];
}

// 배열의 맨 뒤에 새 항목 추가
export function appendToArray<T>(array: T[], newItem: T): T[] {
  return [...array, newItem];
}

// 페이지네이션 상태 관리 헬퍼
export interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function createPaginationState(
  page = 0,
  size = 10,
  totalElements = 0,
  totalPages = 0
): PaginationState {
  return { page, size, totalElements, totalPages };
}

export function updatePaginationState(
  current: PaginationState,
  updates: Partial<PaginationState>
): PaginationState {
  return { ...current, ...updates };
}

// 필터 상태 관리 헬퍼
export function updateFilters<T extends Record<string, any>>(
  currentFilters: T,
  newFilters: Partial<T>
): T {
  return { ...currentFilters, ...newFilters };
}

export function resetFilters<T extends Record<string, any>>(initialFilters: T): T {
  return { ...initialFilters };
}

// 에러 처리 헬퍼
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  return '알 수 없는 오류가 발생했습니다.';
}

// API 응답에서 에러 메시지 추출
export function extractApiErrorMessage(error: any): string {
  return error?.response?.data?.message || 
         error?.message || 
         extractErrorMessage(error);
}

// 로딩 상태 통합 헬퍼
export function combineLoadingStates(...loadingStates: boolean[]): boolean {
  return loadingStates.some(loading => loading);
}

// 에러 상태 통합 헬퍼 (첫 번째 에러만 반환)
export function combineErrorStates(...errorStates: (string | null)[]): string | null {
  return errorStates.find(error => error !== null) || null;
}

// 검색/필터링 헬퍼
export function filterBySearchQuery<T>(
  items: T[],
  searchQuery: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchQuery.trim()) {
    return items;
  }
  
  const query = searchQuery.toLowerCase();
  
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return typeof value === 'string' && 
             value.toLowerCase().includes(query);
    })
  );
}

// 정렬 헬퍼
export function sortItems<T>(
  items: T[],
  sortKey: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

// 날짜순 정렬 헬퍼
export function sortByDate<T>(
  items: T[],
  dateField: keyof T,
  sortOrder: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField] as string).getTime();
    const dateB = new Date(b[dateField] as string).getTime();
    
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });
} 