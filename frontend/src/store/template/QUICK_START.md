# 🚀 상태관리 Quick Start 가이드

팀원들이 빠르게 상태관리를 구현할 수 있도록 단계별 가이드를 제공합니다.

## 📋 1단계: 새로운 Slice 생성하기

### A. 베이스 템플릿 복사

```bash
# template 폴더에서 베이스 파일 복사
cp src/store/template/baseSlice.template.ts src/store/slices/yourEntitySlice.ts
```

### B. 기본 정보 수정

```typescript
// src/store/slices/yourEntitySlice.ts

// 1. import 경로 확인
import type { RootState } from '../store';

// 2. 인터페이스 이름 변경
interface YourEntityState {
  items: YourEntityItem[];
  selectedItem: YourEntityItem | null;
  // ... 나머지는 동일
}

// 3. 타입 정의 (types 폴더에서 import하거나 여기서 정의)
interface YourEntityItem {
  id: string;
  name: string;
  // 필요한 필드들 추가
}

// 4. 액션 이름 수정
export const fetchYourEntityItems = createAsyncThunk<...>('yourEntity/fetchItems', ...)
```

### C. API 연결

```typescript
// 실제 API 호출로 교체
try {
  const response = await yourEntityApi.getItems();
  return response.data;
} catch (error) {
  return rejectWithValue(extractApiErrorMessage(error));
}
```

## 📋 2단계: Store에 Reducer 추가

```typescript
// src/store/store.ts
import yourEntityReducer from './slices/yourEntitySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // ... 기존 reducer들
    yourEntity: yourEntityReducer, // 새로 추가
  },
});
```

## 📋 3단계: 컴포넌트에서 사용하기

### A. 기본 사용법

```typescript
// src/pages/YourEntity/YourEntityListPage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { 
  fetchYourEntityItems,
  selectYourEntityItems,
  selectYourEntityLoading,
  selectYourEntityError
} from '../../store/slices/yourEntitySlice';

const YourEntityListPage = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectYourEntityItems);
  const loading = useAppSelector(selectYourEntityLoading);
  const error = useAppSelector(selectYourEntityError);

  useEffect(() => {
    dispatch(fetchYourEntityItems());
  }, [dispatch]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

export default YourEntityListPage;
```

### B. 공통 Hook 사용법 (권장)

```typescript
// src/pages/YourEntity/YourEntityListPage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { useListSlice } from '../../hooks/useSlice';
import { 
  fetchYourEntityItems,
  selectYourEntityItems,
  selectYourEntityLoading,
  selectYourEntityError,
  selectYourEntityFilters,
  setFilters,
  clearFilters,
  clearError
} from '../../store/slices/yourEntitySlice';

const YourEntityListPage = () => {
  const dispatch = useAppDispatch();
  
  const {
    items,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    clearError: clearYourEntityError
  } = useListSlice(
    selectYourEntityItems,
    selectYourEntityLoading,
    selectYourEntityError,
    selectYourEntityFilters,
    { setFilters, clearFilters, clearError }
  );

  useEffect(() => {
    dispatch(fetchYourEntityItems());
  }, [dispatch]);

  return (
    <div>
      <input
        type="text"
        value={filters.searchQuery}
        onChange={(e) => updateFilters({ searchQuery: e.target.value })}
        placeholder="검색..."
      />
      
      {loading && <div>로딩 중...</div>}
      {error && (
        <div>
          에러: {error}
          <button onClick={clearYourEntityError}>에러 무시</button>
        </div>
      )}
      
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

export default YourEntityListPage;
```

## 📋 4단계: 폼이 있는 경우

### A. 생성/수정 폼

