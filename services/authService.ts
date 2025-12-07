import { User, AuthResponse, APIError, Role } from '../types';
import { mockLogin } from './mockApi'; // Use mock API for this frontend-only example

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'current_user';

export const login = async (email: string, password: string): Promise<AuthResponse | APIError> => {
  const response = await mockLogin(email, password); // Call mock API

  if ('user' in response) {
    localStorage.setItem(TOKEN_KEY, response.user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    return response;
  } else {
    return response;
  }
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/#login'; // Redirect to login after logout
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? (JSON.parse(userJson) as User) : null;
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getCurrentUser();
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === Role.ADMIN;
};