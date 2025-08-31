/**
 * Global error page for The Robot Overlord
 * Displays when an unexpected error occurs
 */

'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Overlord Message */}
        <OverlordMessage variant="error">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              SYSTEM MALFUNCTION DETECTED
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              A critical error has occurred in the Robot Overlord&apos;s systems.
              Our technicians have been notified and are investigating the issue.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Error Details */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-4xl mr-3">⚠️</span>
              System Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-light">
                We&apos;ll get this fixed as soon as possible. Your session. This incident has been
                automatically reported to the Robot Overlord&apos;s maintenance division.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-rejected-red/10 border border-rejected-red rounded-lg p-4">
                  <div className="text-rejected-red font-bold mb-2">
                    Development Error Details:
                  </div>
                  <pre className="text-xs text-rejected-red overflow-x-auto">
                    {error.message}
                  </pre>
                  {error.digest && (
                    <div className="text-xs text-muted-light mt-2">
                      Error ID: {error.digest}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-warning-amber/10 border border-warning-amber rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-warning-amber text-lg mr-2">🔧</span>
                  <span className="text-warning-amber font-bold">Recovery Options</span>
                </div>
                <p className="text-warning-amber text-sm mt-2">
                  Try refreshing the page or returning to a safe area. If the problem
                  Let&apos;s get you back on track. Your loyalty score will not be affected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recovery Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full"
            onClick={reset}
          >
            Retry Operation
          </Button>
          
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full"
            onClick={() => window.location.href = '/dashboard'}
          >
            Return to Dashboard
          </Button>
        </div>

        {/* Additional Options */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-light mb-4">
              Still experiencing issues? Try these options:
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                Home Page
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/help'}
              >
                Help Center
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-light">
          <p>Error logged at {new Date().toLocaleString()}</p>
          <p className="mt-1">The Robot Overlord&apos;s systems are self-healing. Please stand by.</p>
        </div>
      </div>
    </div>
  );
}
