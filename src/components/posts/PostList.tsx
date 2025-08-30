/**
 * Post list component for The Robot Overlord
 * Displays a list of posts with voting, replies, and actions
 */

'use client';

import React from 'react';
import { PostCard } from './PostCard';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Post } from '@/types/posts';

interface PostListProps {
  posts: Post[];
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onReply?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyText?: string;
  className?: string;
}

export function PostList({
  posts,
  onVote,
  onReply,
  onEdit,
  onDelete,
  onReport,
  showPagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyText = "No posts found",
  className = '',
}: PostListProps) {
  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          className="mr-2"
        >
          ← Previous
        </Button>
      );
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "primary" : "ghost"}
          size="sm"
          onClick={() => handlePageChange(1)}
          className="mr-1"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="mx-2 text-muted-light">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "primary" : "ghost"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mr-1"
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="mx-2 text-muted-light">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "primary" : "ghost"}
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="mr-1"
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <Button
          key="next"
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          className="ml-2"
        >
          Next →
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center mt-8 space-x-1">
        {pages}
      </div>
    );
  };

  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      loadingComponent={
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-muted/20 rounded-lg p-6 animate-pulse">
              <div className="flex space-x-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-6 w-6 bg-muted/20 rounded"></div>
                  <div className="h-4 w-8 bg-muted/20 rounded"></div>
                  <div className="h-6 w-6 bg-muted/20 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-muted/20 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-muted/20 rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted/20 rounded w-3/4 mb-4"></div>
                  <div className="flex space-x-4">
                    <div className="h-6 bg-muted/20 rounded w-16"></div>
                    <div className="h-6 bg-muted/20 rounded w-16"></div>
                    <div className="h-6 bg-muted/20 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
    >
      <div className={`space-y-4 ${className}`}>
        {isEmpty ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-light-text mb-2">
              No Posts Yet
            </h3>
            <p className="text-muted-light mb-6">
              {emptyText}
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onVote={onVote}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
              />
            ))}
            
            {renderPagination()}
          </>
        )}
      </div>
    </LoadingState>
  );
}
