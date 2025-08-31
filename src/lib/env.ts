/**
 * Environment variable validation and configuration
 * Ensures required environment variables are present and valid
 */

// Environment variable schema
interface EnvironmentConfig {
  API_BASE_URL: string;
  WS_URL: string;
  DEBUG: boolean;
  GOOGLE_CLIENT_ID?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Validate and parse environment variables
 */
function validateEnvironment(): EnvironmentConfig {
  const requiredVars = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  };

  // Check for missing required variables
  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate URL formats
  try {
    new URL(requiredVars.API_BASE_URL!);
  } catch {
    throw new Error(`Invalid API_BASE_URL format: ${requiredVars.API_BASE_URL}`);
  }

  // Validate WebSocket URL format
  const wsUrl = requiredVars.WS_URL!;
  if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
    throw new Error(`Invalid WS_URL format: ${wsUrl}. Must start with ws:// or wss://`);
  }

  return {
    API_BASE_URL: requiredVars.API_BASE_URL!,
    WS_URL: requiredVars.WS_URL!,
    DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
    GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  };
}

// Export validated environment configuration
export const env = validateEnvironment();

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isDebugMode = env.DEBUG && isDevelopment;

// Log environment info in development
if (isDevelopment && typeof window === 'undefined') {
  console.log('🤖 Robot Overlord Environment Configuration:');
  console.log(`  API Base URL: ${env.API_BASE_URL}`);
  console.log(`  WebSocket URL: ${env.WS_URL}`);
  console.log(`  Debug Mode: ${env.DEBUG}`);
  console.log(`  Google OAuth: ${env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
}
