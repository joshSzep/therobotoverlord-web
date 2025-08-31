/**
 * Real-time user activity indicator component.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocketContext } from './WebSocketProvider';

interface UserActivity {
  user_id: string;
  username: string;
  status: 'online' | 'offline' | 'away';
  last_seen: string | null;
}

interface UserActivityIndicatorProps {
  userId?: string;
  showStatus?: boolean;
  showLastSeen?: boolean;
  className?: string;
}

export function UserActivityIndicator({ 
  userId, 
  showStatus = true, 
  showLastSeen = false,
  className = ''
}: UserActivityIndicatorProps) {
  const { connected, subscribe, unsubscribe, subscribeToChannel } = useWebSocketContext();
  const [userActivities, setUserActivities] = useState<Map<string, UserActivity>>(new Map());

  useEffect(() => {
    const handleUserOnline = (data: unknown) => {
      const activity = data as UserActivity;
      setUserActivities(prev => {
        const updated = new Map(prev);
        updated.set(activity.user_id, activity);
        return updated;
      });
    };

    const handleUserOffline = (data: unknown) => {
      const activity = data as UserActivity;
      setUserActivities(prev => {
        const updated = new Map(prev);
        updated.set(activity.user_id, activity);
        return updated;
      });
    };

    if (connected) {
      subscribe('user_online', handleUserOnline);
      subscribe('user_offline', handleUserOffline);
      subscribeToChannel('user_activity');
    }

    return () => {
      unsubscribe('user_online', handleUserOnline);
      unsubscribe('user_offline', handleUserOffline);
    };
  }, [connected, subscribe, unsubscribe, subscribeToChannel]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const formatLastSeen = (lastSeen: string | null): string => {
    if (!lastSeen) return 'Never';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (userId) {
    // Show specific user's activity
    const activity = userActivities.get(userId);
    if (!activity && !connected) {
      return (
        <div className={`flex items-center ${className}`}>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          {showStatus && <span className="ml-1 text-sm text-gray-500">Connecting...</span>}
        </div>
      );
    }

    if (!activity) {
      return (
        <div className={`flex items-center ${className}`}>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          {showStatus && <span className="ml-1 text-sm text-gray-500">Offline</span>}
        </div>
      );
    }

    return (
      <div className={`flex items-center ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}></div>
        {showStatus && (
          <span className="ml-1 text-sm text-gray-600">
            {getStatusText(activity.status)}
          </span>
        )}
        {showLastSeen && activity.status === 'offline' && (
          <span className="ml-1 text-xs text-gray-500">
            {formatLastSeen(activity.last_seen)}
          </span>
        )}
      </div>
    );
  }

  // Show activity summary
  const onlineCount = Array.from(userActivities.values()).filter(u => u.status === 'online').length;
  const totalCount = userActivities.size;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
      <span className="ml-1 text-sm text-gray-600">
        {onlineCount} of {totalCount} users online
      </span>
    </div>
  );
}

interface OnlineUsersListProps {
  maxUsers?: number;
  className?: string;
}

export function OnlineUsersList({ maxUsers = 10, className = '' }: OnlineUsersListProps) {
  const { connected, subscribe, unsubscribe, subscribeToChannel } = useWebSocketContext();
  const [onlineUsers, setOnlineUsers] = useState<UserActivity[]>([]);

  useEffect(() => {
    const handleUserOnline = (data: unknown) => {
      const activity = data as UserActivity;
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.user_id !== activity.user_id);
        return [...filtered, { ...activity, status: 'online' as const }].slice(0, maxUsers);
      });
    };

    const handleUserOffline = (data: unknown) => {
      const activity = data as UserActivity;
      setOnlineUsers(prev => prev.filter(u => u.user_id !== activity.user_id));
    };

    if (connected) {
      subscribe('user_online', handleUserOnline);
      subscribe('user_offline', handleUserOffline);
      subscribeToChannel('user_activity');
    }

    return () => {
      unsubscribe('user_online', handleUserOnline);
      unsubscribe('user_offline', handleUserOffline);
    };
  }, [connected, subscribe, unsubscribe, subscribeToChannel, maxUsers]);

  if (!connected) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-sm text-gray-500">Connecting to activity feed...</div>
      </div>
    );
  }

  if (onlineUsers.length === 0) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-sm text-gray-500">No users currently online</div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-lg ${className}`}>
      <h4 className="font-medium mb-3 flex items-center">
        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
        Online Users ({onlineUsers.length})
      </h4>
      <div className="space-y-2">
        {onlineUsers.map((user) => (
          <div key={user.user_id} className="flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs font-medium text-blue-600">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-700">{user.username}</span>
            <div className="w-2 h-2 bg-green-400 rounded-full ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
