import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string, department?: string) => Promise<void>;
  logout: () => void;
  switchUser: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('traceback_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('traceback_token');
      if (storedToken) {
        try {
          const me = await api.getMe();
          setUser(me);
        } catch (e) {
          console.warn('Session expired or invalid, defaulting to demo student');
          // Auto login as demo student
          await autoLoginDemo('student');
        }
      } else {
        await autoLoginDemo('student');
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const autoLoginDemo = async (targetRole: UserRole) => {
    try {
      const email = targetRole === 'admin' 
        ? 'admin@traceback.demo' 
        : targetRole === 'staff' 
          ? 'staff@traceback.demo' 
          : 'student@traceback.demo';
      const res = await api.login(email, 'password123');
      localStorage.setItem('traceback_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (e) {
      console.error('Failed to auto-login demo account', e);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('traceback_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: string, department?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password, role, department });
      localStorage.setItem('traceback_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('traceback_token');
    setToken(null);
    setUser(null);
  };

  const switchUser = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      await autoLoginDemo(targetRole);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (user?.role as UserRole) || 'student',
        token,
        isLoading,
        login,
        register,
        logout,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
