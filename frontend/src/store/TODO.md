# 🚧 상태관리 구현 현황 및 할일

## ✅ 구현 완료된 Slice들

| Slice | 상태 | 파일 크기 | 설명 |
|-------|------|-----------|------|
| authSlice | ✅ 완료 | 254줄 | 로그인, 회원가입, 인증 |
| deckSlice | ✅ 완료 | 498줄 | 카드 덱 관리 (카드 CRUD 추가) |
| noteSlice | ✅ 완료 | 155줄 | 노트 작성, 수정, 삭제 |
| studySlice | ⚠️ 최소 구현 | 43줄 | 학습 관련 상태 (확장 필요) |
| dialogSlice | ✅ 완료 | 48줄 | 모달/다이얼로그 관리 |
| snackbarSlice | ✅ 완료 | 57줄 | 알림 메시지 |
| toastSlice | ✅ 완료 | 41줄 | 토스트 메시지 |
| timerSlice | ✅ 완료 | 580줄 | 포모도로 타이머 (Redux Toolkit 기반) |

## 🚧 미구현된 Slice들

### 1. uiSlice.ts ⚠️
```typescript
// 전역 UI 상태 관리 (사이드바, 테마, 레이아웃 등)
interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  layout: 'compact' | 'comfortable';
  notifications: boolean;
  language: 'ko' | 'en';
}
```

**우선순위**: 🟡 중간 (UI 일관성을 위해 필요)

**관련 컴포넌트들**:
- `src/components/common/Header.tsx`
- `src/components/common/BottomNav.tsx`
- `src/theme/theme.ts`

### 2. membershipSlice.ts ⚠️
```typescript
// 멤버십 및 결제 상태 관리
interface MembershipState {
  currentPlan: 'free' | 'premium';
  expiryDate: string | null;
  features: string[];
  paymentHistory: Payment[];
  upgradeModalOpen: boolean;
}
```

**우선순위**: 🟡 중간 (수익화 기능)

**관련 페이지들**:
- `/src/pages/Membership/`
- `src/components/common/MembershipBadge.tsx`

### 3. adSlice.ts ⚠️
```typescript
// 광고 시스템 상태 관리
interface AdState {
  adsEnabled: boolean;
  currentAds: Ad[];
  adPreferences: AdPreference;
  viewHistory: AdView[];
}
```

**우선순위**: 🟢 낮음 (나중에 구현)

**관련 페이지들**:
- `/src/pages/Ad/`
- `src/components/common/AdBanner.tsx`

## 📊 구현 진행률

- ✅ **완료**: 8/11 (72.7%)
- 🚧 **미구현**: 3/11 (27.3%)

## 🔧 최근 업데이트

### 2024년 - timerSlice.ts 구현 완료 ✅

**구현된 기능들**:
- ✅ 포모도로 타이머 (25분 집중 + 5분 휴식)
- ✅ Time Entry 패턴 (일시정지/재개 지원)
- ✅ 자동 세션 전환
- ✅ Redux Toolkit 기반 상태관리
- ✅ TypeScript 타입 안전성
- ✅ 브라우저 알림 지원
- ✅ useTimer Hook (컴포넌트 연동)
- ✅ TimerWidget 컴포넌트 Redux 연동

**참고한 가이드**:
- [Medium: React Timer with Redux](https://medium.com/@machadogj/timers-in-react-with-redux-apps-9a5a722162e8)
- [Diego Castillo: React Timer Component](https://diegocasmo.github.io/2020-10-18-create-a-simple-react-timer-component/)

**파일 변경 내역**:
- `src/store/slices/timerSlice.ts` (신규, 580줄)
- `src/hooks/useTimer.ts` (신규, 200+줄)
- `src/api/timerApi.ts` (saveTimerSettings 함수 추가)
- `src/components/common/TimerWidget.tsx` (Redux 연동)
- `src/store/store.ts` (timer reducer 추가)

## 🎯 다음 단계 권장사항

1. **studySlice 확장** - 학습 통계, 진행률 추가
2. **uiSlice 구현** - 전역 UI 상태 통합
3. **membershipSlice 구현** - 유료 기능 관리
4. **타이머 페이지들 Redux 연동** - useTimer Hook 적용

## 📝 추가 TODO

- [ ] Timer 관련 페이지들에 useTimer Hook 적용
- [ ] 타이머 통계 API 연동
- [ ] 알림 권한 요청 UI 구현
- [ ] 타이머 설정 모달 Redux 연동

## 📋 구현 계획

### Phase 1: 핵심 기능 (이번 주)
1. **timerSlice.ts** 구현 - 가장 우선순위 높음
2. **deckSlice.ts** merge conflict 해결
3. **studySlice.ts** 확장 구현

### Phase 2: UI 개선 (다음 주)  
1. **uiSlice.ts** 구현
2. **membershipSlice.ts** 구현

### Phase 3: 부가 기능 (추후)
1. **adSlice.ts** 구현

## 🛠️ 각 Slice별 구현 가이드

### timerSlice.ts 구현 예시

```bash
# 1. 템플릿 복사
cp src/store/template/cleanSlice.template.ts src/store/slices/timerSlice.ts

# 2. 타입 정의 확인 (이미 있음)
# src/types/timer.ts

# 3. API 함수 확인 (이미 있음)  
# src/api/timerApi.ts
```

**구현해야 할 주요 기능들**:
- 타이머 시작/정지/리셋
- 포모도로 세션 관리 
- 집중 시간 통계
- 설정 관리

### uiSlice.ts 구현 예시

```typescript
interface UIState {
  // 테마
  theme: 'light' | 'dark';
  
  // 네비게이션
  sidebarOpen: boolean;
  bottomNavVisible: boolean;
  
  // 전역 로딩
  globalLoading: boolean;
  
  // 알림
  notifications: Notification[];
}
```

## 🔧 기존 코드와 연동할 부분들

### TimerWidget.tsx와 timerSlice 연동
```typescript
// src/components/common/TimerWidget.tsx
// 현재 로컬 상태 → Redux 상태로 변경 필요
```

### BottomNav.tsx와 uiSlice 연동
```typescript
// src/components/common/BottomNav.tsx  
// 현재 로컬 상태 → Redux 상태로 변경 필요
```

## 📝 체크리스트

### timerSlice.ts
- [ ] 기본 타이머 기능 (시작/정지/리셋)
- [ ] 포모도로 세션 관리
- [ ] 시간 설정 저장
- [ ] 통계 데이터 관리
- [ ] 알림 기능 연동

### uiSlice.ts  
- [ ] 테마 토글 기능
- [ ] 사이드바 상태 관리
- [ ] 전역 로딩 상태
- [ ] 알림 큐 관리

### membershipSlice.ts
- [ ] 현재 플랜 조회
- [ ] 플랜 변경
- [ ] 결제 이력 관리
- [ ] 구독 취소

### adSlice.ts
- [ ] 광고 배너 조회
- [ ] 광고 설정 관리
- [ ] 광고 차단 기능

---

**🎯 다음 액션**: `timerSlice.ts` 구현부터 시작하는 것을 추천합니다! 