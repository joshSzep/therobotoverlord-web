'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallbackPage() {
  const { loginWithGoogle, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for tokens
        await loginWithGoogle({
          provider: 'google',
          code,
          redirect_uri: window.location.origin + '/auth/callback/google',
        });

        // Redirect to dashboard on success
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Google OAuth callback error:', error);
        setError(error.message || 'Authentication failed');
        
        // Redirect to login with error after 3 seconds
        setTimeout(() => {
          router.push('/login?error=oauth_failed');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, loginWithGoogle, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="p-6 bg-rejected-red/10 border border-rejected-red rounded-lg">
            <h2 className="text-lg font-semibold text-rejected-red mb-2">
              Authentication Failed
            </h2>
            <p className="text-rejected-red text-sm mb-4">{error}</p>
            <p className="text-muted-light text-xs">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="p-6 bg-card rounded-lg border">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-overlord-red border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-lg font-semibold text-light-text mb-2">
            Processing Authentication
          </h2>
          <p className="text-muted-light text-sm">
            Please wait while we verify your credentials with the Robot Overlord...
          </p>
        </div>
      </div>
    </div>
  );
}
