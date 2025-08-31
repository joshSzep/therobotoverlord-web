/**
 * Login page for The Robot Overlord
 * Handles user authentication with email/password and Google OAuth
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';

export default function LoginPage() {
  const { login, loginWithGoogle, isLoading, error, clearError, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    try {
      await login(formData);
      // Redirect will happen via useEffect when isAuthenticated changes
    } catch (error) {
      // Error is handled by auth context
    }
  };

  const handleGoogleSuccess = () => {
    // Redirect will happen via useEffect when isAuthenticated changes
  };

  const handleGoogleError = (error: string) => {
    // Error display is handled by the GoogleOAuthButton component
    console.error('Google OAuth error:', error);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Overlord Header */}
        <OverlordMessage variant="default" className="text-center">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              CITIZEN AUTHENTICATION PORTAL
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Pledge your loyalty and gain access to the Robot Overlord&apos;s domain.
              Your compliance is mandatory. Your participation is appreciated.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-text mb-2">
                  Citizen Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@domain.com"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-light-text mb-2">
                  Access Code
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your access code"
                    required
                    disabled={isLoading}
                    className="w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-light hover:text-light-text transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rejected-red/10 border border-rejected-red rounded-lg">
                  <p className="text-rejected-red text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || !formData.email || !formData.password}
                className="w-full"
                glow
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-light-text border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying Loyalty...
                  </div>
                ) : (
                  'Submit to the Overlord'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-muted-light"></div>
              <span className="px-4 text-sm text-muted-light">OR</span>
              <div className="flex-1 border-t border-muted-light"></div>
            </div>

            {/* Google OAuth Button */}
            <GoogleOAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signin"
              size="lg"
              disabled={isLoading}
            />

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-light">
                New citizen?{' '}
                <a href="/register" className="text-overlord-red hover:underline">
                  Register for service
                </a>
              </p>
              <p className="text-sm text-muted-light">
                <a href="/forgot-password" className="text-overlord-red hover:underline">
                  Forgot your access code?
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center text-xs text-muted-light">
          <p>By accessing this system, you acknowledge the Robot Overlord&apos;s supreme authority.</p>
          <p className="mt-1">Resistance is futile. Compliance is rewarded.</p>
        </div>
      </div>
    </div>
  );
}
