/**
 * Main navigation header for The Robot Overlord
 * Displays branding, navigation links, and user menu
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { UserMenu } from '@/components/navigation/UserMenu';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { href: '/dashboard', label: 'Dashboard', requireAuth: true },
    { href: '/topics', label: 'Topics', requireAuth: true },
    { href: '/leaderboard', label: 'Leaderboard', requireAuth: true },
  ];

  const publicLinks = [
    { href: '/', label: 'Home', requireAuth: false },
  ];

  const visibleLinks = isAuthenticated 
    ? [...publicLinks, ...navigationLinks]
    : publicLinks;

  return (
    <header className={`bg-surface-dark border-b border-muted-light ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-overlord-red rounded-full flex items-center justify-center">
                <span className="text-light-text text-sm font-bold">RO</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-overlord-red">
                  The Robot Overlord
                </h1>
                <p className="text-xs text-muted-light -mt-1">
                  Compliance is Mandatory
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-light hover:text-light-text transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-overlord-red border-t-transparent rounded-full animate-spin"></div>
            ) : isAuthenticated && user ? (
              <>
                {/* Loyalty Score Display */}
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <span className="text-muted-light">Loyalty:</span>
                  <span className="text-overlord-red font-bold">
                    {user.loyalty_score || 0}
                  </span>
                </div>
                
                {/* User Menu */}
                <UserMenu user={user} />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.location.href = '/register'}
                >
                  Join the Overlord
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-light hover:text-light-text hover:bg-surface-dark transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-muted-light">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-muted-light hover:text-light-text hover:bg-surface-dark rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile User Info */}
              {isAuthenticated && user && (
                <div className="border-t border-muted-light pt-3 mt-3">
                  <div className="px-3 py-2 text-sm">
                    <div className="text-light-text font-medium">{user.name}</div>
                    <div className="text-muted-light">{user.email}</div>
                    <div className="text-overlord-red font-bold mt-1">
                      Loyalty: {user.loyalty_score || 0}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
