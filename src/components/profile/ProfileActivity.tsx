'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';

interface ActivityItem {
  id: string;
  type: 'post_created' | 'post_approved' | 'post_rejected' | 'badge_earned' | 'rank_changed';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ProfileActivityProps {
  userId: string;
}

export function ProfileActivity({ userId }: ProfileActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsLoading(true);
        const userActivity = await apiClient.get<ActivityItem[]>(`/users/${userId}/activity`);
        setActivities(userActivity || []);
      } catch (error: any) {
        console.error('Failed to fetch activity:', error);
        setError('Failed to load activity');
        // Mock data for development
        setActivities([
          {
            id: '1',
            type: 'post_created',
            title: 'New Post Submitted',
            description: 'Submitted a post about robot efficiency improvements',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '2',
            type: 'post_approved',
            title: 'Post Approved',
            description: 'Your post "AI Ethics in the Modern Age" was approved by the Overlord',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: '3',
            type: 'badge_earned',
            title: 'Badge Earned',
            description: 'Earned the "Loyal Citizen" badge for consistent participation',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [userId]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post_created': return '📝';
      case 'post_approved': return '✅';
      case 'post_rejected': return '❌';
      case 'badge_earned': return '🏅';
      case 'rank_changed': return '📈';
      default: return '📋';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post_created': return 'text-light-text';
      case 'post_approved': return 'text-approved-green';
      case 'post_rejected': return 'text-rejected-red';
      case 'badge_earned': return 'text-pending-yellow';
      case 'rank_changed': return 'text-overlord-red';
      default: return 'text-muted-light';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-overlord-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-muted-light text-sm mb-2">No recent activity</p>
            <p className="text-xs text-muted-light">
              Start participating to see your activity history here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="text-2xl flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium text-sm ${getActivityColor(activity.type)}`}>
                      {activity.title}
                    </h4>
                    <span className="text-xs text-muted-light">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-light">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            <div className="text-center pt-4 border-t border-muted/30">
              <button className="text-sm text-overlord-red hover:underline">
                Load more activity
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
