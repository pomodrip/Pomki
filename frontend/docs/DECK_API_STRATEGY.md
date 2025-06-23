# 🎯 Deck API Mock/Real 전환 전략 가이드

## 🎨 개요

이 프로젝트는 개발 단계에서 **Mock 데이터**와 **실제 API**를 선택적으로 사용할 수 있는 유연한 구조를 제공합니다.

## 🔧 설정 방법

### 1. 환경 변수 설정

루트 디렉토리에 환경 설정 파일들을 생성하세요:

#### `.env.development` (개발용 - Mock 데이터)
```bash
# 🎭 개발 환경 설정
VITE_USE_MOCK_DATA=true
VITE_API_BASE_URL=http://localhost:8088
```

#### `.env.production` (프로덕션용 - 실제 API)
```bash
# 🌐 프로덕션 환경 설정
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://api.pomki.com
```

#### `.env.local` (로컬 개발용 - 개인 설정)
```bash
# 🔧 로컬 환경 설정 (개인 설정, Git 무시됨)
VITE_USE_MOCK_DATA=true
VITE_API_BASE_URL=http://localhost:8088
```

### 2. 모드 전환 방법

```bash
# Mock 모드로 개발 서버 시작
npm run dev

# Real API 모드로 개발 서버 시작 (환경변수 오버라이드)
VITE_USE_MOCK_DATA=false npm run dev

# 프로덕션 빌드 (자동으로 Real API 모드)
npm run build
```

## 🏗️ 아키텍처 구조

### Service Layer 패턴

```
src/
├── services/           # 🎯 서비스 레이어
│   ├── deckService.ts     # 덱 서비스 (Mock + Real)
│   └── cardService.ts     # 카드 서비스 (Mock + Real)
├── api/               # 🌐 실제 API 호출
│   ├── deckApi.ts
│   └── cardApi.ts
├── store/slices/      # 🗃️ Redux 상태 관리
│   └── deckSlice.ts      # 새로운 덱 슬라이스
└── pages/Study/       # 🖥️ UI 컴포넌트
    └── DeckManagementPage.tsx  # 덱 관리 페이지 예시
```

### 핵심 구성요소

#### 1. 서비스 인터페이스
```typescript
// src/services/deckService.ts
export interface IDeckService {
  getDecks(memberId: number): Promise<CardDeck[]>;
  createDeck(data: CreateDeckRequest): Promise<CardDeck>;
  updateDeck(deckId: string, data: UpdateDeckRequest): Promise<CardDeck>;
  deleteDeck(deckId: string): Promise<void>;
  getCardsInDeck(deckId: string): Promise<Card[]>;
}
```

#### 2. Factory 패턴으로 서비스 선택
```typescript
export const createDeckService = (): IDeckService => {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  return useMockData ? new MockDeckService() : new RealDeckService();
};
```

#### 3. Redux Thunk를 통한 비동기 액션
```typescript
// src/store/slices/deckSlice.ts
export const fetchDecks = createAsyncThunk(
  'deck/fetchDecks',
  async (memberId: number) => {
    return await deckService.getDecks(memberId); // 자동으로 Mock/Real 선택
  }
);
```

## 🎮 사용 방법

### 1. 컴포넌트에서 사용
```typescript
import { fetchDecks, createDeck } from '../../store/slices/deckSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { decks, loading, error } = useAppSelector(state => state.deck);

  // 🎯 데이터 로드 (자동으로 Mock/Real 선택됨)
  useEffect(() => {
    dispatch(fetchDecks(userId));
  }, []);

  // 🎯 덱 생성 (자동으로 Mock/Real 선택됨)
  const handleCreate = () => {
    dispatch(createDeck({ deckName: '새 덱' }));
  };
};
```

### 2. 현재 모드 확인
```typescript
const mockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

return (
  <Chip 
    label={mockMode ? "🎭 Mock 모드" : "🌐 Real API 모드"} 
    color={mockMode ? "warning" : "success"}
  />
);
```

## 🎭 Mock 서비스 특징

