import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sh_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Verify token on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('sh_token');
    if (token) {
      authAPI
        .getMe()
        .then(({ data }) => {
          setUser(data.user);
          localStorage.setItem('sh_user', JSON.stringify(data.user));
        })
        .catch(() => {
          localStorage.removeItem('sh_token');
          localStorage.removeItem('sh_user');
          setUser(null);
        })
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('sh_token', data.token);
      localStorage.setItem('sh_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Registration failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('sh_token', data.token);
      localStorage.setItem('sh_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('sh_token');
    localStorage.removeItem('sh_user');
    setUser(null);
  }, []);

  // ── Update user locally ────────────────────────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('sh_user', JSON.stringify(updatedUser));
  }, []);

  const isAuthenticated = !!user && !!localStorage.getItem('sh_token');

  return (
    <AuthContext.Provider
      value={{ user, loading, authChecked, isAuthenticated, register, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
