/**
 * Search bar component for The Robot Overlord
 * Provides global search functionality across topics, posts, and users
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAppStore } from '@/stores/appStore';

interface SearchResult {
  id: string;
  type: 'topic' | 'post' | 'user';
  title: string;
  description?: string;
  url: string;
  metadata?: {
    author?: string;
    category?: string;
    date?: string;
    score?: number;
  };
}

interface SearchBarProps {
  placeholder?: string;
  showResults?: boolean;
  onSearch?: (query: string, results: SearchResult[]) => void;
  onSelect?: (result: SearchResult) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Search topics, posts, and users...",
  showResults = true,
  onSearch,
  onSelect,
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const { addNotification } = useAppStore();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Mock search function - replace with actual API call
  const performSearch = async (searchQuery: string): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'topic' as const,
        title: 'AI Ethics Discussion',
        description: 'Exploring the ethical implications of artificial intelligence',
        url: '/topics/ai-ethics-discussion',
        metadata: {
          author: 'robot_overlord',
          category: 'Philosophy',
          date: '2 days ago',
        }
      },
      {
        id: '2',
        type: 'post' as const,
        title: 'Machine Learning Best Practices',
        description: 'A comprehensive guide to ML implementation',
        url: '/topics/ml-guide/posts/123',
        metadata: {
          author: 'ai_researcher',
          category: 'Technical',
          date: '1 week ago',
          score: 42,
        }
      },
      {
        id: '3',
        type: 'user' as const,
        title: 'robot_master',
        description: 'Senior AI Engineer | 1,250 loyalty points',
        url: '/users/robot_master',
        metadata: {
          date: 'Active 1 hour ago',
        }
      },
    ].filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return mockResults;
  };

  // Handle search with debouncing
  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const selectedResult = results.find(result => result.title.toLowerCase() === searchQuery.toLowerCase());
      if (selectedResult) {
        onSelect?.(selectedResult);
      }
      const searchResults = await performSearch(searchQuery);
      setResults(searchResults);
      setShowDropdown(true);
      setSelectedIndex(-1);
      
      onSearch?.(searchQuery, searchResults);
    } catch (error) {
      console.error('Search error:', error);
      addNotification({
        type: 'error',
        title: 'Search Error',
        message: 'Failed to perform search. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    router.push(result.url);
    setShowDropdown(false);
    setQuery('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const selectedResult = results[selectedIndex];
          if (selectedResult) {
            handleResultSelect(selectedResult);
          }
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'topic':
        return 'Topic';
      case 'post':
        return 'Post';
      case 'user':
        return 'User';
      default:
        return 'Result';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-2 bg-dark-bg border border-muted/30 rounded-lg text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent"
          />
          
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light">
            🔍
          </div>

          {/* Loading Spinner */}
          {isSearching && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {/* Search Button */}
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
          >
            →
          </Button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && showDropdown && (
        <Card 
          variant="bordered" 
          className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 shadow-lg"
        >
          <CardContent className="p-0">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    className={`w-full px-4 py-3 text-left hover:bg-muted/10 transition-colors ${
                      index === selectedIndex ? 'bg-overlord-red/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg mt-0.5">
                        {getResultIcon(result.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-light-text truncate">
                            {result.title}
                          </h4>
                          <span className="text-xs px-2 py-1 rounded bg-muted/20 text-muted-light">
                            {getResultTypeLabel(result.type)}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-light line-clamp-2 mb-1">
                            {result.description}
                          </p>
                        )}
                        {result.metadata && (
                          <div className="flex items-center space-x-3 text-xs text-muted-light">
                            {result.metadata.author && (
                              <span>by {result.metadata.author}</span>
                            )}
                            {result.metadata.category && (
                              <span>in {result.metadata.category}</span>
                            )}
                            {result.metadata.date && (
                              <span>{result.metadata.date}</span>
                            )}
                            {result.metadata.score && (
                              <span className="text-overlord-red">
                                ↑ {result.metadata.score}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {/* View All Results */}
                <div className="border-t border-muted/20 mt-2 pt-2">
                  <button
                    onClick={handleSubmit}
                    className="w-full px-4 py-2 text-left text-sm text-overlord-red hover:bg-overlord-red/10 transition-colors"
                  >
                    View all results for &quot;{query}&quot; →
                  </button>
                </div>
              </div>
            ) : query.length >= 2 && !isSearching ? (
              <div className="px-4 py-6 text-center text-muted-light">
                <div className="text-2xl mb-2">🤖</div>
                <p>No results found for &quot;{query}&quot;</p>
                <p className="text-xs mt-1">Try different keywords or check spelling</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
