/**
 * Post search filters component for The Robot Overlord
 * Provides advanced filtering options for post search
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { topicsService } from '@/services';

interface PostSearchFiltersProps {
  filters: {
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
  };
  onFiltersChange: (filters: any) => void;
  totalCount: number;
  onClearFilters: () => void;
  className?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  postCount: number;
}

interface Topic {
  id: string;
  title: string;
  slug: string;
  category: Category;
  postCount: number;
}

export function PostSearchFilters({
  filters,
  onFiltersChange,
  totalCount,
  onClearFilters,
  className = '',
}: PostSearchFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Load categories from topics service
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await topicsService.getCategories();
        if (response.data) {
          // Map categories to include postCount
          const mappedCategories = response.data.map((cat: unknown) => ({
            ...(cat as any),
            postCount: (cat as any).postCount || 0
          }));
          setCategories(mappedCategories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Load topics when category changes
  useEffect(() => {
    const loadTopics = async () => {
      if (!filters.category) {
        setTopics([]);
        return;
      }

      try {
        setIsLoadingTopics(true);
        const response = await topicsService.getTopics({
          categoryId: filters.category,
          limit: 50,
        });
        if (response.data) {
          // Map topics to include postCount in category
          const mappedTopics = response.data.map((topic: unknown) => ({
            ...(topic as any),
            category: {
              ...(topic as any).category,
              postCount: (topic as any).category.postCount || 0
            },
            postCount: (topic as any).postCount || 0
          }));
          setTopics(mappedTopics);
        }
      } catch (err) {
        console.error('Failed to load topics:', err);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    loadTopics();
  }, [filters.category]);

  const handleFilterChange = (key: string, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    
    // Clear topic when category changes
    if (key === 'category' && value !== filters.category) {
      newFilters.topic = undefined;
    }
    
    onFiltersChange(newFilters);
  };

  const handleTagAdd = () => {
    const tag = tagInput.trim();
    if (tag && !filters.tags?.includes(tag)) {
      const newTags = [...(filters.tags || []), tag];
      handleFilterChange('tags', newTags);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = filters.tags?.filter(tag => tag !== tagToRemove) || [];
    handleFilterChange('tags', newTags.length > 0 ? newTags : undefined);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.topic) count++;
    if (filters.author) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.sortBy !== 'relevance') count++;
    if (filters.status !== 'all') count++;
    if (filters.minScore) count++;
    if (filters.hasReplies) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Header */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-light-text">Filters</h3>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-overlord-red hover:bg-overlord-red/10"
              >
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
          {totalCount > 0 && (
            <p className="text-sm text-muted-light">
              {totalCount} result{totalCount !== 1 ? 's' : ''}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Sort By */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Sort By</h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[
              { value: 'relevance', label: 'Relevance' },
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'popular', label: 'Most Popular' },
              { value: 'controversial', label: 'Most Controversial' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="sortBy"
                  value={option.value}
                  checked={filters.sortBy === option.value}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                />
                <span className="text-sm text-light-text">{option.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Category</h4>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoadingCategories ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-muted-light">Loading...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={!filters.category}
                  onChange={() => handleFilterChange('category', undefined)}
                  className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                />
                <span className="text-sm text-light-text">All Categories</span>
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={filters.category === category.id}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                  />
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-light-text">{category.name}</span>
                    <span className="text-xs text-muted-light">({category.postCount})</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Topic Filter */}
      {filters.category && (
        <Card variant="bordered">
          <CardHeader className="pb-3">
            <h4 className="font-medium text-light-text">Topic</h4>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingTopics ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-muted-light">Loading topics...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="topic"
                    value=""
                    checked={!filters.topic}
                    onChange={() => handleFilterChange('topic', undefined)}
                    className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                  />
                  <span className="text-sm text-light-text">All Topics</span>
                </label>
                {topics.map((topic) => (
                  <label key={topic.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="topic"
                      value={topic.id}
                      checked={filters.topic === topic.id}
                      onChange={(e) => handleFilterChange('topic', e.target.value)}
                      className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-light-text truncate block">{topic.title}</span>
                      <span className="text-xs text-muted-light">({topic.postCount} posts)</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Date Range */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Date Range</h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Time' },
              { value: 'day', label: 'Last 24 Hours' },
              { value: 'week', label: 'Last Week' },
              { value: 'month', label: 'Last Month' },
              { value: 'year', label: 'Last Year' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateRange"
                  value={option.value}
                  checked={filters.dateRange === option.value}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                />
                <span className="text-sm text-light-text">{option.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Filter */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Status</h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Posts' },
              { value: 'approved', label: 'Approved Only' },
              { value: 'pending', label: 'Pending Moderation' },
              { value: 'rejected', label: 'Rejected' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={filters.status === option.value}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                />
                <span className="text-sm text-light-text">{option.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Author Filter */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Author</h4>
        </CardHeader>
        <CardContent className="pt-0">
          <input
            type="text"
            value={filters.author || ''}
            onChange={(e) => handleFilterChange('author', e.target.value || undefined)}
            placeholder="Enter username..."
            className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
          />
        </CardContent>
      </Card>

      {/* Tags Filter */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Tags</h4>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Add tag..."
              className="flex-1 px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTagAdd}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
          
          {filters.tags && filters.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-overlord-red/20 text-overlord-red text-xs rounded"
                >
                  #{tag}
                  <button
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 hover:text-overlord-red/70"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Advanced</h4>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Minimum Score */}
          <div>
            <label className="block text-sm text-light-text mb-2">
              Minimum Score
            </label>
            <input
              type="number"
              value={filters.minScore || ''}
              onChange={(e) => handleFilterChange('minScore', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="0"
              className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
            />
          </div>

          {/* Has Replies */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasReplies || false}
              onChange={(e) => handleFilterChange('hasReplies', e.target.checked || undefined)}
              className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 rounded focus:ring-overlord-red focus:ring-2"
            />
            <span className="text-sm text-light-text">Has replies only</span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
