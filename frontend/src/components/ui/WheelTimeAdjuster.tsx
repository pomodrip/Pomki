import React, { useEffect, useState, useRef } from 'react';
import { Box, styled, InputBase } from '@mui/material';
import { Text } from './';

interface WheelTimeAdjusterProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  boxWidth?: number; // 데스크톱 기준 네모 너비(선택)
}

// 컨테이너 스타일
const AdjusterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  margin: '0 8px',

  [theme.breakpoints.down('sm')]: {
    margin: '0 2px', // 모바일에서 간격 축소
  },
}));

// 휠 조절 영역 스타일
const WheelAreaBase = styled(Box)(({ theme }) => ({
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

// 화살표 컨테이너 (오른쪽 고정)
const ArrowContainer = styled(Box)({
  position: 'absolute',
  right: '6px',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  userSelect: 'none',
});

// 숫자 표시 스타일
const ValueText = styled('span')(() => ({
  fontSize: '32px',
  fontWeight: 700,
  paddingRight: '20px', // 화살표 영역 확보
}));

const WheelTimeAdjuster: React.FC<WheelTimeAdjusterProps> = ({
  value,
  onChange,
  label,
  min = 1,
  max = 120,
  step = 1,
  boxWidth,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const touchStartTime = useRef<number>(0);
  const touchMoved = useRef<boolean>(false);

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
    if (isEditing) return;
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
    touchStartTime.current = Date.now();
    touchMoved.current = false;
    e.preventDefault();
  };

  // 모바일 터치 이동 핸들러
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || isEditing || startY === 0) return;
    
    const touch = e.touches[0];
    const deltaY = startY - touch.clientY; // 위로 드래그하면 양수
    const sensitivity = 2; // 터치 감도 조절
    const valueChange = Math.floor(deltaY / (10 * sensitivity)) * step;
    
    updateValue(startValue + valueChange);
    touchMoved.current = true;
    e.preventDefault();
  };

  // 모바일 터치 종료 핸들러
  const handleTouchEnd = () => {
    if (!isMobile) return;
    
    // 탭(짧은 터치)으로 간주: 이동 거의 없고, 200ms 이하
    const duration = Date.now() - touchStartTime.current;
    if (!touchMoved.current && duration < 250) {
      setIsEditing(true);
      setInputValue(String(value));
      return; // 편집 모드 진입 시 아래 로직 skip
    }

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

  // 편집 모드 진입
  const handleDoubleClick = () => {
    setIsEditing(true);
    setInputValue(String(value));
  };

  // 입력 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 입력 확정 (Enter 또는 blur)
  const commitInput = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num)) {
      updateValue(num);
    }
    setIsEditing(false);
  };

  // 편집 모드에서 Enter 처리
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitInput();
    }
  };

  // 동적 크기 계산
  const defaultDesktopW = 90;
  const defaultMobileW = 70;
  const currentWidth = boxWidth ?? (isMobile ? defaultMobileW : defaultDesktopW);
  const currentHeight = isMobile ? 60 : 85;

  return (
    <AdjusterContainer>
      {/* <HelperText>
        휠/드래그로 조절
      </HelperText> */}
      <WheelAreaBase
        onWheel={isEditing ? undefined : handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        tabIndex={0} // 키보드 접근성
        role="spinbutton"
        aria-label={`${label} 조절. 현재 값: ${value}`}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        sx={{ width: currentWidth, height: currentHeight, fontSize: isMobile ? '24px' : '32px' }}
      >
        {isEditing ? (
          <InputBase
            inputRef={inputRef}
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={commitInput}
            onKeyDown={handleInputKeyDown}
            inputProps={{
              min,
              max,
              step,
              style: {
                textAlign: 'center',
                fontSize: '32px',
                fontWeight: 700,
                width: '100%',
              },
            }}
            sx={{ width: '100%', height: '100%' }}
            autoFocus
          />
        ) : (
          <Box sx={{ 
            position: 'relative',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}>
            <ValueText>{value}</ValueText>
            <ArrowContainer sx={{ display: isEditing ? 'none' : 'flex' }}>
              <Arrow aria-hidden>▲</Arrow>
              <Arrow aria-hidden>▼</Arrow>
            </ArrowContainer>
          </Box>
        )}
      </WheelAreaBase>
      <AdjusterLabel>
        {label}
      </AdjusterLabel>
    </AdjusterContainer>
  );
};

export default WheelTimeAdjuster; 