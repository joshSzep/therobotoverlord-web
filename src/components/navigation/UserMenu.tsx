/**
 * User menu dropdown component
 * Displays user profile and account actions
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CurrentUser } from '@/types/user';
import { Button } from '@/components/ui/Button';

interface UserMenuProps {
  user: CurrentUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊'
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: '👤'
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: '⚙️'
    },
    {
      label: 'Help',
      href: '/help',
      icon: '❓'
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar/Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-surface-dark transition-colors"
        aria-label="User menu"
      >
        <div className="w-8 h-8 bg-overlord-red rounded-full flex items-center justify-center">
          <span className="text-light-text text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-light-text truncate max-w-32">
            {user.name}
          </div>
          <div className="text-xs text-muted-light capitalize">
            {user.role}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-muted-light transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface-dark border border-muted-light rounded-lg shadow-lg z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-muted-light">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-overlord-red rounded-full flex items-center justify-center">
                <span className="text-light-text font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-light-text truncate">
                  {user.name}
                </div>
                <div className="text-xs text-muted-light truncate">
                  {user.email}
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-overlord-red font-bold">
                    Loyalty: {user.loyalty_score || 0}
                  </span>
                  <span className="text-xs text-approved-green">
                    Rep: {user.reputation_score || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm text-muted-light hover:text-light-text hover:bg-surface-dark transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>

          {/* Status Indicator */}
          <div className="px-4 py-2 border-t border-muted-light">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  user.status === 'active' ? 'bg-approved-green' : 'bg-rejected-red'
                }`}></div>
                <span className="text-muted-light capitalize">
                  Status: {user.status}
                </span>
              </div>
              {user.is_verified && (
                <span className="text-approved-green">✓ Verified</span>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="px-4 py-3 border-t border-muted-light">
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="w-full"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
