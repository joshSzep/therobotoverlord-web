/**
 * Topic card component for The Robot Overlord
 * Displays topic information in a card format
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Topic } from '@/types/topics';
import { TopicCardProps } from '@/types/components';

export function TopicCard({
  topic,
  showCategory = true,
  showStats = true,
  showDescription = true,
  compact = false,
  onClick,
  onSubscribe,
  className = '',
}: TopicCardProps) {
  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubscribe?.();
  };

  const handleClick = () => {
    onClick?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Card 
      variant="bordered" 
      className={`hover:border-overlord-red/50 transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <CardHeader className={compact ? 'p-4' : 'p-6'}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            {showCategory && (
              <div className="flex items-center mb-2">
                <span 
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${topic.category.color}20`,
                    color: topic.category.color 
                  }}
                >
                  {topic.category.icon && (
                    <span className="mr-1">{topic.category.icon}</span>
                  )}
                  {topic.category.name}
                </span>
              </div>
            )}

            {/* Topic Title */}
            <h3 className={`font-bold text-light-text hover:text-overlord-red transition-colors ${
              compact ? 'text-lg' : 'text-xl'
            }`}>
              <Link href={`/topics/${topic.slug}`} className="hover:underline">
                {topic.title}
              </Link>
            </h3>

            {/* Status Indicators */}
            <div className="flex items-center space-x-2 mt-2">
              {topic.isPinned && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning-amber/20 text-warning-amber">
                  📌 Pinned
                </span>
              )}
              {topic.isLocked && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-rejected-red/20 text-rejected-red">
                  🔒 Locked
                </span>
              )}
              {topic.isFeatured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-approved-green/20 text-approved-green">
                  ⭐ Featured
                </span>
              )}
              {topic.moderationStatus === 'pending' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning-amber/20 text-warning-amber">
                  ⏳ Pending Review
                </span>
              )}
            </div>
          </div>

          {/* Subscribe Button */}
          {onSubscribe && (
            <Button
              variant={topic.userSubscribed ? "secondary" : "primary"}
              size="sm"
              onClick={handleSubscribe}
              className="ml-4 flex-shrink-0"
            >
              {topic.userSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </Button>
          )}
        </div>
      </CardHeader>

      {!compact && (
        <CardContent className="px-6 pb-6">
          {/* Description */}
          {showDescription && topic.description && (
            <p className="text-muted-light text-sm mb-4 line-clamp-2">
              {topic.description}
            </p>
          )}

          {/* Tags */}
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {topic.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted/20 text-muted-light hover:bg-overlord-red/20 hover:text-overlord-red transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {topic.tags.length > 5 && (
                <span className="text-xs text-muted-light">
                  +{topic.tags.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Stats and Last Activity */}
          {showStats && (
            <div className="flex items-center justify-between text-sm text-muted-light">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <span className="mr-1">📝</span>
                  {formatNumber(topic.postCount)} posts
                </span>
                <span className="flex items-center">
                  <span className="mr-1">👥</span>
                  {formatNumber(topic.participantCount)} participants
                </span>
                <span className="flex items-center">
                  <span className="mr-1">👁️</span>
                  {formatNumber(topic.viewCount)} views
                </span>
                {topic.userSubscribed !== undefined && (
                  <span className="flex items-center">
                    <span className="mr-1">🔔</span>
                    {formatNumber(topic.subscriberCount)} subscribers
                  </span>
                )}
              </div>

              {/* Last Activity */}
              {topic.lastPost && (
                <div className="text-right">
                  <div className="text-xs">
                    Last post by{' '}
                    <Link 
                      href={`/users/${topic.lastPost.author.id}`}
                      className="text-overlord-red hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {topic.lastPost.author.username}
                    </Link>
                  </div>
                  <div className="text-xs text-muted">
                    {formatDate(topic.lastPost.createdAt)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Creator Info */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted/20">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-overlord-red/20 flex items-center justify-center">
                {topic.creator.avatar ? (
                  <img 
                    src={topic.creator.avatar} 
                    alt={topic.creator.username}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <span className="text-xs text-overlord-red">
                    {topic.creator.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-sm">
                <span className="text-muted-light">Created by </span>
                <Link 
                  href={`/users/${topic.creator.id}`}
                  className="text-overlord-red hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {topic.creator.username}
                </Link>
              </div>
            </div>
            <div className="text-xs text-muted">
              {formatDate(topic.createdAt)}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
