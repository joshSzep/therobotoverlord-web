/**
 * Related topics component for The Robot Overlord
 * Displays topics related to the current topic
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { topicsService } from '@/services';
import { Topic } from '@/types/topics';

interface RelatedTopicsProps {
  topicId: string;
  currentTopicSlug?: string;
  limit?: number;
  className?: string;
}

export function RelatedTopics({
  topicId,
  currentTopicSlug,
  limit = 5,
  className = '',
}: RelatedTopicsProps) {
  const [relatedTopics, setRelatedTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load related topics
  const loadRelatedTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await topicsService.getRelatedTopics(topicId, limit);
      if (response.success && response.data) {
        // Filter out the current topic if it appears in related topics
        const filteredTopics = response.data.filter(
          topic => topic.slug !== currentTopicSlug
        );
        setRelatedTopics(filteredTopics);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load related topics';
      setError(errorMessage);
      console.error('Failed to load related topics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (topicId) {
      loadRelatedTopics();
    }
  }, [topicId, limit]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <Card variant="bordered" className={className}>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-bold text-light-text">Related Topics</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/20 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted/20 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="bordered" className={className}>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-bold text-light-text">Related Topics</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-light text-sm mb-3">
              Failed to load related topics
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadRelatedTopics}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedTopics.length === 0) {
    return (
      <Card variant="bordered" className={className}>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-bold text-light-text">Related Topics</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-muted-light text-sm">
              No related topics found
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-light-text">Related Topics</h3>
          <span className="text-sm text-muted-light">
            {relatedTopics.length} topic{relatedTopics.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedTopics.map((topic) => (
            <div
              key={topic.id}
              className="group border-b border-muted/20 last:border-b-0 pb-4 last:pb-0"
            >
              {/* Topic Title */}
              <Link
                href={`/topics/${topic.slug}`}
                className="block text-light-text hover:text-overlord-red transition-colors group-hover:text-overlord-red"
              >
                <h4 className="font-medium line-clamp-2 mb-1">
                  {topic.title}
                </h4>
              </Link>

              {/* Category Badge */}
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${topic.category.color}20`,
                    color: topic.category.color
                  }}
                >
                  {topic.category.name}
                </span>
                {topic.isPinned && (
                  <span className="text-xs text-warning-amber">📌 Pinned</span>
                )}
                {topic.isLocked && (
                  <span className="text-xs text-muted-light">🔒 Locked</span>
                )}
              </div>

              {/* Description */}
              {topic.description && (
                <p className="text-sm text-muted-light line-clamp-2 mb-2">
                  {topic.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-light">
                <div className="flex items-center space-x-3">
                  <span>{formatNumber(topic.postCount)} posts</span>
                  <span>{formatNumber(topic.subscriberCount)} subscribers</span>
                  <span>{formatNumber(topic.viewCount)} views</span>
                </div>
                <span>{formatDate(topic.lastActivityAt || topic.createdAt)}</span>
              </div>

              {/* Tags (if any) */}
              {topic.tags && topic.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {topic.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-muted/20 text-muted-light text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {topic.tags.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-muted/20 text-muted-light text-xs rounded">
                      +{topic.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View More Link */}
        {relatedTopics.length >= limit && (
          <div className="mt-4 pt-4 border-t border-muted/20">
            <Link
              href="/topics"
              className="text-sm text-overlord-red hover:underline"
            >
              Explore more topics →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
