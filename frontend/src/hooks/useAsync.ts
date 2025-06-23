import { useState, useEffect, useCallback } from 'react';

// 비동기 상태를 관리하는 제네릭 타입
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// 비동기 함수 실행을 위한 공통 훅
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction();
      setState({
        data: result,
        loading: false,
        error: null,
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, dependencies);

  // 컴포넌트 마운트 시 자동 실행
  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    execute, // 수동으로 다시 실행할 때 사용
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}

// 수동 실행용 비동기 훅 (자동 실행하지 않음)
export function useAsyncManual<T, P extends unknown[] = []>(
  asyncFunction: (...args: P) => Promise<T>
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction(...args);
      setState({
        data: result,
        loading: false,
        error: null,
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, [asyncFunction]);

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
} 