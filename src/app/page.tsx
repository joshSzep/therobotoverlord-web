"use client";

import React from "react";
import { OverlordHeader } from "@/components/overlord/OverlordHeader";
import { TopicCard } from "@/components/ui/TopicCard";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { AuthStatus } from "@/components/auth";
import { useTopics } from "@/lib/queries";
import type { Topic } from "@/types/api";

/**
 * Main Feed Page - The Robot Overlord v2 with Real Topics Feed
 * Displays live topics from the API with loading and error states
 */
export default function MainFeed() {
  const { 
    data: topicsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useTopics({ 
    per_page: 10 
  });

  // Debug logging
  console.log('🤖 Topics API Response:', {
    topicsResponse,
    isLoading,
    error,
    itemsCount: topicsResponse?.length,
    responseKeys: topicsResponse ? Object.keys(topicsResponse) : null,
    responseType: typeof topicsResponse,
    fullResponse: topicsResponse
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
              retry={() => refetch()} 
            />
          )}

          {/* Handle topics array response */}
          {topicsResponse && topicsResponse.length > 0 && (
            <>
              {/* Feed Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold uppercase tracking-widest text-overlord-gold font-display mb-2">
                  Approved Debates
                </h2>
                <p className="text-overlord-muted-light font-overlord text-sm uppercase tracking-widest">
                  {topicsResponse.length} topics sanctioned by the Central Committee
                </p>
              </div>

              {/* Topics Grid */}
              <div className="grid gap-6">
                {topicsResponse.map((topic: Topic) => (
                  <TopicCard key={topic.pk} topic={topic} />
                ))}
              </div>

            </>
          )}

          {/* Empty State */}
          {topicsResponse && topicsResponse.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-overlord-gold mb-2 font-overlord uppercase tracking-widest">
                No Approved Debates
              </h3>
              <p className="text-overlord-muted-light font-overlord">
                The Central Committee has not yet sanctioned any topics for discussion.
              </p>
            </div>
          )}

          {/* No topics state */}
          {!topicsResponse && !isLoading && !error && (
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
