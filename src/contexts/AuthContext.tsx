"use client";

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authApi, checkAuthStatus } from '@/lib/auth';
import type { User, AuthState, EmailLoginRequest, RegisterRequest } from '@/types/auth';

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth context type
interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  loginWithEmail: (credentials: EmailLoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const user = await checkAuthStatus();
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to check authentication status' });
      }
    };

    initAuth();
  }, []);

  // Login function - redirects to OAuth
  const login = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const loginResponse = await authApi.initiateLogin();
      
      // Redirect to OAuth provider
      window.location.href = loginResponse.data.authorization_url;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initiate login' });
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch({ type: 'LOGOUT' });
      console.error('Logout error:', error);
    }
  }, []);

  // Logout all sessions
  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch({ type: 'LOGOUT' });
      console.error('Logout all error:', error);
    }
  }, []);

  // Email/password login function
  const loginWithEmail = useCallback(async (credentials: EmailLoginRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authApi.loginWithEmail(credentials);
      
      if (response.success && response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Login failed' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to login with email' });
    }
  }, []);

  // Registration function
  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authApi.register(userData);
      
      if (response.success && response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Registration failed' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to register user' });
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const user = await checkAuthStatus();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh user data' });
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    loginWithEmail,
    register,
    logout,
    logoutAll,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
