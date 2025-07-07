// 공통 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// 페이지네이션 응답 타입
export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 에러 응답 타입
export interface ApiError {
  success: false;
  message: string;
  verificationToken?: string;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 사용자 정보
export interface User {
  memberId: number;
  email: string;
  nickname: string;
  isEmailVerified: boolean;
  socialLogin: boolean;
  hasSeenIntroduction?: boolean;
}

// 로그인 응답
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  member: User;
}

// 회원가입 요청
export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  verificationToken: string;
}

// 이메일 인증 요청
export interface EmailVerificationRequest {
  email: string;
  type: 'SIGNUP' | 'EMAIL_CHANGE';
}

// 인증코드 확인 요청
export interface VerificationCodeRequest {
  email: string;
  verificationCode: string;
  type: 'SIGNUP' | 'EMAIL_CHANGE';
}

// 인증코드 확인 응답
export interface VerificationCodeResponse {
  success: boolean;
  message: string;
  verificationToken?: string;
}

// 토큰 갱신 요청
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 토큰 갱신 응답
export interface RefreshTokenResponse {
  accessToken: string;
}
