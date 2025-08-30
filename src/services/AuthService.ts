/**
 * Authentication service for The Robot Overlord
 * Handles user authentication, registration, and session management
 */

import { BaseService } from './BaseService';
import { User, AuthTokens, UserRole, UserStatus } from '@/types/user';
import { ApiResponse } from '@/types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleAuthData {
  token: string;
  redirectUrl?: string;
}

export class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.post('/login', credentials);
  }

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.post('/register', data);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.post('/logout');
  }

  /**
   * Refresh authentication tokens
   */
  async refreshTokens(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return this.post('/refresh', { refreshToken });
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get('/me');
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.patch('/me', data);
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<{ message: string }>> {
    return this.post('/change-password', data);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.post('/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<{ message: string }>> {
    return this.post('/reset-password', data);
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.post('/verify-email', { token });
  }

  /**
   * Resend email verification
   */
  async resendVerification(): Promise<ApiResponse<{ message: string }>> {
    return this.post('/resend-verification');
  }

  /**
   * Google OAuth login
   */
  async googleLogin(data: GoogleAuthData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.post('/google', data);
  }

  /**
   * Get Google OAuth URL
   */
  async getGoogleAuthUrl(redirectUrl?: string): Promise<ApiResponse<{ url: string }>> {
    const params = redirectUrl ? { redirectUrl } : undefined;
    return this.get('/google/url', params);
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete('/me', { data: { password } });
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<ApiResponse<User>> {
    return this.patch(`/users/${userId}/role`, { role });
  }

  /**
   * Update user status (admin/moderator only)
   */
  async updateUserStatus(userId: string, status: UserStatus, reason?: string): Promise<ApiResponse<User>> {
    return this.patch(`/users/${userId}/status`, { status, reason });
  }

  /**
   * Get user sessions
   */
  async getSessions(): Promise<ApiResponse<Array<{
    id: string;
    deviceInfo: string;
    ipAddress: string;
    lastActive: string;
    isCurrent: boolean;
  }>>> {
    return this.get('/sessions');
  }

  /**
   * Revoke user session
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/sessions/${sessionId}`);
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<ApiResponse<{ message: string }>> {
    return this.post('/sessions/revoke-all');
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<ApiResponse<{ qrCode: string; secret: string }>> {
    return this.post('/2fa/enable');
  }

  /**
   * Verify and activate two-factor authentication
   */
  async verifyTwoFactor(token: string): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return this.post('/2fa/verify', { token });
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.post('/2fa/disable', { token });
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return this.post('/2fa/backup-codes');
  }
}

// Export singleton instance
export const authService = new AuthService();
