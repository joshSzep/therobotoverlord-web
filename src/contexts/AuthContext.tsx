/**
 * Authentication Context for The Robot Overlord
 * Manages user authentication state and token handling
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { User, AuthResponse, LoginCredentials, OAuthProvider, CurrentUser } from '@/types/user';

interface AuthContextType {
  // State
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (provider: OAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update user data in state
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  /**
   * Store authentication tokens
   */
  const storeTokens = useCallback((accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    apiClient.setAuthToken(accessToken);
  }, []);

  /**
   * Clear authentication tokens
   */
  const clearTokens = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    apiClient.clearAuthToken();
  }, []);

  /**
   * Fetch current user data
   */
  const fetchCurrentUser = useCallback(async (): Promise<CurrentUser | null> => {
    try {
      const userData = await apiClient.get<CurrentUser>('/auth/me');
      return userData;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }, []);

  /**
   * Login with email/password
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Store tokens
      storeTokens(response.tokens.access_token, response.tokens.refresh_token);
      
      // Fetch full user data with permissions and preferences
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        throw new Error('Failed to fetch user data after login');
      }
    } catch (error: unknown) {
      setError((error as Error).message || 'Login failed');
      clearTokens();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [storeTokens, clearTokens, fetchCurrentUser]);

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = useCallback(async (provider: OAuthProvider) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<AuthResponse>('/auth/oauth/google', provider);
      
      // Store tokens
      storeTokens(response.tokens.access_token, response.tokens.refresh_token);
      
      // Fetch full user data
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        throw new Error('Failed to fetch user data after OAuth login');
      }
    } catch (error: unknown) {
      setError((error as Error).message || 'Google login failed');
      clearTokens();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [storeTokens, clearTokens, fetchCurrentUser]);

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refresh_token: refreshToken
      });

      // Store new tokens
      storeTokens(response.tokens.access_token, response.tokens.refresh_token);
      
      // Update user data
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error: unknown) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  }, [storeTokens, fetchCurrentUser]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint to invalidate tokens on server
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Continue with logout even if server call fails
        console.error('Server logout failed:', error);
      }
      
      // Clear local state and tokens
      clearTokens();
      setUser(null);
      setError(null);
    } catch (error: unknown) {
      console.error('Logout error:', error);
      setError((error as Error).message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [clearTokens]);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Set token in API client
        apiClient.setAuthToken(token);
        
        // Try to fetch current user
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token might be invalid, clear it
          clearTokens();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, [fetchCurrentUser, clearTokens]);

  /**
   * Set up token refresh interval
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh token every 50 minutes (tokens typically expire in 1 hour)
    const refreshInterval = setInterval(() => {
      refreshToken().catch(error => {
        console.error('Automatic token refresh failed:', error);
      });
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, refreshToken]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    refreshToken,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to require authentication (redirects to login if not authenticated)
 */
export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  return auth;
}
