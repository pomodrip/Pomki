import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import type { RootState } from '../store/store';

// 제네릭 타입으로 slice 상태와 액션을 관리하는 훅
export function useSlice<
  TState,
  TActions extends Record<string, (...args: any[]) => any>
>(
  stateSelector: (state: RootState) => TState,
  actions: TActions
) {
  const dispatch = useAppDispatch();
  const state = useAppSelector(stateSelector);

  // 액션들을 dispatch와 함께 바인딩
  const boundActions = useCallback(() => {
    const bound = {} as {
      [K in keyof TActions]: (...args: Parameters<TActions[K]>) => void;
    };

    Object.keys(actions).forEach((key) => {
      const actionKey = key as keyof TActions;
      bound[actionKey] = ((...args: Parameters<TActions[typeof actionKey]>) => {
        dispatch(actions[actionKey](...args));
      }) as any;
    });

    return bound;
  }, [dispatch, actions]);

  return {
    state,
    actions: boundActions(),
  };
}

// 특정 slice의 로딩/에러 상태를 쉽게 가져오는 훅
export function useSliceStatus(
  loadingSelector: (state: RootState) => boolean,
  errorSelector: (state: RootState) => string | null
) {
  const loading = useAppSelector(loadingSelector);
  const error = useAppSelector(errorSelector);

  return { loading, error };
}

// 목록 페이지에서 자주 사용되는 패턴을 위한 훅
export function useListSlice<T>(
  itemsSelector: (state: RootState) => T[],
  loadingSelector: (state: RootState) => boolean,
  errorSelector: (state: RootState) => string | null,
  filtersSelector: (state: RootState) => Record<string, any>,
  actions: {
    setFilters: (filters: Partial<Record<string, any>>) => any;
    clearFilters: () => any;
    clearError: () => any;
  }
) {
  const dispatch = useAppDispatch();
  
  const items = useAppSelector(itemsSelector);
  const loading = useAppSelector(loadingSelector);
  const error = useAppSelector(errorSelector);
  const filters = useAppSelector(filtersSelector);

  const setFilters = useCallback((newFilters: Partial<Record<string, any>>) => {
    dispatch(actions.setFilters(newFilters));
  }, [dispatch, actions.setFilters]);

  const clearFilters = useCallback(() => {
    dispatch(actions.clearFilters());
  }, [dispatch, actions.clearFilters]);

  const clearError = useCallback(() => {
    dispatch(actions.clearError());
  }, [dispatch, actions.clearError]);

  return {
    items,
    loading,
    error,
    filters,
    setFilters,
    clearFilters,
    clearError,
  };
}

// 상세 페이지에서 자주 사용되는 패턴을 위한 훅
export function useDetailSlice<T>(
  itemSelector: (state: RootState) => T | null,
  loadingSelector: (state: RootState) => boolean,
  errorSelector: (state: RootState) => string | null,
  actions: {
    setSelectedItem: (item: T | null) => any;
    clearError: () => any;
  }
) {
  const dispatch = useAppDispatch();
  
  const item = useAppSelector(itemSelector);
  const loading = useAppSelector(loadingSelector);
  const error = useAppSelector(errorSelector);

  const setSelectedItem = useCallback((selectedItem: T | null) => {
    dispatch(actions.setSelectedItem(selectedItem));
  }, [dispatch, actions.setSelectedItem]);

  const clearError = useCallback(() => {
    dispatch(actions.clearError());
  }, [dispatch, actions.clearError]);

  return {
    item,
    loading,
    error,
    setSelectedItem,
    clearError,
  };
} 