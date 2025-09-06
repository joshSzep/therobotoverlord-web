"use client";

import React, { useState } from 'react';
import { EmailLoginForm } from './EmailLoginForm';
import { RegisterForm } from './RegisterForm';
import { LoginButton } from './LoginButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'oauth';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'oauth'>(initialMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-black/75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-overlord-bg border border-overlord-border shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-overlord-bg px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-1">
                <button
                  onClick={() => setMode('login')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                    mode === 'login'
                      ? 'bg-overlord-accent text-overlord-dark-bg'
                      : 'text-overlord-text/70 hover:text-overlord-text'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                    mode === 'register'
                      ? 'bg-overlord-accent text-overlord-dark-bg'
                      : 'text-overlord-text/70 hover:text-overlord-text'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setMode('oauth')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                    mode === 'oauth'
                      ? 'bg-overlord-accent text-overlord-dark-bg'
                      : 'text-overlord-text/70 hover:text-overlord-text'
                  }`}
                >
                  Google
                </button>
              </div>
              
              <button
                onClick={onClose}
                className="text-overlord-text/50 hover:text-overlord-text transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              {mode === 'login' && (
                <EmailLoginForm
                  onSuccess={handleSuccess}
                  onSwitchToRegister={() => setMode('register')}
                />
              )}
              
              {mode === 'register' && (
                <RegisterForm
                  onSuccess={handleSuccess}
                  onSwitchToLogin={() => setMode('login')}
                />
              )}
              
              {mode === 'oauth' && (
                <div className="text-center space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-overlord-text">Continue with Google</h2>
                    <p className="mt-2 text-sm text-overlord-text/70">
                      Sign in using your Google account
                    </p>
                  </div>
                  
                  <LoginButton className="w-full" />
                  
                  <div className="text-center">
                    <p className="text-sm text-overlord-text/70">
                      Prefer email?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="font-medium text-overlord-accent hover:text-overlord-accent/80 transition-colors duration-200"
                      >
                        Sign in with email
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
