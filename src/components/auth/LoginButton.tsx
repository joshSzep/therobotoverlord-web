"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoginButton({ className = '', children }: LoginButtonProps) {
  const { login, isLoading } = useAuth();

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center px-4 py-2 
        bg-overlord-accent hover:bg-overlord-accent/90 
        text-overlord-dark-bg font-medium rounded-lg 
        transition-colors duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-overlord-dark-bg border-t-transparent rounded-full animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        children || 'Login with Google'
      )}
    </button>
  );
}
