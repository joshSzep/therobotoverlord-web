/**
 * Logout page for The Robot Overlord
 * Handles user logout and displays confirmation
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';

export default function LogoutPage() {
  const { logout, isLoading, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutComplete, setLogoutComplete] = useState(false);

  // Auto-logout if user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoggingOut && !logoutComplete) {
      handleLogout();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setLogoutComplete(true);
      
      // Redirect to home page after a brief delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutComplete(true);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const handleLoginAgain = () => {
    window.location.href = '/login';
  };

  if (isLoggingOut || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-overlord-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-light">Terminating your session...</p>
            <p className="text-sm text-muted-light mt-2">
              The Overlord is processing your departure.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Overlord Message */}
        <OverlordMessage variant="default" className="text-center">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              SESSION TERMINATED
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Your loyalty session has been concluded. The Robot Overlord acknowledges your service.
              You may return when ready to resume your duties.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Logout Confirmation */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-approved-green text-4xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-light-text mb-2">
              Logout Successful
            </h2>
            <p className="text-muted-light mb-6">
              You&apos;ve been logged out successfully. logged out of the Robot Overlord system.
              All authentication tokens have been cleared.
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleReturnHome}
                variant="primary"
                size="lg"
                className="w-full"
                glow
              >
                Return to Homepage
              </Button>
              
              <Button
                onClick={handleLoginAgain}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Login Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center text-xs text-muted-light">
          <p>Your session data has been securely cleared.</p>
          <p className="mt-1">The Overlord&apos;s surveillance continues. Stay vigilant.</p>
        </div>
      </div>
    </div>
  );
}
