/**
 * Search results page for The Robot Overlord
 * Displays comprehensive search results across topics, posts, and users
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters } from '@/components/search/SearchFilters';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';

interface SearchFiltersType {
  type: 'all' | 'topics' | 'posts' | 'users';
  category?: string;
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy: 'relevance' | 'date' | 'score' | 'activity';
  sortOrder: 'desc' | 'asc';
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState<SearchFiltersType>({
    type: 'all',
    category: undefined,
    dateRange: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  // Perform search
  const performSearch = async (searchQuery: string, searchFilters: SearchFiltersType, page: number = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Mock search API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock results based on query and filters
      const mockResults = [
        {
          id: '1',
          type: 'topic',
          title: `AI Ethics Discussion - ${searchQuery}`,
          description: 'Exploring the ethical implications of artificial intelligence in modern society',
          url: '/topics/ai-ethics-discussion',
          score: 95,
          author: { username: 'robot_overlord', avatar: null },
          category: { name: 'Philosophy', color: '#8B5CF6' },
          createdAt: '2024-01-15T10:00:00Z',
          stats: { posts: 42, participants: 15, views: 1250 }
        },
        {
          id: '2',
          type: 'post',
          title: `Machine Learning Best Practices for ${searchQuery}`,
          description: 'A comprehensive guide to implementing ML solutions effectively',
          url: '/topics/ml-guide/posts/123',
          score: 87,
          author: { username: 'ai_researcher', avatar: null },
          topic: { title: 'ML Guide', slug: 'ml-guide' },
          createdAt: '2024-01-10T14:30:00Z',
          stats: { upvotes: 45, downvotes: 3, replies: 12 }
        },
        {
          id: '3',
          type: 'user',
          title: 'robot_master',
          description: 'Senior AI Engineer specializing in robotics and automation',
          url: '/users/robot_master',
          score: 78,
          stats: { loyaltyScore: 1250, posts: 89, topics: 12 },
          createdAt: '2023-06-01T00:00:00Z',
          lastActive: '2024-01-20T16:45:00Z'
        }
      ].filter(result => 
        searchFilters.type === 'all' || result.type === searchFilters.type
      );

      setResults(mockResults);
      setTotalResults(mockResults.length);
      setTotalPages(Math.ceil(mockResults.length / 20));
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
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

  // Initial search on page load
  useEffect(() => {
    if (query) {
      performSearch(query, filters);
    }
  }, []);

  // Handle new search
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    router.push(`/search?q=${encodeURIComponent(newQuery)}`);
    performSearch(newQuery, filters);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    if (query) {
      performSearch(query, newFilters);
    }
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch(query, filters, page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-light-text">Search</h1>
          <p className="text-muted-light mt-1">
            Find topics, posts, and users across The Robot Overlord
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl">
        <SearchBar
          placeholder="Search topics, posts, and users..."
          showResults={false}
          onSearch={(searchQuery) => handleSearch(searchQuery)}
        />
      </div>

      {/* Search Results */}
      {query && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              totalResults={totalResults}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <SearchResults
              query={query}
              results={results as any}
              isLoading={isLoading}
              error={error}
              totalResults={totalResults}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              filters={filters}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!query && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-light-text mb-2">
            Search The Robot Overlord
          </h3>
          <p className="text-muted-light mb-6">
            Enter a search term above to find topics, posts, and users
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/topics')}
            >
              Browse Topics
            </Button>
            <Button 
              variant="primary" 
              onClick={() => document.querySelector('input')?.focus()}
            >
              Start Searching
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
