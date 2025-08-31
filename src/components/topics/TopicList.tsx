/**
 * Topic list component for The Robot Overlord
 * Displays a list of topics with filtering and pagination
 */

'use client';

import React from 'react';
import { TopicCard } from './TopicCard';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { Topic } from '@/types/topics';
import { Button } from '@/components/ui/Button';
import { TopicListProps } from '@/types/components';

export function TopicList({
  topics,
  onTopicClick,
  onSubscribe,
  showPagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  filters,
  onFiltersChange,
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyText = "No topics found",
  className = '',
}: TopicListProps) {
  const handleTopicClick = (topic: unknown) => {
    onTopicClick?.(topic as Topic);
  };

  const handleSubscribe = (topicId: string) => {
    onSubscribe?.(topicId);
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

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
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-4 bg-muted/20 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-muted/20 rounded w-3/4 mb-2"></div>
                  <div className="flex space-x-2">
                    <div className="h-4 bg-muted/20 rounded w-16"></div>
                    <div className="h-4 bg-muted/20 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-8 bg-muted/20 rounded w-20"></div>
              </div>
              <div className="h-4 bg-muted/20 rounded w-full mb-2"></div>
              <div className="h-4 bg-muted/20 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between">
                <div className="flex space-x-4">
                  <div className="h-4 bg-muted/20 rounded w-16"></div>
                  <div className="h-4 bg-muted/20 rounded w-20"></div>
                  <div className="h-4 bg-muted/20 rounded w-16"></div>
                </div>
                <div className="h-4 bg-muted/20 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      }
    >
      <div className={`space-y-4 ${className}`}>
        {isEmpty ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-light-text mb-2">
              No Topics Found
            </h3>
            <p className="text-muted-light mb-6">
              {emptyText}
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/topics/new'}>
              Create First Topic
            </Button>
          </div>
        ) : (
          <>
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onClick={() => handleTopicClick(topic)}
                onSubscribe={() => handleSubscribe(topic.id)}
                showCategory={true}
                showStats={true}
                showDescription={true}
              />
            ))}
            
            {renderPagination()}
          </>
        )}
      </div>
    </LoadingState>
  );
}
