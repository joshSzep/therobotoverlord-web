/**
 * Search results component for The Robot Overlord
 * Displays search results with different layouts for different content types
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';

interface SearchResult {
  id: string;
  type: 'topic' | 'post' | 'user';
  title: string;
  description: string;
  url: string;
  score: number;
  author?: {
    username: string;
    avatar?: string;
  };
  category?: {
    name: string;
    color: string;
  };
  topic?: {
    title: string;
    slug: string;
  };
  createdAt: string;
  lastActive?: string;
  stats?: unknown;
}

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: unknown;
  className?: string;
}

export function SearchResults({
  query,
  results,
  isLoading,
  error,
  totalResults,
  currentPage,
  totalPages,
  onPageChange,
  filters,
  className = '',
}: SearchResultsProps) {
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

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'topic':
        return '💬';
      case 'post':
        return '📝';
      case 'user':
        return '👤';
      default:
        return '🔍';
    }
  };

  const renderTopicResult = (result: SearchResult) => (
    <Card key={result.id} variant="bordered" className="hover:border-overlord-red/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="text-2xl">{getResultIcon(result.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Link 
                href={result.url}
                className="text-xl font-bold text-light-text hover:text-overlord-red transition-colors"
              >
                {result.title}
              </Link>
              {result.category && (
                <span 
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${result.category.color}20`,
                    color: result.category.color 
                  }}
                >
                  {result.category.name}
                </span>
              )}
            </div>
            
            <p className="text-muted-light mb-3 line-clamp-2">
              {result.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-light">
                {result.author && (
                  <span>by {result.author.username}</span>
                )}
                <span>{formatDate(result.createdAt)}</span>
                {result.stats ? (
                  <>
                    <span>{formatNumber((result.stats as any).posts)} posts</span>
                    <span>{formatNumber((result.stats as any).participants)} participants</span>
                    <span>{formatNumber((result.stats as any).views)} views</span>
                  </>
                ) : null}
              </div>
              <div className="text-sm font-medium text-overlord-red">
                {result.score}% match
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPostResult = (result: SearchResult) => (
    <Card key={result.id} variant="bordered" className="hover:border-overlord-red/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="text-2xl">{getResultIcon(result.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Link 
                href={result.url}
                className="text-xl font-bold text-light-text hover:text-overlord-red transition-colors"
              >
                {result.title}
              </Link>
            </div>
            
            {result.topic && (
              <div className="mb-2">
                <Link 
                  href={`/topics/${result.topic.slug}`}
                  className="text-sm text-overlord-red hover:underline"
                >
                  in {result.topic.title}
                </Link>
              </div>
            )}
            
            <p className="text-muted-light mb-3 line-clamp-2">
              {result.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-light">
                {result.author && (
                  <span>by {result.author.username}</span>
                )}
                <span>{formatDate(result.createdAt)}</span>
                {result.stats ? (
                  <>
                    <span className="text-approved-green">↑ {(result.stats as any).upvotes}</span>
                    <span className="text-rejected-red">↓ {(result.stats as any).downvotes}</span>
                    <span>{(result.stats as any).replies} replies</span>
                  </>
                ) : null}
              </div>
              <div className="text-sm font-medium text-overlord-red">
                {result.score}% match
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderUserResult = (result: SearchResult) => (
    <Card key={result.id} variant="bordered" className="hover:border-overlord-red/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-overlord-red/20 flex items-center justify-center">
            {result.author?.avatar ? (
              <img 
                src={result.author.avatar} 
                alt={result.title}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <span className="text-lg font-bold text-overlord-red">
                {result.title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Link 
                href={result.url}
                className="text-xl font-bold text-light-text hover:text-overlord-red transition-colors"
              >
                {result.title}
              </Link>
            </div>
            
            <p className="text-muted-light mb-3">
              {result.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-light">
                <span>Joined {formatDate(result.createdAt)}</span>
                {result.lastActive && (
                  <span>Active {formatDate(result.lastActive)}</span>
                )}
                {result.stats ? (
                  <>
                    <span className="text-overlord-red">{formatNumber((result.stats as any).loyaltyScore)} points</span>
                    <span>{(result.stats as any).posts} posts</span>
                    <span>{(result.stats as any).topics} topics</span>
                  </>
                ) : null}
              </div>
              <div className="text-sm font-medium text-overlord-red">
                {result.score}% match
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderResult = (result: SearchResult) => {
    switch (result.type) {
      case 'topic':
        return renderTopicResult(result);
      case 'post':
        return renderPostResult(result);
      case 'user':
        return renderUserResult(result);
      default:
        return null;
    }
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
          onClick={() => onPageChange(currentPage - 1)}
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
          onClick={() => onPageChange(i)}
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
          onClick={() => onPageChange(currentPage + 1)}
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
          {[...Array(5)].map((_, i) => (
            <Card key={i} variant="bordered" className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-muted/20 rounded"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-muted/20 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted/20 rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted/20 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="flex space-x-4">
                        <div className="h-4 bg-muted/20 rounded w-16"></div>
                        <div className="h-4 bg-muted/20 rounded w-20"></div>
                        <div className="h-4 bg-muted/20 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-muted/20 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    >
      <div className={className}>
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-light-text">
              Search Results
            </h2>
            <p className="text-muted-light">
              {totalResults > 0 
                ? `Found ${formatNumber(totalResults)} results for "${query}"`
                : `No results found for "${query}"`
              }
            </p>
          </div>
          
          {totalResults > 0 && (
            <div className="text-sm text-muted-light">
              Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalResults)} of {totalResults}
            </div>
          )}
        </div>

        {/* Results List */}
        {totalResults > 0 ? (
          <div className="space-y-4">
            {results.map(renderResult)}
            {renderPagination()}
          </div>
        ) : !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-light-text mb-2">
              No Results Found
            </h3>
            <p className="text-muted-light mb-6">
              Try adjusting your search terms or filters
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button variant="ghost" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button variant="primary" onClick={() => document.querySelector('input')?.focus()}>
                Try Another Search
              </Button>
            </div>
          </div>
        )}
      </div>
    </LoadingState>
  );
}
