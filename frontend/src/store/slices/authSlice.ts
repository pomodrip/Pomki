import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import { getMyInfo } from '../../api/userApi';
import { cookies } from '../../utils/cookies';
import type { User, LoginRequest, LoginResponse } from '../../types/api';
import type { RootState } from '../store';

// 최신 인터페이스 정의 - 상태 명확화
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 초기 상태 - satisfies를 사용한 타입 안전성 향상
const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  user: null,
  status: 'idle',
  error: null,
} satisfies AuthState as AuthState;

// OAuth2 토큰 처리를 위한 새로운 액션 타입
interface OAuth2TokenPayload {
  accessToken: string;
  user: User;
}

// 🔥 기본 이메일/패스워드 로그인 thunk - 로직 보존 및 강화
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  {
    state: RootState;
    rejectValue: string;
  }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.login(credentials);
    
    // ✅ 더 이상 localStorage 사용하지 않음
    // refreshToken은 서버에서 쿠키로 설정됨
    // accessToken만 메모리(Redux store)에 저장
    
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || 'Login failed'
    );
  }
});

// OAuth2 사용자 정보 처리를 위한 새로운 async thunk
export const setOAuth2User = createAsyncThunk<
  OAuth2TokenPayload,
  OAuth2TokenPayload,
  {
    state: RootState;
    rejectValue: string;
  }
>('auth/setOAuth2User', async (payload, { rejectWithValue }) => {
  try {
    // ✅ OAuth2 토큰도 localStorage 사용하지 않음
    // 메모리(Redux store)에만 저장
    return payload;
  } catch (error: any) {
    return rejectWithValue('OAuth2 user setup failed');
  }
});

// 🔥 로그아웃 thunk - refreshToken 쿠키와 store accessToken 무효화
export const logoutUser = createAsyncThunk<
  void,
  void,
  {
    state: RootState;
  }
>('auth/logoutUser', async (_) => {
  try {
    // 1. 서버에 로그아웃 요청 (서버에서 refreshToken 쿠키 무효화)
    await authApi.logout();
  } catch (error) {
    // 로그아웃 API 실패해도 클라이언트 정리는 계속 진행
    console.warn('Logout API call failed:', error);
  } finally {
    // 2. 클라이언트에서 refreshToken 쿠키 제거
    cookies.clearAuthCookies();
    
    // 3. Redux store의 accessToken은 reducer에서 클리어됨
  }
});

// 토큰 검증 및 자동 로그인 thunk - 쿠키 기반으로 수정
export const validateToken = createAsyncThunk<
  User,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>('auth/validateToken', async (_, { rejectWithValue }) => {
  try {
    // refreshToken 쿠키가 있는지 확인
    if (!cookies.hasRefreshToken()) {
      return rejectWithValue('No refresh token found');
    }

    // 토큰으로 사용자 정보 가져오기 (서버에서 자동으로 accessToken 갱신)
    const userInfo = await getMyInfo();
    
    return {
      memberId: 0, // API에서 받아야 할 실제 값
      email: userInfo.email,
      nickname: userInfo.nickname,
      isEmailVerified: true,
      socialLogin: false, // API에서 받아야 할 실제 값
    };
  } catch (error: any) {
    // 토큰이 유효하지 않으면 쿠키 제거
    cookies.clearAuthCookies();
    return rejectWithValue('Token validation failed');
  }
});

// createSlice - 최신 패턴과 베스트 프랙티스 적용
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 🔥 로컬 로그아웃 (동기) - 쿠키와 store 모두 클리어
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      
      // 쿠키도 클리어
      cookies.clearAuthCookies();
    },
    
    // 에러 클리어
    clearError: (state) => {
      state.error = null;
    },
    
    // 상태 리셋
    resetAuthStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },

    // 🔥 accessToken 수동 설정 (토큰 갱신 등에 사용)
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
  },
  
  // extraReducers - builder 패턴 최신 방식
  extraReducers: (builder) => {
    builder
      // 🔥 일반 이메일/패스워드 로그인 케이스들 - 로직 보존
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.member;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed';
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
      })
      
      // OAuth2 사용자 설정 케이스들
      .addCase(setOAuth2User.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(setOAuth2User.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(setOAuth2User.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'OAuth2 setup failed';
      })
      
      // 🔥 로그아웃 케이스들 - 완전한 상태 클리어
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // 모든 인증 상태 클리어
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
        state.status = 'idle';
        state.error = null;
      })
      
      // 토큰 검증 케이스들
      .addCase(validateToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
        // accessToken은 API 응답에서 받아야 함 (현재는 임시로 null)
        // 실제로는 토큰 갱신 API를 호출해야 함
        state.error = null;
      })
      .addCase(validateToken.rejected, (state) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
      });
  },
});

// 액션 크리에이터 export
export const { clearAuth, clearError, resetAuthStatus, setAccessToken } = authSlice.actions;

// 셀렉터들 - 타입 안전한 셀렉터 패턴
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;

// 편의 셀렉터들
export const selectIsLoading = (state: RootState) => state.auth.status === 'loading';
export const selectIsLoggedIn = (state: RootState) => 
  state.auth.isAuthenticated && state.auth.user !== null;

// 기본 리듀서 export
export default authSlice.reducer;