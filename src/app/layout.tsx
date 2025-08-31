import type { Metadata } from "next";

import "./globals.css";

import * as React from "react";
import { Inter } from "next/font/google";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "The Robot Overlord",
  description:
    "A satirical, AI-moderated debate arena where citizens argue inside a fictional authoritarian state.",
  keywords: ["debate", "AI moderation", "forum", "discussion", "overlord"],
  authors: [{ name: "The Robot Overlord Development Team" }],
  creator: "The Robot Overlord",
  publisher: "The Robot Overlord",
  robots: "index, follow",
  openGraph: {
    title: "The Robot Overlord",
    description:
      "A satirical, AI-moderated debate arena where citizens argue inside a fictional authoritarian state.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Robot Overlord",
    description:
      "A satirical, AI-moderated debate arena where citizens argue inside a fictional authoritarian state.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-deep-black text-light-text">
        <ErrorBoundary>
          <GlobalErrorHandler />
          <a
            href="#main-content"
            className="skip-link sr-only focus:not-sr-only"
          >
            Skip to main content
          </a>
          <a href="#navigation" className="skip-link sr-only focus:not-sr-only">
            Skip to navigation
          </a>

          <AppProviders>{children}</AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
