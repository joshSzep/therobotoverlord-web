/**
 * Breadcrumb navigation component for The Robot Overlord
 * Shows current page hierarchy and navigation path
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for single-level pages
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <svg
                className="w-4 h-4 text-muted-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            
            {item.href && index < breadcrumbItems.length - 1 ? (
              <Link
                href={item.href}
                className="flex items-center text-muted-light hover:text-light-text transition-colors"
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center text-light-text font-medium">
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/', icon: '🏠' }
  ];

  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Convert segment to readable label
    const label = formatSegmentLabel(segment);
    
    // Determine if this should be a link (not the last item)
    const isLast = index === pathSegments.length - 1;
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      icon: getSegmentIcon(segment)
    });
  });

  return breadcrumbs;
}

/**
 * Format path segment into readable label
 */
function formatSegmentLabel(segment: string): string {
  // Handle special cases
  const specialLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'topics': 'Topics',
    'leaderboard': 'Leaderboard',
    'posts': 'Posts',
    'create': 'Create',
    'edit': 'Edit',
    'my-posts': 'My Posts',
    'graveyard': 'Graveyard',
    'badges': 'Badges',
    'users': 'Citizens',
    'moderation': 'Moderation',
    'queue': 'Queue',
    'appeals': 'Appeals',
    'reports': 'Reports',
    'admin': 'Administration',
    'system': 'System',
    'help': 'Help',
    'profile': 'Profile',
    'settings': 'Settings'
  };

  if (specialLabels[segment]) {
    return specialLabels[segment];
  }

  // Convert kebab-case to Title Case
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get icon for path segment
 */
function getSegmentIcon(segment: string): string | undefined {
  const segmentIcons: Record<string, string> = {
    'dashboard': '📊',
    'topics': '💬',
    'leaderboard': '🏆',
    'posts': '📝',
    'create': '✍️',
    'graveyard': '💀',
    'badges': '🏅',
    'users': '👥',
    'moderation': '⚖️',
    'queue': '📋',
    'appeals': '📋',
    'reports': '🚨',
    'admin': '🔧',
    'system': '📈',
    'help': '❓',
    'profile': '👤',
    'settings': '⚙️'
  };

  return segmentIcons[segment];
}

/**
 * Hook to get current breadcrumbs
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  return generateBreadcrumbsFromPath(pathname);
}
