"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * The Robot Overlord Logic Emblem - Hexagonal rotating emblem with pulsing animations
 * Features rotating slogans (Order, Logic, Reason, Truth) and pulsing inner hexagons
 */
export const LogicEmblem: React.FC = () => {
  return (
    <div className="relative h-64 w-64 mx-auto select-none">
      {/* Rotating group: hex frame + slogans rotate together */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
      >
        <div
          className="absolute inset-0 bg-conic-gold clip-hexagon"
          style={{
            boxShadow:
              "0 0 30px 10px rgba(255,215,0,0.4), 0 0 0 6px #FFD700, 0 0 0 12px #7a1111",
          }}
        />

        {/* Slogans positioned around the hexagon */}
        <div 
          className="absolute text-overlord-gold font-extrabold uppercase text-xs tracking-widest"
          style={{ top: "-5%", left: "50%", transform: "translateX(-50%)" }}
        >
          Order
        </div>
        <div 
          className="absolute text-overlord-gold font-extrabold uppercase text-xs tracking-widest"
          style={{ bottom: "-5%", left: "50%", transform: "translateX(-50%)" }}
        >
          <span style={{ display: 'inline-block', transform: 'rotate(180deg)' }}>
            Logic
          </span>
        </div>
        <div 
          className="absolute text-overlord-gold font-extrabold uppercase text-xs tracking-widest -rotate-90"
          style={{ left: "-15%", top: "48%", transform: "rotate(-90deg)" }}
        >
          Reason
        </div>
        <div 
          className="absolute text-overlord-gold font-extrabold uppercase text-xs tracking-widest rotate-90"
          style={{ right: "-15%", top: "48%", transform: "rotate(90deg)" }}
        >
          Truth
        </div>
      </motion.div>

      {/* Pulsing inner halo hexagons (stationary) */}
      <motion.div
        className="absolute inset-8 border-4 border-overlord-gold/50 clip-hexagon"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-8 border-4 border-overlord-gold/50 clip-hexagon"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-8 border-4 border-overlord-gold/50 clip-hexagon"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-8 border-4 border-overlord-gold/50 clip-hexagon"
        animate={{ scale: [1, 0.75, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-8 border-4 border-overlord-gold/50 clip-hexagon"
        animate={{ scale: [1, 0.65, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      {/* Robot core inside hexagon (stationary) */}
      <div className="absolute inset-16 grid place-items-center bg-overlord-robot-core border-4 border-overlord-gold clip-hexagon">
        <span className="text-7xl" style={{ color: "#FFD700" }}>
          🤖
        </span>
      </div>
    </div>
  );
};
