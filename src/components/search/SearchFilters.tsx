/**
 * Search filters component for The Robot Overlord
 * Provides filtering options for search results
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface SearchFiltersType {
  type: 'all' | 'topics' | 'posts' | 'users';
  category?: string;
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy: 'relevance' | 'date' | 'score' | 'activity';
  sortOrder: 'desc' | 'asc';
}

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  totalResults: number;
  className?: string;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  totalResults,
  className = '',
}: SearchFiltersProps) {
  const handleFilterChange = (key: keyof SearchFiltersType, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFiltersType = {
      type: 'all',
      category: undefined,
      dateRange: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc',
    };
    onFiltersChange(clearedFilters);
  };

  const contentTypes = [
    { value: 'all', label: 'All Results', icon: '🔍' },
    { value: 'topics', label: 'Topics', icon: '💬' },
    { value: 'posts', label: 'Posts', icon: '📝' },
    { value: 'users', label: 'Users', icon: '👤' },
  ];

  const categories = [
    { value: 'general', label: 'General Discussion' },
    { value: 'technical', label: 'Technical' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'feedback', label: 'Feedback' },
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'day', label: 'Past Day' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'year', label: 'Past Year' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Date' },
    { value: 'score', label: 'Score' },
    { value: 'activity', label: 'Activity' },
  ];

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-light-text">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
        </div>
        {totalResults > 0 && (
          <p className="text-sm text-muted-light">
            {totalResults} results found
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium text-light-text mb-3">
            Content Type
          </label>
          <div className="space-y-2">
            {contentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleFilterChange('type', type.value)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                  filters.type === type.value
                    ? 'bg-overlord-red/20 text-overlord-red border border-overlord-red/30'
                    : 'text-muted-light hover:text-light-text hover:bg-muted/10'
                }`}
              >
                <span className="text-lg">{type.icon}</span>
                <span className="text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-light-text mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-light-text mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange || 'all'}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-light-text mb-2">
            Sort By
          </label>
          <div className="grid grid-cols-1 gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="pt-4 border-t border-muted/20">
          <label className="block text-sm font-medium text-light-text mb-3">
            Quick Filters
          </label>
          <div className="space-y-2">
            <Button
              variant={filters.dateRange === 'week' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('dateRange', filters.dateRange === 'week' ? 'all' : 'week')}
              className="w-full justify-start"
            >
              📅 This Week
            </Button>
            <Button
              variant={filters.sortBy === 'score' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('sortBy', filters.sortBy === 'score' ? 'relevance' : 'score')}
              className="w-full justify-start"
            >
              ⭐ Highest Rated
            </Button>
            <Button
              variant={filters.sortBy === 'activity' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('sortBy', filters.sortBy === 'activity' ? 'relevance' : 'activity')}
              className="w-full justify-start"
            >
              🔥 Most Active
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
