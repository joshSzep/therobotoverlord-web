/**
 * Admin Dashboard for The Robot Overlord
 * Comprehensive admin interface for system management and moderation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { useModerationRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

interface SystemStats {
  users: {
    total: number;
    active: number;
    new_today: number;
    suspended: number;
    banned: number;
  };
  content: {
    posts_total: number;
    posts_pending: number;
    posts_approved: number;
    posts_rejected: number;
    topics_total: number;
    topics_active: number;
  };
  moderation: {
    queue_size: number;
    flags_pending: number;
    appeals_pending: number;
    actions_today: number;
  };
  system: {
    uptime: string;
    response_time: number;
    error_rate: number;
    active_connections: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  variant: 'primary' | 'secondary' | 'danger';
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  const { connected } = useModerationRealTimeUpdates();
  
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Check admin permissions
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  // Load system statistics
  const loadStats = async () => {
    try {
      setIsLoading(true);

      // Mock system statistics
      const mockStats: SystemStats = {
        users: {
          total: 15847,
          active: 3421,
          new_today: 47,
          suspended: 23,
          banned: 8,
        },
        content: {
          posts_total: 45623,
          posts_pending: 127,
          posts_approved: 44891,
          posts_rejected: 605,
          topics_total: 8934,
          topics_active: 2341,
        },
        moderation: {
          queue_size: 89,
          flags_pending: 34,
          appeals_pending: 12,
          actions_today: 156,
        },
        system: {
          uptime: '99.97%',
          response_time: 142,
          error_rate: 0.03,
          active_connections: 1247,
        },
      };

      setStats(mockStats);

    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Admin Dashboard Error',
        message: 'Failed to load system statistics',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin, selectedTimeRange]);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'moderation-queue',
      title: 'Review Moderation Queue',
      description: `${stats?.moderation.queue_size || 0} items pending`,
      icon: '🛡️',
      action: () => window.location.href = '/admin/moderation',
      variant: 'primary',
    },
    {
      id: 'user-management',
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: '👥',
      action: () => window.location.href = '/admin/users',
      variant: 'secondary',
    },
    {
      id: 'content-review',
      title: 'Content Review',
      description: 'Review flagged posts and topics',
      icon: '📝',
      action: () => window.location.href = '/admin/content',
      variant: 'secondary',
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: '⚙️',
      action: () => window.location.href = '/admin/settings',
      variant: 'secondary',
    },
    {
      id: 'audit-logs',
      title: 'Audit Logs',
      description: 'View system and admin activity',
      icon: '📊',
      action: () => window.location.href = '/admin/audit',
      variant: 'secondary',
    },
    {
      id: 'emergency-actions',
      title: 'Emergency Actions',
      description: 'Critical system controls',
      icon: '🚨',
      action: () => window.location.href = '/admin/emergency',
      variant: 'danger',
    },
  ];

  // Handle emergency broadcast
  const sendEmergencyBroadcast = () => {
    addNotification({
      type: 'warning',
      title: 'Emergency Broadcast',
      message: 'This would send a system-wide emergency notification to all users.',
    });
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <OverlordMessage variant="error">
          <OverlordHeader>
            <h1 className="text-2xl font-bold text-light-text">Access Denied</h1>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              You do not have sufficient permissions to access the admin dashboard.
              Only administrators and moderators can view this page.
            </p>
          </OverlordContent>
        </OverlordMessage>
      </div>
    );
  }

  return (
    <LoadingState
      isLoading={isLoading}
      error={null}
      loadingComponent={
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-24 bg-muted/20 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/20 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-muted/20 rounded-lg"></div>
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
                <h1 className="text-2xl font-bold text-light-text">Admin Dashboard</h1>
                <div className="text-sm text-muted-light mt-2">
                  SYSTEM COMMAND CENTER - {user?.role?.toUpperCase()}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-approved-green' : 'bg-muted'}`}></div>
                  <span className="text-muted-light">
                    {connected ? 'Real-time monitoring active' : 'Offline mode'}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[
                    { value: '24h', label: '24H' },
                    { value: '7d', label: '7D' },
                    { value: '30d', label: '30D' },
                  ].map((range) => (
                    <Button
                      key={range.value}
                      variant={selectedTimeRange === range.value ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedTimeRange(range.value as any)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Monitor system health, manage users and content, and maintain platform security.
              All administrative actions are logged and auditable.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="bordered" className="bg-gradient-to-br from-approved-green/10 to-transparent border-approved-green/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-light">System Uptime</p>
                  <p className="text-2xl font-bold text-approved-green">{stats?.system.uptime}</p>
                </div>
                <div className="text-3xl">🟢</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" className="bg-gradient-to-br from-warning-amber/10 to-transparent border-warning-amber/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-light">Moderation Queue</p>
                  <p className="text-2xl font-bold text-warning-amber">{stats?.moderation.queue_size}</p>
                </div>
                <div className="text-3xl">🛡️</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" className="bg-gradient-to-br from-overlord-red/10 to-transparent border-overlord-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-light">Active Users</p>
                  <p className="text-2xl font-bold text-overlord-red">{stats?.users.active.toLocaleString()}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-light">Response Time</p>
                  <p className="text-2xl font-bold text-blue-400">{stats?.system.response_time}ms</p>
                </div>
                <div className="text-3xl">⚡</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>👥</span>
                <span>User Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Total Users</span>
                  <span className="font-bold text-light-text">{stats?.users.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">New Today</span>
                  <span className="font-bold text-approved-green">+{stats?.users.new_today}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Suspended</span>
                  <span className="font-bold text-warning-amber">{stats?.users.suspended}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Banned</span>
                  <span className="font-bold text-rejected-red">{stats?.users.banned}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>Content Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Total Posts</span>
                  <span className="font-bold text-light-text">{stats?.content.posts_total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Pending Review</span>
                  <span className="font-bold text-warning-amber">{stats?.content.posts_pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Approved</span>
                  <span className="font-bold text-approved-green">{stats?.content.posts_approved.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Rejected</span>
                  <span className="font-bold text-rejected-red">{stats?.content.posts_rejected}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🛡️</span>
                <span>Moderation Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Queue Size</span>
                  <span className="font-bold text-warning-amber">{stats?.moderation.queue_size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Flags Pending</span>
                  <span className="font-bold text-rejected-red">{stats?.moderation.flags_pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Appeals Pending</span>
                  <span className="font-bold text-blue-400">{stats?.moderation.appeals_pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-light">Actions Today</span>
                  <span className="font-bold text-light-text">{stats?.moderation.actions_today}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Card
                  key={action.id}
                  variant="bordered"
                  className={`cursor-pointer transition-all hover:bg-muted/5 ${
                    action.variant === 'danger' ? 'border-rejected-red/30 hover:border-rejected-red/50' :
                    action.variant === 'primary' ? 'border-overlord-red/30 hover:border-overlord-red/50' :
                    'border-muted/20 hover:border-muted/40'
                  }`}
                  onClick={action.action}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{action.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-light-text">{action.title}</h3>
                        <p className="text-sm text-muted-light mt-1">{action.description}</p>
                      </div>
                      <div className="text-muted-light">→</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Controls */}
        <Card variant="bordered" className="border-rejected-red/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-rejected-red">
              <span>🚨</span>
              <span>Emergency Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-light-text font-medium">System Emergency Actions</p>
                <p className="text-sm text-muted-light">
                  Use these controls only in critical situations. All actions are logged and auditable.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  onClick={sendEmergencyBroadcast}
                >
                  📢 Emergency Broadcast
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addNotification({
                    type: 'warning',
                    title: 'Maintenance Mode',
                    message: 'This would enable maintenance mode for the platform.',
                  })}
                >
                  🔧 Maintenance Mode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '2 minutes ago', action: 'Post approved', user: 'admin', details: 'ID: #12345' },
                { time: '5 minutes ago', action: 'User suspended', user: 'moderator_1', details: 'Spam violation' },
                { time: '12 minutes ago', action: 'Flag reviewed', user: 'admin', details: 'False positive' },
                { time: '18 minutes ago', action: 'Topic locked', user: 'moderator_2', details: 'Off-topic discussion' },
                { time: '25 minutes ago', action: 'Appeal processed', user: 'admin', details: 'Reinstated user' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-muted/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-overlord-red rounded-full"></div>
                    <div>
                      <span className="font-medium text-light-text">{activity.action}</span>
                      <span className="text-muted-light text-sm ml-2">by {activity.user}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-light">{activity.time}</div>
                    <div className="text-xs text-muted-light">{activity.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </LoadingState>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AdminDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
