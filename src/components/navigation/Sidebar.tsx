/**
 * Responsive sidebar navigation for The Robot Overlord
 * Provides secondary navigation and quick access to features
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard } from '@/components/auth/ProtectedRoute';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function Sidebar({ isOpen, onClose, className = '' }: SidebarProps) {
  const { user } = useAuth();

  const navigationSections = [
    {
      title: 'Main',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/topics', label: 'Topics', icon: '💬' },
        { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
      ]
    },
    {
      title: 'Content',
      items: [
        { href: '/posts/create', label: 'Create Post', icon: '✍️' },
        { href: '/posts/my-posts', label: 'My Posts', icon: '📝' },
        { href: '/posts/graveyard', label: 'Graveyard', icon: '💀' },
      ]
    },
    {
      title: 'Community',
      items: [
        { href: '/badges', label: 'Badges', icon: '🏅' },
        { href: '/users', label: 'Citizens', icon: '👥' },
        { href: '/help', label: 'Help', icon: '❓' },
      ]
    }
  ];

  const moderatorSections = [
    {
      title: 'Moderation',
      items: [
        { href: '/moderation/queue', label: 'Moderation Queue', icon: '⚖️' },
        { href: '/moderation/appeals', label: 'Appeals', icon: '📋' },
        { href: '/moderation/reports', label: 'Reports', icon: '🚨' },
      ]
    }
  ];

  const adminSections = [
    {
      title: 'Administration',
      items: [
        { href: '/admin/dashboard', label: 'Admin Dashboard', icon: '🔧' },
        { href: '/admin/users', label: 'User Management', icon: '👤' },
        { href: '/admin/system', label: 'System Stats', icon: '📈' },
      ]
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-surface-dark border-r border-muted-light
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-auto
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-muted-light lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-overlord-red rounded-full flex items-center justify-center">
              <span className="text-light-text text-xs font-bold">RO</span>
            </div>
            <span className="text-overlord-red font-bold">Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-light hover:text-light-text hover:bg-surface-dark transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-muted-light">
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
                <div className="text-xs text-muted-light capitalize">
                  {user.role}
                </div>
                <div className="text-xs text-overlord-red font-bold">
                  Loyalty: {user.loyalty_score || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Navigation */}
          {navigationSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-light uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm text-muted-light hover:text-light-text hover:bg-surface-dark rounded-lg transition-colors group"
                    onClick={onClose}
                  >
                    <span className="mr-3 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Moderator Navigation */}
          <RoleGuard roles={['moderator', 'admin']}>
            {moderatorSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-warning-amber uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-3 py-2 text-sm text-muted-light hover:text-warning-amber hover:bg-warning-amber/10 rounded-lg transition-colors group"
                      onClick={onClose}
                    >
                      <span className="mr-3 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </RoleGuard>

          {/* Admin Navigation */}
          <RoleGuard roles="admin">
            {adminSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-rejected-red uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-3 py-2 text-sm text-muted-light hover:text-rejected-red hover:bg-rejected-red/10 rounded-lg transition-colors group"
                      onClick={onClose}
                    >
                      <span className="mr-3 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </RoleGuard>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-muted-light">
          <div className="text-xs text-muted-light text-center">
            <p>Robot Overlord v1.0</p>
            <p className="mt-1">Compliance Monitored</p>
          </div>
        </div>
      </div>
    </>
  );
}
