"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogoutButton } from './LogoutButton';

interface UserProfileProps {
  className?: string;
  showLogoutAll?: boolean;
}

export function UserProfile({ className = '', showLogoutAll = false }: UserProfileProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 w-32 bg-overlord-muted rounded"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-overlord-light-text">
          {user.username}
        </span>
        <span className="text-xs text-overlord-muted">
          {user.role} • Loyalty: {user.loyalty_score}
        </span>
      </div>
      <div className="flex space-x-2">
        <LogoutButton className="text-xs px-2 py-1" />
        {showLogoutAll && (
          <LogoutButton 
            logoutAll 
            className="text-xs px-2 py-1 bg-red-700 hover:bg-red-800"
          >
            Logout All
          </LogoutButton>
        )}
      </div>
    </div>
  );
}
