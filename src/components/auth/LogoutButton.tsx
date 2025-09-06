"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  logoutAll?: boolean;
}

export function LogoutButton({ className = '', children, logoutAll = false }: LogoutButtonProps) {
  const { logout, logoutAll: logoutAllSessions, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (logoutAll) {
        await logoutAllSessions();
      } else {
        await logout();
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading || isLoggingOut}
      className={`
        inline-flex items-center justify-center px-4 py-2 
        bg-red-600 hover:bg-red-700 
        text-white font-medium rounded-lg 
        transition-colors duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoggingOut ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Logging out...</span>
        </div>
      ) : (
        children || (logoutAll ? 'Logout All Sessions' : 'Logout')
      )}
    </button>
  );
}
