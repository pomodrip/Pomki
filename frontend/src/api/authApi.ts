import api from './index';
import { LoginCredentials, SignupData } from '../types/user';

const login = (credentials: LoginCredentials) => {
  return api.post('/auth/login', credentials);
};

const signup = (data: SignupData) => {
  return api.post('/auth/signup', data);
};

export const authApi = {
  login,
  signup,
};