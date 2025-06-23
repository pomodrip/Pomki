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
| uiSlice | ✅ 완료 (확장됨) | 520줄 | 전역 UI 상태 (테마, 네비게이션, 알림, 프리셋) |

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

### 2. uiSlice.ts ✅ **확장 완료**
```typescript
// 전역 UI 상태 관리 - 대폭 확장됨
interface UIState {
  theme: ThemeMode; // 'light' | 'dark' | 'system'
  currentPreset: ThemePreset; // 테마 프리셋 시스템
  themePresets: ThemePreset[]; // 기본 + 커스텀 프리셋
  sidebarOpen: boolean;
  bottomNavVisible: boolean;
  globalLoading: boolean;
  loadingStack: string[]; // 여러 로딩 동시 지원
  notifications: NotificationItem[];
  notificationQueue: NotificationItem[]; // 알림 큐
  isMobile: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  settings: UISettings; // 접근성, 알림 설정 등
}
```

**우선순위**: ✅ **완료 및 확장됨**

**새로 구현된 기능들**:
- 🎨 **테마 프리셋 시스템**: 4가지 기본 프리셋 (기본, 포레스트, 선셋, 오션) + 커스텀 프리셋 지원
- 📱 **스택 기반 로딩**: 여러 로딩 작업 동시 관리, 순차적 완료 지원
- 🔔 **확장된 알림 시스템**: 
  - 액션 버튼이 있는 알림
  - 여러 알림 동시 표시 (최대 5개)
  - 알림 큐 자동 처리
  - 위치 설정 (4방향)
  - 지속적 알림 지원
- ♿ **접근성 설정**: 고대비 모드, 폰트 크기 조절, 애니메이션 감소
- 🔧 **실제 페이지 적용**: NoteListPage, TimerPage, ProfilePage, NoteCreatePage

**확장된 컴포넌트들**:
- `GlobalNotifications.tsx` (150줄) - 여러 알림 동시 표시, 액션 버튼 지원
- `UIUsageExample.tsx` (500줄) - 모든 새 기능 시연

**페이지 적용 현황**:
- ✅ `NoteListPage.tsx` - Redux 알림 + 로딩 시스템 적용
- ✅ `NoteCreatePage.tsx` - Redux 알림 시스템 적용  
- ✅ `TimerPage.tsx` - alert() → Redux 알림으로 교체
- ✅ `ProfilePage.tsx` - 로그아웃 시 Redux 알림 적용
- ✅ `Header.tsx` - 테마 토글 버튼 추가
- ✅ `App.tsx` - 확장된 알림 시스템 연동

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

### Phase 2: UI 개선 ✅ **완료됨**
1. ~~**uiSlice.ts** 구현~~ ✅ 완료 및 대폭 확장
   - 테마 프리셋 시스템 구현
   - 알림 시스템 확장 (액션 버튼, 여러 알림 동시 표시)
   - 로딩 스택 시스템 구현
   - 접근성 설정 추가
   - 실제 페이지 적용 완료
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

### uiSlice.ts ✅ **확장 완료**

```typescript
interface UIState {
  // 테마 (확장됨)
  theme: 'light' | 'dark' | 'system';
  currentPreset: ThemePreset;
  themePresets: ThemePreset[];
  
  // 네비게이션
  sidebarOpen: boolean;
  bottomNavVisible: boolean;
  
  // 전역 로딩 (스택 기반)
  globalLoading: boolean;
  loadingStack: string[];
  
  // 알림 (대폭 확장)
  notifications: NotificationItem[];
  notificationQueue: NotificationItem[];
  
  // 설정
  settings: {
    accessibility: AccessibilitySettings;
    notifications: NotificationSettings;
    animations: AnimationSettings;
  };
}
```

## 🔧 기존 코드와 연동할 부분들

### TimerWidget.tsx와 timerSlice 연동
```typescript
// src/components/common/TimerWidget.tsx
// 현재 로컬 상태 → Redux 상태로 변경 필요
```

### BottomNav.tsx와 uiSlice 연동 ✅ **완료**
```typescript
// src/components/common/BottomNav.tsx  
// ✅ 완료: 로컬 상태 → Redux 상태로 변경됨
```

## 📝 체크리스트

### timerSlice.ts
- [ ] 기본 타이머 기능 (시작/정지/리셋)
- [ ] 포모도로 세션 관리
- [ ] 시간 설정 저장
- [ ] 통계 데이터 관리
- [ ] 알림 기능 연동

### uiSlice.ts ✅ **확장 완료**
- [x] 테마 토글 기능 (light/dark/system 모드)
- [x] **NEW**: 테마 프리셋 시스템 (4가지 기본 + 커스텀)
- [x] 사이드바 상태 관리
- [x] 전역 로딩 상태
- [x] **NEW**: 스택 기반 로딩 (여러 로딩 동시 지원)
- [x] 알림 큐 관리
- [x] **NEW**: 액션 버튼이 있는 알림
- [x] **NEW**: 여러 알림 동시 표시
- [x] **NEW**: 알림 위치 설정
- [x] 반응형 상태 관리
- [x] **NEW**: 접근성 설정 (고대비, 폰트 크기, 애니메이션)
- [x] 로컬 스토리지 연동
- [x] 커스텀 훅 구현
- [x] **NEW**: 확장된 사용 예제 작성 (500줄)
- [x] **NEW**: 실제 페이지 적용 (5개 페이지)

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

**🎉 Phase 2 완료**: UI 시스템이 대폭 확장되어 프로덕션 레벨의 기능을 제공합니다! 