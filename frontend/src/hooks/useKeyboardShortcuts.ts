import { useEffect, useCallback } from 'react';

interface KeyboardShortcutOptions {
  // 다이얼로그 관련
  onEnter?: () => void;           // Enter 키 - 확인/저장
  onEscape?: () => void;          // ESC 키 - 취소/닫기
  onCtrlEnter?: () => void;       // Ctrl+Enter - 강제 확인
  
  // 네비게이션 관련
  onArrowLeft?: () => void;       // 왼쪽 화살표 - 이전
  onArrowRight?: () => void;      // 오른쪽 화살표 - 다음
  onArrowUp?: () => void;         // 위쪽 화살표 - 위로
  onArrowDown?: () => void;       // 아래쪽 화살표 - 아래로
  
  // 폼 관련
  onTab?: () => void;             // Tab 키 - 다음 필드
  onShiftTab?: () => void;        // Shift+Tab - 이전 필드
  
  // 기타
  onSpace?: () => void;           // Space 키 - 선택/토글
  onDelete?: () => void;          // Delete 키 - 삭제
  
  // 옵션
  enabled?: boolean;              // 훅 활성화 여부 (기본: true)
  preventDefault?: boolean;       // 기본 동작 방지 여부 (기본: true)
  stopPropagation?: boolean;      // 이벤트 전파 중단 여부 (기본: true)
  
  // 특정 조건에서만 작동하도록 제어
  isActive?: () => boolean;       // 활성화 조건 함수
  
  // 제외할 요소들 (기본적으로 input, textarea, select는 제외됨)
  excludeElements?: string[];     // 제외할 CSS 셀렉터 배열
  
  // 탭 네비게이션 전용 옵션
  allowTabInInputs?: boolean;     // 입력 필드에서도 탭 키 사용자 정의 처리 허용 (기본: false)
}

/**
 * 키보드 단축키를 처리하는 커스텀 훅
 * 다이얼로그, 폼, 네비게이션 등에서 일관된 키보드 UX 제공
 * 
 * @example
 * // 다이얼로그에서 사용
 * useKeyboardShortcuts({
 *   onEnter: handleSave,
 *   onEscape: handleCancel,
 *   enabled: isDialogOpen
 * });
 * 
 * // 플래시카드 네비게이션에서 사용
 * useKeyboardShortcuts({
 *   onArrowLeft: handlePrevious,
 *   onArrowRight: handleNext,
 *   isActive: () => !isDialogOpen && !isInputFocused
 * });
 */
