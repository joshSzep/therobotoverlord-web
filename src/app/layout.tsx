import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';
import './globals.css';
import { PageErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SkipLink } from '@/components/ui/AccessibilityHelpers';
import { MetaTags } from '@/components/seo/MetaTags';
import { OrganizationStructuredData, WebSiteStructuredData } from '@/components/seo/StructuredData';
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
        <PageErrorBoundary>
          <MetaTags />
          <OrganizationStructuredData />
          <WebSiteStructuredData />
          
          <SkipLink href="#main-content" text="Skip to main content" />
          <SkipLink href="#navigation" text="Skip to navigation" />
          
          <AppProviders>
            {children}
          </AppProviders>
          
          <ToastContainer />
        </PageErrorBoundary>
      </body>
    </html>
  );
}
