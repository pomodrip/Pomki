# ✨ 상태관리 간단 가이드

## 왜 에러가 있었나요?

네, 맞습니다! 이전 템플릿 파일들에는 의도적으로 ESLint 에러들이 있었습니다:

1. **`any` 타입 사용** - 실제로는 적절한 타입을 사용해야 함
2. **존재하지 않는 state 참조** - 템플릿이라서 실제 store에 연결되지 않음
3. **불완전한 타입 정의** - 가이드용이라서 완전하지 않음

## 🚀 실제 사용 방법

### 1단계: 깔끔한 템플릿 사용

```bash
# 에러 없는 템플릿 복사
cp src/store/template/cleanSlice.template.ts src/store/slices/yourSlice.ts
```

### 2단계: 3가지만 수정하면 완성!

```typescript
// src/store/slices/yourSlice.ts

// 1. 이름 변경 (Example → Your)
interface YourItem {
  id: string;
  name: string;
  // ... 필요한 필드들
}

// 2. API 호출 교체
export const fetchYourItems = createAsyncThunk(
  'your/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await yourApi.getItems(); // 실제 API
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// 3. Selector 주석 해제
export const selectYourItems = (state: RootState) => state.your.items;
```

### 3단계: Store에 추가

```typescript
// src/store/store.ts
import yourReducer from './slices/yourSlice';

export const store = configureStore({
  reducer: {
    // ... 기존 reducer들
    your: yourReducer, // 추가
  },
});
```

## 🎯 컴포넌트에서 사용

### 기본 사용법

```typescript
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchYourItems, selectYourItems } from '../../store/slices/yourSlice';

const YourComponent = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectYourItems);
  
  useEffect(() => {
    dispatch(fetchYourItems());
  }, [dispatch]);
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

### 폼 사용 (공통 훅 활용)

```typescript
import { useFormState } from '../../hooks/useFormState';

const CreateForm = () => {
  const dispatch = useAppDispatch();
  
  const { values, errors, getFieldProps, isValid } = useFormState(
    { name: '', description: '' },
    (values) => {
      const errors: Record<string, string> = {};
      if (!values.name) errors.name = '이름을 입력하세요';
      return errors;
    }
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      dispatch(createYourItem(values));
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input {...getFieldProps('name')} placeholder="이름" />
      {errors.name && <span>{errors.name}</span>}
      <button type="submit">생성</button>
    </form>
  );
};
```

## 📚 추가 기능이 필요할 때

### 페이지네이션

```typescript
import { usePagination } from '../../hooks/usePagination';

const { currentPage, goToNextPage, setTotalElements } = usePagination();
```

### 검색/필터링

```typescript
// slice에 이미 filters 상태가 포함되어 있음
const filters = useAppSelector(selectYourFilters);
dispatch(setFilters({ searchQuery: 'search term' }));
```

## ✅ 체크리스트

- [ ] `cleanSlice.template.ts` 복사
- [ ] 이름 변경 (Example → Your)
- [ ] API 호출 교체
- [ ] Store에 reducer 추가
- [ ] Selector 주석 해제
- [ ] 컴포넌트에서 사용

이렇게 하면 에러 없이 깔끔하게 상태관리를 구현할 수 있습니다! 🎉

## 🆘 문제 해결

- **"Property does not exist on type RootState"** → store.ts에 reducer 추가했는지 확인
- **API 호출 에러** → try-catch와 handleAsyncError 사용
- **타입 에러** → interface 정의 확인

더 자세한 내용은 기존 `authSlice.ts`나 `noteSlice.ts`를 참고하세요! 