```typescript
// src/pages/YourEntity/YourEntityCreatePage.tsx
import React from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { useFormState } from '../../hooks/useFormState';
import { createYourEntityItem } from '../../store/slices/yourEntitySlice';

const YourEntityCreatePage = () => {
  const dispatch = useAppDispatch();
  
  const {
    values,
    errors,
    isValid,
    isSubmitting,
    getFieldProps,
    setSubmitting,
    resetForm
  } = useFormState(
    { name: '', description: '' }, // 초기값
    (values) => {
      const errors: Record<string, string> = {};
      if (!values.name.trim()) {
        errors.name = '이름을 입력해주세요.';
      }
      return errors;
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    try {
      await dispatch(createYourEntityItem(values)).unwrap();
      resetForm();
      // 성공 시 리다이렉트 또는 메시지 표시
    } catch (error) {
      console.error('생성 실패:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="이름"
          {...getFieldProps('name')}
        />
        {errors.name && <span>{errors.name}</span>}
      </div>
      
      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? '생성 중...' : '생성하기'}
      </button>
    </form>
  );
};

export default YourEntityCreatePage;
```

## 📋 5단계: 페이지네이션이 필요한 경우

```typescript
// src/pages/YourEntity/YourEntityListPage.tsx
import { usePagination } from '../../hooks/usePagination';

const YourEntityListPage = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useListSlice(/*...*/);
  
  const {
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setTotalElements,
    getPageRange,
    getItemRange
  } = usePagination({
    initialPage: 0,
    initialPageSize: 10
  });

  useEffect(() => {
    dispatch(fetchYourEntityItems({ page: currentPage, size: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  // API 응답 후 총 요소 수 설정
  useEffect(() => {
    if (totalElementsFromAPI) {
      setTotalElements(totalElementsFromAPI);
    }
  }, [totalElementsFromAPI, setTotalElements]);

  const itemRange = getItemRange();
  const pageRange = getPageRange();

  return (
    <div>
      {/* 목록 표시 */}
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      
      {/* 페이지네이션 UI */}
      <div>
        <span>{itemRange.start}-{itemRange.end} of {itemRange.total}</span>
        
        <button onClick={goToPreviousPage} disabled={!hasPreviousPage}>
          이전
        </button>
        
        {pageRange.map(page => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            disabled={page === currentPage}
          >
            {page + 1}
          </button>
        ))}
        
        <button onClick={goToNextPage} disabled={!hasNextPage}>
          다음
        </button>
      </div>
    </div>
  );
};
```

## 🎯 체크리스트

새로운 상태 관리를 구현할 때 다음 사항들을 확인하세요:

### 필수 사항
- [ ] `baseSlice.template.ts`를 기반으로 slice 생성
- [ ] `store.ts`에 reducer 추가
- [ ] 타입 정의 완료 (interface 또는 types 폴더)
- [ ] API 호출 로직 구현
- [ ] Selector 함수들 작성
- [ ] 컴포넌트에서 훅 사용

### 권장 사항
- [ ] 공통 Hook (`useListSlice`, `useDetailSlice`) 사용
- [ ] 폼이 있는 경우 `useFormState` 활용
- [ ] 페이지네이션이 있는 경우 `usePagination` 활용
- [ ] 에러 처리 로직 구현
- [ ] 로딩 상태 표시

### 성능 최적화
- [ ] 불필요한 리렌더링 방지를 위한 selector 최적화
- [ ] 메모이제이션이 필요한 경우 `useMemo`, `useCallback` 활용
- [ ] 큰 목록의 경우 가상화 고려

## 🆘 자주 발생하는 문제들

### 1. "Property does not exist on type RootState"
- `store.ts`에 reducer를 추가했는지 확인
- 타입 정의가 올바른지 확인

### 2. API 호출이 작동하지 않음
- `extractApiErrorMessage` 함수 사용 확인
- API 함수가 올바르게 import되었는지 확인

### 3. 상태가 업데이트되지 않음
- `extraReducers`에서 올바른 케이스를 처리하고 있는지 확인
- Immer를 활용한 상태 변경인지 확인

### 4. 성능 문제
- Selector 함수에서 불필요한 재계산이 없는지 확인
- 컴포넌트에서 올바른 dependency 배열 사용 확인

## 📞 도움이 필요할 때

1. `src/store/template/README.md` 상세 가이드라인 참고
2. `src/store/template/exampleUsage.ts` 실제 구현 예시 참고
3. 기존 slice들 (`authSlice.ts`, `noteSlice.ts`) 참고
4. 팀 내 코드 리뷰 요청

이 가이드를 따라하면 일관되고 유지보수 가능한 상태관리 코드를 빠르게 구현할 수 있습니다! 🎉 