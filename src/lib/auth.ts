import axios from 'axios';
import type { LoginResponse, AuthResponse, RefreshResponse, LogoutResponse, User, EmailLoginRequest, RegisterRequest, EmailAuthResponse } from '@/types/auth';

// Create auth-specific axios instance
const authClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API functions
export const authApi = {
  // Initiate login flow
  initiateLogin: async (): Promise<LoginResponse> => {
    const response = await authClient.get<LoginResponse>('/login');
    return response.data;
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    const response = await authClient.get<AuthResponse>('/me');
    return response.data.data;
  },

  // Refresh tokens
  refreshTokens: async (): Promise<RefreshResponse> => {
    const response = await authClient.post<RefreshResponse>('/refresh');
    return response.data;
  },

  // Logout (single session)
  logout: async (): Promise<LogoutResponse> => {
    const response = await authClient.post<LogoutResponse>('/logout', {
      revoke_all_sessions: false,
    });
    return response.data;
  },

  // Logout all sessions
  logoutAll: async (): Promise<LogoutResponse> => {
    const response = await authClient.post<LogoutResponse>('/logout', {
      revoke_all_sessions: true,
    });
    return response.data;
  },

  // Email/password login
  loginWithEmail: async (credentials: EmailLoginRequest): Promise<EmailAuthResponse> => {
    const response = await authClient.post<EmailAuthResponse>('/login/email', credentials);
    return response.data;
  },

  // User registration
  register: async (userData: RegisterRequest): Promise<EmailAuthResponse> => {
    const response = await authClient.post<EmailAuthResponse>('/register', userData);
    return response.data;
  },
};

// Token refresh utility
export const refreshTokensIfNeeded = async (): Promise<boolean> => {
  try {
    await authApi.refreshTokens();
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Check if user is authenticated by trying to get current user
export const checkAuthStatus = async (): Promise<User | null> => {
  try {
    return await authApi.getCurrentUser();
  } catch (error) {
    // If 401, try to refresh tokens
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const refreshed = await refreshTokensIfNeeded();
      if (refreshed) {
        try {
          return await authApi.getCurrentUser();
        } catch (retryError) {
          return null;
        }
      }
    }
    return null;
  }
};
