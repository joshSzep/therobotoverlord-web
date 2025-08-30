/**
 * Audit Log Viewer for The Robot Overlord
 * Displays system audit logs for admin review and monitoring
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { EmptyAuditLogsState } from '@/components/ui/EmptyState';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'user' | 'content' | 'moderation' | 'system' | 'security';
}

interface AuditFilters {
  category: string;
  severity: string;
  dateRange: string;
  userId: string;
  action: string;
}

function AuditLogContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    category: 'all',
    severity: 'all',
    dateRange: '7d',
    userId: '',
    action: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock audit log data
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      userId: 'user123',
      userEmail: 'admin@robotoverlord.com',
      action: 'USER_SUSPENDED',
      resource: 'user',
      resourceId: 'user456',
      details: { reason: 'Spam posting', duration: '7d' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      severity: 'high',
      category: 'moderation'
    },
    {
      id: '2',
      timestamp: '2024-01-15T09:15:00Z',
      userId: 'user789',
      userEmail: 'moderator@robotoverlord.com',
      action: 'POST_DELETED',
      resource: 'post',
      resourceId: 'post123',
      details: { reason: 'Inappropriate content' },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      severity: 'medium',
      category: 'content'
    },
    {
      id: '3',
      timestamp: '2024-01-15T08:45:00Z',
      userId: 'system',
      userEmail: 'system@robotoverlord.com',
      action: 'BACKUP_COMPLETED',
      resource: 'system',
      resourceId: 'backup_20240115',
      details: { size: '2.3GB', duration: '45m' },
      ipAddress: '127.0.0.1',
      userAgent: 'System/1.0',
      severity: 'low',
      category: 'system'
    },
    {
      id: '4',
      timestamp: '2024-01-15T07:20:00Z',
      userId: 'user456',
      userEmail: 'user@example.com',
      action: 'LOGIN_FAILED',
      resource: 'auth',
      resourceId: 'login_attempt_789',
      details: { attempts: 5, locked: true },
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0...',
      severity: 'critical',
      category: 'security'
    }
  ];

  useEffect(() => {
    loadAuditLogs();
  }, [filters, currentPage]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data based on filters
      let filteredLogs = mockAuditLogs;
      
      if (filters.category !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      
      if (filters.severity !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }
      
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => 
          log.userEmail.toLowerCase().includes(filters.userId.toLowerCase())
        );
      }
      
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(filters.action.toLowerCase())
        );
      }

      setAuditLogs(filteredLogs);
      setTotalPages(Math.ceil(filteredLogs.length / 10));
      
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load audit logs'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<AuditFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const exportLogs = () => {
    // Mock export functionality
    addNotification({
      type: 'success',
      title: 'Export Started',
      message: 'Audit logs export has been initiated'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user': return '👤';
      case 'content': return '📝';
      case 'moderation': return '🛡️';
      case 'system': return '⚙️';
      case 'security': return '🔒';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <LoadingState isLoading={isLoading}>
      <div className="space-y-6">
        {/* Header */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-light-text">Audit Log Viewer</h1>
                <div className="text-sm text-muted-light mt-2">
                  SYSTEM ACTIVITY MONITORING
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" onClick={exportLogs}>
                  📥 Export Logs
                </Button>
                <Button variant="secondary" size="sm" onClick={() => loadAuditLogs()}>
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-base">
              Monitor and review all system activities, user actions, and security events. 
              Use filters to narrow down specific events or time periods.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Filter Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFiltersChange({ category: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Categories</option>
                  <option value="user">User Actions</option>
                  <option value="content">Content</option>
                  <option value="moderation">Moderation</option>
                  <option value="system">System</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => handleFiltersChange({ severity: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Time Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFiltersChange({ dateRange: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  User Email
                </label>
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => handleFiltersChange({ userId: e.target.value })}
                  placeholder="Filter by user..."
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Action
                </label>
                <input
                  type="text"
                  value={filters.action}
                  onChange={(e) => handleFiltersChange({ action: e.target.value })}
                  placeholder="Filter by action..."
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Entries */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Audit Log Entries ({auditLogs.length} entries)</CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogs.length > 0 ? (
              <div className="space-y-4">
                {auditLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(entry.category)}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-light-text">
                              {entry.action.replace(/_/g, ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                              {entry.severity.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-light">
                            {formatTimestamp(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-light">
                        <div>User: {entry.userEmail}</div>
                        <div>IP: {entry.ipAddress}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-light-text">Resource:</span>
                        <span className="ml-2 text-muted-light">
                          {entry.resource} ({entry.resourceId})
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-light-text">Category:</span>
                        <span className="ml-2 text-muted-light capitalize">
                          {entry.category}
                        </span>
                      </div>
                    </div>

                    {Object.keys(entry.details).length > 0 && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-md">
                        <div className="font-medium text-light-text mb-2">Details:</div>
                        <div className="text-sm text-muted-light">
                          {Object.entries(entry.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyAuditLogsState onRefresh={() => loadAuditLogs()} />
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-light">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}

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

export default function AuditLogPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AuditLogContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
