import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './useRedux';
import { hideSnackbar } from '../store/slices/snackbarSlice';
import { clearAuth } from '../store/slices/authSlice';
import { cookies } from '../utils/cookies';

/**
 * 🟡 React Hooks 활용 - 스낵바 자동 리디렉션 로직 처리
 * Redux store의 redirectConfig를 기반으로 자동 리디렉션을 처리합니다.
 */
export const useSnackbarRedirect = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const snackbar = useAppSelector((state) => state.snackbar);

  useEffect(() => {
    const { redirectConfig } = snackbar;
    
    // 리디렉션 설정이 있고 활성화되어 있을 때만 처리
    if (redirectConfig?.enabled && snackbar.open) {
      // 현재 페이지가 목적지 페이지가 아닌 경우에만 리디렉션
      if (window.location.pathname !== redirectConfig.targetPath) {
        const redirectTimer = setTimeout(() => {
          // 인증 정보 클리어가 필요한 경우
          if (redirectConfig.shouldClearAuth) {
            cookies.clearAuthCookies();
            dispatch(clearAuth());
          }
          
          // 스낵바 숨기기
          dispatch(hideSnackbar());
          
          // 리디렉션 실행
          navigate(redirectConfig.targetPath);
        }, redirectConfig.delay);

        return () => clearTimeout(redirectTimer);
      }
    }
  }, [snackbar.open, snackbar.redirectConfig, navigate, dispatch]);

  return {
    isRedirecting: snackbar.redirectConfig?.enabled && snackbar.open,
    redirectDelay: snackbar.redirectConfig?.delay || 0,
    targetPath: snackbar.redirectConfig?.targetPath,
  };
}; 