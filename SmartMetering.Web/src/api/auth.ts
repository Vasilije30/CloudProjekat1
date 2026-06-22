import { post, get } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
  role: string;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/api/auth/login', data);
}

export function forgotPassword(email: string): Promise<void> {
  return post<void>('/api/auth/forgot-password', { email });
}

export function setPassword(token: string, password: string, confirmPassword: string): Promise<void> {
  return post<void>('/api/auth/set-password', { token, password, confirmPassword });
}

export function getCurrentUser(): Promise<CurrentUserResponse> {
  return get<CurrentUserResponse>('/api/auth/me');
}
