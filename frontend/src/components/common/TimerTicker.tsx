import React from 'react';
import { useTimer } from '../../hooks/useTimer';

/**
 * TimerTicker
 * 전역에서 한 번만 렌더링되어 타이머가 실행 중일 때 매 초 tick 액션을 디스패치합니다.
 * UI 를 렌더링하지 않고, 오직 사이드이펙트(틱)만 담당합니다.
 */
const TimerTicker: React.FC = () => {
  // autoTick 을 true 로 하여 매 초 tick() 을 dispatch 한다.
  useTimer({ autoTick: true, notify: true });
  return null;
};

export default TimerTicker; 