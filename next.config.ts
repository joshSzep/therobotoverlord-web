import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API proxy for development (optional - direct API calls work fine)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG,
  },

  // Experimental features
  experimental: {
    // Enable if needed for better performance
    optimizePackageImports: ['axios'],
  },
};

export default nextConfig;
