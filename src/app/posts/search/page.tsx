/**
 * Post search page for The Robot Overlord
 * Allows users to search and filter posts with advanced options
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { PostSearchResults } from '@/components/posts/PostSearchResults';
import { PostSearchFilters } from '@/components/posts/PostSearchFilters';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { useAppStore } from '@/stores/appStore';
import { postsService } from '@/services';
import { Post } from '@/types/posts';

interface PostSearchFilters {
  query: string;
  category?: string;
  topic?: string;
  author?: string;
  tags?: string[];
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy: 'relevance' | 'newest' | 'oldest' | 'popular' | 'controversial';
  status?: 'all' | 'approved' | 'pending' | 'rejected';
  minScore?: number;
  hasReplies?: boolean;
}

export default function PostSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useAppStore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<PostSearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || undefined,
    topic: searchParams.get('topic') || undefined,
    author: searchParams.get('author') || undefined,
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    dateRange: (searchParams.get('dateRange') as any) || 'all',
    sortBy: (searchParams.get('sortBy') as any) || 'relevance',
    status: (searchParams.get('status') as any) || 'all',
    minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
    hasReplies: searchParams.get('hasReplies') === 'true' || undefined,
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: PostSearchFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.topic) params.set('topic', newFilters.topic);
    if (newFilters.author) params.set('author', newFilters.author);
    if (newFilters.tags && newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','));
    if (newFilters.dateRange !== 'all') params.set('dateRange', newFilters.dateRange!);
    if (newFilters.sortBy !== 'relevance') params.set('sortBy', newFilters.sortBy);
    if (newFilters.status !== 'all') params.set('status', newFilters.status!);
    if (newFilters.minScore) params.set('minScore', newFilters.minScore.toString());
    if (newFilters.hasReplies) params.set('hasReplies', 'true');

    const queryString = params.toString();
    const newURL = queryString ? `/posts/search?${queryString}` : '/posts/search';
    
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Search posts
  const searchPosts = async (page: number = 1, newFilters?: PostSearchFilters) => {
    const searchFilters = newFilters || filters;
    
    if (!searchFilters.query.trim() && !searchFilters.category && !searchFilters.topic && !searchFilters.author) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await postsService.searchPosts({
        query: searchFilters.query.trim(),
        category: searchFilters.category,
        topic: searchFilters.topic,
        author: searchFilters.author,
        tags: searchFilters.tags,
        dateRange: searchFilters.dateRange,
        sortBy: searchFilters.sortBy,
        status: searchFilters.status,
        minScore: searchFilters.minScore,
        hasReplies: searchFilters.hasReplies,
        page,
        limit: 20,
      });

      if (response.data) {
        setPosts(response.data);
        setTotalPages((response as any).totalPages || 1);
        setTotalCount((response as any).total || 0);
        setCurrentPage(page);
        setHasSearched(true);
      } else {
        throw new Error('Failed to search posts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search posts';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Search Error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    const newFilters = { ...filters, query };
    setFilters(newFilters);
    updateURL(newFilters);
    searchPosts(1, newFilters);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<PostSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
    setCurrentPage(1);
    searchPosts(1, updatedFilters);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    searchPosts(page);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: PostSearchFilters = {
      query: '',
      category: undefined,
      topic: undefined,
      author: undefined,
      tags: [],
      dateRange: 'all',
      sortBy: 'relevance',
      status: 'all',
      minScore: undefined,
      hasReplies: undefined,
    };
    setFilters(clearedFilters);
    setPosts([]);
    setHasSearched(false);
    setCurrentPage(1);
    router.replace('/posts/search');
  };

  // Initial search if URL has parameters
  useEffect(() => {
    if (filters.query || filters.category || filters.topic || filters.author) {
      searchPosts(1);
    }
  }, []); // Only run on mount

  const renderPagination = () => {
    if (totalPages <= 1) return null;

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
          <h1 className="text-3xl font-bold text-light-text">Search Posts</h1>
          <p className="text-muted-light mt-1">
            Find posts across all topics and categories
          </p>
        </div>
        {hasSearched && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-light">
              {totalCount} result{totalCount !== 1 ? 's' : ''} found
            </span>
            <Button
              variant="ghost"
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <Card variant="bordered">
        <CardContent className="p-6">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search posts by title, content, author, or tags..."
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <PostSearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalCount={totalCount}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <LoadingState
            isLoading={isLoading}
            error={error}
            loadingComponent={
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} variant="bordered" className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-6 bg-muted/20 rounded w-3/4"></div>
                        <div className="h-4 bg-muted/20 rounded w-full"></div>
                        <div className="h-4 bg-muted/20 rounded w-2/3"></div>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4">
                            <div className="h-4 bg-muted/20 rounded w-16"></div>
                            <div className="h-4 bg-muted/20 rounded w-20"></div>
                          </div>
                          <div className="h-4 bg-muted/20 rounded w-24"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            {hasSearched ? (
              posts.length > 0 ? (
                <div className="space-y-4">
                  <PostSearchResults
                    posts={posts}
                    searchQuery={filters.query}
                    totalCount={totalCount}
                  />
                  {renderPagination()}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-light-text mb-2">
                    No Posts Found
                  </h3>
                  <p className="text-muted-light mb-6">
                    Try adjusting your search terms or filters
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-light">Suggestions:</p>
                    <ul className="text-sm text-muted-light space-y-1">
                      <li>• Check your spelling</li>
                      <li>• Try broader search terms</li>
                      <li>• Remove some filters</li>
                      <li>• Search for different keywords</li>
                    </ul>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-light-text mb-2">
                  Search for Posts
                </h3>
                <p className="text-muted-light mb-6">
                  Enter a search term above to find posts across all topics
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-light">You can search by:</p>
                  <ul className="text-sm text-muted-light space-y-1">
                    <li>• Post title or content</li>
                    <li>• Author username</li>
                    <li>• Tags and categories</li>
                    <li>• Topic names</li>
                  </ul>
                </div>
              </div>
            )}
          </LoadingState>
        </div>
      </div>
    </div>
  );
}
