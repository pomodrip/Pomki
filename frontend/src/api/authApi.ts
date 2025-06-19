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

// authApi 객체로 모든 함수들을 그룹화하여 export
export const authApi = {
  login,
  logout,
  refreshToken,
  signup,
  sendEmailVerification,
  verifyEmailCode,
};
