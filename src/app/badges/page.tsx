/**
 * Badges gallery page for The Robot Overlord
 * Displays all available badges with progress tracking and earning notifications
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'participation' | 'quality' | 'social' | 'special' | 'loyalty';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: 'posts' | 'topics' | 'likes' | 'streak' | 'loyalty' | 'special';
    target: number;
    description: string;
  };
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  earnedAt?: string;
  isEarned: boolean;
  shareableUrl?: string;
}

interface BadgeNotification {
  id: string;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  earnedAt: string;
  isNew: boolean;
}

export default function BadgesPage() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<BadgeNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Badge['category']>('all');
  const [selectedRarity, setSelectedRarity] = useState<'all' | Badge['rarity']>('all');
  const [showOnlyEarned, setShowOnlyEarned] = useState(false);

  // Load badges data
  const loadBadges = async () => {
    try {
      setIsLoading(true);

      // Mock badges data with progress tracking
      const mockBadges: Badge[] = [
        {
          id: 'early-adopter',
          name: 'Early Adopter',
          description: 'Joined The Robot Overlord community in its early days',
          icon: '🚀',
          category: 'special',
          rarity: 'rare',
          requirements: {
            type: 'special',
            target: 1,
            description: 'Join during beta period'
          },
          isEarned: true,
          earnedAt: '2023-06-15T10:00:00Z'
        },
        {
          id: 'first-post',
          name: 'First Steps',
          description: 'Created your first post in the community',
          icon: '👶',
          category: 'participation',
          rarity: 'common',
          requirements: {
            type: 'posts',
            target: 1,
            description: 'Create 1 post'
          },
          isEarned: true,
          earnedAt: '2023-06-16T14:30:00Z'
        },
        {
          id: 'prolific-writer',
          name: 'Prolific Writer',
          description: 'Created 100 high-quality posts',
          icon: '✍️',
          category: 'participation',
          rarity: 'uncommon',
          requirements: {
            type: 'posts',
            target: 100,
            description: 'Create 100 posts'
          },
          progress: {
            current: 156,
            target: 100,
            percentage: 100
          },
          isEarned: true,
          earnedAt: '2024-01-10T09:15:00Z'
        },
        {
          id: 'discussion-starter',
          name: 'Discussion Starter',
          description: 'Started 25 engaging topic discussions',
          icon: '💬',
          category: 'participation',
          rarity: 'uncommon',
          requirements: {
            type: 'topics',
            target: 25,
            description: 'Create 25 topics'
          },
          progress: {
            current: 23,
            target: 25,
            percentage: 92
          },
          isEarned: false
        },
        {
          id: 'community-favorite',
          name: 'Community Favorite',
          description: 'Received 1000 likes from fellow citizens',
          icon: '❤️',
          category: 'social',
          rarity: 'rare',
          requirements: {
            type: 'likes',
            target: 1000,
            description: 'Receive 1000 likes'
          },
          progress: {
            current: 1247,
            target: 1000,
            percentage: 100
          },
          isEarned: true,
          earnedAt: '2024-01-05T16:45:00Z'
        },
        {
          id: 'streak-master',
          name: 'Streak Master',
          description: 'Maintained a 30-day activity streak',
          icon: '🔥',
          category: 'participation',
          rarity: 'rare',
          requirements: {
            type: 'streak',
            target: 30,
            description: 'Maintain 30-day streak'
          },
          progress: {
            current: 12,
            target: 30,
            percentage: 40
          },
          isEarned: false
        },
        {
          id: 'ai-expert',
          name: 'AI Expert',
          description: 'Recognized as an authority on artificial intelligence topics',
          icon: '🤖',
          category: 'quality',
          rarity: 'epic',
          requirements: {
            type: 'special',
            target: 1,
            description: 'Demonstrate AI expertise through quality contributions'
          },
          isEarned: true,
          earnedAt: '2023-12-20T11:30:00Z'
        },
        {
          id: 'loyalty-champion',
          name: 'Loyalty Champion',
          description: 'Achieved maximum loyalty score of 5000 points',
          icon: '👑',
          category: 'loyalty',
          rarity: 'legendary',
          requirements: {
            type: 'loyalty',
            target: 5000,
            description: 'Reach 5000 loyalty points'
          },
          progress: {
            current: 2450,
            target: 5000,
            percentage: 49
          },
          isEarned: false
        },
        {
          id: 'community-helper',
          name: 'Community Helper',
          description: 'Consistently helped other community members',
          icon: '🤝',
          category: 'social',
          rarity: 'uncommon',
          requirements: {
            type: 'special',
            target: 1,
            description: 'Help other community members regularly'
          },
          isEarned: true,
          earnedAt: '2023-11-15T13:20:00Z'
        },
        {
          id: 'top-contributor',
          name: 'Top Contributor',
          description: 'Ranked in top 10% of all contributors',
          icon: '⭐',
          category: 'quality',
          rarity: 'epic',
          requirements: {
            type: 'special',
            target: 1,
            description: 'Achieve top 10% contributor status'
          },
          isEarned: true,
          earnedAt: '2024-01-01T00:00:00Z'
        }
      ];

      setBadges(mockBadges);

      // Mock recent badge notifications
      const mockNotifications: BadgeNotification[] = [
        {
          id: 'notif-1',
          badgeId: 'community-favorite',
          badgeName: 'Community Favorite',
          badgeIcon: '❤️',
          earnedAt: '2024-01-05T16:45:00Z',
          isNew: true
        },
        {
          id: 'notif-2',
          badgeId: 'prolific-writer',
          badgeName: 'Prolific Writer',
          badgeIcon: '✍️',
          earnedAt: '2024-01-10T09:15:00Z',
          isNew: false
        }
      ];

      setRecentNotifications(mockNotifications);

    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Badges Error',
        message: 'Failed to load badges data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  // Handle badge sharing
  const handleShareBadge = async (badge: Badge) => {
    try {
      const shareUrl = `${window.location.origin}/badges/${badge.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `I earned the "${badge.name}" badge!`,
          text: `Check out my "${badge.name}" achievement on The Robot Overlord: ${badge.description}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        addNotification({
          type: 'success',
          title: 'Badge Shared',
          message: 'Badge link copied to clipboard!',
        });
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Share Error',
        message: 'Failed to share badge',
      });
    }
  };

  // Filter badges
  const filteredBadges = badges.filter(badge => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;
    if (showOnlyEarned && !badge.isEarned) return false;
    return true;
  });

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-muted-light border-muted/20';
      case 'uncommon': return 'text-approved-green border-approved-green/20';
      case 'rare': return 'text-warning-amber border-warning-amber/20';
      case 'epic': return 'text-overlord-red border-overlord-red/20';
      case 'legendary': return 'text-yellow-400 border-yellow-400/20';
      default: return 'text-muted-light border-muted/20';
    }
  };

  const getCategoryIcon = (category: Badge['category']) => {
    switch (category) {
      case 'participation': return '📝';
      case 'quality': return '💎';
      case 'social': return '👥';
      case 'special': return '✨';
      case 'loyalty': return '👑';
      default: return '🏆';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const earnedBadges = badges.filter(b => b.isEarned);
  const totalBadges = badges.length;

  return (
    <LoadingState
      isLoading={isLoading}
      error={null}
      loadingComponent={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-24 bg-muted/20 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-muted/20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-light-text">Badge Gallery</h1>
            <p className="text-muted-light mt-1">
              Track your achievements and unlock new badges
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-overlord-red">
              {earnedBadges.length}/{totalBadges}
            </div>
            <div className="text-sm text-muted-light">Badges Earned</div>
          </div>
        </div>

        {/* Recent Badge Notifications */}
        {recentNotifications.length > 0 && (
          <Card variant="bordered" className="bg-overlord-red/5 border-overlord-red/20">
            <CardHeader>
              <h3 className="text-lg font-bold text-light-text flex items-center space-x-2">
                <span>🎉</span>
                <span>Recent Achievements</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      notification.isNew ? 'bg-overlord-red/10 border border-overlord-red/20' : 'bg-muted/10'
                    }`}
                  >
                    <div className="text-2xl">{notification.badgeIcon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-light-text">
                        {notification.isNew && <span className="text-overlord-red mr-2">NEW!</span>}
                        You earned "{notification.badgeName}"
                      </div>
                      <div className="text-sm text-muted-light">
                        {formatDate(notification.earnedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-light-text">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="px-3 py-1 bg-dark-bg border border-muted/20 rounded text-light-text text-sm focus:border-overlord-red focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="participation">📝 Participation</option>
                  <option value="quality">💎 Quality</option>
                  <option value="social">👥 Social</option>
                  <option value="special">✨ Special</option>
                  <option value="loyalty">👑 Loyalty</option>
                </select>
              </div>

              {/* Rarity Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-light-text">Rarity:</span>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value as any)}
                  className="px-3 py-1 bg-dark-bg border border-muted/20 rounded text-light-text text-sm focus:border-overlord-red focus:outline-none"
                >
                  <option value="all">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>

              {/* Show Only Earned */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyEarned}
                  onChange={(e) => setShowOnlyEarned(e.target.checked)}
                  className="text-overlord-red focus:ring-overlord-red"
                />
                <span className="text-sm text-light-text">Show only earned</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => (
            <Card
              key={badge.id}
              variant="bordered"
              className={`relative transition-all duration-200 hover:scale-105 ${
                badge.isEarned 
                  ? `${getRarityColor(badge.rarity)} bg-gradient-to-br from-transparent to-current/5` 
                  : 'opacity-60 grayscale'
              }`}
            >
              {badge.isEarned && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-approved-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}

              <CardContent className="p-6 text-center">
                {/* Badge Icon */}
                <div className="text-6xl mb-4">{badge.icon}</div>

                {/* Badge Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-light-text">{badge.name}</h3>
                    <p className="text-sm text-muted-light mt-1">{badge.description}</p>
                  </div>

                  {/* Category and Rarity */}
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-muted/20 text-muted-light rounded">
                      {getCategoryIcon(badge.category)} {badge.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded capitalize ${getRarityColor(badge.rarity)} bg-current/10`}>
                      {badge.rarity}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {badge.progress && !badge.isEarned && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-light">
                        <span>Progress</span>
                        <span>{badge.progress.current}/{badge.progress.target}</span>
                      </div>
                      <div className="w-full bg-muted/20 rounded-full h-2">
                        <div 
                          className="bg-overlord-red h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(badge.progress.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-light">
                        {badge.progress.percentage}% complete
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  <div className="text-xs text-muted-light">
                    <span className="font-medium">Requirement:</span> {badge.requirements.description}
                  </div>

                  {/* Earned Date */}
                  {badge.isEarned && badge.earnedAt && (
                    <div className="text-xs text-approved-green">
                      Earned on {formatDate(badge.earnedAt)}
                    </div>
                  )}

                  {/* Share Button */}
                  {badge.isEarned && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareBadge(badge)}
                      className="w-full mt-3"
                    >
                      🔗 Share Badge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-light-text mb-2">
              No Badges Found
            </h3>
            <p className="text-muted-light">
              Try adjusting your filters or start participating to earn badges!
            </p>
          </div>
        )}
      </div>
    </LoadingState>
  );
}
