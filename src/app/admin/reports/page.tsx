/**
 * Moderation Reporting Tools for The Robot Overlord
 * Provides analytics and reports for moderation activities and trends
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';

interface ModerationStats {
  timeframe: string;
  totalActions: number;
  contentRemoved: number;
  usersWarned: number;
  usersSuspended: number;
  usersBanned: number;
  appealsReceived: number;
  appealsApproved: number;
  flagsProcessed: number;
  flagsResolved: number;
  averageResponseTime: number;
  topModerators: Array<{
    name: string;
    actions: number;
  }>;
  contentTypes: Array<{
    type: string;
    count: number;
  }>;
  violationTypes: Array<{
    type: string;
    count: number;
  }>;
}

interface ReportFilters {
  timeframe: string;
  reportType: string;
  moderator: string;
}

function ModerationReportsContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({
    timeframe: '7d',
    reportType: 'overview',
    moderator: 'all'
  });

  // Mock moderation statistics
  const mockStats: ModerationStats = {
    timeframe: '7d',
    totalActions: 156,
    contentRemoved: 42,
    usersWarned: 28,
    usersSuspended: 12,
    usersBanned: 3,
    appealsReceived: 8,
    appealsApproved: 3,
    flagsProcessed: 89,
    flagsResolved: 76,
    averageResponseTime: 2.4,
    topModerators: [
      { name: 'admin@robotoverlord.com', actions: 45 },
      { name: 'moderator@robotoverlord.com', actions: 38 },
      { name: 'senior-mod@robotoverlord.com', actions: 29 }
    ],
    contentTypes: [
      { type: 'Posts', count: 67 },
      { type: 'Comments', count: 54 },
      { type: 'Topics', count: 23 },
      { type: 'User Profiles', count: 12 }
    ],
    violationTypes: [
      { type: 'Spam', count: 45 },
      { type: 'Harassment', count: 32 },
      { type: 'Inappropriate Content', count: 28 },
      { type: 'Misinformation', count: 19 },
      { type: 'Copyright', count: 8 }
    ]
  };

  useEffect(() => {
    loadStats();
  }, [filters]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load moderation stats:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load moderation statistics'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const exportReport = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification({
        type: 'success',
        title: 'Export Started',
        message: 'Moderation report export has been initiated'
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to export report'
      });
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case '1d': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'Custom Period';
    }
  };

  if (!stats) {
    return <LoadingState isLoading={isLoading}><div /></LoadingState>;
  }

  return (
    <LoadingState isLoading={isLoading}>
      <div className="space-y-6">
        {/* Header */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-light-text">Moderation Reports</h1>
                <div className="text-sm text-muted-light mt-2">
                  ANALYTICS AND PERFORMANCE INSIGHTS
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" onClick={exportReport}>
                  📊 Export Report
                </Button>
                <Button variant="secondary" size="sm" onClick={() => loadStats()}>
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-base">
              Comprehensive analytics and reporting for moderation activities. 
              Track performance metrics, trends, and team effectiveness.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>📅 Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Time Period
                </label>
                <select
                  value={filters.timeframe}
                  onChange={(e) => handleFiltersChange({ timeframe: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Report Type
                </label>
                <select
                  value={filters.reportType}
                  onChange={(e) => handleFiltersChange({ reportType: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="overview">Overview</option>
                  <option value="detailed">Detailed Analysis</option>
                  <option value="performance">Performance Metrics</option>
                  <option value="trends">Trend Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Moderator
                </label>
                <select
                  value={filters.moderator}
                  onChange={(e) => handleFiltersChange({ moderator: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Moderators</option>
                  <option value="admin@robotoverlord.com">Admin</option>
                  <option value="moderator@robotoverlord.com">Moderator</option>
                  <option value="senior-mod@robotoverlord.com">Senior Mod</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">⚡</div>
                <div>
                  <div className="text-2xl font-bold text-light-text">{stats.totalActions}</div>
                  <div className="text-sm text-muted-light">Total Actions</div>
                  <div className="text-xs text-green-600">
                    {getTimeframeLabel(filters.timeframe)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🗑️</div>
                <div>
                  <div className="text-2xl font-bold text-light-text">{stats.contentRemoved}</div>
                  <div className="text-sm text-muted-light">Content Removed</div>
                  <div className="text-xs text-red-600">
                    {calculatePercentage(stats.contentRemoved, stats.totalActions)}% of actions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🚨</div>
                <div>
                  <div className="text-2xl font-bold text-light-text">{stats.usersSuspended + stats.usersBanned}</div>
                  <div className="text-sm text-muted-light">Users Sanctioned</div>
                  <div className="text-xs text-orange-600">
                    {stats.usersSuspended} suspended, {stats.usersBanned} banned
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">⏱️</div>
                <div>
                  <div className="text-2xl font-bold text-light-text">{stats.averageResponseTime}h</div>
                  <div className="text-sm text-muted-light">Avg Response Time</div>
                  <div className="text-xs text-blue-600">
                    Target: &lt; 4h
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Action Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-light-text">Content Removed</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${calculatePercentage(stats.contentRemoved, stats.totalActions)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-light w-12">{stats.contentRemoved}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-light-text">Users Warned</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${calculatePercentage(stats.usersWarned, stats.totalActions)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-light w-12">{stats.usersWarned}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-light-text">Users Suspended</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${calculatePercentage(stats.usersSuspended, stats.totalActions)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-light w-12">{stats.usersSuspended}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-light-text">Users Banned</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${calculatePercentage(stats.usersBanned, stats.totalActions)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-light w-12">{stats.usersBanned}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appeals & Flags */}
          <Card>
            <CardHeader>
              <CardTitle>⚖️ Appeals & Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-light-text">{stats.appealsReceived}</div>
                  <div className="text-sm text-muted-light">Appeals Received</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.appealsApproved}</div>
                  <div className="text-sm text-muted-light">Appeals Approved</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-light-text">{stats.flagsProcessed}</div>
                  <div className="text-sm text-muted-light">Flags Processed</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.flagsResolved}</div>
                  <div className="text-sm text-muted-light">Flags Resolved</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm text-blue-800">
                  <strong>Appeal Success Rate:</strong> {calculatePercentage(stats.appealsApproved, stats.appealsReceived)}%
                </div>
                <div className="text-sm text-blue-800">
                  <strong>Flag Resolution Rate:</strong> {calculatePercentage(stats.flagsResolved, stats.flagsProcessed)}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Moderators */}
          <Card>
            <CardHeader>
              <CardTitle>👥 Top Moderators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topModerators.map((moderator, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-overlord-red text-light-text rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="text-light-text">{moderator.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-light-text">{moderator.actions}</div>
                      <div className="text-xs text-muted-light">actions</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Violation Types */}
          <Card>
            <CardHeader>
              <CardTitle>🚫 Violation Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.violationTypes.map((violation, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-light-text">{violation.type}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-overlord-red h-2 rounded-full" 
                          style={{ 
                            width: `${calculatePercentage(violation.count, Math.max(...stats.violationTypes.map(v => v.count)))}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-light w-8">{violation.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Types Affected */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Content Types Affected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.contentTypes.map((contentType, index) => (
                <div key={index} className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-light-text">{contentType.count}</div>
                  <div className="text-sm text-muted-light">{contentType.type}</div>
                  <div className="text-xs text-blue-600">
                    {calculatePercentage(contentType.count, stats.contentTypes.reduce((sum, ct) => sum + ct.count, 0))}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-light-text mb-3">✅ Strengths</h4>
                <ul className="space-y-2 text-sm text-muted-light">
                  <li>• Average response time is within target (&lt; 4h)</li>
                  <li>• High flag resolution rate ({calculatePercentage(stats.flagsResolved, stats.flagsProcessed)}%)</li>
                  <li>• Balanced moderation team activity</li>
                  <li>• Effective spam detection and removal</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-light-text mb-3">⚠️ Areas for Improvement</h4>
                <ul className="space-y-2 text-sm text-muted-light">
                  <li>• Appeal approval rate could be reviewed</li>
                  <li>• Consider additional training for harassment cases</li>
                  <li>• Monitor misinformation detection accuracy</li>
                  <li>• Evaluate escalation procedures</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              ← Back to Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </LoadingState>
  );
}

export default function ModerationReportsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ModerationReportsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
