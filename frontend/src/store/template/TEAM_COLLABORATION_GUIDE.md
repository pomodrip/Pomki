# 🤝 팀 협업을 위한 상태관리 가이드

## 📋 목차
1. [빠른 시작](#빠른-시작)
2. [코딩 스타일](#코딩-스타일)  
3. [파일 구조](#파일-구조)
4. [네이밍 컨벤션](#네이밍-컨벤션)
5. [에러 처리](#에러-처리)
6. [코드 리뷰 체크리스트](#코드-리뷰-체크리스트)

## 🚀 빠른 시작

### 1. 새로운 Slice 생성하기

```bash
# 1. 템플릿 복사
cp src/store/template/cleanSlice.template.ts src/store/slices/[entityName]Slice.ts

# 2. 타입 정의 (types 폴더에 추가)
touch src/types/[entityName].ts

# 3. API 함수 정의 (api 폴더에 추가)  
touch src/api/[entityName]Api.ts
```

### 2. 체크리스트
- [ ] slice 파일명은 `[entityName]Slice.ts` 형식
- [ ] types 폴더에 타입 정의 추가
- [ ] api 폴더에 API 함수 추가
- [ ] store.ts에 reducer 등록
- [ ] 테스트 코드 작성

## 🎨 코딩 스타일

### TypeScript 타입 정의
```typescript
// ✅ 좋은 예
interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

// ❌ 나쁜 예  
interface State {
  data: any;
  isLoading: boolean;
  err: any;
}
```

### Async Thunk 패턴
```typescript
// ✅ 표준 패턴
export const fetchUsers = createAsyncThunk<
  User[],                    // 반환 타입
  { page: number; size: number }, // 매개변수 타입
  { state: RootState; rejectValue: string }
>('user/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    const response = await userApi.getUsers(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});
```

### Selector 네이밍
```typescript
// ✅ 일관된 네이밍
export const selectUsers = (state: RootState) => state.user.users;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectSelectedUser = (state: RootState) => state.user.selectedUser;

// 파생 상태는 Filtered, Sorted 등 명시
export const selectFilteredUsers = (state: RootState) => {
  // 필터링 로직
};
```

## 📁 파일 구조

```
src/
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── userSlice.ts
│   │   └── ...
│   ├── template/           # 🎯 팀 공용 템플릿
│   └── store.ts
├── types/
│   ├── auth.ts
│   ├── user.ts
│   └── api.ts
├── api/
│   ├── authApi.ts
│   ├── userApi.ts
│   └── index.ts
└── hooks/
    ├── useRedux.ts         # 기본 Redux Hook
    ├── useSlice.ts         # 공통 슬라이스 Hook
    └── useAsync.ts         # 비동기 처리 Hook
```

## 🏷️ 네이밍 컨벤션

### Slice 이름
```typescript
// ✅ 단수형, camelCase
const userSlice = createSlice({ name: 'user', ... });
const noteSlice = createSlice({ name: 'note', ... });

// ❌ 복수형이나 다른 형식 피하기
const usersSlice = createSlice({ name: 'users', ... }); // ❌
```

### 액션 이름
```typescript
// ✅ 표준 CRUD 패턴
- fetch[Entity]s        // 목록 조회
- fetch[Entity]         // 단일 조회  
- create[Entity]        // 생성
- update[Entity]        // 수정
- delete[Entity]        // 삭제

// 예시
fetchUsers, fetchUser, createUser, updateUser, deleteUser
```

### 상태 필드명
```typescript
// ✅ 표준 필드명 사용
interface BaseState {
  loading: boolean;      // 로딩 상태
  error: string | null;  // 에러 메시지
  items: T[];           // 목록 데이터
  selectedItem: T | null; // 선택된 항목
}
```

## ⚠️ 에러 처리

### 1. 일관된 에러 처리
```typescript
// utils/stateUtils.ts의 헬퍼 사용
import { handleAsyncError } from '../../utils/stateUtils';

export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getData(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);
```

### 2. 사용자 친화적 메시지
```typescript
// ✅ 사용자가 이해하기 쉬운 메시지
'데이터를 불러오는데 실패했습니다.'
'저장에 실패했습니다. 다시 시도해주세요.'

// ❌ 기술적인 메시지 피하기
'500 Internal Server Error'
'Network request failed'
```

## 🔍 코드 리뷰 체크리스트

### Slice 작성 시
- [ ] TypeScript 타입이 정확히 정의되었는가?
- [ ] 에러 처리가 일관되게 적용되었는가?
- [ ] 네이밍 컨벤션을 따르는가?
- [ ] 불필요한 상태는 없는가?
- [ ] Selector가 memoization을 고려하는가?

### 컴포넌트에서 사용 시
- [ ] useAppSelector, useAppDispatch를 사용하는가?
- [ ] 공통 Hook(useListSlice, useDetailSlice)을 활용하는가?
- [ ] 불필요한 리렌더링이 없는가?
- [ ] 에러 상태를 UI에 적절히 표시하는가?

### 성능 고려사항
- [ ] Selector가 reference equality를 고려하는가?
- [ ] 큰 배열의 경우 메모이제이션을 사용하는가?
- [ ] 불필요한 API 호출은 없는가?

## 🛠️ 디버깅 도구

### Redux DevTools 활용
```typescript
// 개발 환경에서 Redux DevTools 확장 사용
// 액션 추적, 시간 여행 디버깅 등 활용
```

### 로깅
```typescript
// 개발 환경에서만 콘솔 로그 출력
if (process.env.NODE_ENV === 'development') {
  console.log('Action dispatched:', action);
}
```

## 📚 추가 학습 자료

1. **기본 가이드**: `QUICK_START.md` 참고
2. **상세 가이드**: `Guidline.md` 참고  
3. **예시 코드**: `exampleUsage.ts` 참고
4. **템플릿**: `cleanSlice.template.ts` 사용

## 🤝 협업 규칙

1. **PR 전 체크**: 위 체크리스트 확인
2. **코드 리뷰**: 최소 1명 이상 리뷰 필수
3. **테스트**: 새로운 slice는 기본 테스트 작성
4. **문서화**: 복잡한 로직은 주석 필수

---

**💡 팁**: 막히는 부분이 있다면 기존 slice(`authSlice.ts`, `deckSlice.ts`)를 참고하세요! 