"use client";

import React from "react";
import { useParams } from "next/navigation";
import { OverlordHeader } from "@/components/overlord/OverlordHeader";
import { TopicCard } from "@/components/ui/TopicCard";
import { PostCard } from "@/components/ui/PostCard";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { useTopic, useTopicPosts } from "@/lib/queries";
import type { PostThread } from "@/types/api";

/**
 * Topic Detail Page - Shows individual topic with threaded comments
 * Displays topic details and all posts in the debate thread
 */
export default function TopicDetailPage() {
  const params = useParams();
  const topicId = params.id as string;

  const { 
    data: topic, 
    isLoading: topicLoading, 
    error: topicError 
  } = useTopic(topicId);

  const { 
    data: postsResponse, 
    isLoading: postsLoading, 
    error: postsError,
    refetch: refetchPosts
  } = useTopicPosts(topicId);

  // Debug logging
  console.log('🤖 Topic Detail:', {
    topicId,
    topic,
    postsResponse,
    topicLoading,
    postsLoading,
    topicError,
    postsError
  });

  if (topicLoading) {
    return (
      <div className="min-h-screen bg-overlord-robot-core">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <OverlordHeader />
          <LoadingState message="The Overlord retrieves debate details..." />
        </div>
      </div>
    );
  }

  if (topicError) {
    return (
      <div className="min-h-screen bg-overlord-robot-core">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <OverlordHeader />
          <ErrorState 
            error={topicError as Error} 
            retry={() => window.location.reload()} 
          />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-overlord-robot-core">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <OverlordHeader />
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-status-rejected-red clip-hexagon mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-status-rejected-red font-display text-xl uppercase tracking-widest mb-2">
              Debate Not Found
            </h3>
            <p className="text-overlord-muted-light font-overlord text-sm">
              The requested debate does not exist or has been removed by the Overlord.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-overlord-robot-core">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <OverlordHeader />

        {/* Topic Details */}
        <div className="mb-8">
          <TopicCard topic={topic} />
        </div>

        {/* Posts Thread */}
        <div className="space-y-6">
          {/* Thread Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold uppercase tracking-widest text-overlord-gold font-display mb-2">
              Debate Thread
            </h2>
            <p className="text-overlord-muted-light font-overlord text-sm uppercase tracking-widest">
              {postsResponse?.length || 0} statements submitted for evaluation
            </p>
          </div>

          {/* Posts Loading State */}
          {postsLoading && (
            <LoadingState message="Loading citizen statements..." />
          )}

          {/* Posts Error State */}
          {postsError && (
            <ErrorState 
              error={postsError as Error} 
              retry={() => refetchPosts()} 
            />
          )}

          {/* Posts List */}
          {postsResponse && postsResponse.length > 0 && (
            <>
              {postsResponse.map((post: PostThread) => (
                <PostCard key={post.pk} post={post} />
              ))}
            </>
          )}

          {/* Empty Posts State */}
          {postsResponse && postsResponse.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-overlord-gold/30 clip-hexagon mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-overlord-gold font-display text-xl uppercase tracking-widest mb-2">
                No Statements Yet
              </h3>
              <p className="text-overlord-muted-light font-overlord text-sm">
                Be the first citizen to contribute to this debate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
