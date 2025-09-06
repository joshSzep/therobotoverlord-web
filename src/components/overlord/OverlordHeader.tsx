"use client";

import React from "react";
import { LogicEmblem } from "./LogicEmblem";

/**
 * Overlord Header Component - Main header with Logic Emblem and title
 * Displays the hexagonal emblem with "The Robot Overlord" branding
 */
export const OverlordHeader: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center mb-12">
      <LogicEmblem />
      <h1 className="mt-6 text-5xl font-extrabold uppercase tracking-widest text-overlord-gold text-center glow-gold font-display">
        The Robot Overlord
      </h1>
      <p className="text-overlord-red uppercase font-bold tracking-widest mt-3 text-center font-body">
        Logic Above All. Reason Guides the Collective.
      </p>
    </div>
  );
};
