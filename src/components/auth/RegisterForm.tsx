"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { RegisterRequest } from '@/types/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

export function RegisterForm({ onSuccess, onSwitchToLogin, className = '' }: RegisterFormProps) {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    username: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Partial<RegisterRequest & { confirmPassword: string }>>({});

  const validateForm = (): boolean => {
    const errors: Partial<RegisterRequest & { confirmPassword: string }> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 100) {
      errors.username = 'Username must be less than 100 characters';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await register(formData);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof (RegisterRequest & { confirmPassword: string })]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-overlord-text">Create Account</h2>
          <p className="mt-2 text-sm text-overlord-text/70">
            Join The Robot Overlord community
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
            <label htmlFor="username" className="block text-sm font-medium text-overlord-text mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              className={`
                w-full px-3 py-2 border rounded-lg 
                bg-overlord-dark-bg/50 text-overlord-text
                border-overlord-border focus:border-overlord-accent
                focus:ring-1 focus:ring-overlord-accent focus:outline-none
                transition-colors duration-200
                ${formErrors.username ? 'border-red-500' : ''}
              `}
              placeholder="Choose a username"
            />
            {formErrors.username && (
              <p className="mt-1 text-sm text-red-400">{formErrors.username}</p>
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
              autoComplete="new-password"
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
              placeholder="Create a password"
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-overlord-text mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={handleInputChange}
              className={`
                w-full px-3 py-2 border rounded-lg 
                bg-overlord-dark-bg/50 text-overlord-text
                border-overlord-border focus:border-overlord-accent
                focus:ring-1 focus:ring-overlord-accent focus:outline-none
                transition-colors duration-200
                ${formErrors.confirmPassword ? 'border-red-500' : ''}
              `}
              placeholder="Confirm your password"
            />
            {formErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
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
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        {onSwitchToLogin && (
          <div className="text-center">
            <p className="text-sm text-overlord-text/70">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-overlord-accent hover:text-overlord-accent/80 transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
