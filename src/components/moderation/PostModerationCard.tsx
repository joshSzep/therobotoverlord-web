/**
 * Post moderation card component for The Robot Overlord
 * Displays post details with moderation actions for moderators
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Post } from '@/types/posts';

interface PostModerationCardProps {
  post: Post;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onModerate: (action: 'approve' | 'reject' | 'flag', reason?: string) => void;
  className?: string;
}

export function PostModerationCard({
  post,
  selected,
  onSelect,
  onModerate,
  className = '',
}: PostModerationCardProps) {
  const [showReasonInput, setShowReasonInput] = useState<'reject' | 'flag' | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-warning-amber';
      case 'approved':
        return 'text-approved-green';
      case 'rejected':
        return 'text-rejected-red';
      case 'flagged':
        return 'text-overlord-red';
      default:
        return 'text-muted-light';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'flagged':
        return '🚩';
      default:
        return '❓';
    }
  };

  const handleModerationAction = async (action: 'approve' | 'reject' | 'flag') => {
    if ((action === 'reject' || action === 'flag') && !reason.trim()) {
      setShowReasonInput(action);
      return;
    }

    setIsSubmitting(true);
    try {
      await onModerate(action, reason.trim() || undefined);
      setReason('');
      setShowReasonInput(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReasonSubmit = (action: 'reject' | 'flag') => {
    if (reason.trim()) {
      handleModerationAction(action);
    }
  };

  const handleReasonCancel = () => {
    setReason('');
    setShowReasonInput(null);
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      variant="bordered" 
      className={`hover:border-overlord-red/50 transition-colors ${selected ? 'border-overlord-red/70 bg-overlord-red/5' : ''} ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Selection Checkbox */}
          <div className="flex items-center pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 rounded focus:ring-overlord-red focus:ring-2"
            />
          </div>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Link 
                    href={`/posts/${post.id}`}
                    className="text-xl font-bold text-light-text hover:text-overlord-red transition-colors line-clamp-1"
                  >
                    {post.title}
                  </Link>
                  {post.topic && (
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `${post.topic.category.color}20`,
                        color: post.topic.category.color 
                      }}
                    >
                      {post.topic.category.name}
                    </span>
                  )}
                </div>
                
                {/* Topic Link */}
                {post.topic && (
                  <div className="mb-2">
                    <Link 
                      href={`/topics/${post.topic.slug}`}
                      className="text-sm text-overlord-red hover:underline"
                    >
                      in {post.topic.title}
                    </Link>
                  </div>
                )}
                
                <div className="text-muted-light mb-3">
                  <p className="line-clamp-3">
                    {truncateContent(post.content)}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2 ml-4">
                <span className={`text-sm font-medium ${getStatusColor(post.moderationStatus)}`}>
                  {getStatusIcon(post.moderationStatus)} {post.moderationStatus.charAt(0).toUpperCase() + post.moderationStatus.slice(1)}
                </span>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted/20 text-muted-light text-xs rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 5 && (
                  <span className="px-2 py-1 bg-muted/20 text-muted-light text-xs rounded">
                    +{post.tags.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-muted-light mb-4">
              <div className="flex items-center space-x-4">
                <span>by {post.author.username}</span>
                <span>{formatDate(post.createdAt)}</span>
                <span className="text-approved-green">↑ {post.upvotes}</span>
                <span className="text-rejected-red">↓ {post.downvotes}</span>
                <span>{post.replyCount} replies</span>
              </div>
            </div>

            {/* Moderation Reason (if exists) */}
            {post.moderationReason && (
              <div className="bg-warning-amber/10 border border-warning-amber/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-warning-amber font-medium mb-1">
                  Moderation Note:
                </p>
                <p className="text-sm text-light-text">
                  {post.moderationReason}
                </p>
              </div>
            )}

            {/* Reason Input */}
            {showReasonInput && (
              <div className="bg-dark-bg/50 border border-muted/30 rounded-lg p-4 mb-4">
                <label className="block text-sm font-medium text-light-text mb-2">
                  Reason for {showReasonInput}:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Enter reason for ${showReasonInput}ing this post...`}
                  className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-end space-x-3 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReasonCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleReasonSubmit(showReasonInput)}
                    disabled={!reason.trim() || isSubmitting}
                    className={showReasonInput === 'reject' ? 'bg-rejected-red hover:bg-rejected-red/80' : 'bg-warning-amber hover:bg-warning-amber/80'}
                  >
                    {isSubmitting ? 'Submitting...' : `${showReasonInput.charAt(0).toUpperCase() + showReasonInput.slice(1)} Post`}
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!showReasonInput && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-sm text-overlord-red hover:underline"
                  >
                    View Post →
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

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleModerationAction('approve')}
                    disabled={isSubmitting || post.moderationStatus === 'approved'}
                    className="text-approved-green hover:bg-approved-green/10"
                  >
                    {isSubmitting ? '...' : '✓ Approve'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleModerationAction('reject')}
                    disabled={isSubmitting || post.moderationStatus === 'rejected'}
                    className="text-rejected-red hover:bg-rejected-red/10"
                  >
                    {isSubmitting ? '...' : '✗ Reject'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleModerationAction('flag')}
                    disabled={isSubmitting}
                    className="text-warning-amber hover:bg-warning-amber/10"
                  >
                    {isSubmitting ? '...' : '🚩 Flag'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
