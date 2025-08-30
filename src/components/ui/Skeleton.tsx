/**
 * Skeleton Loading Components for The Robot Overlord
 * Provides various skeleton loading states for better UX
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`animate-pulse bg-muted rounded ${className}`}
      style={style}
    />
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-border rounded-lg p-4 ${className}`}>
      <div className="space-y-3">
        <Skeleton height="20px" width="60%" />
        <Skeleton height="16px" width="40%" />
        <Skeleton height="32px" width="80px" />
      </div>
    </div>
  );
}

// List item skeleton for feeds and lists
export function ListItemSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <Skeleton width="40px" height="40px" className="rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton height="16px" width="30%" />
          <Skeleton height="14px" width="100%" />
          <Skeleton height="14px" width="80%" />
          <div className="flex space-x-2 mt-3">
            <Skeleton height="24px" width="60px" className="rounded-full" />
            <Skeleton height="24px" width="60px" className="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4, className = '' }: { columns?: number; className?: string }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Skeleton height="16px" width={index === 0 ? '60%' : '80%'} />
        </td>
      ))}
    </tr>
  );
}

// User profile skeleton
export function UserProfileSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Skeleton width="48px" height="48px" className="rounded-full" />
      <div className="space-y-2">
        <Skeleton height="16px" width="120px" />
        <Skeleton height="14px" width="80px" />
      </div>
    </div>
  );
}

// Stats card skeleton
export function StatsCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Skeleton width="48px" height="48px" className="rounded" />
        <div className="space-y-2">
          <Skeleton height="24px" width="60px" />
          <Skeleton height="14px" width="100px" />
        </div>
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 3, className = '' }: { fields?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton height="16px" width="25%" />
          <Skeleton height="40px" width="100%" className="rounded-md" />
        </div>
      ))}
      <div className="flex space-x-2 pt-4">
        <Skeleton height="36px" width="80px" className="rounded-md" />
        <Skeleton height="36px" width="80px" className="rounded-md" />
      </div>
    </div>
  );
}

// Navigation skeleton
export function NavigationSkeleton({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <nav className={`space-y-2 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-2">
          <Skeleton width="20px" height="20px" />
          <Skeleton height="16px" width="120px" />
        </div>
      ))}
    </nav>
  );
}

// Chat message skeleton
export function ChatMessageSkeleton({ isUser = false, className = '' }: { isUser?: boolean; className?: string }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`max-w-xs lg:max-w-md space-y-2 ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && <Skeleton width="32px" height="32px" className="rounded-full" />}
        <div className={`p-3 rounded-lg ${isUser ? 'bg-muted' : 'bg-muted/50'}`}>
          <Skeleton height="14px" width="100%" />
          <Skeleton height="14px" width="80%" className="mt-1" />
        </div>
      </div>
    </div>
  );
}

// Feed post skeleton
export function FeedPostSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-border rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Skeleton width="40px" height="40px" className="rounded-full" />
          <div className="space-y-1">
            <Skeleton height="16px" width="120px" />
            <Skeleton height="12px" width="80px" />
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <Skeleton height="20px" width="90%" />
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="85%" />
          <Skeleton height="16px" width="70%" />
        </div>
        
        {/* Actions */}
        <div className="flex space-x-4 pt-2">
          <Skeleton height="32px" width="60px" className="rounded-md" />
          <Skeleton height="32px" width="60px" className="rounded-md" />
          <Skeleton height="32px" width="60px" className="rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Notification skeleton
export function NotificationSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start space-x-3 p-4 border-b border-border ${className}`}>
      <Skeleton width="32px" height="32px" className="rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton height="16px" width="60%" />
          <Skeleton height="12px" width="60px" />
        </div>
        <Skeleton height="14px" width="100%" />
        <Skeleton height="14px" width="40%" />
      </div>
    </div>
  );
}

// Page header skeleton
export function PageHeaderSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height="32px" width="300px" />
          <Skeleton height="16px" width="200px" />
        </div>
        <div className="flex space-x-2">
          <Skeleton height="36px" width="80px" className="rounded-md" />
          <Skeleton height="36px" width="80px" className="rounded-md" />
        </div>
      </div>
      <Skeleton height="1px" width="100%" />
    </div>
  );
}

// Generic content skeleton
export function ContentSkeleton({ 
  lines = 3, 
  showHeader = true, 
  showActions = true, 
  className = '' 
}: { 
  lines?: number; 
  showHeader?: boolean; 
  showActions?: boolean; 
  className?: string; 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && <PageHeaderSkeleton />}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index} 
            height="16px" 
            width={index === lines - 1 ? '60%' : '100%'} 
          />
        ))}
      </div>
      
      {showActions && (
        <div className="flex space-x-2 pt-4">
          <Skeleton height="36px" width="100px" className="rounded-md" />
          <Skeleton height="36px" width="80px" className="rounded-md" />
        </div>
      )}
    </div>
  );
}
