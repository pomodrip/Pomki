import React, { useState, useCallback } from 'react';
import { Box, Skeleton, styled } from '@mui/material';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
}

const ImageContainer = styled(Box)<{ $width?: number | string; $height?: number | string }>(
  ({ $width, $height }) => ({
    position: 'relative',
    display: 'inline-block',
    width: $width || 'auto',
    height: $height || 'auto',
    overflow: 'hidden',
  })
);

const StyledImage = styled('img')<{ $isLoaded: boolean }>(({ $isLoaded }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'opacity 0.3s ease-in-out',
  opacity: $isLoaded ? 1 : 0,
}));

const PlaceholderSkeleton = styled(Skeleton)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
});

// WebP 지원 여부 확인
const checkWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// 이미지 URL을 WebP 형식으로 변환 (가능한 경우)
const getOptimizedImageUrl = (src: string, quality: number = 85): string => {
  // 이미 WebP 형식인 경우
  if (src.includes('.webp')) {
    return src;
  }
  
  // 외부 이미지인 경우 원본 반환
  if (src.startsWith('http') && !src.includes(window.location.origin)) {
    return src;
  }
  
  // 로컬 이미지인 경우 WebP 변환 시도
  // 실제 서버에서는 이미지 최적화 서비스를 사용해야 함
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  // 품질 파라미터 추가 (서버에서 지원하는 경우)
  if (src.includes('?')) {
    return `${webpSrc}&quality=${quality}`;
  } else {
    return `${webpSrc}?quality=${quality}`;
  }
};

// 반응형 이미지 srcSet 생성
const generateSrcSet = (src: string, quality: number): string => {
  const baseUrl = src.split('?')[0];
  const params = new URLSearchParams(src.split('?')[1] || '');
  params.set('quality', quality.toString());
  
  const sizes = [320, 640, 768, 1024, 1280, 1920];
  
  return sizes
    .map(size => {
      const sizeParams = new URLSearchParams(params);
      sizeParams.set('w', size.toString());
      return `${baseUrl}?${sizeParams.toString()} ${size}w`;
    })
    .join(', ');
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  priority = false,
  sizes = '100vw',
  className,
  style,
  onLoad,
  onError,
  lazy = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);

  // WebP 지원 확인
  React.useEffect(() => {
    checkWebPSupport().then(setWebpSupported);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsError(true);
    onError?.();
  }, [onError]);

  // WebP 지원 확인이 완료되지 않은 경우 스켈레톤 표시
  if (webpSupported === null) {
    return (
      <ImageContainer $width={width} $height={height} className={className} style={style}>
        <PlaceholderSkeleton variant="rectangular" />
      </ImageContainer>
    );
  }

  // 최적화된 이미지 URL 생성
  const optimizedSrc = webpSupported ? getOptimizedImageUrl(src, quality) : src;
  const srcSet = generateSrcSet(src, quality);

  return (
    <ImageContainer $width={width} $height={height} className={className} style={style}>
      {/* 플레이스홀더 */}
      {!isLoaded && !isError && (
        <>
          {placeholder === 'blur' && blurDataURL ? (
            <StyledImage
              src={blurDataURL}
              alt=""
              $isLoaded={true}
              style={{
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
              }}
            />
          ) : (
            <PlaceholderSkeleton variant="rectangular" />
          )}
        </>
      )}

      {/* 실제 이미지 */}
      {!isError && (
        <StyledImage
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          $isLoaded={isLoaded}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy && !priority ? 'lazy' : 'eager'}
          decoding="async"
          style={{
            position: isLoaded ? 'static' : 'absolute',
            top: 0,
            left: 0,
            ...style,
          }}
        />
      )}

      {/* 에러 상태 */}
      {isError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.200',
            color: 'grey.500',
            fontSize: '14px',
          }}
        >
          이미지를 불러올 수 없습니다
        </Box>
      )}
    </ImageContainer>
  );
};

export default OptimizedImage; 