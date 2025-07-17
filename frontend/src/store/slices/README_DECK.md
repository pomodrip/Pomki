# 🃏 Deck Slice 사용 가이드

## 📋 개요

`deckSlice`는 카드 덱 관리를 위한 상태관리 모듈입니다. 템플릿 기반으로 작성되어 일관된 패턴을 따릅니다.

## 🚀 설정 완료 사항

### 1. Store 설정 ✅
```typescript
// src/store/store.ts
import deckReducer from './slices/deckSlice';

export const store = configureStore({
  reducer: {
    // ... 기존 reducer들
    deck: deckReducer, // ✅ 추가됨
  },
});
```

### 2. 타입 정의 ✅
```typescript
// src/types/card.ts - 기존 타입 활용
interface CardDeck {
  deckId: string;
  deckName: string;
  cardCnt: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  // ...
}
```

### 3. API 연결 ✅
```typescript
// src/api/studyApi.ts - 기존 API 활용
export const getDecks = async (params: GetDecksRequest) => { /* ... */ };
export const createDeck = async (data: CreateDeckRequest) => { /* ... */ };
// ...
```

## 🎯 기본 사용법

### 1. 컴포넌트에서 기본 사용

```typescript
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  fetchDecks,
  selectDecks,
  selectDeckLoading,
  selectDeckError,
} from '../store/slices/deckSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const decks = useAppSelector(selectDecks);
  const loading = useAppSelector(selectDeckLoading);
  const error = useAppSelector(selectDeckError);

  useEffect(() => {
    dispatch(fetchDecks({ page: 0, size: 10 }));
  }, [dispatch]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div>
      {decks.map(deck => (
        <div key={deck.deckId}>{deck.deckName}</div>
      ))}
    </div>
  );
};
```

### 2. 덱 생성

```typescript
const handleCreateDeck = async () => {
  try {
    await dispatch(createDeck({ deckName: '새 덱' })).unwrap();
    // 성공 처리
  } catch (error) {
    // 에러 처리
  }
};
```

### 3. 검색 및 필터링

```typescript
const handleSearch = (query: string) => {
  dispatch(setFilters({ searchQuery: query }));
};

const handleSort = (sortBy: 'deckName' | 'createdAt' | 'cardCnt') => {
  dispatch(setFilters({ sortBy }));
};
```

## 🔧 고급 기능

### 1. 페이지네이션과 함께 사용

```typescript
import { usePagination } from '../hooks/usePagination';

const MyComponent = () => {
  const pagination = useAppSelector(selectDeckPagination);
  
  const {
    currentPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  } = usePagination({
    initialPage: pagination.currentPage,
    initialPageSize: pagination.pageSize,
  });

  useEffect(() => {
    dispatch(fetchDecks({
      page: currentPage,
      size: pagination.pageSize,
    }));
  }, [currentPage, pagination.pageSize]);

  // 페이지네이션 UI 렌더링...
};
```

### 2. 필터링된 데이터 사용

```typescript
const filteredDecks = useAppSelector(selectFilteredDecks);
const stats = useAppSelector(selectDeckStats);

// filteredDecks: 검색/정렬이 적용된 덱 목록
// stats: { totalDecks, totalCards } 통계 정보
```

### 3. 폼 상태관리와 함께

```typescript
import { useFormState } from '../hooks/useFormState';

const CreateDeckForm = () => {
  const {
    values,
    errors,
    isValid,
    getFieldProps,
    resetForm,
  } = useFormState(
    { deckName: '' },
    (values) => {
      const errors: Record<string, string> = {};
      if (!values.deckName.trim()) {
        errors.deckName = '덱 이름을 입력하세요';
      }
      return errors;
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      await dispatch(createDeck(values));
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input {...getFieldProps('deckName')} />
      {errors.deckName && <span>{errors.deckName}</span>}
      <button type="submit">생성</button>
    </form>
  );
};
```

## 📚 사용 가능한 액션들

### Async Thunk 액션
- `fetchDecks(params)` - 덱 목록 조회
- `fetchDeck(deckId)` - 단일 덱 조회
- `createDeck(data)` - 덱 생성
- `updateDeck({ deckId, data })` - 덱 수정
- `deleteDeck(deckId)` - 덱 삭제

### Sync 액션
- `setFilters(filters)` - 필터 설정
- `clearFilters()` - 필터 초기화
- `setCurrentPage(page)` - 페이지 설정
- `setPageSize(size)` - 페이지 크기 설정
- `clearError()` - 에러 클리어
- `setSelectedDeck(deck)` - 선택된 덱 설정

## 🎪 Selector 함수들

### 기본 Selector
- `selectDecks` - 덱 목록
- `selectSelectedDeck` - 선택된 덱
- `selectDeckLoading` - 로딩 상태
- `selectDeckError` - 에러 상태
- `selectDeckFilters` - 필터 상태
- `selectDeckPagination` - 페이지네이션 정보

### 파생 Selector
- `selectFilteredDecks` - 필터링된 덱 목록
- `selectDeckStats` - 통계 정보

## 📝 실제 예시

완전한 사용 예시는 다음 파일을 참고하세요:
- `src/examples/DeckUsageExample.tsx` - 기본 사용법
- `src/components/deck/DeckListComponent.tsx` - 고급 사용법

## 🔧 커스터마이징

필요에 따라 다음을 수정할 수 있습니다:

1. **새로운 필터 추가**
```typescript
// deckSlice.ts의 filters 인터페이스에 필드 추가
filters: {
  searchQuery: string;
  showBookmarked: boolean;
  category: string; // 새 필터 추가
  // ...
}
```

2. **새로운 액션 추가**
```typescript
// deckSlice.ts의 reducers 또는 extraReducers에 추가
toggleFavorite: (state, action: PayloadAction<string>) => {
  // 즐겨찾기 토글 로직
},
```

3. **새로운 Selector 추가**
```typescript
// 카테고리별 덱 개수
export const selectDecksByCategory = (state: RootState) => {
  const decks = selectDecks(state);
  return decks.reduce((acc, deck) => {
    // 카테고리별 그룹핑 로직
  }, {});
};
```

이제 덱 상태관리를 일관되고 효율적으로 사용할 수 있습니다! 🎉 