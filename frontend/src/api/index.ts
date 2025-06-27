import axios from 'axios';
import { cookies } from '../utils/cookies';
import type { EnhancedStore } from '@reduxjs/toolkit';

// API 기본 URL 설정 - 개발 환경에서는 프록시(/api), 운영에서는 실제 도메인
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8088' : 'https://api.pomkist.com');

console.log('=== API 기본 설정 ===');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('DEV 모드:', import.meta.env.DEV);
console.log('최종 API_BASE_URL:', API_BASE_URL);

// Store 참조를 위한 변수 (순환 참조 방지)
let store: EnhancedStore | null = null;

// Store 설정 함수 (store에서 호출)
export const setStoreReference = (storeInstance: EnhancedStore) => {
  store = storeInstance;
};

// axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // 🔥 쿠키 전송을 위해 필수
});

// 🔥 요청 인터셉터 - store에서 토큰 가져오기
api.interceptors.request.use(
  (config) => {
    
    // Redux store에서 토큰 가져오기
    if (store) {
      const state = store.getState();
      const accessToken = state.auth?.accessToken;
      
      // console.log('Store 상태:', !!store);
      // console.log('AccessToken 존재:', !!accessToken);
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        //console.log('Authorization 헤더 설정됨');
      } else {
        console.log('AccessToken이 없음 - 인증 없이 요청');
      }
    } else {
      console.error('❌ Store reference not found in API interceptor');
    }
    
    // CORS preflight 요청 최소화를 위한 헤더 설정
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    console.error('=== API 요청 인터셉터 에러 ===', error);
    return Promise.reject(error);
  }
);

// 🔥 응답 인터셉터 - 쿠키 기반 토큰 갱신
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // CORS 에러 처리
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('Network error - possibly CORS issue:', error);
      return Promise.reject(new Error('서버에 연결할 수 없습니다. CORS 설정을 확인해주세요.'));
    }

    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // refreshToken 쿠키 확인
        if (cookies.hasRefreshToken()) {
          // 서버에 토큰 갱신 요청 (refreshToken은 쿠키로 자동 전송됨)
          const refreshUrl = import.meta.env.DEV ? '/api/auth/refresh' : `${API_BASE_URL}/api/auth/refresh`;
          const response = await axios.post(refreshUrl, {}, {
            withCredentials: true, // 쿠키 전송
          });
          
          const { accessToken } = response.data;
          
          // 🔥 Redux store에 새 토큰 설정
          if (store) {
            const { setAccessToken } = await import('../store/slices/authSlice');
            store.dispatch(setAccessToken(accessToken));
          }
          
          // 원래 요청에 새 토큰 적용
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 쿠키 제거 및 로그인 페이지로 이동
        console.error('Token refresh failed:', refreshError);
        cookies.clearAuthCookies();
        
        // Redux store도 클리어
        if (store) {
          const { clearAuth } = await import('../store/slices/authSlice');
          store.dispatch(clearAuth());
        }
        
        // 현재 페이지가 로그인 페이지가 아닌 경우에만 스낵바 표시
        if (window.location.pathname !== '/login' && store) {
          const { show401ErrorSnackbar } = await import('../store/slices/snackbarSlice');
          store.dispatch(show401ErrorSnackbar());
        }
        
        return Promise.reject(error);
      }
      
      // refreshToken이 없는 경우에도 스낵바 표시 후 자동 리디렉션
      if (window.location.pathname !== '/login') {
        cookies.clearAuthCookies();
        if (store) {
          const { clearAuth } = await import('../store/slices/authSlice');
          const { show401ErrorSnackbar } = await import('../store/slices/snackbarSlice');
          store.dispatch(clearAuth());
          store.dispatch(show401ErrorSnackbar());
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API 모듈들을 re-export
export * from './authApi';
export * from './userApi';
export * from './noteApi';
export * from './deckApi';
export * from './cardApi';
export * from './membershipApi';
export * from './timerApi';
export * from './adApi';
export * from './trashApi';

export default api;
