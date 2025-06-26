# 키보드 단축키 훅 사용 가이드

## 개요

`useKeyboardShortcuts` 훅을 통해 애플리케이션 전반에서 일관된 키보드 UX를 제공합니다.

## 주요 훅들

### 1. `useKeyboardShortcuts` (기본 훅)

모든 키보드 이벤트를 세밀하게 제어할 수 있는 범용 훅입니다.

```typescript
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

useKeyboardShortcuts({
  onEnter: () => console.log('Enter 키'),
  onEscape: () => console.log('ESC 키'),
  onArrowLeft: () => console.log('← 키'),
  onArrowRight: () => console.log('→ 키'),
  enabled: true,
  isActive: () => !isInputFocused
});
```

### 2. `useDialogKeyboardShortcuts` (다이얼로그 전용)

다이얼로그에서 일반적으로 사용되는 패턴에 최적화된 훅입니다.

```typescript
import { useDialogKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

useDialogKeyboardShortcuts(
  handleConfirm,    // Enter 키 시 실행
  handleCancel,     // ESC 키 시 실행
  {
    enabled: isDialogOpen,
    allowCtrlEnter: true  // Ctrl+Enter도 확인으로 처리
  }
);
```

### 3. `useNavigationKeyboardShortcuts` (네비게이션 전용)

이전/다음 네비게이션에 최적화된 훅입니다.

```typescript
import { useNavigationKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

useNavigationKeyboardShortcuts(
  handlePrevious,   // ← 키 시 실행
  handleNext,       // → 키 시 실행
  {
    enabled: true,
    isActive: () => !isDialogOpen  // 다이얼로그가 없을 때만 작동
  }
);
```

## 실제 사용 예시

### 플래시카드 연습 페이지

```typescript
// FlashcardPracticePage.tsx
const FlashcardPracticePage: React.FC = () => {
  // ... 상태 정의 ...

  // 플래시카드 네비게이션
  useNavigationKeyboardShortcuts(
    handlePrevious,
    handleNext,
    {
      enabled: flashcards.length > 0,
      isActive: () => !showCompletionDialog && !isFeedbackOpen
    }
  );
  
  // 학습 완료 다이얼로그
  useDialogKeyboardShortcuts(
    handleCompletionConfirm,
    handleCompletionCancel,
    {
      enabled: showCompletionDialog
    }
  );

  // ...
};
```

### 덱 생성 다이얼로그

```typescript
// FlashcardDeckListPage.tsx
const FlashcardDeckListPage: React.FC = () => {
  // ... 상태 정의 ...

  // 덱 생성/수정 다이얼로그
  useDialogKeyboardShortcuts(
    handleCreateDialogConfirm,
    handleCreateDialogClose,
    {
      enabled: showCreateDialog
    }
  );

  // ...
};
```

### 카드 수정 다이얼로그

```typescript
// FlashCardListPage.tsx
const FlashCardListPage: React.FC = () => {
  // ... 상태 정의 ...

  // 카드 수정 다이얼로그
  useDialogKeyboardShortcuts(
    handleEditDialogConfirm,
    handleEditDialogClose,
    {
      enabled: showEditDialog
    }
  );

  // ...
};
```

## 지원되는 키보드 단축키

### 다이얼로그 관련
- **Enter**: 확인/저장
- **ESC**: 취소/닫기
- **Ctrl+Enter**: 강제 확인 (옵션)

### 네비게이션 관련
- **← (왼쪽 화살표)**: 이전 항목
- **→ (오른쪽 화살표)**: 다음 항목
- **↑ (위쪽 화살표)**: 위로 이동
- **↓ (아래쪽 화살표)**: 아래로 이동

### 기타
- **Space**: 선택/토글
- **Delete**: 삭제
- **Tab**: 다음 필드 이동
- **Shift+Tab**: 이전 필드 이동

## 자동 제외 요소

다음 요소들에 포커스가 있을 때는 키보드 이벤트가 자동으로 무시됩니다:

- `<input>` 태그
- `<textarea>` 태그  
- `<select>` 태그
- `[contenteditable="true"]` 요소

## 옵션 설정

### `enabled` (boolean)
훅의 활성화/비활성화를 제어합니다.

```typescript
useDialogKeyboardShortcuts(onConfirm, onCancel, {
  enabled: isDialogOpen  // 다이얼로그가 열려있을 때만 활성화
});
```

### `isActive` (function)
더 세밀한 활성화 조건을 제어할 수 있습니다.

```typescript
useNavigationKeyboardShortcuts(onPrev, onNext, {
  isActive: () => !isDialogOpen && !isInputFocused
});
```

### `allowCtrlEnter` (boolean)
Ctrl+Enter 조합키 허용 여부를 설정합니다.

```typescript
useDialogKeyboardShortcuts(onConfirm, onCancel, {
  allowCtrlEnter: true  // Ctrl+Enter도 확인으로 처리
});
```

### `preventDefault` (boolean)
브라우저 기본 동작 방지 여부를 설정합니다.

```typescript
useKeyboardShortcuts({
  onArrowLeft: handlePrevious,
  preventDefault: true  // 기본값: true
});
```

## 주의사항

1. **함수 정의 순서**: 훅에서 사용하는 함수들이 먼저 정의되어야 합니다.

2. **조건부 활성화**: `enabled`와 `isActive` 옵션을 적절히 사용하여 키보드 이벤트 충돌을 방지하세요.

3. **성능 최적화**: 불필요한 이벤트 리스너를 방지하기 위해 `enabled` 옵션을 활용하세요.

4. **접근성**: 키보드 단축키를 추가할 때는 사용자에게 이를 알려주는 UI (툴팁 등)를 함께 제공하세요.

## 확장 방법

새로운 키보드 단축키가 필요한 경우, `useKeyboardShortcuts`의 옵션을 확장하여 추가할 수 있습니다:

```typescript
export const useCustomKeyboardShortcuts = (
  onSave: () => void,
  onUndo: () => void,
  options?: { enabled?: boolean }
) => {
  useKeyboardShortcuts({
    onCtrlEnter: onSave,
    onEscape: onUndo,
    enabled: options?.enabled
  });
};
``` 