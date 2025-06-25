import React, { useEffect, useState } from 'react';
import { Box, styled } from '@mui/material';
import { Text } from './';

interface WheelTimeAdjusterProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

// 컨테이너 스타일
const AdjusterContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
}));

// 휠 조절 영역 스타일
const WheelArea = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '12px',
  backgroundColor: '#F3F4F6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  fontWeight: 700,
  color: theme.palette.text.primary, // theme 색상 적용
  marginBottom: '8px',
  cursor: 'pointer',
  userSelect: 'none',
  fontFamily: theme.typography.fontFamily, // KoddiUD 폰트 적용
  
  [theme.breakpoints.down('sm')]: {
    width: '65px', // 모바일에서 너비 줄임
    height: '65px', // 모바일에서 높이 줄임
    fontSize: '24px', // 모바일에서 폰트 크기 줄임
  },
}));

// 라벨 스타일
const AdjusterLabel = styled(Text)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 500,
  color: theme.palette.text.secondary, // theme 색상 적용
  textAlign: 'center',
  fontFamily: theme.typography.fontFamily, // KoddiUD 폰트 적용
}));

// 화살표 스타일
const Arrow = styled('div')({
  fontSize: '15px', // 크기 줄임
  color: '#A1A1AA',
  userSelect: 'none',
  pointerEvents: 'none', // 클릭 이벤트 방지
  lineHeight: 1,
});

// 숫자 표시 스타일
const ValueText = styled('span')(() => ({
  fontSize: '32px',
  fontWeight: 700,
}));

const WheelTimeAdjuster: React.FC<WheelTimeAdjusterProps> = ({
  value,
  onChange,
  label,
  min = 1,
  max = 120,
  step = 1,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

  // 모바일 환경 감지
  useEffect(() => {
    const ua = navigator.userAgent;
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(ua));
  }, []);

  // 값 변경 함수 (범위 제한 포함)
  const updateValue = (newValue: number) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
  };

  // 데스크톱 마우스 휠 핸들러
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    
    if (delta < 0) {
      updateValue(value + step);
    } else if (delta > 0) {
      updateValue(value - step);
    }
  };

  // 모바일 터치 시작 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setStartValue(value);
    e.preventDefault();
  };

  // 모바일 터치 이동 핸들러
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || startY === 0) return;
    
    const touch = e.touches[0];
    const deltaY = startY - touch.clientY; // 위로 드래그하면 양수
    const sensitivity = 2; // 터치 감도 조절
    const valueChange = Math.floor(deltaY / (10 * sensitivity)) * step;
    
    updateValue(startValue + valueChange);
    e.preventDefault();
  };

  // 모바일 터치 종료 핸들러
  const handleTouchEnd = () => {
    if (!isMobile) return;
    
    setStartY(0);
    setStartValue(0);
  };

  // 키보드 핸들러 (접근성)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateValue(value + step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateValue(value - step);
    }
  };

  return (
    <AdjusterContainer>
      {/* <HelperText>
        휠/드래그로 조절
      </HelperText> */}
      <WheelArea
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0} // 키보드 접근성
        role="spinbutton"
        aria-label={`${label} 조절. 현재 값: ${value}`}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          gap: '4px' // 숫자와 화살표 사이 간격
        }}>
          
          <ValueText>{value}</ValueText>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Arrow aria-hidden>▲</Arrow>
            <Arrow aria-hidden>▼</Arrow>
          </Box>
        </Box>
      </WheelArea>
      <AdjusterLabel>
        {label}
      </AdjusterLabel>
    </AdjusterContainer>
  );
};

export default WheelTimeAdjuster; 