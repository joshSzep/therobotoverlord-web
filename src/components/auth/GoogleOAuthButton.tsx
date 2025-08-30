'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleOAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: 'signin' | 'signup' | 'continue';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'lg' | 'md' | 'sm';
  disabled?: boolean;
}

export function GoogleOAuthButton({
  onSuccess,
  onError,
  text = 'signin',
  theme = 'outline',
  size = 'lg',
  disabled = false,
}: GoogleOAuthButtonProps) {
  const { loginWithGoogle, isLoading } = useAuth();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        setIsGoogleLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        onError?.('Failed to load Google Sign-In');
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, [onError]);

  useEffect(() => {
    if (!isGoogleLoaded || isInitialized) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('Google Client ID not configured');
      onError?.('Google Sign-In not configured');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      onError?.('Failed to initialize Google Sign-In');
    }
  }, [isGoogleLoaded, isInitialized, onError]);

  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    try {
      await loginWithGoogle({
        provider: 'google',
        token: response.credential,
        redirect_uri: window.location.origin + '/auth/callback/google',
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Google OAuth login failed:', error);
      onError?.(error.message || 'Google Sign-In failed');
    }
  };

  const handleManualSignIn = () => {
    if (!isInitialized) {
      onError?.('Google Sign-In not ready');
      return;
    }

    try {
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Failed to show Google Sign-In prompt:', error);
      onError?.('Failed to show Google Sign-In');
    }
  };

  // Render custom button if Google script hasn't loaded or failed to initialize
  if (!isGoogleLoaded || !isInitialized) {
    return (
      <Button
        variant="secondary"
        size={size}
        onClick={handleManualSignIn}
        disabled={disabled || isLoading || !isInitialized}
        className="w-full flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading ? 'Signing in...' : `${text === 'signin' ? 'Sign in' : text === 'signup' ? 'Sign up' : 'Continue'} with Google`}
      </Button>
    );
  }

  return (
    <div className="w-full">
      <GoogleSignInButton
        theme={theme}
        size={size}
        text={text}
        disabled={disabled || isLoading}
        onError={onError}
      />
    </div>
  );
}

interface GoogleSignInButtonProps {
  theme: 'outline' | 'filled_blue' | 'filled_black';
  size: 'lg' | 'md' | 'sm';
  text: 'signin' | 'signup' | 'continue';
  disabled: boolean;
  onError?: (error: string) => void;
}

function GoogleSignInButton({ theme, size, text, disabled, onError }: GoogleSignInButtonProps) {
  const buttonRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buttonRef.current || disabled) return;

    try {
      const googleSize = size === 'lg' ? 'large' : size === 'md' ? 'medium' : 'small';
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme,
        size: googleSize,
        text: `${text}_with` as any,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
      });
    } catch (error) {
      console.error('Failed to render Google Sign-In button:', error);
      onError?.('Failed to render Google Sign-In button');
    }
  }, [theme, size, text, disabled, onError]);

  return <div ref={buttonRef} className={disabled ? 'opacity-50 pointer-events-none' : ''} />;
}
