import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { PageErrorBoundary, setupGlobalErrorHandlers } from '@/components/ui/ErrorBoundary';
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
      <body className="antialiased bg-background text-foreground min-h-screen">
        <PageErrorBoundary>
          <AppProviders>
            {children}
            <ToastContainer />
          </AppProviders>
        </PageErrorBoundary>
      </body>
    </html>
  );
}
