/**
 * Personalized recommendations component for The Robot Overlord
 * Displays AI-powered content recommendations based on user behavior
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { useAppStore } from '@/stores/appStore';
import { postsService, topicsService } from '@/services';
import { Post } from '@/types/posts';
import { Topic } from '@/types/topics';

interface Recommendation {
  id: string;
  type: 'post' | 'topic' | 'user' | 'category';
  title: string;
  description: string;
  url: string;
  score: number;
  reason: string;
  metadata?: {
    author?: string;
    category?: string;
    tags?: string[];
    stats?: {
      views?: number;
      posts?: number;
      replies?: number;
      score?: number;
    };
  };
}

interface PersonalizedRecommendationsProps {
  userId?: string;
  limit?: number;
  categories?: string[];
  excludeViewed?: boolean;
  className?: string;
}

export function PersonalizedRecommendations({
  userId,
  limit = 10,
  categories = [],
  excludeViewed = true,
  className = '',
}: PersonalizedRecommendationsProps) {
  const { addNotification } = useAppStore();
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'posts' | 'topics' | 'users'>('all');

  // Load personalized recommendations
  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate AI-powered recommendations API call
      const mockRecommendations: Recommendation[] = [
        {
          id: 'rec-1',
          type: 'post',
          title: 'Advanced Machine Learning Techniques for Beginners',
          description: 'A comprehensive guide covering neural networks, deep learning, and practical applications.',
          url: '/posts/advanced-ml-techniques',
          score: 0.95,
          reason: 'Based on your interest in AI and machine learning topics',
          metadata: {
            author: 'ai_researcher',
            category: 'Technical',
            tags: ['machine-learning', 'ai', 'neural-networks'],
            stats: { views: 1250, replies: 45, score: 89 }
          }
        },
        {
          id: 'rec-2',
          type: 'topic',
          title: 'Future of Robotics in Healthcare',
          description: 'Discussing the revolutionary impact of robotics in medical procedures and patient care.',
          url: '/topics/robotics-healthcare',
          score: 0.92,
          reason: 'Trending in your followed categories',
          metadata: {
            author: 'medical_bot',
            category: 'Healthcare',
            tags: ['robotics', 'healthcare', 'innovation'],
            stats: { posts: 23, views: 890 }
          }
        },
        {
          id: 'rec-3',
          type: 'post',
          title: 'Ethical Considerations in AI Development',
          description: 'Exploring the moral implications and responsibilities in artificial intelligence creation.',
          url: '/posts/ai-ethics-considerations',
          score: 0.88,
          reason: 'Similar to posts you\'ve engaged with',
          metadata: {
            author: 'ethics_expert',
            category: 'Philosophy',
            tags: ['ethics', 'ai', 'philosophy'],
            stats: { views: 756, replies: 32, score: 67 }
          }
        },
        {
          id: 'rec-4',
          type: 'topic',
          title: 'Quantum Computing Breakthroughs',
          description: 'Latest developments in quantum computing and their potential applications.',
          url: '/topics/quantum-computing',
          score: 0.85,
          reason: 'Popular among users with similar interests',
          metadata: {
            author: 'quantum_dev',
            category: 'Science',
            tags: ['quantum', 'computing', 'physics'],
            stats: { posts: 18, views: 1100 }
          }
        },
        {
          id: 'rec-5',
          type: 'user',
          title: 'Dr. Sarah Chen - AI Research Lead',
          description: 'Leading researcher in artificial intelligence with 15+ years experience. 2,450 loyalty points.',
          url: '/users/dr-sarah-chen',
          score: 0.82,
          reason: 'Expert in topics you follow',
          metadata: {
            category: 'AI Research',
            stats: { posts: 156, score: 2450 }
          }
        },
        {
          id: 'rec-6',
          type: 'category',
          title: 'Cybersecurity',
          description: 'Discussions about digital security, privacy, and protection against cyber threats.',
          url: '/categories/cybersecurity',
          score: 0.79,
          reason: 'Emerging interest based on your activity',
          metadata: {
            stats: { posts: 342, views: 5600 }
          }
        }
      ];

      // Filter by selected type
      const filteredRecommendations = mockRecommendations.filter(rec => {
        if (selectedType === 'all') return true;
        if (selectedType === 'posts') return rec.type === 'post';
        if (selectedType === 'topics') return rec.type === 'topic';
        if (selectedType === 'users') return rec.type === 'user';
        return false;
      });

      setRecommendations(filteredRecommendations.slice(0, limit));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Recommendations Error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and reload when filters change
  useEffect(() => {
    loadRecommendations();
  }, [selectedType, limit, categories]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return '📝';
      case 'topic':
        return '💬';
      case 'user':
        return '👤';
      case 'category':
        return '📂';
      default:
        return '🎯';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return 'Post';
      case 'topic':
        return 'Topic';
      case 'user':
        return 'User';
      case 'category':
        return 'Category';
      default:
        return 'Item';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-approved-green';
    if (score >= 0.8) return 'text-warning-amber';
    if (score >= 0.7) return 'text-overlord-red';
    return 'text-muted-light';
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedType === 'all') return true;
    if (selectedType === 'posts') return rec.type === 'post';
    if (selectedType === 'topics') return rec.type === 'topic';
    if (selectedType === 'users') return rec.type === 'user';
    return false;
  });

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-light-text">Recommended for You</h3>
            <p className="text-sm text-muted-light">AI-powered content suggestions</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadRecommendations}
            disabled={isLoading}
          >
            🔄 Refresh
          </Button>
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2 mt-4">
          {[
            { value: 'all', label: 'All', icon: '🎯' },
            { value: 'posts', label: 'Posts', icon: '📝' },
            { value: 'topics', label: 'Topics', icon: '💬' },
            { value: 'users', label: 'Users', icon: '👤' },
          ].map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedType(type.value as any)}
              className="text-xs"
            >
              {type.icon} {type.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <LoadingState
          isLoading={isLoading}
          error={error}
          loadingComponent={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-start space-x-3">
                  <div className="w-8 h-8 bg-muted/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted/20 rounded w-full mb-1"></div>
                    <div className="h-3 bg-muted/20 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          }
        >
          {filteredRecommendations.length > 0 ? (
            <div className="space-y-4">
              {filteredRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-muted/20 hover:border-overlord-red/30 transition-colors"
                >
                  {/* Type Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-overlord-red/20 flex items-center justify-center">
                    <span className="text-sm">{getTypeIcon(rec.type)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <Link
                        href={rec.url}
                        className="font-medium text-light-text hover:text-overlord-red transition-colors line-clamp-1"
                      >
                        {rec.title}
                      </Link>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className={`text-xs font-medium ${getScoreColor(rec.score)}`}>
                          {Math.round(rec.score * 100)}%
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-muted/20 text-muted-light rounded">
                          {getTypeLabel(rec.type)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-light line-clamp-2 mb-2">
                      {rec.description}
                    </p>

                    {/* Metadata */}
                    {rec.metadata && (
                      <div className="flex items-center space-x-3 text-xs text-muted-light mb-2">
                        {rec.metadata.author && (
                          <span>by {rec.metadata.author}</span>
                        )}
                        {rec.metadata.category && (
                          <span>in {rec.metadata.category}</span>
                        )}
                        {rec.metadata.stats && (
                          <>
                            {rec.metadata.stats.views && (
                              <span>{rec.metadata.stats.views} views</span>
                            )}
                            {rec.metadata.stats.posts && (
                              <span>{rec.metadata.stats.posts} posts</span>
                            )}
                            {rec.metadata.stats.replies && (
                              <span>{rec.metadata.stats.replies} replies</span>
                            )}
                            {rec.metadata.stats.score && (
                              <span className="text-overlord-red">{rec.metadata.stats.score} pts</span>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {rec.metadata?.tags && rec.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {rec.metadata.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-muted/20 text-muted-light text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Reason */}
                    <div className="text-xs text-overlord-red/80 italic">
                      💡 {rec.reason}
                    </div>
                  </div>
                </div>
              ))}

              {/* View More */}
              {filteredRecommendations.length >= limit && (
                <div className="text-center pt-4 border-t border-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Navigate to full recommendations page */}}
                    className="text-overlord-red hover:bg-overlord-red/10"
                  >
                    View More Recommendations →
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🤖</div>
              <h4 className="text-lg font-medium text-light-text mb-2">
                No Recommendations Yet
              </h4>
              <p className="text-sm text-muted-light mb-4">
                Interact with more content to get personalized suggestions
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadRecommendations}
              >
                Check Again
              </Button>
            </div>
          )}
        </LoadingState>
      </CardContent>
    </Card>
  );
}
