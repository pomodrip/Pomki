import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  
  // 1024px 이상: 데스크톱 (헤더 네비게이션만 표시)
  // 1024px 미만: 모바일/태블릿 (푸터 네비게이션 표시)
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // 구체적인 구간별 분류 (필요시 사용)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg')); // 600~1023px
  
  return {
    isMobile: !isDesktop, // 1024px 미만은 모두 모바일로 취급 (푸터 표시)
    isTablet,
    isDesktop,
  };
};

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};
