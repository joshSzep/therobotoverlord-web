/**
 * Post search results component for The Robot Overlord
 * Displays search results with highlighting and metadata
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Post } from '@/types/posts';

interface PostSearchResultsProps {
  posts: Post[];
  searchQuery: string;
  totalCount: number;
  className?: string;
}

export function PostSearchResults({
  posts,
  searchQuery,
  totalCount,
  className = '',
}: PostSearchResultsProps) {
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

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-overlord-red/30 text-overlord-red px-1 rounded">
          {part}
        </mark>
      ) : part
    );
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-light-text">
            Search Results
          </h2>
          <p className="text-sm text-muted-light">
            {totalCount} post{totalCount !== 1 ? 's' : ''} found
            {searchQuery && (
              <span> for "<span className="text-overlord-red">{searchQuery}</span>"</span>
            )}
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card 
            key={post.id} 
            variant="bordered" 
            className="hover:border-overlord-red/50 transition-colors"
          >
            <CardContent className="p-6">
              <div className="space-y-3">
                {/* Title and Topic */}
                <div>
                  <Link 
                    href={`/posts/${post.id}`}
                    className="text-xl font-bold text-light-text hover:text-overlord-red transition-colors line-clamp-2"
                  >
                    {highlightText(post.title, searchQuery)}
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

                {/* Content Preview */}
                <div className="text-muted-light">
                  <p className="line-clamp-3">
                    {highlightText(truncateContent(post.content), searchQuery)}
                  </p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-muted/20 text-muted-light text-xs rounded hover:bg-overlord-red/20 hover:text-overlord-red transition-colors"
                      >
                        #{highlightText(tag, searchQuery)}
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
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-muted-light">
                    <span>
                      by <span className="text-light-text font-medium">
                        {highlightText(post.author.username, searchQuery)}
                      </span>
                    </span>
                    <span>{formatDate(post.createdAt)}</span>
                    <span className={`font-medium ${getScoreColor(post.score || 0)}`}>
                      {post.score || 0} points
                    </span>
                    <span>{post.replyCount} replies</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Badge */}
                    {post.moderationStatus && post.moderationStatus !== 'approved' && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        post.moderationStatus === 'pending' ? 'bg-warning-amber/20 text-warning-amber' :
                        post.moderationStatus === 'rejected' ? 'bg-rejected-red/20 text-rejected-red' :
                        post.moderationStatus === 'flagged' ? 'bg-overlord-red/20 text-overlord-red' :
                        'bg-muted/20 text-muted-light'
                      }`}>
                        {post.moderationStatus}
                      </span>
                    )}

                    {/* Pinned Badge */}
                    {post.isPinned && (
                      <span className="px-2 py-1 bg-overlord-red/20 text-overlord-red rounded text-xs font-medium">
                        📌 Pinned
                      </span>
                    )}

                    {/* Locked Badge */}
                    {post.isLocked && (
                      <span className="px-2 py-1 bg-muted/20 text-muted-light rounded text-xs font-medium">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-muted/20">
                  <div className="flex items-center space-x-4">
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

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-light">
                      {post.upvotes} ↑
                    </span>
                    <span className="text-xs text-muted-light">
                      {post.downvotes} ↓
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Hint */}
      {posts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-light">
            Showing {posts.length} of {totalCount} results
          </p>
        </div>
      )}
    </div>
  );
}
