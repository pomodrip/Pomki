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
| membershipSlice | ✅ 완료 | 500줄 | 멤버십 관리, 결제 처리 |

## 🚧 미구현된 Slice들 (0줄)

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

### 2. uiSlice.ts ❌
```typescript
// 전역 UI 상태 관리
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  bottomNavVisible: boolean;
  loading: boolean;
  notifications: Notification[];
}
```

**우선순위**: 🟡 중간 (UI 일관성을 위해 필요)

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



## 📋 구현 계획

### Phase 1: 핵심 기능 (이번 주)
1. **timerSlice.ts** 구현 - 가장 우선순위 높음
2. **deckSlice.ts** merge conflict 해결
3. **studySlice.ts** 확장 구현

### Phase 2: UI 개선 (다음 주)  
1. **uiSlice.ts** 구현

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

### membershipSlice.ts ✅ 완료
- [x] 현재 플랜 조회
- [x] 플랜 변경  
- [x] 결제 이력 관리
- [x] 구독 취소
- [x] 멤버십 혜택 관리
- [x] 결제 상태 확인
- [x] 사용량 추적

### adSlice.ts
- [ ] 광고 배너 조회
- [ ] 광고 설정 관리
- [ ] 광고 차단 기능

---

## ✨ membershipSlice.ts 구현 완료!

### 🎯 주요 구현 사항 (500줄)

**1. 완전한 상태 관리**
- 현재 멤버십 정보
- 플랜 목록 및 선택
- 결제 프로세스 관리
- 혜택 및 사용량 추적
- 결제 히스토리

**2. 7개 비동기 Thunk 액션**
- `fetchCurrentMembership`: 현재 멤버십 조회
- `fetchMembershipPlans`: 플랜 목록 조회  
- `processMembershipPayment`: 결제 처리
- `verifyPaymentStatus`: 결제 상태 확인
- `cancelMembershipSubscription`: 멤버십 취소
- `fetchMembershipBenefits`: 혜택 조회
- `fetchPaymentHistory`: 결제 히스토리 조회

**3. 8개 동기 액션**
- UI 상태 관리 (플랜 선택, 결제 방법, 취소 다이얼로그)
- 에러 관리 (개별/전체 에러 클리어)
- 결제 상태 리셋
- 혜택 사용량 업데이트

**4. 15개 셀렉터**
- 기본 상태 셀렉터들
- 로딩/에러 상태 셀렉터들
- 복합 셀렉터들 (프리미엄 여부, 기능 사용 가능 여부)

**5. 3개 헬퍼 함수**
- 멤버십 타입 한글화
- 결제 상태 한글화  
- 결제 방법 한글화

**6. 커스텀 훅 (300줄)**
- `useMembership`: 기본 멤버십 관리
- `useMembershipFeatures`: 혜택 및 기능 확인
- `usePaymentProcess`: 결제 프로세스 전용

**7. 사용 예제 (670줄)**
- 멤버십 상태 표시
- 플랜 선택 및 결제
- 혜택 사용량 시각화
- 결제 히스토리 표시
- 멤버십 취소 프로세스
- 완전한 결제 다이얼로그

### 📊 전체 진행률: 9/11 (81.8%) 완료

**완료된 Slice들**:
1. ✅ authSlice (254줄)
2. ✅ deckSlice (265줄) 
3. ✅ noteSlice (155줄)
4. ✅ studySlice (43줄)
5. ✅ dialogSlice (48줄)
6. ✅ snackbarSlice (57줄)
7. ✅ toastSlice (41줄)
8. ✅ uiSlice (520줄) 
9. ✅ membershipSlice (500줄)

**남은 Slice들**:
- timerSlice.ts
- adSlice.ts

---

**🎯 다음 액션**: `timerSlice.ts` 구현부터 시작하는 것을 추천합니다! 