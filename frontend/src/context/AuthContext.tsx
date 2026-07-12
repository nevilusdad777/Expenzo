import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { apiClient } from '@/services/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  hasGoogleAccount: boolean;
  role: 'USER' | 'ADMIN';
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerification: boolean;
  autoLockMinutes: number;
  setAutoLockMinutes: (m: number) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  sendOTP: () => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoLockMinutes, setAutoLockMinutes] = useState(60);

  const isAuthenticated = !!user;
  const pendingVerification = isAuthenticated && !user.emailVerified;

  // Check session on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('session_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    apiClient
      .get<{ success: boolean; data: { authenticated: boolean; user: AuthUser | null } }>(
        '/api/auth/me'
      )
      .then((res) => {
        if (res.data.data.authenticated && res.data.data.user) {
          setUser(res.data.data.user);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{
      success: boolean;
      data: { user: AuthUser; token: string; autoLockMinutes: number };
    }>('/api/auth/login', { email, password });
    console.log('[Expenzo Auth] Login response:', res.data.data);
    if (res.data.data.token) {
      localStorage.setItem('session_token', res.data.data.token);
    }
    setUser(res.data.data.user);
    setAutoLockMinutes(res.data.data.autoLockMinutes);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiClient.post<{
      success: boolean;
      data: { user: AuthUser; token: string; autoLockMinutes: number };
    }>('/api/auth/register', { name, email, password, confirmPassword: password });
    console.log('[Expenzo Auth] Register response:', res.data.data);
    if (res.data.data.token) {
      localStorage.setItem('session_token', res.data.data.token);
    }
    setUser(res.data.data.user);
    setAutoLockMinutes(res.data.data.autoLockMinutes);
  }, []);

  const logout = useCallback(async () => {
    await apiClient.post('/api/auth/logout').catch(() => {});
    localStorage.removeItem('session_token');
    setUser(null);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
      await apiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
    },
    []
  );

  const forgotPassword = useCallback(async (email: string) => {
    await apiClient.post('/api/auth/forgot-password', { email });
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await apiClient.post('/api/auth/reset-password', { token, newPassword });
  }, []);

  const sendOTP = useCallback(async () => {
    await apiClient.post('/api/auth/send-otp');
  }, []);

  const verifyOTP = useCallback(async (code: string) => {
    const res = await apiClient.post<{ success: boolean; data: { user: AuthUser; token: string } }>(
      '/api/auth/verify-otp',
      { code }
    );
    if (res.data.data.token) {
      localStorage.setItem('session_token', res.data.data.token);
    }
    setUser(res.data.data.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        pendingVerification,
        autoLockMinutes,
        setAutoLockMinutes,
        login,
        register,
        logout,
        changePassword,
        forgotPassword,
        resetPassword,
        sendOTP,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}