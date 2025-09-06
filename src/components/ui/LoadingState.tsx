"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Loading State Component - Dystopian loading indicator with Overlord messaging
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "The Overlord processes your request...", 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* Rotating hexagonal loader */}
      <motion.div
        className="w-16 h-16 border-4 border-overlord-gold/30 border-t-overlord-gold clip-hexagon mb-4"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
      
      {/* Loading message */}
      <p className="text-overlord-muted-light font-overlord text-sm uppercase tracking-widest text-center">
        {message}
      </p>
      
      {/* Pulsing dots */}
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-overlord-gold rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              delay: i * 0.2,
              ease: "easeInOut" 
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Error State Component - Displays API errors with Overlord styling
 */
interface ErrorStateProps {
  error: Error | null;
  retry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, retry, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* Error icon */}
      <div className="w-16 h-16 border-4 border-status-rejected-red clip-hexagon mb-4 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      
      {/* Error message */}
      <h3 className="text-status-rejected-red font-display text-xl uppercase tracking-widest mb-2">
        System Malfunction
      </h3>
      <p className="text-overlord-muted-light font-overlord text-sm text-center mb-4 max-w-md">
        The Overlord's systems have encountered an irregularity. 
        {error?.message && ` Error: ${error.message}`}
      </p>
      
      {/* Retry button */}
      {retry && (
        <button
          onClick={retry}
          className="px-6 py-2 bg-overlord-surface-dark border-2 border-overlord-gold text-overlord-gold font-display uppercase tracking-widest hover:bg-overlord-gold hover:text-overlord-deep-black transition-colors"
        >
          Retry Request
        </button>
      )}
    </div>
  );
};