export const useKeyboardShortcuts = (options: KeyboardShortcutOptions) => {
  const {
    onEnter,
    onEscape,
    onCtrlEnter,
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onTab,
    onShiftTab,
    onSpace,
    onDelete,
    enabled = true,
    preventDefault = true,
    stopPropagation = true,
    isActive,
    excludeElements = [],
    allowTabInInputs = false
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 훅이 비활성화된 경우 무시
    if (!enabled) return;
    
    // 사용자 정의 활성화 조건 체크
    if (isActive && !isActive()) return;
    
    // 기본 제외 요소들 (입력 필드 등)
    let defaultExcludeElements = ['select', '[contenteditable="true"]'];
    
    // allowTabInInputs가 false인 경우에만 입력 필드를 제외
    if (!allowTabInInputs) {
      defaultExcludeElements = [...defaultExcludeElements, 'input', 'textarea'];
    }
    
    const allExcludeElements = [...defaultExcludeElements, ...excludeElements];
    
    // 현재 포커스된 요소가 제외 대상인지 확인
    const activeElement = document.activeElement;
    if (activeElement) {
      const isExcluded = allExcludeElements.some(selector => 
        activeElement.matches(selector)
      );
      
      // 탭 키의 경우 특별 처리
      const { key, shiftKey } = event;
      const isTabKey = (key === 'Tab' && (onTab || onShiftTab));
      
      // 탭 키이고 allowTabInInputs가 true인 경우에는 입력 필드에서도 허용
      if (isTabKey && allowTabInInputs && activeElement.matches('input, textarea')) {
        // 입력 필드에서 탭 키는 허용하고 계속 진행
      } else if (isExcluded) {
        return;
      }
    }
    
    const { key, ctrlKey, shiftKey } = event;
    
    // Ctrl+Enter 조합
    if (ctrlKey && key === 'Enter' && onCtrlEnter) {
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();
      onCtrlEnter();
      return;
    }
    
    // Shift+Tab 조합
    if (shiftKey && key === 'Tab' && onShiftTab) {
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();
      onShiftTab();
      return;
    }
    
    // 단일 키 처리
    switch (key) {
      case 'Enter':
        if (onEnter) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onEnter();
        }
        break;
        
      case 'Escape':
        if (onEscape) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onEscape();
        }
        break;
        
      case 'ArrowLeft':
        if (onArrowLeft) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowLeft();
        }
        break;
        
      case 'ArrowRight':
        if (onArrowRight) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowRight();
        }
        break;
        
      case 'ArrowUp':
        if (onArrowUp) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowUp();
        }
        break;
        
      case 'ArrowDown':
        if (onArrowDown) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onArrowDown();
        }
        break;
        
      case 'Tab':
        if (onTab && !shiftKey) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onTab();
        }
        break;
        
      case ' ':
        if (onSpace) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onSpace();
        }
        break;
        
      case 'Delete':
        if (onDelete) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          onDelete();
        }
        break;
    }
  }, [
    enabled,
    preventDefault,
    stopPropagation,
    isActive,
    excludeElements,
    allowTabInInputs,
    onEnter,
    onEscape,
    onCtrlEnter,
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onTab,
    onShiftTab,
    onSpace,
    onDelete
  ]);

  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
};

/**
 * 다이얼로그 전용 키보드 단축키 훅
 * 일반적인 다이얼로그 패턴에 최적화됨
 */
export const useDialogKeyboardShortcuts = (
  onConfirm: () => void,
  onCancel: () => void,
  options?: {
    enabled?: boolean;
    allowCtrlEnter?: boolean;
  }
) => {
  const { enabled = true, allowCtrlEnter = true } = options || {};
  
  useKeyboardShortcuts({
    onEnter: onConfirm,
    onEscape: onCancel,
    onCtrlEnter: allowCtrlEnter ? onConfirm : undefined,
    enabled,
    isActive: () => {
      // 다이얼로그가 열려있을 때만 작동
      const dialogs = document.querySelectorAll('[role="dialog"]');
      return dialogs.length > 0;
    }
  });
};

/**
 * 네비게이션 전용 키보드 단축키 훅
 * 플래시카드, 갤러리 등에서 사용
 */
export const useNavigationKeyboardShortcuts = (
  onPrevious: () => void,
  onNext: () => void,
  options?: {
    enabled?: boolean;
    isActive?: () => boolean;
  }
) => {
  const { enabled = true, isActive } = options || {};
  
  useKeyboardShortcuts({
    onArrowLeft: onPrevious,
    onArrowRight: onNext,
    enabled,
    isActive: isActive || (() => {
      // 다이얼로그가 열려있지 않을 때만 작동
      const dialogs = document.querySelectorAll('[role="dialog"]');
      return dialogs.length === 0;
    })
  });
};

/**
 * 탭 네비게이션 전용 키보드 단축키 훅
 * BottomNav, 탭 패널 등에서 사용
 */
export const useTabNavigationKeyboardShortcuts = (
  onNextTab: () => void,
  onPreviousTab: () => void,
  options?: {
    enabled?: boolean;
    isActive?: () => boolean;
    excludeInputs?: boolean; // 입력 필드가 포커스된 경우 비활성화 (기본: true)
  }
) => {
  const { enabled = true, isActive, excludeInputs = true } = options || {};
  
  useKeyboardShortcuts({
    onTab: onNextTab,
    onShiftTab: onPreviousTab,
    enabled,
    isActive: isActive || (() => {
      // 다이얼로그가 열려있지 않을 때만 작동
      const dialogs = document.querySelectorAll('[role="dialog"]');
      const dialogsOpen = dialogs.length === 0;
      
      if (!excludeInputs) return dialogsOpen;
      
      // 입력 필드에 포커스가 없을 때만 활성화
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' ||
                           activeElement?.getAttribute('contenteditable') === 'true' ||
                           activeElement?.hasAttribute('data-slate-editor');
      
      return dialogsOpen && !isInputFocused;
    })
  });
};

