import type { AxiosResponse } from 'axios';
import api from './index';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  EmailVerificationRequest,
  VerificationCodeRequest,
  VerificationCodeResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ApiResponse,
} from '../types/api';

// 로그인
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response: AxiosResponse<LoginResponse> = await api.post('/api/auth/login', data);
  return response.data;
};

// 로그아웃 
export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

// 토큰 갱신
export const refreshToken = async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
  const response: AxiosResponse<RefreshTokenResponse> = await api.post('/api/auth/refresh', data);
  return response.data;
};

// 쿠키 기반 토큰 갱신 (refreshToken이 쿠키로 자동 전송됨)
export const refreshTokenFromCookie = async (): Promise<RefreshTokenResponse> => {
  const response: AxiosResponse<RefreshTokenResponse> = await api.post('/api/auth/refresh', {});
  return response.data;
};

// 회원가입
export const signup = async (data: SignupRequest): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post('/api/members', data);
  return response.data;
};

// 이메일 인증 요청
export const sendEmailVerification = async (data: EmailVerificationRequest): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post('/api/email/verification', data);
  return response.data;
};

// 인증코드 확인
export const verifyEmailCode = async (data: VerificationCodeRequest): Promise<VerificationCodeResponse> => {
  const response: AxiosResponse<VerificationCodeResponse> = await api.post('/api/email/code', data);
  return response.data;
};

// 회원 탈퇴
export const deleteUser = async (): Promise<void> => {
  await api.delete('/api/members/me');
};

// 구글 로그인 - 브라우저 리다이렉트
export const redirectToGoogleLogin = (): void => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV ? 'http://localhost:5173' : 'http://localhost:8088');
  window.location.href = `${baseUrl}/oauth2/authorization/google`;
};

// 카카오 로그인 - 브라우저 리다이렉트
export const redirectToKakaoLogin = (): void => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.DEV ? 'http://localhost:5173' : 'http://localhost:8088');
  window.location.href = `${baseUrl}/oauth2/authorization/kakao`;
};

// authApi 객체로 모든 함수들을 그룹화하여 export
export const authApi = {
  redirectToGoogleLogin,
  redirectToKakaoLogin,
  login,
  logout,
  refreshToken,
  refreshTokenFromCookie,
  signup,
  sendEmailVerification,
  verifyEmailCode,
  deleteUser
};
