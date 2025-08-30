/**
 * Post card component for The Robot Overlord
 * Displays individual post with voting, actions, and metadata
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Post } from '@/types/posts';

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onReply?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  showTopic?: boolean;
  compact?: boolean;
  className?: string;
}

export function PostCard({
  post,
  onVote,
  onReply,
  onEdit,
  onDelete,
  onReport,
  showTopic = false,
  compact = false,
  className = '',
}: PostCardProps) {
  const [showActions, setShowActions] = useState(false);

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

  const handleVote = (voteType: 'up' | 'down') => {
    onVote?.(post.id, voteType);
  };

  return (
    <Card 
      variant="bordered" 
      className={`hover:border-overlord-red/30 transition-colors ${className}`}
    >
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <div className="flex space-x-4">
          {/* Voting Column */}
          <div className="flex flex-col items-center space-y-2 min-w-[3rem]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('up')}
              className={`p-1 h-8 w-8 ${
                post.userVote === 'up' 
                  ? 'text-approved-green bg-approved-green/20' 
                  : 'text-muted-light hover:text-approved-green'
              }`}
            >
              ▲
            </Button>
            
            <span className={`text-sm font-bold ${
              post.score > 0 
                ? 'text-approved-green' 
                : post.score < 0 
                ? 'text-rejected-red' 
                : 'text-muted-light'
            }`}>
              {post.score}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('down')}
              className={`p-1 h-8 w-8 ${
                post.userVote === 'down' 
                  ? 'text-rejected-red bg-rejected-red/20' 
                  : 'text-muted-light hover:text-rejected-red'
              }`}
            >
              ▼
            </Button>
          </div>

          {/* Content Column */}
          <div className="flex-1 min-w-0">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {/* Author */}
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-overlord-red/20 flex items-center justify-center">
                    {post.author.avatar ? (
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.username}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <span className="text-xs text-overlord-red">
                        {post.author.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Link 
                    href={`/users/${post.author.id}`}
                    className="font-medium text-light-text hover:text-overlord-red transition-colors"
                  >
                    {post.author.username}
                  </Link>
                  <span className="text-xs px-2 py-1 rounded bg-muted/20 text-muted-light">
                    {post.author.role}
                  </span>
                </div>

                {/* Timestamp */}
                <span className="text-sm text-muted-light">
                  {formatDate(post.createdAt)}
                </span>

                {/* Edited Indicator */}
                {post.editedAt && (
                  <span className="text-xs text-muted-light italic">
                    (edited {formatDate(post.editedAt)})
                  </span>
                )}
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 h-6 w-6 text-muted-light hover:text-light-text"
                >
                  ⋯
                </Button>

                {showActions && (
                  <div className="absolute right-0 top-8 bg-dark-card border border-muted/20 rounded-lg shadow-lg py-2 z-10 min-w-[120px]">
                    {onReply && (
                      <button
                        onClick={() => {
                          onReply(post.id);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-light-text hover:bg-muted/10 transition-colors"
                      >
                        Reply
                      </button>
                    )}
                    {onEdit && post.userPermissions?.canEdit && (
                      <button
                        onClick={() => {
                          onEdit(post.id);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-light-text hover:bg-muted/10 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && post.userPermissions?.canDelete && (
                      <button
                        onClick={() => {
                          onDelete(post.id);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-rejected-red hover:bg-rejected-red/10 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                    {onReport && (
                      <button
                        onClick={() => {
                          onReport(post.id);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-warning-amber hover:bg-warning-amber/10 transition-colors"
                      >
                        Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Topic Link (if showing topic) */}
            {showTopic && post.topic && (
              <div className="mb-3">
                <Link 
                  href={`/topics/${post.topic.slug}`}
                  className="text-sm text-overlord-red hover:underline"
                >
                  in {post.topic.title}
                </Link>
              </div>
            )}

            {/* Post Title */}
            {post.title && (
              <h3 className={`font-bold text-light-text mb-2 ${
                compact ? 'text-lg' : 'text-xl'
              }`}>
                {post.title}
              </h3>
            )}

            {/* Post Content */}
            <div className="prose prose-invert max-w-none mb-4">
              <div 
                className="text-light-text leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {post.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-muted/20 rounded-lg text-sm text-light-text hover:bg-muted/30 transition-colors"
                    >
                      <span className="mr-2">📎</span>
                      {attachment.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Post Footer */}
            <div className="flex items-center justify-between text-sm text-muted-light">
              <div className="flex items-center space-x-4">
                {/* Reply Count */}
                {post.replyCount > 0 && (
                  <span className="flex items-center">
                    <span className="mr-1">💬</span>
                    {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                  </span>
                )}

                {/* Vote Counts */}
                <span className="flex items-center space-x-2">
                  <span className="text-approved-green">
                    ▲ {post.upvotes}
                  </span>
                  <span className="text-rejected-red">
                    ▼ {post.downvotes}
                  </span>
                </span>
              </div>

              {/* Moderation Status */}
              {post.moderationStatus === 'pending' && (
                <span className="text-warning-amber text-xs">
                  ⏳ Pending Review
                </span>
              )}
              {post.moderationStatus === 'rejected' && (
                <span className="text-rejected-red text-xs">
                  ❌ Rejected
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
