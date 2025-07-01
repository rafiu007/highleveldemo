'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    workspaceId?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper functions to manage cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;samesite=strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie('token');
    const storedUser = getCookie('user');

    console.log('AuthProvider: Checking stored auth data');
    console.log('Token exists:', !!token);
    console.log('Stored user exists:', !!storedUser);

    if (token && storedUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(storedUser));
        console.log('Restored user from cookies:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        deleteCookie('token');
        deleteCookie('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Login attempt for:', email);
      const response = await authApi.login({ email, password });
      console.log('Login API response:', response);
      console.log('Response data:', response.data);

      const authData: AuthResponse = response.data;
      console.log('Auth data:', authData);
      console.log('Access token:', authData.accessToken);
      console.log('User data:', authData.user);

      setCookie('token', authData.accessToken, 7);
      setCookie('user', encodeURIComponent(JSON.stringify(authData.user)), 7);
      console.log('Tokens saved to cookies');

      setUser(authData.user);
      console.log('User state updated');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    workspaceId?: string,
  ): Promise<void> => {
    try {
      console.log('Signup attempt for:', email);
      const response = await authApi.signup({
        email,
        password,
        name,
        workspaceId,
      });
      console.log('Signup API response:', response.data);

      const authData: AuthResponse = response.data;

      setCookie('token', authData.accessToken, 7);
      setCookie('user', encodeURIComponent(JSON.stringify(authData.user)), 7);
      setUser(authData.user);
      console.log('Signup successful, user state updated');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      deleteCookie('token');
      deleteCookie('user');
      setUser(null);
      console.log('User logged out');
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  console.log('AuthProvider current state:', {
    user: user?.email,
    loading,
    isAuthenticated: !!user,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
