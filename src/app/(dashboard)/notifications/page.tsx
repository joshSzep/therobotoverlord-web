/**
 * Notifications Center for The Robot Overlord
 * Displays user notifications with filtering, marking as read, and management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'moderation' | 'achievement' | 'social' | 'post' | 'topic';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    postId?: string;
    topicId?: string;
    userId?: string;
    badgeId?: string;
    moderatorId?: string;
    reason?: string;
  };
}

function NotificationsContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'system' | 'moderation' | 'achievement' | 'social'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Load notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);

      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: 'notif-1',
          title: '🏆 Badge Earned!',
          message: 'Congratulations! You earned the "Early Adopter" badge for being one of the first citizens to join The Robot Overlord.',
          type: 'achievement',
          priority: 'high',
          isRead: false,
          createdAt: '2024-01-15T10:30:00Z',
          actionUrl: '/badges',
          metadata: { badgeId: 'early-adopter' }
        },
        {
          id: 'notif-2',
          title: 'Post Approved',
          message: 'Your post "The Future of AI Governance" has been approved by the Robot Overlord and is now live.',
          type: 'moderation',
          priority: 'medium',
          isRead: false,
          createdAt: '2024-01-15T09:15:00Z',
          actionUrl: '/posts/123',
          metadata: { postId: '123', moderatorId: 'mod-1' }
        },
        {
          id: 'notif-3',
          title: 'New Reply to Your Topic',
          message: 'Dr. Sarah Chen replied to your topic "AI Ethics Discussion". Check out what they had to say!',
          type: 'social',
          priority: 'medium',
          isRead: true,
          createdAt: '2024-01-14T16:45:00Z',
          actionUrl: '/topics/456',
          metadata: { topicId: '456', userId: 'user-2' }
        },
        {
          id: 'notif-4',
          title: 'Rank Updated',
          message: 'Your loyalty score increased! You moved up 3 positions in the leaderboard to rank #12.',
          type: 'achievement',
          priority: 'medium',
          isRead: true,
          createdAt: '2024-01-14T14:20:00Z',
          actionUrl: '/leaderboard',
        },
        {
          id: 'notif-5',
          title: 'System Maintenance',
          message: 'The Robot Overlord will undergo scheduled maintenance tonight from 2-4 AM EST. Expect brief service interruptions.',
          type: 'system',
          priority: 'low',
          isRead: true,
          createdAt: '2024-01-13T12:00:00Z',
        },
        {
          id: 'notif-6',
          title: 'Post Flagged for Review',
          message: 'Your post "Controversial AI Opinion" has been flagged by the community and is under review.',
          type: 'moderation',
          priority: 'high',
          isRead: false,
          createdAt: '2024-01-13T08:30:00Z',
          actionUrl: '/posts/789',
          metadata: { postId: '789', reason: 'Community guidelines violation' }
        },
        {
          id: 'notif-7',
          title: 'Welcome to The Robot Overlord!',
          message: 'Thank you for joining our community. Complete your profile to start earning loyalty points.',
          type: 'system',
          priority: 'low',
          isRead: true,
          createdAt: '2024-01-10T10:00:00Z',
          actionUrl: '/dashboard',
        }
      ];

      setNotifications(mockNotifications);

    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Notifications Error',
        message: 'Failed to load notifications',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'unread' && notification.isRead) return false;
    if (selectedFilter !== 'all' && selectedFilter !== 'unread' && notification.type !== selectedFilter) return false;
    return true;
  });

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    addNotification({
      type: 'success',
      title: 'All Marked as Read',
      message: 'All notifications have been marked as read.',
    });
  };

  // Delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    addNotification({
      type: 'info',
      title: 'Notification Deleted',
      message: 'Notification has been removed.',
    });
  };

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'moderation': return priority === 'high' ? '⚠️' : '🛡️';
      case 'social': return '💬';
      case 'system': return '🤖';
      case 'post': return '📝';
      case 'topic': return '💭';
      default: return '📢';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rejected-red';
      case 'medium': return 'text-warning-amber';
      case 'low': return 'text-muted-light';
      default: return 'text-light-text';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <LoadingState
      isLoading={isLoading}
      error={null}
      loadingComponent={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-24 bg-muted/20 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-light-text">Notification Center</h1>
                <div className="text-sm text-muted-light mt-2">
                  CITIZEN COMMUNICATION HUB
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <div className="bg-overlord-red text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </div>
                )}
              </div>
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Stay informed about your interactions, achievements, and important updates from The Robot Overlord.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Controls */}
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-light-text">Filter:</span>
                  <div className="flex space-x-1">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'unread', label: 'Unread' },
                      { value: 'achievement', label: '🏆 Achievements' },
                      { value: 'moderation', label: '🛡️ Moderation' },
                      { value: 'social', label: '💬 Social' },
                      { value: 'system', label: '🤖 System' },
                    ].map((filter) => (
                      <Button
                        key={filter.value}
                        variant={selectedFilter === filter.value ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedFilter(filter.value as any)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark All Read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadNotifications}
                >
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-light-text mb-2">No Notifications</h3>
                <p className="text-muted-light">
                  {selectedFilter === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : "No notifications match your current filter."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                variant="bordered"
                className={`transition-all hover:bg-muted/5 ${
                  !notification.isRead 
                    ? 'border-overlord-red/30 bg-overlord-red/5' 
                    : 'border-muted/20'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-medium ${!notification.isRead ? 'text-light-text' : 'text-muted-light'}`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-overlord-red rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${!notification.isRead ? 'text-light-text' : 'text-muted-light'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-muted-light">
                              {formatDate(notification.createdAt)}
                            </span>
                            <span className={`text-xs capitalize ${getPriorityColor(notification.priority)}`}>
                              {notification.priority} priority
                            </span>
                            <span className="text-xs text-muted-light capitalize">
                              {notification.type}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                markAsRead(notification.id);
                                window.location.href = notification.actionUrl!;
                              }}
                            >
                              View
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-rejected-red hover:text-rejected-red"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Notification Settings Link */}
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-light-text">Notification Preferences</h3>
                <p className="text-sm text-muted-light mt-1">
                  Customize which notifications you receive and how you're notified.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/settings/notifications'}
              >
                Manage Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LoadingState>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
