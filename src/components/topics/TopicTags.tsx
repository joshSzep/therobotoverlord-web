/**
 * Topic tags component for The Robot Overlord
 * Displays and manages topic tags with filtering and search
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { topicsService } from '@/services';

interface TopicTag {
  name: string;
  count: number;
  color?: string;
}

interface TopicTagsProps {
  topicId?: string;
  selectedTags?: string[];
  onTagSelect?: (tag: string) => void;
  onTagDeselect?: (tag: string) => void;
  showCounts?: boolean;
  limit?: number;
  className?: string;
}

export function TopicTags({
  topicId,
  selectedTags = [],
  onTagSelect,
  onTagDeselect,
  showCounts = true,
  limit = 20,
  className = '',
}: TopicTagsProps) {
  const [tags, setTags] = useState<TopicTag[]>([]);
  const [popularTags, setPopularTags] = useState<TopicTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Load tags
  const loadTags = async () => {
    try {
      setIsLoading(true);

      // Mock data - replace with actual API calls
      const mockTags: TopicTag[] = [
        { name: 'artificial-intelligence', count: 156 },
        { name: 'machine-learning', count: 142 },
        { name: 'robotics', count: 98 },
        { name: 'automation', count: 87 },
        { name: 'neural-networks', count: 76 },
        { name: 'deep-learning', count: 65 },
        { name: 'computer-vision', count: 54 },
        { name: 'natural-language-processing', count: 43 },
        { name: 'ethics', count: 39 },
        { name: 'future-tech', count: 32 },
        { name: 'programming', count: 28 },
        { name: 'algorithms', count: 25 },
        { name: 'data-science', count: 22 },
        { name: 'philosophy', count: 19 },
        { name: 'research', count: 16 },
      ];

      setTags(mockTags);
      setPopularTags(mockTags.slice(0, 10));
    } catch (err) {
      console.error('Failed to load tags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadTags();
  }, [topicId]);

  // Filter tags based on search
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Display tags (limited or all)
  const displayTags = showAll ? filteredTags : filteredTags.slice(0, limit);

  const handleTagClick = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagDeselect?.(tagName);
    } else {
      onTagSelect?.(tagName);
    }
  };

  const getTagColor = (tag: TopicTag) => {
    if (selectedTags.includes(tag.name)) {
      return 'bg-overlord-red text-white border-overlord-red';
    }
    
    // Color based on popularity
    if (tag.count > 100) {
      return 'bg-approved-green/20 text-approved-green border-approved-green/30 hover:bg-approved-green/30';
    } else if (tag.count > 50) {
      return 'bg-warning-amber/20 text-warning-amber border-warning-amber/30 hover:bg-warning-amber/30';
    } else {
      return 'bg-muted/20 text-muted-light border-muted/30 hover:bg-muted/30 hover:text-light-text';
    }
  };

  if (isLoading) {
    return (
      <Card variant="bordered" className={className}>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-bold text-light-text">Topic Tags</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-8 bg-muted/20 rounded-full animate-pulse"
                style={{ width: `${60 + Math.random() * 40}px` }}
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-light-text">Topic Tags</h3>
          <span className="text-sm text-muted-light">
            {tags.length} tags
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
          />
          <div className="absolute right-3 top-2.5 text-muted-light">
            🔍
          </div>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-light-text mb-2">
              Selected Tags ({selectedTags.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagName) => {
                const tag = tags.find(t => t.name === tagName) || { name: tagName, count: 0 };
                return (
                  <button
                    key={tagName}
                    onClick={() => handleTagClick(tagName)}
                    className="px-3 py-1 rounded-full text-sm border transition-colors bg-overlord-red text-white border-overlord-red hover:bg-overlord-red/80"
                  >
                    #{tag.name}
                    {showCounts && tag.count > 0 && (
                      <span className="ml-1 opacity-75">({tag.count})</span>
                    )}
                    <span className="ml-1">×</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        {!searchQuery && (
          <div>
            <h4 className="text-sm font-medium text-light-text mb-2">
              Popular Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, 6).map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => handleTagClick(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${getTagColor(tag)}`}
                >
                  #{tag.name}
                  {showCounts && (
                    <span className="ml-1 opacity-75">({tag.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-light-text">
              {searchQuery ? `Search Results (${filteredTags.length})` : 'All Tags'}
            </h4>
            {!searchQuery && filteredTags.length > limit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All (${filteredTags.length})`}
              </Button>
            )}
          </div>

          {displayTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => handleTagClick(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${getTagColor(tag)}`}
                >
                  #{tag.name}
                  {showCounts && (
                    <span className="ml-1 opacity-75">({tag.count})</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">🏷️</div>
              <p className="text-muted-light text-sm">
                {searchQuery ? 'No tags found matching your search' : 'No tags available'}
              </p>
            </div>
          )}
        </div>

        {/* Tag Statistics */}
        <div className="pt-4 border-t border-muted/20">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-light">Total Tags:</span>
              <span className="ml-2 text-light-text font-medium">{tags.length}</span>
            </div>
            <div>
              <span className="text-muted-light">Selected:</span>
              <span className="ml-2 text-overlord-red font-medium">{selectedTags.length}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/topics?view=tags"
            className="text-sm text-overlord-red hover:underline"
          >
            Browse by tags →
          </Link>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedTags.forEach(tag => onTagDeselect?.(tag))}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
