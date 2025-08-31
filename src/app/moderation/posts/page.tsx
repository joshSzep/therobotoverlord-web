/**
 * Post moderation queue page for The Robot Overlord
 * Allows moderators to approve, reject, and manage pending posts
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PostModerationCard } from '@/components/moderation/PostModerationCard';
import { ModerationFilters } from '@/components/moderation/ModerationFilters';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { useAppStore } from '@/stores/appStore';
import { postsService } from '@/services';
import { Post } from '@/types/posts';

interface ModerationFiltersType {
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'all';
  category?: string;
  dateRange?: 'day' | 'week' | 'month' | 'all';
  sortBy: 'newest' | 'oldest' | 'priority';
}

export default function PostModerationPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filters, setFilters] = useState<ModerationFiltersType>({
    status: 'pending',
    category: undefined,
    dateRange: 'all',
    sortBy: 'newest',
  });

  // Load posts for moderation
  const loadPosts = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await postsService.getPendingModeration(page, 20);

      if (response.data) {
        setPosts(response.data as Post[] || []);
        setTotalPages((response as any).totalPages || 1);
        setTotalCount((response as any).total || 0);
        setCurrentPage(page);
      } else {
        throw new Error('Failed to load moderation queue');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Loading Error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [filters]);

  // Handle post moderation
  const handlePostModeration = async (postId: string, action: 'approve' | 'reject' | 'flag', reason?: string) => {
    try {
      const response = await postsService.moderatePost(postId, {
        action,
        reason,
        notifyAuthor: true,
      });

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Post Moderated',
          message: `Post has been ${action}d successfully`,
        });

        // Refresh the list
        loadPosts(currentPage);
        
        // Remove from selected posts
        setSelectedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        throw new Error(`Failed to ${action} post`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${action} post`;
      addNotification({
        type: 'error',
        title: 'Moderation Error',
        message: errorMessage,
      });
    }
  };

  // Handle bulk moderation
  const handleBulkModeration = async (action: 'approve' | 'reject' | 'flag', reason?: string) => {
    if (selectedPosts.size === 0) {
      addNotification({
        type: 'warning',
        title: 'No Selection',
        message: 'Please select posts to moderate',
      });
      return;
    }

    try {
      const postIds = Array.from(selectedPosts);
      const response = await postsService.bulkModerate(postIds, {
        action,
        reason,
        notifyAuthor: true,
      });

      if (response.success && response.data) {
        const { success, failed } = response.data;
        
        addNotification({
          type: success.length > 0 ? 'success' : 'error',
          title: 'Bulk Moderation Complete',
          message: `${success.length} posts ${action}d successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
        });

        // Refresh the list
        loadPosts(currentPage);
        setSelectedPosts(new Set());
      } else {
        throw new Error(`Failed to bulk ${action} posts`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to bulk ${action} posts`;
      addNotification({
        type: 'error',
        title: 'Bulk Moderation Error',
        message: errorMessage,
      });
    }
  };

  // Handle post selection
  const handlePostSelect = (postId: string, selected: boolean) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedPosts(new Set(posts.map(post => post.id)));
    } else {
      setSelectedPosts(new Set());
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: ModerationFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    loadPosts(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-light-text">Post Moderation</h1>
          <p className="text-muted-light mt-1">
            Review and moderate posts awaiting approval
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-light">
            {totalCount} posts in queue
          </span>
          <Button
            variant="ghost"
            onClick={() => loadPosts(currentPage)}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPosts.size > 0 && (
        <Card variant="bordered" className="border-overlord-red/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-light-text font-medium">
                {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkModeration('approve')}
                  className="text-approved-green hover:bg-approved-green/10"
                >
                  ✓ Approve All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkModeration('reject', 'Bulk rejection')}
                  className="text-rejected-red hover:bg-rejected-red/10"
                >
                  ✗ Reject All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkModeration('flag', 'Requires review')}
                  className="text-warning-amber hover:bg-warning-amber/10"
                >
                  🚩 Flag All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPosts(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ModerationFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalCount={totalCount}
          />
        </div>

        {/* Posts List */}
        <div className="lg:col-span-3">
          <LoadingState
            isLoading={isLoading}
            error={error}
            loadingComponent={
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} variant="bordered" className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-6 h-6 bg-muted/20 rounded"></div>
                        <div className="flex-1">
                          <div className="h-6 bg-muted/20 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted/20 rounded w-full mb-2"></div>
                          <div className="h-4 bg-muted/20 rounded w-2/3 mb-4"></div>
                          <div className="flex justify-between">
                            <div className="flex space-x-4">
                              <div className="h-4 bg-muted/20 rounded w-16"></div>
                              <div className="h-4 bg-muted/20 rounded w-20"></div>
                            </div>
                            <div className="flex space-x-2">
                              <div className="h-8 bg-muted/20 rounded w-16"></div>
                              <div className="h-8 bg-muted/20 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            {posts.length > 0 ? (
              <div className="space-y-4">
                {/* Select All */}
                <div className="flex items-center space-x-3 p-4 bg-dark-bg/50 rounded-lg border border-muted/20">
                  <input
                    type="checkbox"
                    checked={selectedPosts.size === posts.length && posts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 rounded focus:ring-overlord-red focus:ring-2"
                  />
                  <span className="text-sm text-light-text">
                    Select all {posts.length} posts on this page
                  </span>
                </div>

                {/* Posts */}
                {posts.map((post) => (
                  <PostModerationCard
                    key={post.id}
                    post={post}
                    selected={selectedPosts.has(post.id)}
                    onSelect={(selected) => handlePostSelect(post.id, selected)}
                    onModerate={(action, reason) => handlePostModeration(post.id, action, reason)}
                  />
                ))}

                {renderPagination()}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-light-text mb-2">
                  No Posts to Moderate
                </h3>
                <p className="text-muted-light mb-6">
                  All posts in the {filters.status} queue have been processed
                </p>
                <Button
                  variant="primary"
                  onClick={() => setFilters({ ...filters, status: 'pending' })}
                >
                  View Pending Posts
                </Button>
              </div>
            )}
          </LoadingState>
        </div>
      </div>
    </div>
  );
}
