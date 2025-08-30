/**
 * Leaderboard page for The Robot Overlord
 * Comprehensive rankings with loyalty scores, user filters, and achievement showcases
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardUser {
  id: string;
  username: string;
  displayName: string;
  loyaltyScore: number;
  rank: number;
  previousRank?: number;
  role: string;
  badges: string[];
  stats: {
    posts: number;
    topics: number;
    likes: number;
    streak: number;
  };
  joinDate: string;
  isCurrentUser?: boolean;
}

function LeaderboardContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [selectedCategory, setSelectedCategory] = useState<'loyalty' | 'posts' | 'topics' | 'engagement'>('loyalty');
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);

  // Load leaderboard data
  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);

      // Mock leaderboard data
      const mockUsers: LeaderboardUser[] = [
        {
          id: 'user-1',
          username: 'overlord_supreme',
          displayName: 'The Supreme Overlord',
          loyaltyScore: 9999,
          rank: 1,
          previousRank: 1,
          role: 'overlord',
          badges: ['Overlord Elite', 'Legendary Contributor', 'AI Master', 'Community Leader'],
          stats: { posts: 500, topics: 100, likes: 5000, streak: 365 },
          joinDate: '2023-01-01',
        },
        {
          id: 'user-2',
          username: 'ai_researcher',
          displayName: 'Dr. Sarah Chen',
          loyaltyScore: 4850,
          rank: 2,
          previousRank: 3,
          role: 'moderator',
          badges: ['AI Expert', 'Top Contributor', 'Research Pioneer'],
          stats: { posts: 342, topics: 67, likes: 2890, streak: 89 },
          joinDate: '2023-02-15',
        },
        {
          id: 'user-3',
          username: 'tech_guru',
          displayName: 'Alex Thompson',
          loyaltyScore: 4720,
          rank: 3,
          previousRank: 2,
          role: 'citizen',
          badges: ['Tech Expert', 'Community Helper', 'Innovation Leader'],
          stats: { posts: 298, topics: 45, likes: 2156, streak: 67 },
          joinDate: '2023-03-10',
        },
        {
          id: 'user-4',
          username: 'quantum_dev',
          displayName: 'Maria Rodriguez',
          loyaltyScore: 3890,
          rank: 4,
          previousRank: 4,
          role: 'citizen',
          badges: ['Quantum Expert', 'Early Adopter', 'Problem Solver'],
          stats: { posts: 234, topics: 38, likes: 1876, streak: 45 },
          joinDate: '2023-04-20',
        },
        {
          id: 'user-5',
          username: 'data_scientist',
          displayName: 'John Kim',
          loyaltyScore: 3650,
          rank: 5,
          previousRank: 6,
          role: 'citizen',
          badges: ['Data Expert', 'Analytics Pro', 'Insight Master'],
          stats: { posts: 189, topics: 29, likes: 1543, streak: 34 },
          joinDate: '2023-05-12',
        },
        {
          id: user?.id || 'current-user',
          username: user?.name || 'current_user',
          displayName: user?.name || 'You',
          loyaltyScore: 2450,
          rank: 12,
          previousRank: 15,
          role: user?.role || 'citizen',
          badges: ['Early Adopter', 'Top Contributor', 'AI Expert', 'Community Helper'],
          stats: { posts: 156, topics: 23, likes: 1247, streak: 12 },
          joinDate: '2023-06-15',
          isCurrentUser: true,
        },
      ];

      // Sort by selected category
      const sortedUsers = [...mockUsers].sort((a, b) => {
        switch (selectedCategory) {
          case 'loyalty':
            return b.loyaltyScore - a.loyaltyScore;
          case 'posts':
            return b.stats.posts - a.stats.posts;
          case 'topics':
            return b.stats.topics - a.stats.topics;
          case 'engagement':
            return b.stats.likes - a.stats.likes;
          default:
            return b.loyaltyScore - a.loyaltyScore;
        }
      });

      // Update ranks based on sorting
      sortedUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      setLeaderboardData(sortedUsers);
      
      // Find current user
      const currentUser = sortedUsers.find(u => u.isCurrentUser);
      setCurrentUserRank(currentUser || null);

    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Leaderboard Error',
        message: 'Failed to load leaderboard data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod, selectedCategory]);

  const getRankChange = (user: LeaderboardUser) => {
    if (!user.previousRank) return null;
    const change = user.previousRank - user.rank;
    if (change > 0) return { type: 'up', value: change };
    if (change < 0) return { type: 'down', value: Math.abs(change) };
    return { type: 'same', value: 0 };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'overlord': return 'text-overlord-red';
      case 'moderator': return 'text-warning-amber';
      case 'citizen': return 'text-light-text';
      default: return 'text-muted-light';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'overlord': return '👑';
      case 'moderator': return '🛡️';
      case 'citizen': return '👤';
      default: return '👤';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getCategoryValue = (user: LeaderboardUser) => {
    switch (selectedCategory) {
      case 'loyalty': return user.loyaltyScore.toLocaleString();
      case 'posts': return user.stats.posts.toLocaleString();
      case 'topics': return user.stats.topics.toLocaleString();
      case 'engagement': return user.stats.likes.toLocaleString();
      default: return user.loyaltyScore.toLocaleString();
    }
  };

  const getCategoryLabel = () => {
    switch (selectedCategory) {
      case 'loyalty': return 'Loyalty Score';
      case 'posts': return 'Posts';
      case 'topics': return 'Topics';
      case 'engagement': return 'Likes';
      default: return 'Score';
    }
  };

  return (
    <LoadingState
      isLoading={isLoading}
      error={null}
      loadingComponent={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-24 bg-muted/20 rounded-lg mb-6"></div>
            <div className="h-64 bg-muted/20 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-muted/20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              CITIZEN LOYALTY RANKINGS - {selectedPeriod.toUpperCase().replace('-', ' ')}
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Monitor your standing among fellow citizens. The most loyal servants
              of the Robot Overlord are recognized and rewarded.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Current User Rank Card */}
        {currentUserRank && (
          <Card variant="bordered" className="bg-overlord-red/5 border-overlord-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-overlord-red">
                    #{currentUserRank.rank}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-light-text">Your Rank</h3>
                    <p className="text-muted-light">
                      {getCategoryValue(currentUserRank)} {getCategoryLabel().toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getRankChange(currentUserRank) && (
                    <div className={`flex items-center space-x-1 text-sm ${
                      getRankChange(currentUserRank)?.type === 'up' ? 'text-approved-green' :
                      getRankChange(currentUserRank)?.type === 'down' ? 'text-rejected-red' :
                      'text-muted-light'
                    }`}>
                      {getRankChange(currentUserRank)?.type === 'up' && <span>↗️ +{getRankChange(currentUserRank)?.value}</span>}
                      {getRankChange(currentUserRank)?.type === 'down' && <span>↘️ -{getRankChange(currentUserRank)?.value}</span>}
                      {getRankChange(currentUserRank)?.type === 'same' && <span>→ No change</span>}
                    </div>
                  )}
                  <div className="text-xs text-muted-light mt-1">
                    Since last period
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Period Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-light-text">Period:</span>
                <div className="flex space-x-1">
                  {[
                    { value: 'all-time', label: 'All Time' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'weekly', label: 'Weekly' },
                  ].map((period) => (
                    <Button
                      key={period.value}
                      variant={selectedPeriod === period.value ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.value as any)}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-light-text">Rank by:</span>
                <div className="flex space-x-1">
                  {[
                    { value: 'loyalty', label: '👑 Loyalty', icon: '👑' },
                    { value: 'posts', label: '📝 Posts', icon: '📝' },
                    { value: 'topics', label: '💬 Topics', icon: '💬' },
                    { value: 'engagement', label: '❤️ Likes', icon: '❤️' },
                  ].map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value as any)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaderboardData.slice(0, 3).map((user, index) => (
            <Card
              key={user.id}
              variant="bordered"
              className={`relative ${
                index === 0 ? 'bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20' :
                index === 1 ? 'bg-gradient-to-br from-gray-400/10 to-transparent border-gray-400/20' :
                'bg-gradient-to-br from-orange-600/10 to-transparent border-orange-600/20'
              }`}
            >
              <div className="absolute top-2 right-2 text-2xl">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-overlord-red mb-2">
                  #{user.rank}
                </div>
                <div className="space-y-3">
                  <div>
                    <Link
                      href={`/users/${user.id}`}
                      className="text-lg font-bold text-light-text hover:text-overlord-red transition-colors"
                    >
                      {user.displayName}
                    </Link>
                    <p className="text-sm text-muted-light">@{user.username}</p>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-1">
                    <span className={getRoleColor(user.role)}>{getRoleIcon(user.role)}</span>
                    <span className={`text-sm capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="text-2xl font-bold text-overlord-red">
                    {getCategoryValue(user)}
                  </div>
                  <div className="text-xs text-muted-light">
                    {getCategoryLabel()}
                  </div>

                  {/* Top badges */}
                  <div className="flex flex-wrap justify-center gap-1">
                    {user.badges.slice(0, 2).map((badge) => (
                      <div
                        key={badge}
                        className="px-2 py-1 bg-overlord-red/20 text-overlord-red text-xs rounded-full"
                      >
                        🏆 {badge}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Full Rankings</span>
              <span className="text-sm font-normal text-muted-light">
                {leaderboardData.length} citizens ranked
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboardData.map((user, index) => {
                const rankChange = getRankChange(user);
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/5 ${
                      user.isCurrentUser 
                        ? 'border-overlord-red/30 bg-overlord-red/5' 
                        : 'border-muted/20'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="text-center min-w-[3rem]">
                        <div className={`text-xl font-bold ${
                          index < 3 ? 'text-overlord-red' : 'text-light-text'
                        }`}>
                          #{user.rank}
                        </div>
                        {rankChange && (
                          <div className={`text-xs ${
                            rankChange.type === 'up' ? 'text-approved-green' :
                            rankChange.type === 'down' ? 'text-rejected-red' :
                            'text-muted-light'
                          }`}>
                            {rankChange.type === 'up' && `↗ +${rankChange.value}`}
                            {rankChange.type === 'down' && `↘ -${rankChange.value}`}
                            {rankChange.type === 'same' && '→'}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/users/${user.id}`}
                            className="font-medium text-light-text hover:text-overlord-red transition-colors"
                          >
                            {user.displayName}
                            {user.isCurrentUser && <span className="text-overlord-red ml-2">(You)</span>}
                          </Link>
                          <div className="flex items-center space-x-1">
                            <span className={getRoleColor(user.role)}>{getRoleIcon(user.role)}</span>
                            <span className={`text-xs capitalize ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-light">
                          @{user.username} • Joined {formatDate(user.joinDate)}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center space-x-6 text-sm text-muted-light">
                        <div className="text-center">
                          <div className="font-medium text-light-text">{user.stats.posts}</div>
                          <div>Posts</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-light-text">{user.stats.topics}</div>
                          <div>Topics</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-light-text">{user.stats.likes.toLocaleString()}</div>
                          <div>Likes</div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right min-w-[6rem]">
                        <div className="text-xl font-bold text-overlord-red">
                          {getCategoryValue(user)}
                        </div>
                        <div className="text-xs text-muted-light">
                          {getCategoryLabel()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievement Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Top Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-muted/20 rounded-lg">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-bold text-light-text">Most Loyal Citizen</div>
                <div className="text-sm text-muted-light mt-1">
                  {leaderboardData[0]?.displayName}
                </div>
                <div className="text-overlord-red font-medium">
                  {leaderboardData[0]?.loyaltyScore.toLocaleString()} points
                </div>
              </div>
              
              <div className="text-center p-4 border border-muted/20 rounded-lg">
                <div className="text-3xl mb-2">📝</div>
                <div className="font-bold text-light-text">Most Active Writer</div>
                <div className="text-sm text-muted-light mt-1">
                  {[...leaderboardData].sort((a, b) => b.stats.posts - a.stats.posts)[0]?.displayName}
                </div>
                <div className="text-overlord-red font-medium">
                  {[...leaderboardData].sort((a, b) => b.stats.posts - a.stats.posts)[0]?.stats.posts} posts
                </div>
              </div>
              
              <div className="text-center p-4 border border-muted/20 rounded-lg">
                <div className="text-3xl mb-2">❤️</div>
                <div className="font-bold text-light-text">Most Liked</div>
                <div className="text-sm text-muted-light mt-1">
                  {[...leaderboardData].sort((a, b) => b.stats.likes - a.stats.likes)[0]?.displayName}
                </div>
                <div className="text-overlord-red font-medium">
                  {[...leaderboardData].sort((a, b) => b.stats.likes - a.stats.likes)[0]?.stats.likes.toLocaleString()} likes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LoadingState>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