### 완전한 API 시뮬레이션
- ✅ **지연 시뮬레이션**: 실제 네트워크 지연 모방
- ✅ **상태 관리**: 메모리 내에서 CRUD 동작
- ✅ **에러 처리**: 실제 API와 동일한 에러 타입
- ✅ **타입 안전성**: TypeScript로 완전한 타입 체크

### Mock 데이터 예시
```typescript
const mockDecks: CardDeck[] = [
  {
    deckId: 'deck-uuid-1',
    deckName: 'React 이해도',
    memberId: 1,
    cardCnt: 5,
    isDeleted: false,
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  }
];
```

## 🌐 Real API 서비스 특징

### 백엔드 API 직접 호출
- ✅ **완전한 백엔드 연동**: 실제 서버와 통신
- ✅ **인증 처리**: JWT 토큰 자동 관리
- ✅ **에러 핸들링**: 실제 서버 에러 처리
- ✅ **데이터 영속성**: 데이터베이스에 실제 저장

## 🔄 전환 시나리오

### 개발 단계별 전환
1. **초기 개발**: Mock 모드로 UI/UX 개발
2. **백엔드 준비**: Real API 모드로 통합 테스트
3. **배포 전**: Real API 모드로 최종 테스트
4. **프로덕션**: Real API 모드로 배포

### 팀 개발 시나리오
- **프론트엔드 개발자**: Mock 모드로 독립 개발
- **백엔드 개발자**: Real API 모드로 통합 테스트
- **QA 테스터**: 두 모드 모두 테스트 가능

## 🚀 사용 예시 페이지

`src/pages/Study/DeckManagementPage.tsx`에서 전체 사용 예시를 확인할 수 있습니다.

### 주요 기능
- ✅ 덱 목록 조회 (자동 로딩)
- ✅ 덱 생성 (다이얼로그)
- ✅ 덱 수정 (인라인 편집)
- ✅ 덱 삭제 (확인 대화상자)
- ✅ 현재 모드 표시 (Mock/Real 칩)
- ✅ 로딩 상태 처리
- ✅ 에러 처리 (스낵바)

## 📋 체크리스트

### 환경 설정 확인
- [ ] `.env.development` 파일 생성
- [ ] `.env.production` 파일 생성  
- [ ] `.env.local` 파일 생성 (선택사항)
- [ ] `VITE_USE_MOCK_DATA` 환경 변수 설정

### 코드 구현 확인
- [ ] `src/services/` 폴더 및 서비스 파일들
- [ ] `src/store/slices/deckSlice.ts` 생성
- [ ] 스토어에 덱 슬라이스 추가
- [ ] 페이지 컴포넌트에서 새 슬라이스 사용

### 테스트 확인
- [ ] Mock 모드에서 모든 CRUD 동작 테스트
- [ ] Real API 모드에서 백엔드 연동 테스트
- [ ] 환경 변수 전환 테스트
- [ ] 에러 핸들링 테스트

## 🔧 고급 설정

### 개발자 도구 활용
```typescript
// 콘솔에서 현재 모드 확인
console.log('Current Mode:', import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'Mock' : 'Real');

// 서비스 로그 확인 (브라우저 콘솔)
// 🎯 Deck Service Mode: MOCK
// 🃏 Card Service Mode: MOCK
```

### 런타임 모드 전환 (고급)
```typescript
// 개발 모드에서만 사용 가능한 런타임 전환
if (import.meta.env.DEV) {
  (window as any).switchToMockMode = () => {
    localStorage.setItem('forceMockMode', 'true');
    location.reload();
  };
}
```

## 🎯 결론

이 전략을 통해:
- **개발 효율성 극대화**: 백엔드 의존 없이 개발 가능
- **테스트 용이성**: 두 환경 모두에서 테스트 가능
- **코드 일관성**: 동일한 인터페이스로 두 모드 지원
- **배포 유연성**: 환경에 따른 자동 전환

**핵심은 Service Layer 패턴을 통해 Mock과 Real API를 완벽하게 추상화한 것입니다!** 🎉 