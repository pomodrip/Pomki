import { useState, useCallback, useMemo } from 'react';

// 페이지네이션 설정 인터페이스
interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
  totalElements?: number;
}

// 페이지네이션 상태 인터페이스
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 페이지네이션 관리 훅
export function usePagination(config: PaginationConfig = {}) {
  const {
    initialPage = 0,
    initialPageSize = 10,
    totalElements = 0,
  } = config;

  const [state, setState] = useState({
    currentPage: initialPage,
    pageSize: initialPageSize,
    totalElements,
  });

  // 계산된 상태들
  const paginationState: PaginationState = useMemo(() => {
    const totalPages = Math.ceil(state.totalElements / state.pageSize);
    
    return {
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      totalElements: state.totalElements,
      totalPages,
      hasNextPage: state.currentPage < totalPages - 1,
      hasPreviousPage: state.currentPage > 0,
    };
  }, [state.currentPage, state.pageSize, state.totalElements]);

  // 페이지 변경
  const goToPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      currentPage: Math.max(0, Math.min(page, Math.ceil(prev.totalElements / prev.pageSize) - 1)),
    }));
  }, []);

  // 다음 페이지로
  const goToNextPage = useCallback(() => {
    if (paginationState.hasNextPage) {
      goToPage(state.currentPage + 1);
    }
  }, [paginationState.hasNextPage, state.currentPage, goToPage]);

  // 이전 페이지로
  const goToPreviousPage = useCallback(() => {
    if (paginationState.hasPreviousPage) {
      goToPage(state.currentPage - 1);
    }
  }, [paginationState.hasPreviousPage, state.currentPage, goToPage]);

  // 첫 번째 페이지로
  const goToFirstPage = useCallback(() => {
    goToPage(0);
  }, [goToPage]);

  // 마지막 페이지로
  const goToLastPage = useCallback(() => {
    const lastPage = Math.ceil(state.totalElements / state.pageSize) - 1;
    goToPage(Math.max(0, lastPage));
  }, [state.totalElements, state.pageSize, goToPage]);

  // 페이지 크기 변경
  const setPageSize = useCallback((newPageSize: number) => {
    setState(prev => {
      // 페이지 크기 변경 시 현재 위치를 유지하려고 시도
      const currentItemIndex = prev.currentPage * prev.pageSize;
      const newPage = Math.floor(currentItemIndex / newPageSize);
      
      return {
        ...prev,
        pageSize: newPageSize,
        currentPage: newPage,
      };
    });
  }, []);

  // 총 요소 수 설정 (API 응답 후 호출)
  const setTotalElements = useCallback((total: number) => {
    setState(prev => {
      const totalPages = Math.ceil(total / prev.pageSize);
      const adjustedPage = prev.currentPage >= totalPages ? Math.max(0, totalPages - 1) : prev.currentPage;
      
      return {
        ...prev,
        totalElements: total,
        currentPage: adjustedPage,
      };
    });
  }, []);

  // 페이지네이션 초기화
  const reset = useCallback(() => {
    setState({
      currentPage: initialPage,
      pageSize: initialPageSize,
      totalElements: 0,
    });
  }, [initialPage, initialPageSize]);

  // 페이지 범위 계산 (UI에서 표시할 페이지 번호들)
  const getPageRange = useCallback((maxVisiblePages = 5) => {
    const { totalPages, currentPage } = paginationState;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(0, currentPage - half);
    const end = Math.min(totalPages - 1, start + maxVisiblePages - 1);
    
    if (end === totalPages - 1) {
      start = Math.max(0, end - maxVisiblePages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [paginationState]);

  // 현재 페이지의 항목 범위 (예: "1-10 of 100")
  const getItemRange = useMemo(() => {
    const { currentPage, pageSize, totalElements } = paginationState;
    
    if (totalElements === 0) {
      return { start: 0, end: 0, total: 0 };
    }
    
    const start = currentPage * pageSize + 1;
    const end = Math.min((currentPage + 1) * pageSize, totalElements);
    
    return { start, end, total: totalElements };
  }, [paginationState]);

  return {
    ...paginationState,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    setTotalElements,
    reset,
    getPageRange,
    getItemRange,
  };
} 