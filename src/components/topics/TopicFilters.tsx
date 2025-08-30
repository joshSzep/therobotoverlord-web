/**
 * Topic filters component for The Robot Overlord
 * Provides filtering and sorting options for topics
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { TopicFiltersProps } from '@/types/components';
import { TopicFilters as TopicFiltersType } from '@/types/topics';

export function TopicFilters({
  filters,
  onFiltersChange,
  categories = [],
  showAdvanced = false,
  onToggleAdvanced,
  className = '',
}: TopicFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TopicFiltersType>(filters);

  const handleFilterChange = (key: keyof TopicFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: TopicFiltersType = {
      search: '',
      categoryId: undefined,
      sortBy: 'recent',
      sortOrder: 'desc',
      status: undefined,
      timeRange: undefined,
      tags: [],
      minPosts: undefined,
      maxPosts: undefined,
      hasSubscription: undefined,
      creatorId: undefined,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'posts', label: 'Most Posts' },
    { value: 'views', label: 'Most Views' },
    { value: 'subscribers', label: 'Most Subscribers' },
    { value: 'title', label: 'Alphabetical' },
    { value: 'created', label: 'Date Created' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'locked', label: 'Locked' },
    { value: 'archived', label: 'Archived' },
    { value: 'featured', label: 'Featured' },
    { value: 'pinned', label: 'Pinned' },
  ];

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-light-text">Filters</h3>
          <div className="flex items-center space-x-2">
            {onToggleAdvanced && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleAdvanced}
              >
                {showAdvanced ? 'Simple' : 'Advanced'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-light-text mb-2">
            Search Topics
          </label>
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by title, description, or tags..."
            className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Category
            </label>
            <select
              value={localFilters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Sort By
            </label>
            <select
              value={localFilters.sortBy || 'recent'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Order
            </label>
            <select
              value={localFilters.sortOrder || 'desc'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Status
              </label>
              <select
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Time Range
              </label>
              <select
                value={localFilters.timeRange || ''}
                onChange={(e) => handleFilterChange('timeRange', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
              >
                <option value="">All Time</option>
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Post Count Range */}
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Post Count Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={localFilters.minPosts || ''}
                  onChange={(e) => handleFilterChange('minPosts', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Min posts"
                  min="0"
                  className="px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
                />
                <input
                  type="number"
                  value={localFilters.maxPosts || ''}
                  onChange={(e) => handleFilterChange('maxPosts', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Max posts"
                  min="0"
                  className="px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
                />
              </div>
            </div>

            {/* Subscription Filter */}
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Subscription Status
              </label>
              <select
                value={localFilters.hasSubscription === undefined ? '' : localFilters.hasSubscription.toString()}
                onChange={(e) => handleFilterChange('hasSubscription', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
              >
                <option value="">All Topics</option>
                <option value="true">Subscribed Only</option>
                <option value="false">Not Subscribed</option>
              </select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={localFilters.tags?.join(', ') || ''}
                onChange={(e) => handleFilterChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                placeholder="Enter tags separated by commas..."
                className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Quick Filter Buttons */}
        <div className="pt-4 border-t border-muted/20">
          <label className="block text-sm font-medium text-light-text mb-2">
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={localFilters.status === 'featured' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('status', localFilters.status === 'featured' ? undefined : 'featured')}
            >
              ⭐ Featured
            </Button>
            <Button
              variant={localFilters.status === 'pinned' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('status', localFilters.status === 'pinned' ? undefined : 'pinned')}
            >
              📌 Pinned
            </Button>
            <Button
              variant={localFilters.hasSubscription === true ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('hasSubscription', localFilters.hasSubscription === true ? undefined : true)}
            >
              🔔 Subscribed
            </Button>
            <Button
              variant={localFilters.timeRange === 'week' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('timeRange', localFilters.timeRange === 'week' ? undefined : 'week')}
            >
              📅 This Week
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
