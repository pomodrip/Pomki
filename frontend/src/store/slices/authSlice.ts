import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import { User, LoginRequest, LoginResponse } from '../../types/api';
import { AppDispatch } from '../store';

// 타입 정의
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Thunk: 로그인 처리
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authApi.login(credentials);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

// Thunk: 로그아웃 처리
export const logoutUser = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'auth/logout',
  async (_, { dispatch }) => {
    // API 로그아웃 호출 (필요 시)
    // await authApi.logout();
    dispatch(logout());
  },
);

// 초기 상태
const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  user: null,
  status: 'idle',
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      state.status = 'idle';
    },
    setAuthState: (
      state,
      action: PayloadAction<{ accessToken: string; user: User }>,
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.status = 'succeeded';
          state.isAuthenticated = true;
          state.accessToken = action.payload.accessToken;
          state.user = action.payload.member;
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
      });
  },
});

export const { logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;