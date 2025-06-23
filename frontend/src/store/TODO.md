# 🚧 상태관리 구현 현황 및 할일

## ✅ 구현 완료된 Slice들

| Slice | 상태 | 파일 크기 | 설명 |
|-------|------|-----------|------|
| authSlice | ✅ 완료 | 254줄 | 로그인, 회원가입, 인증 |
| deckSlice | ⚠️ 충돌 | 265줄 | 카드 덱 관리 (merge conflict 해결 필요) |
| noteSlice | ✅ 완료 | 155줄 | 노트 작성, 수정, 삭제 |
| studySlice | ⚠️ 최소 구현 | 43줄 | 학습 관련 상태 (확장 필요) |
| dialogSlice | ✅ 완료 | 48줄 | 모달/다이얼로그 관리 |
| snackbarSlice | ✅ 완료 | 57줄 | 알림 메시지 |
| toastSlice | ✅ 완료 | 41줄 | 토스트 메시지 |
| uiSlice | ✅ 완료 | 420줄 | 전역 UI 상태 (테마, 네비게이션, 알림) |

## 🚧 미구현된 Slice들

### 1. timerSlice.ts ❌
```typescript
// 포모도로 타이머, 집중 세션 관리
interface TimerState {
  currentSession: PomodoroSession | null;
  isRunning: boolean;
  timeRemaining: number;
  sessionType: 'work' | 'break' | 'longBreak';
  completedSessions: number;
  settings: TimerSettings;
  stats: TimerStats;
}
```

**우선순위**: 🔴 높음 (Timer 페이지들에서 필요)

**관련 페이지들**:
- `/src/pages/Timer/PomodoroPage.tsx`
- `/src/pages/Timer/FocusSessionPage.tsx` 
- `/src/pages/Timer/TimerPage.tsx`
- `/src/pages/Timer/TimerSettingsPage.tsx`
- `/src/pages/Timer/PomodoroStatsPage.tsx`

### 2. uiSlice.ts ✅
```typescript
// 전역 UI 상태 관리 - 구현 완료
interface UIState {
  theme: ThemeMode; // 'light' | 'dark' | 'system'
  sidebarOpen: boolean;
  bottomNavVisible: boolean;
  globalLoading: boolean;
  notifications: NotificationItem[];
  isMobile: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  settings: UISettings;
}
```

**우선순위**: ✅ 완료
**구현 내용**:
- 테마 관리 (light/dark/system 모드)
- 네비게이션 상태 (사이드바, 바텀 네비게이션)
- 전역 로딩 상태
- 알림 시스템 (notification queue)
- 반응형 상태 (모바일/데스크톱 감지)
- 로컬 스토리지 연동
- 커스텀 훅 (useUI, useTheme, useNotifications, useResponsiveUI)
- 사용 예제 (UIUsageExample.tsx)

### 3. adSlice.ts ❌
```typescript
// 광고 관리
interface AdState {
  banners: AdBanner[];
  preferences: AdPreferences;
  blockedAds: string[];
  loading: boolean;
  error: string | null;
}
```

**우선순위**: 🟢 낮음 (광고 기능용)

**관련 페이지들**:
- `/src/pages/Ad/AdManagementPage.tsx`
- `/src/pages/Ad/AdPreferencePage.tsx`

### 4. membershipSlice.ts ❌
```typescript
// 멤버십 관리
interface MembershipState {
  currentPlan: MembershipPlan | null;
  plans: MembershipPlan[];
  paymentHistory: Payment[];
  loading: boolean;
  error: string | null;
}
```

**우선순위**: 🟡 중간 (결제 기능)

**관련 페이지들**:
- `/src/pages/Membership/PremiumPlanPage.tsx`
- `/src/pages/Membership/PaymentPage.tsx`
- `/src/pages/Membership/CancelMembershipPage.tsx`

## 📋 구현 계획

### Phase 1: 핵심 기능 (이번 주)
1. **timerSlice.ts** 구현 - 가장 우선순위 높음
2. **deckSlice.ts** merge conflict 해결
3. **studySlice.ts** 확장 구현

### Phase 2: UI 개선 (다음 주)  
1. ~~**uiSlice.ts** 구현~~ ✅ 완료
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

### uiSlice.ts ✅ 완료 
- [x] 테마 토글 기능 (light/dark/system 모드)
- [x] 사이드바 상태 관리
- [x] 전역 로딩 상태
- [x] 알림 큐 관리
- [x] 반응형 상태 관리
- [x] 로컬 스토리지 연동
- [x] 커스텀 훅 구현
- [x] 사용 예제 작성

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