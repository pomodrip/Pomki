# API Fallback 시스템

axios 통신 실패시 자동으로 mock 데이터를 반환하는 시스템입니다.

## 🎯 주요 기능

- **자동 Fallback**: API 호출 실패시 자동으로 mock 데이터 반환
- **환경별 제어**: 개발/프로덕션 환경에 따른 동작 제어
- **유연한 설정**: 딜레이, 로깅 등 세부 옵션 설정 가능
- **타입 안전성**: TypeScript로 타입 안전한 구현

## 📁 파일 구조

```
src/api/
├── mockData.ts           # Mock 데이터 정의
├── apiWithFallback.ts    # Fallback 시스템 구현
└── README_FALLBACK.md    # 이 문서
```

## 🚀 사용 방법

### 1. 기본 사용법

```typescript
import { apiWithFallback } from '../api/apiWithFallback';

const result = await apiWithFallback(
  // 실제 API 호출
  () => api.get('/api/data'),
  // Fallback 데이터
  { message: 'Mock 데이터입니다' },
  // 옵션 (선택사항)
  { 
    enableMock: true,
    fallbackDelay: 500,
    logError: true 
  }
);
```

### 2. 사전 정의된 API 사용

```typescript
import { authApiWithFallback, deckApiWithFallback } from '../api/apiWithFallback';

// 로그인
const loginResult = await authApiWithFallback.login({
  email: 'user@example.com',
  password: 'password'
});

// 덱 목록 조회
const decks = await deckApiWithFallback.getDecksByMemberId(1);
```

### 3. 컴포넌트에서 사용

```typescript
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await deckApiWithFallback.getDecksByMemberId(1);
      setData(result);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // ...
};
```

## ⚙️ 설정

### 환경 변수

`.env` 파일에 다음 변수를 설정할 수 있습니다:

```bash
# Mock fallback 사용 여부 (개발 환경에서는 기본적으로 true)
VITE_USE_MOCK_FALLBACK=true
```

### 옵션 설정

```typescript
const options = {
  enableMock: true,        // Mock 사용 여부
  fallbackDelay: 500,      // Mock 응답 지연 시간 (ms)
  logError: true           // 에러 로깅 여부
};
```

## 📝 Mock 데이터 추가/수정

`mockData.ts` 파일에서 mock 데이터를 관리합니다:

```typescript
export const mockData = {
  // 새로운 API 추가
  newApi: {
    getData: [
      { id: 1, name: 'Mock Item 1' },
      { id: 2, name: 'Mock Item 2' }
    ],
    
    createData: (input: any) => ({
      id: Date.now(),
      name: input.name,
      createdAt: new Date().toISOString()
    })
  }
};
```

## 🔧 새로운 API 추가하기

1. **Mock 데이터 정의** (`mockData.ts`)
```typescript
export const mockData = {
  // 기존 데이터...
  myNewApi: {
    getItems: [
      { id: 1, title: 'Item 1' },
      { id: 2, title: 'Item 2' }
    ]
  }
};
```

2. **Fallback API 함수 추가** (`apiWithFallback.ts`)
```typescript
export const myNewApiWithFallback = {
  getItems: async () => {
    try {
      const { getItems } = await import('./myNewApi');
      return apiWithFallback(
        () => getItems(),
        mockData.myNewApi.getItems
      );
    } catch {
      return mockData.myNewApi.getItems;
    }
  }
};
```

3. **통합 객체에 추가**
```typescript
export const apiWithFallbacks = {
  // 기존 API들...
  myNewApi: myNewApiWithFallback,
};
```

## 🎮 예제 실행

예제 컴포넌트를 실행하여 fallback 시스템을 테스트할 수 있습니다:

```typescript
import ApiWithFallbackExample from '../examples/ApiWithFallbackExample';

// 컴포넌트 렌더링
<ApiWithFallbackExample />
```

## 💡 활용 팁

### 1. 개발 중 서버 연결 없이 작업
서버가 준비되지 않은 상태에서도 프론트엔드 개발을 계속할 수 있습니다.

### 2. 오프라인 모드 지원
네트워크 연결이 불안정한 환경에서도 기본적인 기능을 제공할 수 있습니다.

### 3. 테스트 데이터 제공
일관된 테스트 데이터로 UI 테스트를 진행할 수 있습니다.

### 4. API 문서화
Mock 데이터가 실제 API 응답 구조의 문서 역할을 합니다.

## ⚠️ 주의사항

1. **프로덕션 환경에서는 신중하게 사용**
   - 실제 데이터와 mock 데이터를 구분할 수 있도록 로깅 필수

2. **Mock 데이터 최신 상태 유지**
   - 실제 API 스펙 변경시 mock 데이터도 함께 업데이트

3. **보안 고려사항**
   - Mock 데이터에 민감한 정보 포함 금지

4. **성능 고려**
   - 대용량 mock 데이터는 lazy loading 고려

## 🐛 트러블슈팅

### Q: Mock 데이터가 반환되지 않아요
A: `enableMock` 옵션이 true인지, 환경 변수가 올바르게 설정되어 있는지 확인하세요.

### Q: 타입 에러가 발생해요
A: Mock 데이터의 구조가 실제 API 응답 타입과 일치하는지 확인하세요.

### Q: 네트워크 에러에서만 fallback을 사용하고 싶어요
A: axios interceptor에서 에러 타입을 체크하여 선택적으로 fallback을 적용할 수 있습니다.

---

더 자세한 내용은 `ApiWithFallbackExample.tsx` 예제를 참고하세요. 