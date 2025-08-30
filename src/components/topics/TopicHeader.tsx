/**
 * Topic header component for The Robot Overlord
 * Displays topic title, metadata, and action buttons
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Topic } from '@/types/topics';

interface TopicHeaderProps {
  topic: Topic;
  onSubscribe?: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
  className?: string;
}

export function TopicHeader({
  topic,
  onSubscribe,
  onEdit,
  canEdit = false,
  className = '',
}: TopicHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Card variant="bordered" className={className}>
      <CardContent className="p-6">
        {/* Category Badge */}
        <div className="flex items-center mb-4">
          <Link 
            href={`/topics?categoryId=${topic.category.id}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ 
              backgroundColor: `${topic.category.color}20`,
              color: topic.category.color 
            }}
          >
            {topic.category.icon && (
              <span className="mr-2">{topic.category.icon}</span>
            )}
            {topic.category.name}
          </Link>
        </div>

        {/* Topic Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-light-text mb-2">
              {topic.title}
            </h1>

            {/* Status Indicators */}
            <div className="flex items-center space-x-2 mb-4">
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

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 ml-6">
            {onSubscribe && (
              <Button
                variant={topic.userSubscribed ? "secondary" : "primary"}
                onClick={onSubscribe}
                className="flex items-center space-x-2"
              >
                <span>{topic.userSubscribed ? '🔔' : '🔕'}</span>
                <span>{topic.userSubscribed ? 'Unsubscribe' : 'Subscribe'}</span>
              </Button>
            )}
            
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                onClick={onEdit}
                className="flex items-center space-x-2"
              >
                <span>✏️</span>
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {topic.description && (
          <div className="mb-6">
            <p className="text-muted-light leading-relaxed">
              {topic.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {topic.tags.map((tag) => (
              <Link
                key={tag}
                href={`/topics?tags=${encodeURIComponent(tag)}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted/20 text-muted-light hover:bg-overlord-red/20 hover:text-overlord-red transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-overlord-red">
              {formatNumber(topic.postCount)}
            </div>
            <div className="text-sm text-muted-light">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-overlord-red">
              {formatNumber(topic.participantCount)}
            </div>
            <div className="text-sm text-muted-light">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-overlord-red">
              {formatNumber(topic.viewCount)}
            </div>
            <div className="text-sm text-muted-light">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-overlord-red">
              {formatNumber(topic.subscriberCount)}
            </div>
            <div className="text-sm text-muted-light">Subscribers</div>
          </div>
        </div>

        {/* Creator and Dates */}
        <div className="flex items-center justify-between pt-6 border-t border-muted/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-overlord-red/20 flex items-center justify-center">
              {topic.creator.avatar ? (
                <img 
                  src={topic.creator.avatar} 
                  alt={topic.creator.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-sm font-bold text-overlord-red">
                  {topic.creator.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Link 
                  href={`/users/${topic.creator.id}`}
                  className="font-medium text-light-text hover:text-overlord-red transition-colors"
                >
                  {topic.creator.username}
                </Link>
                <span className="text-xs px-2 py-1 rounded bg-muted/20 text-muted-light">
                  {topic.creator.role}
                </span>
              </div>
              <div className="text-sm text-muted-light">
                Created {formatDate(topic.createdAt)}
              </div>
            </div>
          </div>

          {/* Last Activity */}
          {topic.lastPost && (
            <div className="text-right">
              <div className="text-sm text-light-text">
                Last post by{' '}
                <Link 
                  href={`/users/${topic.lastPost.author.id}`}
                  className="text-overlord-red hover:underline"
                >
                  {topic.lastPost.author.username}
                </Link>
              </div>
              <div className="text-xs text-muted-light">
                {formatDate(topic.lastPost.createdAt)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
