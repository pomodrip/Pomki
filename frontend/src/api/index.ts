import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';
// import { showErrorSnackbar } from '../store/slices/snackbarSlice';
     
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 인증 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 전역 에러 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 401 Unauthorized 에러 시 자동 로그아웃 처리
      store.dispatch(logout());
      // 로그인 페이지로 리디렉션 로직 추가 가능
    } else {
      // 기타 에러 발생 시 전역 스낵바 표시
      // const message = error.response?.data?.message || 'An unexpected error occurred.';
      // store.dispatch(showErrorSnackbar({ message }));
    }
    return Promise.reject(error);
  }
);

export default api;

// API 모듈들 export
export { default as authApi } from '../api'; // 나는 좋은 코드는 아니라고 생각한다.