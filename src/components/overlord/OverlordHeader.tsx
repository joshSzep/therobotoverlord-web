"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTopicCreationEligibility } from '@/hooks/useTopicCreationEligibility';
import { LogicEmblem } from "./LogicEmblem";

/**
 * Overlord Header Component - Main header with Logic Emblem and title
 * Displays the hexagonal emblem with "The Robot Overlord" branding
 */
export const OverlordHeader: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { canCreate: canCreateTopic } = useTopicCreationEligibility();

  return (
    <header className="relative">
      <Link href="/" className="relative flex flex-col items-center mb-8 cursor-pointer hover:opacity-90 transition-opacity">
        <LogicEmblem />
        <h1 className="mt-6 text-5xl font-extrabold uppercase tracking-widest text-overlord-gold text-center glow-gold font-display">
          The Robot Overlord
        </h1>
        <p className="text-overlord-red uppercase font-bold tracking-widest mt-3 text-center font-body">
          Logic Above All. Reason Guides the Collective.
        </p>
      </Link>
      
      {/* Navigation */}
      <nav className="flex justify-center space-x-6 mb-8">
        <Link 
          href="/" 
          className="text-overlord-text hover:text-overlord-accent transition-colors duration-200 font-medium"
        >
          Debates
        </Link>
        
        {isAuthenticated && (
          <>
            <Link 
              href="/profile" 
              className="text-overlord-text hover:text-overlord-accent transition-colors duration-200 font-medium"
            >
              Profile
            </Link>
            {/* Navigation Links */}
            {isAuthenticated && canCreateTopic && (
              <Link 
                href="/topics/create"
                className="absolute top-0 right-0 px-4 py-2 bg-overlord-accent text-overlord-bg font-bold uppercase tracking-wide text-sm hover:bg-overlord-accent/80 transition-colors"
              >
                Propose Topic
              </Link>
            )}
          </>
        )}
        
        {!isAuthenticated && (
          <span className="text-overlord-muted text-sm">
            Authenticate to participate in debates
          </span>
        )}
      </nav>
    </header>
  );
};
