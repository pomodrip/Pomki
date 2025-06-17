import { useAppSelector } from './useRedux';

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  
  return {
    user: auth.user,
    token: auth.token,
    isLoggedIn: !!auth.token,
    isLoading: auth.isLoading,
    error: auth.error,
  };
};
