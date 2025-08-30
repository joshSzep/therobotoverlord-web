/**
 * Flag Management System for The Robot Overlord
 * Manages content flags and user reports for moderation review
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

interface Flag {
  id: string;
  contentId: string;
  contentType: 'post' | 'comment' | 'topic' | 'user_profile';
  contentTitle: string;
  contentPreview: string;
  contentAuthor: string;
  flaggedBy: string;
  flaggedByEmail: string;
  flagType: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'copyright' | 'other';
  reason: string;
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  flaggedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  resolution?: string;
  actionTaken?: string;
  duplicateCount: number;
  relatedFlags: string[];
}

interface FlagFilters {
  status: string;
  type: string;
  priority: string;
  contentType: string;
  dateRange: string;
  flaggedBy: string;
}

function FlagManagementContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [resolution, setResolution] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [filters, setFilters] = useState<FlagFilters>({
    status: 'pending',
    type: 'all',
    priority: 'all',
    contentType: 'all',
    dateRange: '7d',
    flaggedBy: ''
  });

  // Mock flags data
  const mockFlags: Flag[] = [
    {
      id: '1',
      contentId: 'post123',
      contentType: 'post',
      contentTitle: 'Controversial AI Discussion',
      contentPreview: 'I think AI will replace all humans and we should welcome our robot overlords...',
      contentAuthor: 'TechEnthusiast',
      flaggedBy: 'ConcernedCitizen',
      flaggedByEmail: 'concerned@example.com',
      flagType: 'misinformation',
      reason: 'Spreading false information about AI',
      description: 'This post contains misleading information about AI capabilities and could cause panic among users.',
      status: 'pending',
      priority: 'high',
      flaggedAt: '2024-01-15T14:30:00Z',
      duplicateCount: 3,
      relatedFlags: ['2', '3']
    },
    {
      id: '2',
      contentId: 'comment456',
      contentType: 'comment',
      contentTitle: 'Reply to: Robot Ethics Discussion',
      contentPreview: 'You are all idiots if you believe this nonsense. Wake up sheeple!',
      contentAuthor: 'AngryUser',
      flaggedBy: 'ModerateUser',
      flaggedByEmail: 'moderate@example.com',
      flagType: 'harassment',
      reason: 'Insulting other users',
      description: 'User is being hostile and insulting towards other community members.',
      status: 'under_review',
      priority: 'medium',
      flaggedAt: '2024-01-15T12:15:00Z',
      reviewedAt: '2024-01-15T13:00:00Z',
      reviewedBy: 'moderator@robotoverlord.com',
      duplicateCount: 1,
      relatedFlags: []
    },
    {
      id: '3',
      contentId: 'post789',
      contentType: 'post',
      contentTitle: 'Buy Crypto Now! 🚀🚀🚀',
      contentPreview: 'URGENT: Buy this amazing cryptocurrency before it moons! Limited time offer!',
      contentAuthor: 'CryptoSpammer',
      flaggedBy: 'VigilantUser',
      flaggedByEmail: 'vigilant@example.com',
      flagType: 'spam',
      reason: 'Promotional spam content',
      description: 'Clear spam post promoting cryptocurrency with no relevant discussion value.',
      status: 'resolved',
      priority: 'medium',
      flaggedAt: '2024-01-14T16:45:00Z',
      reviewedAt: '2024-01-15T09:30:00Z',
      reviewedBy: 'admin@robotoverlord.com',
      resolution: 'Post removed and user warned',
      actionTaken: 'content_removed',
      duplicateCount: 5,
      relatedFlags: ['4', '5']
    }
  ];

  useEffect(() => {
    loadFlags();
  }, [filters]);

  const loadFlags = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredFlags = mockFlags;
      
      if (filters.status !== 'all') {
        filteredFlags = filteredFlags.filter(flag => flag.status === filters.status);
      }
      
      if (filters.type !== 'all') {
        filteredFlags = filteredFlags.filter(flag => flag.flagType === filters.type);
      }
      
      if (filters.priority !== 'all') {
        filteredFlags = filteredFlags.filter(flag => flag.priority === filters.priority);
      }
      
      if (filters.contentType !== 'all') {
        filteredFlags = filteredFlags.filter(flag => flag.contentType === filters.contentType);
      }
      
      if (filters.flaggedBy) {
        filteredFlags = filteredFlags.filter(flag => 
          flag.flaggedBy.toLowerCase().includes(filters.flaggedBy.toLowerCase()) ||
          flag.flaggedByEmail.toLowerCase().includes(filters.flaggedBy.toLowerCase())
        );
      }

      setFlags(filteredFlags);
      
    } catch (error) {
      console.error('Failed to load flags:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load flags'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<FlagFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResolveFlag = async (flagId: string, action: 'resolved' | 'dismissed') => {
    if (!resolution.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a resolution note'
      });
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFlags(prev => prev.map(flag => 
        flag.id === flagId 
          ? { 
              ...flag, 
              status: action,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.email || 'admin@robotoverlord.com',
              resolution: resolution,
              actionTaken: actionTaken
            }
          : flag
      ));
      
      setSelectedFlag(null);
      setResolution('');
      setActionTaken('');
      
      addNotification({
        type: 'success',
        title: 'Flag Updated',
        message: `Flag has been ${action}`
      });
      
    } catch (error) {
      console.error('Failed to resolve flag:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to resolve flag'
      });
    }
  };

  const handleBulkAction = async (flagIds: string[], action: 'resolve' | 'dismiss') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFlags(prev => prev.map(flag => 
        flagIds.includes(flag.id)
          ? { 
              ...flag, 
              status: action === 'resolve' ? 'resolved' : 'dismissed',
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.email || 'admin@robotoverlord.com',
              resolution: `Bulk ${action} action`
            }
          : flag
      ));
      
      addNotification({
        type: 'success',
        title: 'Bulk Action Complete',
        message: `${flagIds.length} flags have been ${action}d`
      });
      
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to perform bulk action'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'dismissed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFlagTypeIcon = (type: string) => {
    switch (type) {
      case 'spam': return '🚫';
      case 'harassment': return '😡';
      case 'inappropriate': return '⚠️';
      case 'misinformation': return '❌';
      case 'copyright': return '©️';
      case 'other': return '❓';
      default: return '🚩';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'comment': return '💬';
      case 'topic': return '📋';
      case 'user_profile': return '👤';
      default: return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <LoadingState isLoading={isLoading}>
      <div className="space-y-6">
        {/* Header */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-light-text">Flag Management</h1>
                <div className="text-sm text-muted-light mt-2">
                  CONTENT REPORTING AND MODERATION
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" onClick={() => loadFlags()}>
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-base">
              Review and manage content flags reported by the community. 
              Take appropriate action on flagged content to maintain platform quality.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⏳</div>
                <div>
                  <div className="text-2xl font-bold text-light-text">
                    {flags.filter(f => f.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-light">Pending Review</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🔍</div>
                <div>
                  <div className="text-2xl font-bold text-light-text">
                    {flags.filter(f => f.status === 'under_review').length}
                  </div>
                  <div className="text-sm text-muted-light">Under Review</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🚨</div>
                <div>
                  <div className="text-2xl font-bold text-light-text">
                    {flags.filter(f => f.priority === 'high' || f.priority === 'urgent').length}
                  </div>
                  <div className="text-sm text-muted-light">High Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📊</div>
                <div>
                  <div className="text-2xl font-bold text-light-text">
                    {flags.reduce((sum, f) => sum + f.duplicateCount, 0)}
                  </div>
                  <div className="text-sm text-muted-light">Total Reports</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Filter Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFiltersChange({ status: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Flag Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFiltersChange({ type: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Types</option>
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate">Inappropriate</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="copyright">Copyright</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFiltersChange({ priority: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Content Type
                </label>
                <select
                  value={filters.contentType}
                  onChange={(e) => handleFiltersChange({ contentType: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Content</option>
                  <option value="post">Posts</option>
                  <option value="comment">Comments</option>
                  <option value="topic">Topics</option>
                  <option value="user_profile">User Profiles</option>
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
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Flagged By
                </label>
                <input
                  type="text"
                  value={filters.flaggedBy}
                  onChange={(e) => handleFiltersChange({ flaggedBy: e.target.value })}
                  placeholder="Filter by reporter..."
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flags List */}
        <Card>
          <CardHeader>
            <CardTitle>🚩 Flagged Content ({flags.length} flags)</CardTitle>
          </CardHeader>
          <CardContent>
            {flags.length > 0 ? (
              <div className="space-y-4">
                {flags.map((flag) => (
                  <div
                    key={flag.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFlagTypeIcon(flag.flagType)}</span>
                        <span className="text-lg">{getContentTypeIcon(flag.contentType)}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-light-text">
                              {flag.contentTitle}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}>
                              {flag.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(flag.priority)}`}>
                              {flag.priority.toUpperCase()}
                            </span>
                            {flag.duplicateCount > 1 && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                {flag.duplicateCount} REPORTS
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-light">
                            Flagged: {formatDate(flag.flaggedAt)} by {flag.flaggedBy}
                          </div>
                          <div className="text-sm text-muted-light">
                            Author: {flag.contentAuthor} | Type: {flag.flagType}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedFlag(flag)}
                        >
                          👁️ Review
                        </Button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="font-medium text-light-text mb-1">Content Preview:</div>
                      <div className="text-sm text-muted-light bg-muted/30 p-2 rounded">
                        {flag.contentPreview}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="font-medium text-light-text mb-1">Flag Reason:</div>
                      <div className="text-sm text-muted-light bg-muted/30 p-2 rounded">
                        {flag.reason}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="font-medium text-light-text mb-1">Description:</div>
                      <div className="text-sm text-muted-light bg-muted/30 p-2 rounded">
                        {flag.description}
                      </div>
                    </div>

                    {flag.resolution && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="font-medium text-green-800 mb-1">Resolution:</div>
                        <div className="text-sm text-green-700">{flag.resolution}</div>
                        {flag.actionTaken && (
                          <div className="text-xs text-green-600 mt-1">
                            Action: {flag.actionTaken} | Resolved by {flag.reviewedBy} on {flag.reviewedAt && formatDate(flag.reviewedAt)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚩</div>
                <h3 className="text-xl font-bold text-light-text mb-2">
                  No Flags Found
                </h3>
                <p className="text-muted-light mb-6">
                  No flags match your current filters
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleFiltersChange({
                    status: 'all',
                    type: 'all',
                    priority: 'all',
                    contentType: 'all',
                    dateRange: '7d',
                    flaggedBy: ''
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flag Review Modal */}
        {selectedFlag && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-light-text">Review Flag</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFlag(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-light-text">Content:</label>
                      <div className="text-muted-light">{selectedFlag.contentTitle}</div>
                    </div>
                    <div>
                      <label className="font-medium text-light-text">Author:</label>
                      <div className="text-muted-light">{selectedFlag.contentAuthor}</div>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-light-text">Content Preview:</label>
                    <div className="text-muted-light bg-muted/30 p-3 rounded mt-1">
                      {selectedFlag.contentPreview}
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-light-text">Flag Details:</label>
                    <div className="text-muted-light bg-muted/30 p-3 rounded mt-1">
                      <div><strong>Type:</strong> {selectedFlag.flagType}</div>
                      <div><strong>Reason:</strong> {selectedFlag.reason}</div>
                      <div><strong>Description:</strong> {selectedFlag.description}</div>
                      <div><strong>Flagged by:</strong> {selectedFlag.flaggedBy} ({selectedFlag.flaggedByEmail})</div>
                      <div><strong>Reports:</strong> {selectedFlag.duplicateCount}</div>
                    </div>
                  </div>

                  {selectedFlag.status === 'pending' || selectedFlag.status === 'under_review' ? (
                    <div>
                      <label className="font-medium text-light-text">Resolution Notes:</label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Add resolution notes..."
                        className="w-full p-3 border border-border rounded-md bg-card text-light-text mt-1"
                        rows={4}
                      />
                      
                      <label className="font-medium text-light-text mt-4 block">Action Taken:</label>
                      <select
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        className="w-full p-2 border border-border rounded-md bg-card text-light-text mt-1"
                      >
                        <option value="">Select action...</option>
                        <option value="content_removed">Content Removed</option>
                        <option value="user_warned">User Warned</option>
                        <option value="user_suspended">User Suspended</option>
                        <option value="no_action">No Action Required</option>
                        <option value="escalated">Escalated to Admin</option>
                      </select>
                      
                      <div className="flex space-x-3 mt-4">
                        <Button
                          variant="primary"
                          onClick={() => handleResolveFlag(selectedFlag.id, 'resolved')}
                        >
                          ✅ Resolve Flag
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleResolveFlag(selectedFlag.id, 'dismissed')}
                        >
                          ❌ Dismiss Flag
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedFlag(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="font-medium text-green-800">Flag Status: {selectedFlag.status}</div>
                      {selectedFlag.resolution && (
                        <div className="text-sm text-green-700 mt-2">{selectedFlag.resolution}</div>
                      )}
                      <div className="text-xs text-green-600 mt-1">
                        Reviewed by {selectedFlag.reviewedBy} on {selectedFlag.reviewedAt && formatDate(selectedFlag.reviewedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

export default function FlagManagementPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FlagManagementContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
