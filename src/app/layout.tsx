import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { PageErrorBoundary, setupGlobalErrorHandlers } from '@/components/ui/ErrorBoundary';
import { SkipLink } from '@/components/ui/AccessibilityHelpers';
import { AppProviders } from '@/components/providers/AppProviders';
import { ToastContainer } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: "The Robot Overlord",
  description: "A satirical, AI-moderated debate arena where citizens argue inside a fictional authoritarian state.",
  keywords: ["debate", "AI moderation", "forum", "discussion", "overlord"],
  authors: [{ name: "The Robot Overlord Development Team" }],
  creator: "The Robot Overlord",
  publisher: "The Robot Overlord",
  robots: "index, follow",
  openGraph: {
    title: "The Robot Overlord",
    description: "A satirical, AI-moderated debate arena where citizens argue inside a fictional authoritarian state.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Robot Overlord",
    description: "A satirical, AI-moderated debate arena where citizens argue inside a fictional authoritarian state.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Setup global error handlers
  if (typeof window !== 'undefined') {
    setupGlobalErrorHandlers();
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-deep-black text-light-text">
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#main-navigation">Skip to navigation</SkipLink>
        <PageErrorBoundary>
          <AppProviders>
            <AuthProvider>
              {children}
              <ToastContainer />
            </AuthProvider>
          </AppProviders>
        </PageErrorBoundary>
      </body>
    </html>
  );
}
