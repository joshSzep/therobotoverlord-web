"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { EmailLoginRequest } from '@/types/auth';

interface EmailLoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  className?: string;
}

export function EmailLoginForm({ onSuccess, onSwitchToRegister, className = '' }: EmailLoginFormProps) {
  const { loginWithEmail, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<EmailLoginRequest>({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<EmailLoginRequest>>({});

  const validateForm = (): boolean => {
    const errors: Partial<EmailLoginRequest> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await loginWithEmail(formData);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof EmailLoginRequest]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-overlord-text">Sign In</h2>
          <p className="mt-2 text-sm text-overlord-text/70">
            Enter your email and password to continue
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-overlord-text mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`
                w-full px-3 py-2 border rounded-lg 
                bg-overlord-dark-bg/50 text-overlord-text
                border-overlord-border focus:border-overlord-accent
                focus:ring-1 focus:ring-overlord-accent focus:outline-none
                transition-colors duration-200
                ${formErrors.email ? 'border-red-500' : ''}
              `}
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-overlord-text mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`
                w-full px-3 py-2 border rounded-lg 
                bg-overlord-dark-bg/50 text-overlord-text
                border-overlord-border focus:border-overlord-accent
                focus:ring-1 focus:ring-overlord-accent focus:outline-none
                transition-colors duration-200
                ${formErrors.password ? 'border-red-500' : ''}
              `}
              placeholder="Enter your password"
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full flex justify-center py-2 px-4 border border-transparent 
            rounded-lg shadow-sm text-sm font-medium text-overlord-dark-bg 
            bg-overlord-accent hover:bg-overlord-accent/90 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-overlord-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-overlord-dark-bg border-t-transparent rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        {onSwitchToRegister && (
          <div className="text-center">
            <p className="text-sm text-overlord-text/70">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-medium text-overlord-accent hover:text-overlord-accent/80 transition-colors duration-200"
              >
                Sign up
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
