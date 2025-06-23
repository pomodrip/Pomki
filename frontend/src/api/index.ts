import axios from 'axios';
import { cookies } from '../utils/cookies';
import type { EnhancedStore } from '@reduxjs/toolkit';

// API 기본 URL 설정 - 개발 환경에서는 프록시 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8088' : 'http://localhost:8088');

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
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
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
        // �� 토큰 갱신 실패 시 쿠키 제거 및 로그인 페이지로 이동
        console.error('Token refresh failed:', refreshError);
        cookies.clearAuthCookies();
        
        // Redux store도 클리어
        if (store) {
          const { clearAuth } = await import('../store/slices/authSlice');
          store.dispatch(clearAuth());
        }
        
        window.location.href = '/login';
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
