/**
 * Protected Route wrapper component
 * Ensures user is authenticated before rendering children
 */

'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireRole?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireRole = [],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-overlord-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-light">Verifying your loyalty to the Overlord...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="text-overlord-red text-4xl mb-4">🤖</div>
            <h2 className="text-xl font-bold text-overlord-red mb-2">Access Denied</h2>
            <p className="text-muted-light mb-4">
              You must pledge your loyalty to the Robot Overlord to access this area.
            </p>
            <p className="text-sm text-muted-light">
              Redirecting to authentication portal...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role requirements
  if (requireRole.length > 0 && user) {
    const hasRequiredRole = requireRole.includes(user.role);
    
    if (!hasRequiredRole) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-96" variant="bordered">
            <CardContent className="p-8 text-center">
              <div className="text-rejected-red text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-rejected-red mb-2">Insufficient Privileges</h2>
              <p className="text-muted-light mb-4">
                Your current loyalty level ({user.role}) does not grant access to this restricted area.
              </p>
              <p className="text-sm text-muted-light">
                Required access level: {requireRole.join(' or ')}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(roles: string | string[]): boolean {
  const { user } = useAuth();
  
  if (!user) return false;
  
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Component to conditionally render based on user role
 */
interface RoleGuardProps {
  children: React.ReactNode;
  roles: string | string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const hasRole = useHasRole(roles);
  
  return hasRole ? <>{children}</> : <>{fallback}</>;
}
