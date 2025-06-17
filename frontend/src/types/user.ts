export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  membership: 'free' | 'premium' | 'pro';
  studyGoals?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  studyGoals?: string[];
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface UpdateProfileData {
  displayName?: string;
  avatar?: string;
  studyGoals?: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  emailNotifications: boolean;
  language: string;
  timezone: string;
}
