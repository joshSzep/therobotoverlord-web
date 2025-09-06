"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { UserProfile } from './UserProfile';

interface AuthStatusProps {
  className?: string;
  showUserProfile?: boolean;
  showLogoutAll?: boolean;
}

export function AuthStatus({ 
  className = '', 
  showUserProfile = true, 
  showLogoutAll = false 
}: AuthStatusProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 w-24 bg-overlord-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {isAuthenticated ? (
        showUserProfile ? (
          <UserProfile showLogoutAll={showLogoutAll} />
        ) : (
          <div className="text-sm text-overlord-light-text">
            Authenticated
          </div>
        )
      ) : (
        <>
          <button
            onClick={() => setShowAuthModal(true)}
            className="
              inline-flex items-center justify-center px-4 py-2 
              bg-overlord-accent hover:bg-overlord-accent/90 
              text-overlord-dark-bg font-medium rounded-lg 
              transition-colors duration-200 
              focus:outline-none focus:ring-2 focus:ring-overlord-accent focus:ring-offset-2
            "
          >
            Sign In / Register
          </button>
          
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialMode="login"
          />
        </>
      )}
    </div>
  );
}
