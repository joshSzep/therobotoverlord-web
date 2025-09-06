"use client";

import React from "react";
import { motion } from "framer-motion";

interface StarburstBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Starburst Background Component - Creates rotating conic gradient background
 * Used behind content cards to create dynamic visual interest
 */
export const StarburstBackground: React.FC<StarburstBackgroundProps> = ({ children, className = "" }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "240%",
          height: "880%",
          backgroundImage:
            "repeating-conic-gradient(from 270deg, rgba(204,0,0,0.45) 0deg 8deg, transparent 8deg 16deg)",
          transformOrigin: "50% 50%",
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
      />
      {children}
    </div>
  );
};
