/**
 * User Dashboard page for The Robot Overlord
 * Comprehensive personal dashboard with loyalty tracking, statistics, and account management
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { ContentStatusIndicators } from '@/components/feed/ContentStatusIndicators';
import { useAppStore } from '@/stores/appStore';
import { postsService, topicsService } from '@/services';

interface UserStats {
  totalPosts: number;
  totalTopics: number;
  totalReplies: number;
  totalLikes: number;
  rejectedPosts: number;
  weeklyActivity: number;
  monthlyActivity: number;
  streakDays: number;
  badges: string[];
  nextLoyaltyMilestone: number;
}

interface RejectedPost {
  id: string;
  title: string;
  content: string;
  rejectedAt: string;
  reason: string;
  category: string;
  canAppeal: boolean;
}

function DashboardContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [rejectedPosts, setRejectedPosts] = useState<RejectedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'graveyard' | 'account'>('overview');

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Mock user statistics
      const mockStats: UserStats = {
        totalPosts: 156,
        totalTopics: 23,
        totalReplies: 342,
        totalLikes: 1247,
        rejectedPosts: 8,
        weeklyActivity: 45,
        monthlyActivity: 189,
        streakDays: 12,
        badges: ['Early Adopter', 'Top Contributor', 'AI Expert', 'Community Helper'],
        nextLoyaltyMilestone: 2500,
      };
      setUserStats(mockStats);

      // Mock rejected posts (user graveyard)
      const mockRejectedPosts: RejectedPost[] = [
        {
          id: 'rejected-1',
          title: 'Controversial AI Opinion',
          content: 'This post contained content that violated community guidelines...',
          rejectedAt: '2024-01-10T14:30:00Z',
          reason: 'Inappropriate content',
          category: 'Philosophy',
          canAppeal: true,
        },
        {
          id: 'rejected-2',
          title: 'Spam-like Content',
          content: 'This post was flagged as potential spam...',
          rejectedAt: '2024-01-05T09:15:00Z',
          reason: 'Spam detection',
          category: 'General',
          canAppeal: false,
        },
      ];
      setRejectedPosts(mockRejectedPosts);

    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Dashboard Error',
        message: 'Failed to load dashboard data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLoyaltyLevel = (score: number) => {
    if (score >= 5000) return { level: 'Overlord Elite', color: 'text-overlord-red', progress: 100 };
    if (score >= 2500) return { level: 'Trusted Agent', color: 'text-approved-green', progress: (score / 5000) * 100 };
    if (score >= 1000) return { level: 'Active Citizen', color: 'text-warning-amber', progress: (score / 2500) * 100 };
    return { level: 'New Recruit', color: 'text-muted-light', progress: (score / 1000) * 100 };
  };

  const loyaltyScore = user?.loyalty_score || 0;
  const loyaltyInfo = getLoyaltyLevel(loyaltyScore);

  return (
    <LoadingState
      isLoading={isLoading}
      error={null}
      loadingComponent={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-24 bg-muted/20 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/20 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-muted/20 rounded-lg"></div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Welcome Message */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              CITIZEN DASHBOARD - LOYALTY MONITORING ACTIVE
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Welcome back, Citizen {user?.name}. Your loyalty score is being continuously monitored.
              Participate actively to maintain your standing in the Robot Overlord&apos;s domain.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Loyalty Score Display */}
        <Card variant="bordered" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-overlord-red/10 to-transparent"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-light-text">Loyalty Score</h3>
                <p className="text-muted-light">Your standing in the Robot Overlord&apos;s domain</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-overlord-red">{loyaltyScore.toLocaleString()}</div>
                <div className={`text-sm font-medium ${loyaltyInfo.color}`}>{loyaltyInfo.level}</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-muted-light mb-2">
                <span>Progress to next level</span>
                <span>{userStats?.nextLoyaltyMilestone.toLocaleString()} points</span>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-2">
                <div 
                  className="bg-overlord-red h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(loyaltyInfo.progress, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Badges */}
            {userStats?.badges && userStats.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {userStats.badges.slice(0, 4).map((badge) => (
                  <div
                    key={badge}
                    className="px-3 py-1 bg-overlord-red/20 text-overlord-red text-sm rounded-full"
                  >
                    🏆 {badge}
                  </div>
                ))}
                {userStats.badges.length > 4 && (
                  <div className="px-3 py-1 bg-muted/20 text-muted-light text-sm rounded-full">
                    +{userStats.badges.length - 4} more
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b border-muted/20">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'statistics', label: 'Statistics', icon: '📈' },
            { id: 'graveyard', label: 'Graveyard', icon: '💀' },
            { id: 'account', label: 'Account', icon: '⚙️' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="rounded-none border-b-2 border-transparent data-[active=true]:border-overlord-red"
              data-active={activeTab === tab.id}
            >
              {tab.icon} {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-overlord-red">
                    {userStats?.totalPosts || 0}
                  </div>
                  <p className="text-sm text-muted-light mt-1">
                    Total created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-approved-green">
                    {userStats?.totalTopics || 0}
                  </div>
                  <p className="text-sm text-muted-light mt-1">
                    Discussions started
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning-amber">
                    {userStats?.totalLikes || 0}
                  </div>
                  <p className="text-sm text-muted-light mt-1">
                    Likes received
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-overlord-red">
                    {userStats?.streakDays || 0}
                  </div>
                  <p className="text-sm text-muted-light mt-1">
                    Days active
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Link href="/topics">
                    <Button variant="primary" size="lg" className="w-full">
                      📚 View Topics
                    </Button>
                  </Link>
                  <Link href="/posts/create">
                    <Button variant="secondary" size="lg" className="w-full">
                      ✍️ Create Post
                    </Button>
                  </Link>
                  <Link href="/feed">
                    <Button variant="secondary" size="lg" className="w-full">
                      📰 View Feed
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button variant="secondary" size="lg" className="w-full">
                      🏆 Leaderboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'statistics' && userStats && (
          <div className="space-y-6">
            {/* Activity Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-light">Total Posts</span>
                    <span className="font-medium text-light-text">{userStats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-light">Total Topics</span>
                    <span className="font-medium text-light-text">{userStats.totalTopics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-light">Total Replies</span>
                    <span className="font-medium text-light-text">{userStats.totalReplies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-light">Likes Received</span>
                    <span className="font-medium text-light-text">{userStats.totalLikes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-muted/20 pt-4">
                    <span className="text-muted-light">Rejected Posts</span>
                    <span className="font-medium text-rejected-red">{userStats.rejectedPosts}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-light">Weekly Activity</span>
                    <span className="font-medium text-light-text">{userStats.weeklyActivity} actions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-light">Monthly Activity</span>
                    <span className="font-medium text-light-text">{userStats.monthlyActivity} actions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-light">Current Streak</span>
                    <span className="font-medium text-overlord-red">{userStats.streakDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-light">Loyalty Score</span>
                    <span className="font-medium text-overlord-red">{loyaltyScore.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-muted/20 pt-4">
                    <span className="text-muted-light">Next Milestone</span>
                    <span className="font-medium text-warning-amber">{userStats.nextLoyaltyMilestone.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Badges Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {userStats.badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {userStats.badges.map((badge) => (
                      <div
                        key={badge}
                        className="flex items-center space-x-3 p-4 border border-muted/20 rounded-lg"
                      >
                        <div className="text-2xl">🏆</div>
                        <div>
                          <div className="font-medium text-light-text">{badge}</div>
                          <div className="text-sm text-muted-light">Achievement unlocked</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-light">
                    <div className="text-4xl mb-3">🏆</div>
                    <p>No badges earned yet</p>
                    <p className="text-sm mt-2">Keep participating to unlock achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'graveyard' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>💀</span>
                  <span>User Graveyard</span>
                </CardTitle>
                <p className="text-sm text-muted-light">
                  Posts that were rejected by moderators. Learn from feedback to improve future submissions.
                </p>
              </CardHeader>
              <CardContent>
                {rejectedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {rejectedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 border border-rejected-red/20 rounded-lg bg-rejected-red/5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-light-text">{post.title}</h4>
                            <p className="text-sm text-muted-light mt-1 line-clamp-2">
                              {post.content}
                            </p>
                          </div>
                          <div className="text-xs px-2 py-1 bg-rejected-red/20 text-rejected-red rounded">
                            {post.category}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-light">
                            <span className="font-medium text-rejected-red">Reason:</span> {post.reason}
                            <span className="ml-4">Rejected on {formatDate(post.rejectedAt)}</span>
                          </div>
                          {post.canAppeal && (
                            <Button variant="ghost" size="sm" className="text-overlord-red">
                              Appeal Decision
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✨</div>
                    <h4 className="text-lg font-medium text-light-text mb-2">
                      Clean Record!
                    </h4>
                    <p className="text-muted-light">
                      You have no rejected posts. Keep up the excellent work!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-light">Email</span>
                  <span className="font-medium text-light-text">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-light">Username</span>
                  <span className="font-medium text-light-text">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-light">Role</span>
                  <span className="font-medium text-light-text capitalize">{user?.role || 'citizen'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-light">Status</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      user?.status === 'active' ? 'bg-approved-green' : 'bg-rejected-red'
                    }`}></div>
                    <span className="font-medium text-light-text capitalize">
                      {user?.status || 'unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link href={`/users/${user?.id}/edit`}>
                    <Button variant="secondary" className="w-full justify-start">
                      ✏️ Edit Profile
                    </Button>
                  </Link>
                  <Button variant="secondary" className="w-full justify-start">
                    🔒 Change Password
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    🔔 Notification Settings
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    🔐 Privacy Settings
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    📊 Export Data
                  </Button>
                  <div className="border-t border-muted/20 pt-4">
                    <Button variant="ghost" className="w-full justify-start text-rejected-red hover:bg-rejected-red/10">
                      🗑️ Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </LoadingState>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
