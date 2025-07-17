import { useAppSelector } from './useRedux';

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  
  return {
    user: auth.user,
    token: auth.accessToken,
    isLoggedIn: !!auth.accessToken,
    isLoading: auth.status === 'loading',
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    isInitialized: auth.isInitialized,
  };
};
