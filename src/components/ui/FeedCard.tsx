"use client";

import React from "react";
import { StarburstBackground } from "@/components/overlord/StarburstBackground";

interface FeedCardProps {
  title: string;
  body: string;
  className?: string;
}

/**
 * FeedCard Component - Displays content with dystopian styling and starburst background
 * Used for topics, posts, and other content in feeds
 */
export const FeedCard: React.FC<FeedCardProps> = ({ title, body, className = "" }) => {
  return (
    <div className={`relative bg-overlord-card-dark border-2 border-overlord-gold p-6 mb-6 rounded-lg overflow-hidden ${className}`}>
      <StarburstBackground />
      <div className="absolute inset-0 bg-overlord-card-dark/80" />
      <div className="relative z-10">
        <h2 className="text-2xl font-extrabold uppercase tracking-widest text-overlord-gold mb-2 font-display">
          {title}
        </h2>
        <p className="text-overlord-light-text leading-relaxed font-body">
          {body}
        </p>
      </div>
    </div>
  );
};
