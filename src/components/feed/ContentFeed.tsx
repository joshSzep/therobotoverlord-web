/**
 * Content feed component for The Robot Overlord
 * Displays mixed feed of posts and topics with infinite scroll
 */

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Post } from '@/types/posts';
import { Topic } from '@/types/topics';

interface FeedItem {
  id: string;
  type: 'post' | 'topic';
  data: Post | Topic;
  timestamp: string;
  relevanceScore?: number;
}

interface ContentFeedProps {
  items: FeedItem[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  className?: string;
}

export function ContentFeed({
  items,
  onLoadMore,
  hasMore,
  isLoadingMore,
  className = '',
}: ContentFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

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

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getScoreColor = (score: number) => {
    if (score >= 10) return 'text-approved-green';
    if (score >= 5) return 'text-warning-amber';
    if (score >= 0) return 'text-light-text';
    return 'text-rejected-red';
  };

  const renderPostItem = (item: FeedItem) => {
    const post = item.data as Post;
    
    return (
      <Card key={item.id} variant="bordered" className="hover:border-overlord-red/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Post Type Indicator */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-overlord-red/20 flex items-center justify-center">
              <span className="text-overlord-red text-lg">📝</span>
            </div>

            {/* Post Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Link 
                    href={`/posts/${post.id}`}
                    className="text-xl font-bold text-light-text hover:text-overlord-red transition-colors line-clamp-2"
                  >
                    {post.title}
                  </Link>
                  
                  {post.topic && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Link 
                        href={`/topics/${post.topic.slug}`}
                        className="text-sm text-overlord-red hover:underline"
                      >
                        in {post.topic.title}
                      </Link>
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: `${post.topic.category.color}20`,
                          color: post.topic.category.color 
                        }}
                      >
                        {post.topic.category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Score Badge */}
                <div className={`text-sm font-medium ${getScoreColor(post.score || 0)}`}>
                  {post.score || 0} pts
                </div>
              </div>

              {/* Content Preview */}
              <div className="text-muted-light mb-3">
                <p className="line-clamp-3">
                  {truncateContent(post.content)}
                </p>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted/20 text-muted-light text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="px-2 py-1 bg-muted/20 text-muted-light text-xs rounded">
                      +{post.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4 text-muted-light">
                  <span>
                    by <span className="text-light-text font-medium">{post.author.username}</span>
                  </span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>{post.replyCount} replies</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-approved-green">↑ {post.upvotes}</span>
                  <span className="text-xs text-rejected-red">↓ {post.downvotes}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 mt-4 pt-3 border-t border-muted/20">
                <Link
                  href={`/posts/${post.id}`}
                  className="text-sm text-overlord-red hover:underline"
                >
                  Read Post →
                </Link>
                {post.topic && (
                  <Link
                    href={`/topics/${post.topic.slug}`}
                    className="text-sm text-muted-light hover:text-light-text hover:underline"
                  >
                    View Topic →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTopicItem = (item: FeedItem) => {
    const topic = item.data as Topic;
    
    return (
      <Card key={item.id} variant="bordered" className="hover:border-overlord-red/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Topic Type Indicator */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-overlord-red/20 flex items-center justify-center">
              <span className="text-overlord-red text-lg">💬</span>
            </div>

            {/* Topic Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Link 
                    href={`/topics/${topic.slug}`}
                    className="text-xl font-bold text-light-text hover:text-overlord-red transition-colors line-clamp-2"
                  >
                    {topic.title}
                  </Link>
                  
                  <div className="flex items-center space-x-2 mt-2">
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
                      <span className="px-2 py-1 bg-overlord-red/20 text-overlord-red rounded text-xs font-medium">
                        📌 Pinned
                      </span>
                    )}
                  </div>
                </div>

                {/* Post Count Badge */}
                <div className="text-sm font-medium text-overlord-red">
                  {topic.postCount} posts
                </div>
              </div>

              {/* Description */}
              {topic.description && (
                <div className="text-muted-light mb-3">
                  <p className="line-clamp-2">
                    {truncateContent(topic.description)}
                  </p>
                </div>
              )}

              {/* Tags */}
              {topic.tags && topic.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {topic.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted/20 text-muted-light text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {topic.tags.length > 4 && (
                    <span className="px-2 py-1 bg-muted/20 text-muted-light text-xs rounded">
                      +{topic.tags.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4 text-muted-light">
                  <span>
                    by <span className="text-light-text font-medium">{(topic as any).author?.username || 'Unknown'}</span>
                  </span>
                  <span>{formatDate(topic.createdAt)}</span>
                  <span>{topic.viewCount} views</span>
                </div>

                <div className="flex items-center space-x-2">
                  {(topic as any).lastActivity && (
                    <span className="text-xs text-muted-light">
                      Active {formatDate((topic as any).lastActivity)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 mt-4 pt-3 border-t border-muted/20">
                <Link
                  href={`/topics/${topic.slug}`}
                  className="text-sm text-overlord-red hover:underline"
                >
                  View Topic →
                </Link>
                <Link
                  href={`/topics/${topic.slug}/create-post`}
                  className="text-sm text-muted-light hover:text-light-text hover:underline"
                >
                  Add Post →
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Feed Items */}
      {items?.map((item) => (
        item.type === 'post' ? renderPostItem(item) : renderTopicItem(item)
      ))}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isLoadingMore ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-muted-light">Loading more content...</span>
          </div>
        ) : hasMore ? (
          <Button
            variant="ghost"
            onClick={onLoadMore}
            className="text-overlord-red hover:bg-overlord-red/10"
          >
            Load More Content
          </Button>
        ) : items.length > 0 ? (
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-muted-light text-sm">
              You&apos;ve reached the end of your feed
            </p>
            <p className="text-muted-light text-xs mt-1">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
