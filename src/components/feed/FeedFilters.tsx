/**
 * Feed filters component for The Robot Overlord
 * Provides filtering options for the main content feed
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { topicsService } from '@/services';

interface FeedFiltersProps {
  filters: {
    contentType: 'all' | 'posts' | 'topics';
    timeRange: 'day' | 'week' | 'month' | 'all';
    categories: string[];
    sortBy: 'newest' | 'popular' | 'trending' | 'personalized';
    showFollowing: boolean;
  };
  onFiltersChange: (filters: unknown) => void;
  totalItems: number;
  className?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  postCount: number;
}

export function FeedFilters({
  filters,
  onFiltersChange,
  totalItems,
  className = '',
}: FeedFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await topicsService.getCategories();
        if (response.data) {
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

  const handleFilterChange = (key: string, value: unknown) => {
    onFiltersChange({ [key]: value });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    handleFilterChange('categories', newCategories);
  };

  const handleClearFilters = () => {
    onFiltersChange({
      contentType: 'all',
      timeRange: 'week',
      categories: [],
      sortBy: 'personalized',
      showFollowing: false,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.contentType !== 'all') count++;
    if (filters.timeRange !== 'week') count++;
    if (filters.categories.length > 0) count++;
    if (filters.sortBy !== 'personalized') count++;
    if (filters.showFollowing) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Header */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-light-text">Feed Filters</h3>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-overlord-red hover:bg-overlord-red/10"
              >
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
          {totalItems > 0 && (
            <p className="text-sm text-muted-light">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in feed
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Content Type */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Content Type</h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Content', icon: '📰' },
              { value: 'posts', label: 'Posts Only', icon: '📝' },
              { value: 'topics', label: 'Topics Only', icon: '💬' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="contentType"
                  value={option.value}
                  checked={filters.contentType === option.value}
                  onChange={(e) => handleFilterChange('contentType', e.target.value)}
                  className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                />
                <span className="text-sm">{option.icon}</span>
                <span className="text-sm text-light-text">{option.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sort By */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Sort By</h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[
              { value: 'personalized', label: 'Personalized', icon: '🎯' },
              { value: 'newest', label: 'Newest First', icon: '🕐' },
              { value: 'popular', label: 'Most Popular', icon: '🔥' },
              { value: 'trending', label: 'Trending', icon: '📈' },
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
                <span className="text-sm">{option.icon}</span>
                <span className="text-sm text-light-text">{option.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Range */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Time Range</h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[
              { value: 'day', label: 'Last 24 Hours', icon: '🌅' },
              { value: 'week', label: 'Last Week', icon: '📅' },
              { value: 'month', label: 'Last Month', icon: '🗓️' },
              { value: 'all', label: 'All Time', icon: '♾️' },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeRange"
                  value={option.value}
                  checked={filters.timeRange === option.value}
                  onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                  className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                />
                <span className="text-sm">{option.icon}</span>
                <span className="text-sm text-light-text">{option.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Categories</h4>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoadingCategories ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-muted-light">Loading...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 rounded focus:ring-overlord-red focus:ring-2"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-light-text flex-1">{category.name}</span>
                    <span className="text-xs text-muted-light">({category.postCount})</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Following Filter */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Following</h4>
        </CardHeader>
        <CardContent className="pt-0">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showFollowing}
              onChange={(e) => handleFilterChange('showFollowing', e.target.checked)}
              className="w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 rounded focus:ring-overlord-red focus:ring-2"
            />
            <span className="text-sm">👥</span>
            <span className="text-sm text-light-text">Show only followed content</span>
          </label>
          <p className="text-xs text-muted-light mt-2">
            Filter to show only posts and topics from users you follow
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card variant="bordered">
        <CardHeader className="pb-3">
          <h4 className="font-medium text-light-text">Quick Actions</h4>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ 
              contentType: 'posts', 
              sortBy: 'newest', 
              timeRange: 'day' 
            })}
            className="w-full justify-start text-left"
          >
            🆕 Latest Posts
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ 
              contentType: 'topics', 
              sortBy: 'popular', 
              timeRange: 'week' 
            })}
            className="w-full justify-start text-left"
          >
            🔥 Hot Topics
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ 
              contentType: 'all', 
              sortBy: 'trending', 
              timeRange: 'day' 
            })}
            className="w-full justify-start text-left"
          >
            📈 Trending Now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ 
              showFollowing: true, 
              sortBy: 'newest' 
            })}
            className="w-full justify-start text-left"
          >
            👥 Following Feed
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
