/**
 * Toast notification component for The Robot Overlord
 * Displays temporary notifications with Robot Overlord theming
 */

'use client';

import React, { useEffect } from 'react';
import { useAppStore, Notification } from '@/stores/appStore';
import { Button } from './Button';

interface ToastProps {
  notification: Notification;
}

function Toast({ notification }: ToastProps) {
  const removeNotification = useAppStore((state) => state.removeNotification);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, removeNotification]);

  const getToastStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-approved-green/10 border-approved-green text-approved-green';
      case 'error':
        return 'bg-rejected-red/10 border-rejected-red text-rejected-red';
      case 'warning':
        return 'bg-warning-amber/10 border-warning-amber text-warning-amber';
      case 'info':
      default:
        return 'bg-overlord-red/10 border-overlord-red text-overlord-red';
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm
        animate-in slide-in-from-right-full duration-300
        ${getToastStyles(notification.type)}
      `}
    >
      {/* Close button */}
      <button
        onClick={() => removeNotification(notification.id)}
        className="absolute top-2 right-2 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex items-start space-x-3 pr-6">
        <span className="text-lg flex-shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </span>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">
            {notification.title}
          </div>
          <div className="text-sm mt-1 opacity-90">
            {notification.message}
          </div>
          
          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    action.action();
                    removeNotification(notification.id);
                  }}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const notifications = useAppStore((state) => state.notifications);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
