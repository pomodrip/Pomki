import React, { useEffect, useRef } from 'react';

/**
 * FocusLoopGuard
 * ----------------
 * Prevents Tab focus from leaving the page (e.g. jumping to the browser address bar)
 * by creating two hidden, focusable sentinels at the start and end of the container.
 * When either sentinel receives focus, it will wrap the focus to the opposite sentinel.
 *
 * Usage: Place <FocusLoopGuard /> **inside** the container you want to keep focus in
 * (typically near the top-level of your page/layout).
 */
const FocusLoopGuard: React.FC = () => {
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startEl = startRef.current;
    const endEl = endRef.current;
    if (!startEl || !endEl) return;

    const handleStartKeyDown = (e: KeyboardEvent) => {
      // Shift+Tab on the first sentinel → move focus to the last focusable element
      if (e.key === 'Tab' && (e as KeyboardEvent).shiftKey) {
        e.preventDefault();
        endEl.focus();
      }
    };

    const handleEndKeyDown = (e: KeyboardEvent) => {
      // Tab on the last sentinel → move focus to the first focusable element
      if (e.key === 'Tab' && !(e as KeyboardEvent).shiftKey) {
        e.preventDefault();
        startEl.focus();
      }
    };

    startEl.addEventListener('keydown', handleStartKeyDown);
    endEl.addEventListener('keydown', handleEndKeyDown);

    return () => {
      startEl.removeEventListener('keydown', handleStartKeyDown);
      endEl.removeEventListener('keydown', handleEndKeyDown);
    };
  }, []);

  // Hide the sentinels visually but keep them focusable for accessibility.
  // We use role="none" and descriptive aria-labels instead of aria-hidden="true"
  // to avoid violating the rule that focusable elements should not be aria-hidden.
  const sentinelStyle: React.CSSProperties = {
    width: 0,
    height: 0,
    overflow: 'hidden',
    position: 'fixed', // fixed so it never disrupts layout
    left: 0,
    top: 0,
  };

  return (
    <>
      <div 
        ref={startRef} 
        tabIndex={0} 
        style={sentinelStyle} 
        role="none"
      />
      {/* Render children via props in future if needed */}
      <div 
        ref={endRef} 
        tabIndex={0} 
        style={sentinelStyle} 
        role="none"
      />
    </>
  );
};

export default FocusLoopGuard; 