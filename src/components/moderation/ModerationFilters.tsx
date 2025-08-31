/**
 * Moderation filters component for The Robot Overlord
 * Provides filtering options for moderation queues
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface ModerationFiltersType {
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'all';
  category?: string;
  dateRange?: 'day' | 'week' | 'month' | 'all';
  sortBy: 'newest' | 'oldest' | 'priority';
}

interface ModerationFiltersProps {
  filters: ModerationFiltersType;
  onFiltersChange: (filters: ModerationFiltersType) => void;
  totalCount: number;
  className?: string;
}

export function ModerationFilters({
  filters,
  onFiltersChange,
  totalCount,
  className = '',
}: ModerationFiltersProps) {
  const handleFilterChange = (key: keyof ModerationFiltersType, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: ModerationFiltersType = {
      status: 'pending',
      category: undefined,
      dateRange: 'all',
      sortBy: 'newest',
    };
    onFiltersChange(clearedFilters);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: '📋', count: totalCount },
    { value: 'pending', label: 'Pending', icon: '⏳', color: 'text-warning-amber' },
    { value: 'approved', label: 'Approved', icon: '✅', color: 'text-approved-green' },
    { value: 'rejected', label: 'Rejected', icon: '❌', color: 'text-rejected-red' },
    { value: 'flagged', label: 'Flagged', icon: '🚩', color: 'text-overlord-red' },
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
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priority', label: 'Priority' },
  ];

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-light-text">Moderation Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            Reset
          </Button>
        </div>
        <p className="text-sm text-muted-light">
          {totalCount} items in queue
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-light-text mb-3">
            Moderation Status
          </label>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => handleFilterChange('status', status.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
                  filters.status === status.value
                    ? 'bg-overlord-red/20 text-overlord-red border border-overlord-red/30'
                    : `text-muted-light hover:text-light-text hover:bg-muted/10 ${status.color || ''}`
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{status.icon}</span>
                  <span className="text-sm">{status.label}</span>
                </div>
                {status.count !== undefined && (
                  <span className="text-xs bg-muted/20 px-2 py-1 rounded">
                    {status.count}
                  </span>
                )}
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
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-muted/20">
          <label className="block text-sm font-medium text-light-text mb-3">
            Quick Actions
          </label>
          <div className="space-y-2">
            <Button
              variant={filters.status === 'pending' && filters.dateRange === 'day' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, status: 'pending', dateRange: 'day' })}
              className="w-full justify-start"
            >
              ⚡ Today&apos;s Pending
            </Button>
            <Button
              variant={filters.status === 'flagged' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, status: 'flagged', sortBy: 'priority' })}
              className="w-full justify-start"
            >
              🚨 High Priority
            </Button>
            <Button
              variant={filters.sortBy === 'oldest' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, sortBy: 'oldest', status: 'pending' })}
              className="w-full justify-start"
            >
              ⏰ Oldest First
            </Button>
          </div>
        </div>

        {/* Moderation Stats */}
        <div className="pt-4 border-t border-muted/20">
          <label className="block text-sm font-medium text-light-text mb-3">
            Queue Stats
          </label>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-light">Total Items:</span>
              <span className="text-light-text font-medium">{totalCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warning-amber">Pending:</span>
              <span className="text-warning-amber font-medium">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-overlord-red">Flagged:</span>
              <span className="text-overlord-red font-medium">--</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
