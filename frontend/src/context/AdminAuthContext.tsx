import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/services/apiClient';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AdminAuthContextValue {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin is already logged in on mount
  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: { authenticated: boolean; admin: AdminProfile | null } }>(
        '/api/admin/auth/me'
      )
      .then((r) => {
        if (r.data.data.authenticated && r.data.data.admin) {
          setAdmin(r.data.data.admin);
        }
      })
      .catch(() => {/* not logged in */})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await apiClient.post<{ success: boolean; data: { admin: AdminProfile; token: string } }>(
      '/api/admin/auth/login',
      { email, password }
    );
    if (r.data.data.token) {
      localStorage.setItem('admin_token', r.data.data.token);
    }
    setAdmin(r.data.data.admin);
  };

  const logout = async () => {
    await apiClient.post('/api/admin/auth/logout');
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, isAuthenticated: !!admin, isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
