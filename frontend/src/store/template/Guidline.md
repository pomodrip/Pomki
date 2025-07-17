# 상태관리 가이드라인

## 📋 개요

이 프로젝트는 Redux Toolkit을 사용하여 상태를 관리합니다. 일관된 코드 작성을 위해 아래 가이드라인을 따라주세요.

## 🗂️ 폴더 구조

```
src/
├── store/
│   ├── slices/              # Redux slice 파일들
│   ├── template/            # 템플릿과 가이드
│   └── store.ts            # Store 설정
├── hooks/                  # 커스텀 훅들
├── types/                  # 타입 정의
└── utils/                  # 유틸리티 함수들
```

## 🔧 Slice 작성 가이드

### 1. 기본 구조

모든 slice는 `baseSlice.template.ts`를 참고하여 다음 구조를 따라야 합니다:

1. **상태 인터페이스 정의**
2. **타입 정의** (types 폴더에서 import)
3. **초기 상태 정의**
4. **Async Thunk 액션들**
5. **Slice 정의**
6. **액션과 리듀서 내보내기**
7. **Selector 함수들**

### 2. 네이밍 컨벤션

#### Slice 이름
- 소문자로 시작
- camelCase 사용
- 예: `user`, `note`, `study`

#### 액션 이름
- `fetch[Entity]` - 목록 조회
- `fetch[Entity]Item` - 단일 항목 조회
- `create[Entity]` - 생성
- `update[Entity]` - 수정
- `delete[Entity]` - 삭제

#### Selector 이름
- `select[Entity][Property]`
- 예: `selectUserItems`, `selectUserLoading`

### 3. 상태 구조

모든 slice는 다음 기본 상태를 포함해야 합니다:

```typescript
interface BaseState {
  loading: boolean;      // 로딩 상태
  error: string | null;  // 에러 메시지
}
```

추가로 필요에 따라:
- `items: T[]` - 목록 데이터
- `selectedItem: T | null` - 선택된 항목
- `filters: FilterState` - 필터 상태

### 4. Async Thunk 작성 규칙

```typescript
export const fetchItems = createAsyncThunk<
  ReturnType,           // 반환 타입
  ParameterType,        // 매개변수 타입
  {
    state: RootState;
    rejectValue: string;
  }
>('sliceName/actionName', async (params, { rejectWithValue }) => {
  try {
    // API 호출
    const response = await api.method(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      extractApiErrorMessage(error)
    );
  }
});
```

### 5. 에러 처리

- 모든 async thunk에서 `rejectWithValue` 사용
- `utils/stateUtils.ts`의 `extractApiErrorMessage` 함수 활용
- 사용자 친화적인 에러 메시지 제공

## 🎣 Hook 사용 가이드

### 1. 기본 Redux Hook

```typescript
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';

// 컴포넌트 내에서
const dispatch = useAppDispatch();
const data = useAppSelector(selectSomeData);
```

### 2. 공통 Hook 활용

#### useListSlice - 목록 페이지용

```typescript
import { useListSlice } from '../hooks/useSlice';

const {
  items,
  loading,
  error,
  filters,
  setFilters,
  clearFilters,
  clearError
} = useListSlice(
  selectItems,
  selectLoading,
  selectError,
  selectFilters,
  { setFilters, clearFilters, clearError }
);
```

#### useDetailSlice - 상세 페이지용

```typescript
import { useDetailSlice } from '../hooks/useSlice';

const {
  item,
  loading,
  error,
  setSelectedItem,
  clearError
} = useDetailSlice(
  selectSelectedItem,
  selectLoading,
  selectError,
  { setSelectedItem, clearError }
);
```

#### useAsync - 비동기 처리용

```typescript
import { useAsync } from '../hooks/useAsync';

// 자동 실행
const { data, loading, error, execute } = useAsync(
  () => fetchData(id),
  [id]
);

// 수동 실행
const { data, loading, error, execute } = useAsyncManual(
  (params) => api.call(params)
);
```

## 🛠️ 유틸리티 활용

### 상태 업데이트 헬퍼

```typescript
import { 
  updateItemById, 
  removeItemById, 
  prependToArray 
} from '../utils/stateUtils';

// reducer 내에서
.addCase(updateItem.fulfilled, (state, action) => {
  state.items = updateItemById(
    state.items, 
    action.payload.id, 
    () => action.payload
  );
})
```

### 검색/필터링

```typescript
import { filterBySearchQuery, sortByDate } from '../utils/stateUtils';

// selector 내에서
export const selectFilteredItems = (state: RootState) => {
  let items = selectItems(state);
  const filters = selectFilters(state);
  
  // 검색 필터링
  items = filterBySearchQuery(items, filters.searchQuery, ['name', 'title']);
  
  // 날짜순 정렬
  items = sortByDate(items, 'createdAt', 'desc');
  
  return items;
};
```

## 📝 실제 구현 예시

### 1. 새로운 Slice 생성

1. `src/store/template/baseSlice.template.ts` 복사
2. 파일명을 `[entityName]Slice.ts`로 변경
3. 인터페이스와 타입을 실제 엔티티에 맞게 수정
4. API 호출 부분을 실제 API로 교체
5. `store.ts`에 reducer 추가

### 2. 컴포넌트에서 사용

```typescript
// 목록 페이지
const NotesListPage = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters } = useListSlice(/* ... */);
  
  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);
  
  // 컴포넌트 렌더링 로직
};

// 상세 페이지
const NoteDetailPage = () => {
  const { id } = useParams();
  const { item, loading, error } = useDetailSlice(/* ... */);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchNote(id));
    }
  }, [dispatch, id]);
  
  // 컴포넌트 렌더링 로직
};
```

## ⚠️ 주의사항

1. **Immer 활용**: Redux Toolkit은 Immer를 내장하므로 직접 상태 변경 가능
2. **타입 안전성**: 모든 액션과 상태에 타입 정의 필수
3. **에러 처리**: 사용자에게 의미 있는 에러 메시지 제공
4. **성능 최적화**: 불필요한 리렌더링 방지를 위해 selector 최적화
5. **일관성 유지**: 팀 전체가 동일한 패턴 사용

## 🔄 코드 리뷰 체크리스트

- [ ] 타입 정의가 올바른가?
- [ ] 에러 처리가 적절한가?
- [ ] Selector 함수가 필요한 곳에 정의되었는가?
- [ ] 네이밍 컨벤션을 따르고 있는가?
- [ ] 불필요한 상태가 없는가?
- [ ] 성능에 영향을 주는 부분은 없는가?

이 가이드라인을 따라 일관되고 유지보수 가능한 상태관리 코드를 작성해주세요! 