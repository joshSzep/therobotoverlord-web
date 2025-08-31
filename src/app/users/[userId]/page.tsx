/**
 * User profile page for The Robot Overlord
 * Displays comprehensive user information, statistics, and activity
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingState } from '@/components/ui/LoadingSpinner';
import { ContentStatusIndicators } from '@/components/feed/ContentStatusIndicators';
import { useAppStore } from '@/stores/appStore';
import { usersService, postsService, topicsService } from '@/services';
import { User } from '@/types/users';
import { Post } from '@/types/posts';
import { Topic } from '@/types/topics';

interface UserStats {
  totalPosts: number;
  totalTopics: number;
  totalReplies: number;
  totalLikes: number;
  totalViews: number;
  loyaltyPoints: number;
  joinDate: string;
  lastActive: string;
  reputation: number;
  badges: string[];
  following: number;
  followers: number;
}

interface UserActivity {
  id: string;
  type: 'post' | 'topic' | 'reply' | 'like' | 'follow';
  title: string;
  description: string;
  timestamp: string;
  url: string;
  metadata?: {
    category?: string;
    tags?: string[];
    score?: number;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { addNotification, currentUser } = useAppStore() as any;
  
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'topics' | 'activity'>('overview');
  const [isFollowing, setIsFollowing] = useState(false);

  // Load user profile data
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user basic info
      const userResponse = await usersService.getUserById(userId);
      if (userResponse.data) {
        setUser(userResponse.data as any);
      }

      // Load user statistics (mock data for now)
      const mockStats: UserStats = {
        totalPosts: 156,
        totalTopics: 23,
        totalReplies: 342,
        totalLikes: 1247,
        totalViews: 8934,
        loyaltyPoints: 2450,
        joinDate: '2023-06-15',
        lastActive: '2024-01-15T10:30:00Z',
        reputation: 89,
        badges: ['Early Adopter', 'Top Contributor', 'AI Expert', 'Community Helper'],
        following: 45,
        followers: 123,
      };
      setUserStats(mockStats);

      // Load recent posts
      const postsResponse = await postsService.getPostsByUser(userId, 1, 5);
      if (postsResponse.data) {
        setRecentPosts(postsResponse.data);
      }

      // Load recent topics
      const topicsResponse = await topicsService.getTopicsByUser(userId, 1, 5);
      if (topicsResponse.data) {
        setRecentTopics(topicsResponse.data as any);
      }

      // Load recent activity (mock data)
      const mockActivity: UserActivity[] = [
        {
          id: 'act-1',
          type: 'post',
          title: 'Created new post',
          description: 'Advanced Machine Learning Techniques for Beginners',
          timestamp: '2024-01-15T09:30:00Z',
          url: '/posts/advanced-ml-techniques',
          metadata: {
            category: 'Technical',
            tags: ['machine-learning', 'ai'],
            score: 89
          }
        },
        {
          id: 'act-2',
          type: 'topic',
          title: 'Started new topic',
          description: 'Future of Robotics in Healthcare',
          timestamp: '2024-01-14T16:45:00Z',
          url: '/topics/robotics-healthcare',
          metadata: {
            category: 'Healthcare',
            tags: ['robotics', 'healthcare']
          }
        },
        {
          id: 'act-3',
          type: 'reply',
          title: 'Replied to discussion',
          description: 'Ethical Considerations in AI Development',
          timestamp: '2024-01-14T14:20:00Z',
          url: '/posts/ai-ethics-considerations',
          metadata: {
            category: 'Philosophy'
          }
        },
        {
          id: 'act-4',
          type: 'like',
          title: 'Liked post',
          description: 'Quantum Computing Breakthroughs',
          timestamp: '2024-01-14T11:15:00Z',
          url: '/posts/quantum-computing-breakthroughs',
          metadata: {
            category: 'Science'
          }
        },
        {
          id: 'act-5',
          type: 'follow',
          title: 'Started following',
          description: 'Dr. Sarah Chen - AI Research Lead',
          timestamp: '2024-01-13T18:30:00Z',
          url: '/users/dr-sarah-chen'
        }
      ];
      setRecentActivity(mockActivity);

      // Check if current user is following this user
      setIsFollowing(false); // Mock - would check actual follow status

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Profile Error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await usersService.unfollowUser(userId);
        setIsFollowing(false);
        addNotification({
          type: 'success',
          title: 'Unfollowed',
          message: `You are no longer following ${user?.username}`,
        });
      } else {
        await usersService.followUser(userId);
        setIsFollowing(true);
        addNotification({
          type: 'success',
          title: 'Following',
          message: `You are now following ${user?.username}`,
        });
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Follow Error',
        message: 'Failed to update follow status',
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'topic': return '💬';
      case 'reply': return '💭';
      case 'like': return '👍';
      case 'follow': return '👤';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-overlord-red';
      case 'topic': return 'text-approved-green';
      case 'reply': return 'text-warning-amber';
      case 'like': return 'text-overlord-red';
      case 'follow': return 'text-muted-light';
      default: return 'text-muted-light';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return formatDate(dateString);
  };

  const isOwnProfile = currentUser?.id === userId;

  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      loadingComponent={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-muted/20 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted/20 rounded-lg"></div>
                <div className="h-48 bg-muted/20 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-muted/20 rounded-lg"></div>
                <div className="h-32 bg-muted/20 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {user && userStats ? (
        <div className="space-y-6">
          {/* Profile Header */}
          <Card variant="bordered" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-overlord-red/10 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-overlord-red/20 flex items-center justify-center text-3xl font-bold text-overlord-red">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  {/* Basic Info */}
                  <div>
                    <h1 className="text-3xl font-bold text-light-text mb-2">
                      {user.displayName || user.username}
                    </h1>
                    <p className="text-lg text-muted-light mb-1">@{user.username}</p>
                    {user.bio && (
                      <p className="text-muted-light max-w-2xl mb-4">{user.bio}</p>
                    )}
                    
                    {/* Quick Stats */}
                    <div className="flex items-center space-x-6 text-sm text-muted-light">
                      <div className="flex items-center space-x-1">
                        <span>📅</span>
                        <span>Joined {formatDate(userStats.joinDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🕒</span>
                        <span>Active {formatRelativeTime(userStats.lastActive)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span>{userStats.loyaltyPoints.toLocaleString()} loyalty points</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {!isOwnProfile && (
                    <Button
                      variant={isFollowing ? 'ghost' : 'primary'}
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? '✓ Following' : '+ Follow'}
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Link href={`/users/${userId}/edit`}>
                      <Button variant="ghost">
                        ✏️ Edit Profile
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost">
                    💬 Message
                  </Button>
                </div>
              </div>

              {/* Badges */}
              {userStats.badges.length > 0 && (
                <div className="mt-6 pt-6 border-t border-muted/20">
                  <h3 className="text-sm font-medium text-muted-light mb-3">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {userStats.badges.map((badge) => (
                      <div
                        key={badge}
                        className="px-3 py-1 bg-overlord-red/20 text-overlord-red text-sm rounded-full"
                      >
                        🏆 {badge}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <div className="flex items-center space-x-1 border-b border-muted/20">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'posts', label: 'Posts', icon: '📝' },
              { id: 'topics', label: 'Topics', icon: '💬' },
              { id: 'activity', label: 'Activity', icon: '📋' },
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Recent Posts */}
                  <Card variant="bordered">
                    <CardHeader>
                      <h3 className="text-lg font-bold text-light-text">Recent Posts</h3>
                    </CardHeader>
                    <CardContent>
                      {recentPosts.length > 0 ? (
                        <div className="space-y-4">
                          {recentPosts.slice(0, 3).map((post) => (
                            <div key={post.id} className="border-b border-muted/20 last:border-0 pb-4 last:pb-0">
                              <Link
                                href={`/posts/${post.id}`}
                                className="font-medium text-light-text hover:text-overlord-red transition-colors"
                              >
                                {post.title}
                              </Link>
                              <p className="text-sm text-muted-light mt-1 line-clamp-2">
                                {post.content}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="text-xs text-muted-light">
                                  {formatRelativeTime(post.createdAt)}
                                </div>
                                <ContentStatusIndicators
                                  contentType="post"
                                  contentId={post.id}
                                  engagementScore={post.score}
                                  className="text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-light text-center py-8">No posts yet</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Topics */}
                  <Card variant="bordered">
                    <CardHeader>
                      <h3 className="text-lg font-bold text-light-text">Recent Topics</h3>
                    </CardHeader>
                    <CardContent>
                      {recentTopics.length > 0 ? (
                        <div className="space-y-4">
                          {recentTopics.slice(0, 3).map((topic) => (
                            <div key={topic.id} className="border-b border-muted/20 last:border-0 pb-4 last:pb-0">
                              <Link
                                href={`/topics/${topic.id}`}
                                className="font-medium text-light-text hover:text-overlord-red transition-colors"
                              >
                                {topic.title}
                              </Link>
                              <p className="text-sm text-muted-light mt-1 line-clamp-2">
                                {topic.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="text-xs text-muted-light">
                                  {formatRelativeTime(topic.createdAt)}
                                </div>
                                <div className="text-xs text-muted-light">
                                  {topic.postCount} posts
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-light text-center py-8">No topics yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'posts' && (
                <Card variant="bordered">
                  <CardHeader>
                    <h3 className="text-lg font-bold text-light-text">All Posts</h3>
                  </CardHeader>
                  <CardContent>
                    {recentPosts.length > 0 ? (
                      <div className="space-y-6">
                        {recentPosts.map((post) => (
                          <div key={post.id} className="border-b border-muted/20 last:border-0 pb-6 last:pb-0">
                            <Link
                              href={`/posts/${post.id}`}
                              className="text-xl font-medium text-light-text hover:text-overlord-red transition-colors"
                            >
                              {post.title}
                            </Link>
                            <p className="text-muted-light mt-2 line-clamp-3">
                              {post.content}
                            </p>
                            <div className="flex items-center justify-between mt-4">
                              <div className="text-sm text-muted-light">
                                {formatRelativeTime(post.createdAt)}
                              </div>
                              <ContentStatusIndicators
                                contentType="post"
                                contentId={post.id}
                                engagementScore={post.score}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-light text-center py-12">No posts yet</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'topics' && (
                <Card variant="bordered">
                  <CardHeader>
                    <h3 className="text-lg font-bold text-light-text">All Topics</h3>
                  </CardHeader>
                  <CardContent>
                    {recentTopics.length > 0 ? (
                      <div className="space-y-6">
                        {recentTopics.map((topic) => (
                          <div key={topic.id} className="border-b border-muted/20 last:border-0 pb-6 last:pb-0">
                            <Link
                              href={`/topics/${topic.id}`}
                              className="text-xl font-medium text-light-text hover:text-overlord-red transition-colors"
                            >
                              {topic.title}
                            </Link>
                            <p className="text-muted-light mt-2 line-clamp-3">
                              {topic.description}
                            </p>
                            <div className="flex items-center justify-between mt-4">
                              <div className="text-sm text-muted-light">
                                {formatRelativeTime(topic.createdAt)} • {topic.postCount} posts
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-light text-center py-12">No topics yet</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'activity' && (
                <Card variant="bordered">
                  <CardHeader>
                    <h3 className="text-lg font-bold text-light-text">Recent Activity</h3>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                              <span className="text-sm">{getActivityIcon(activity.type)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-light-text">
                                    {activity.title}
                                  </p>
                                  <Link
                                    href={activity.url}
                                    className="text-sm text-overlord-red hover:underline"
                                  >
                                    {activity.description}
                                  </Link>
                                  {activity.metadata && (
                                    <div className="flex items-center space-x-2 mt-1">
                                      {activity.metadata.category && (
                                        <span className="text-xs px-1.5 py-0.5 bg-muted/20 text-muted-light rounded">
                                          {activity.metadata.category}
                                        </span>
                                      )}
                                      {activity.metadata.score && (
                                        <span className="text-xs text-overlord-red">
                                          {activity.metadata.score} pts
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-muted-light">
                                  {formatRelativeTime(activity.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-light text-center py-12">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <Card variant="bordered">
                <CardHeader>
                  <h3 className="text-lg font-bold text-light-text">Statistics</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-light">Posts</span>
                      <span className="font-medium text-light-text">{userStats.totalPosts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-light">Topics</span>
                      <span className="font-medium text-light-text">{userStats.totalTopics}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-light">Replies</span>
                      <span className="font-medium text-light-text">{userStats.totalReplies}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-light">Likes Received</span>
                      <span className="font-medium text-light-text">{userStats.totalLikes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-light">Profile Views</span>
                      <span className="font-medium text-light-text">{userStats.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-muted/20 pt-4">
                      <span className="text-muted-light">Reputation</span>
                      <span className="font-bold text-overlord-red">{userStats.reputation}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social */}
              <Card variant="bordered">
                <CardHeader>
                  <h3 className="text-lg font-bold text-light-text">Social</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-light">Following</span>
                      <span className="font-medium text-light-text">{userStats.following}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-light">Followers</span>
                      <span className="font-medium text-light-text">{userStats.followers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-bold text-light-text mb-2">
            User Not Found
          </h3>
          <p className="text-muted-light">
            The user profile you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      )}
    </LoadingState>
  );
}
