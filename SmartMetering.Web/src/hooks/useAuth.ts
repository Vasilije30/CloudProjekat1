import { useState, useCallback } from 'react';

export interface AuthState {
  token: string | null;
  role: string | null;
  email: string | null;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => ({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    email: localStorage.getItem('email'),
  }));

  const loginStore = useCallback((token: string, role: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('email', email);
    setAuth({ token, role, email });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setAuth({ token: null, role: null, email: null });
  }, []);

  const isAuthenticated = !!auth.token;

  return {
    token: auth.token,
    role: auth.role,
    email: auth.email,
    isAuthenticated,
    loginStore,
    logout,
  };
}
