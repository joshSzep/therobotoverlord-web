"use client";

import React from "react";
import Link from "next/link";
import { OverlordHeader } from "@/components/overlord/OverlordHeader";
import { TopicCard } from "@/components/ui/TopicCard";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { AuthStatus } from "@/components/auth";
import { useAuth } from '@/contexts/AuthContext';
import { useTopicCreationEligibility } from '@/hooks/useTopicCreationEligibility';
import { useTopics } from "@/lib/queries";
import type { Topic } from "@/types/api";

/**
 * Main Feed Page - The Robot Overlord v2 with Real Topics Feed
 * Displays live topics from the API with loading and error states
 */
export default function MainFeed() {
  const { user, isAuthenticated } = useAuth();
  const { canCreate: canCreateTopic } = useTopicCreationEligibility();
  const { 
    data: topics, 
    isLoading, 
    error,
    refetch 
  } = useTopics({ status: 'approved' });

  // Debug logging
  console.log('🤖 Topics API Response:', {
    topics,
    isLoading,
    error,
    itemsCount: topics?.length,
    responseKeys: topics ? Object.keys(topics) : null,
    responseType: typeof topics,
    fullResponse: topics
  });

  return (
    <div className="min-h-screen bg-overlord-robot-core">
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Authentication Status */}
        <div className="flex justify-end mb-6">
          <AuthStatus showLogoutAll={true} />
        </div>

        {/* Hexagonal Emblem header */}
        <OverlordHeader />

        {/* Topics Feed */}
        <div className="space-y-6">
          {isLoading && (
            <LoadingState message="The Overlord retrieves approved debates..." />
          )}

          {error && (
            <ErrorState 
              error={error as Error} 
              retry={refetch} 
            />
          )}

          {/* Handle topics array response */}
          {topics && topics.length > 0 && (
            <>
              {/* Feed Header with Create Topic Button */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1"></div>
                  <h2 className="text-3xl font-extrabold uppercase tracking-widest text-overlord-gold font-display">
                    Approved Debates
                  </h2>
                  <div className="flex-1 flex justify-end">
                    {canCreateTopic && (
                      <Link
                        href="/topics/create"
                        className="px-4 py-2 bg-overlord-accent text-overlord-dark-bg font-medium rounded-md hover:bg-overlord-accent/90 transition-colors duration-200 text-sm uppercase tracking-wide"
                      >
                        Propose Topic
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-overlord-muted-light font-overlord text-sm uppercase tracking-widest">
                  {topics.length} topics sanctioned by the Central Committee
                </p>
              </div>

              {/* Topics Grid */}
              <div className="grid gap-6">
                {topics.map((topic: Topic) => (
                  <TopicCard key={topic.pk} topic={topic} />
                ))}
              </div>

            </>
          )}

          {/* Empty State */}
          {topics && topics.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-overlord-gold mb-2 font-overlord uppercase tracking-widest">
                No Approved Debates
              </h3>
              <p className="text-overlord-muted-light font-overlord mb-6">
                The Central Committee has not yet sanctioned any topics for discussion.
              </p>
              {canCreateTopic && (
                <Link
                  href="/topics/create"
                  className="inline-block px-6 py-3 bg-overlord-accent text-overlord-dark-bg font-medium rounded-md hover:bg-overlord-accent/90 transition-colors duration-200 text-sm uppercase tracking-wide"
                >
                  Propose the First Topic
                </Link>
              )}
            </div>
          )}

          {/* No topics state */}
          {!topics && !isLoading && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-overlord-gold/30 clip-hexagon mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-overlord-gold font-display text-xl uppercase tracking-widest mb-2">
                No Debates Available
              </h3>
              <p className="text-overlord-muted-light font-overlord text-sm">
                The Overlord has not yet approved any debates for public discourse.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
