'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, type User } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('qm_token');
    const storedUser = localStorage.getItem('qm_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('qm_token', res.access_token);
    localStorage.setItem('qm_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (nombre: string, email: string, password: string) => {
    const res = await authApi.register({ nombre, email, password });
    localStorage.setItem('qm_token', res.access_token);
    localStorage.setItem('qm_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