/**
 * 폼 저장 전용 키보드 단축키 훅
 * 저장 버튼에 포커스가 있을 때 Enter로 저장 실행
 */
export const useFormSaveKeyboardShortcuts = (
  onSave: () => void,
  options?: {
    enabled?: boolean;
    saveButtonRef?: React.RefObject<HTMLButtonElement | null>; // 저장 버튼 참조
    saveButtonSelector?: string; // 저장 버튼 CSS 셀렉터 (기본: '[data-save-button]')
    ctrlEnterAnywhere?: boolean; // Ctrl+Enter는 어디서든 작동 (기본: true)
  }
) => {
  const { 
    enabled = true, 
    saveButtonRef, 
    saveButtonSelector = '[data-save-button]',
    ctrlEnterAnywhere = true 
  } = options || {};
  
  useKeyboardShortcuts({
    onEnter: () => {
      // Enter 키는 저장 버튼에 포커스가 있을 때만 작동
      const activeElement = document.activeElement;
      
      // 버튼 참조로 확인
      if (saveButtonRef?.current && activeElement === saveButtonRef.current) {
        onSave();
        return;
      }
      
      // CSS 셀렉터로 확인
      if (activeElement?.matches?.(saveButtonSelector)) {
        onSave();
        return;
      }
      
      // 저장 버튼의 일반적인 속성들로 확인
      if (activeElement?.tagName === 'BUTTON') {
        const buttonText = activeElement.textContent?.toLowerCase();
        const hasDataAttribute = activeElement.hasAttribute('data-save') || 
                                activeElement.hasAttribute('data-submit');
        
        if (buttonText?.includes('저장') || buttonText?.includes('save') || hasDataAttribute) {
          onSave();
        }
      }
    },
    onCtrlEnter: ctrlEnterAnywhere ? onSave : undefined,
    enabled,
    isActive: () => {
      // 다이얼로그가 열려있지 않을 때만 작동
      const dialogs = document.querySelectorAll('[role="dialog"]');
      return dialogs.length === 0;
    }
  });
};

/**
 * 폼 필드들 사이의 Tab 네비게이션을 제어하는 훅
 * 지정된 요소들 사이에서만 Tab 이동이 가능하도록 함
 */
export const useFormTabNavigation = (
  fieldRefs: React.RefObject<HTMLElement | null>[],
  options?: {
    enabled?: boolean;
    loop?: boolean; // 마지막 요소에서 첫 번째로 순환 (기본: true)
  }
) => {
  const { enabled = true, loop = true } = options || {};

  const getCurrentIndex = () => {
    const activeElement = document.activeElement;
    return fieldRefs.findIndex(ref => ref.current === activeElement);
  };

  const focusNext = () => {
    const currentIndex = getCurrentIndex();
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= fieldRefs.length) {
      nextIndex = loop ? 0 : fieldRefs.length - 1;
    }
    
    const nextElement = fieldRefs[nextIndex]?.current;
    if (nextElement) {
      nextElement.focus();
    }
  };

  const focusPrevious = () => {
    const currentIndex = getCurrentIndex();
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = loop ? fieldRefs.length - 1 : 0;
    }
    
    const prevElement = fieldRefs[prevIndex]?.current;
    if (prevElement) {
      prevElement.focus();
    }
  };

  useKeyboardShortcuts({
    onTab: focusNext,
    onShiftTab: focusPrevious,
    enabled,
    isActive: () => {
      // 현재 포커스된 요소가 관리 대상 요소 중 하나일 때만 작동
      const currentIndex = getCurrentIndex();
      return currentIndex !== -1;
    }
  });
};

export default useKeyboardShortcuts; 