/**
 * Appeals System Interface for The Robot Overlord
 * Allows users to appeal moderation decisions and admins to review appeals
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { EmptyAppealsState } from '@/components/ui/EmptyState';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';

interface Appeal {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'content_removal' | 'account_suspension' | 'ban' | 'warning';
  originalAction: string;
  originalReason: string;
  appealReason: string;
  appealText: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
  evidence: {
    type: 'text' | 'image' | 'link';
    content: string;
    description: string;
  }[];
  relatedContent?: {
    type: 'post' | 'comment' | 'topic';
    id: string;
    title: string;
    content: string;
  };
}

interface AppealFilters {
  status: string;
  type: string;
  priority: string;
  dateRange: string;
  userId: string;
}

function AppealsSystemContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filters, setFilters] = useState<AppealFilters>({
    status: 'pending',
    type: 'all',
    priority: 'all',
    dateRange: '30d',
    userId: ''
  });

  // Mock appeals data
  const mockAppeals: Appeal[] = [
    {
      id: '1',
      userId: 'user123',
      userEmail: 'user@example.com',
      userName: 'CitizenX',
      type: 'content_removal',
      originalAction: 'Post Removed',
      originalReason: 'Spam content',
      appealReason: 'wrongful_removal',
      appealText: 'This post was not spam. It was a legitimate discussion about AI ethics and should not have been removed. I believe this was a mistake by the automated system.',
      status: 'pending',
      priority: 'medium',
      submittedAt: '2024-01-15T10:30:00Z',
      evidence: [
        {
          type: 'text',
          content: 'Original post content discussing AI ethics in robotics',
          description: 'The original post that was removed'
        }
      ],
      relatedContent: {
        type: 'post',
        id: 'post123',
        title: 'The Future of AI Ethics in Robotics',
        content: 'As we advance into an era where artificial intelligence...'
      }
    },
    {
      id: '2',
      userId: 'user456',
      userEmail: 'citizen@robotoverlord.com',
      userName: 'LoyalCitizen',
      type: 'account_suspension',
      originalAction: 'Account Suspended (7 days)',
      originalReason: 'Multiple policy violations',
      appealReason: 'excessive_punishment',
      appealText: 'I believe the 7-day suspension is too harsh for the violations. I have been a loyal citizen for 2 years and this is my first offense.',
      status: 'under_review',
      priority: 'high',
      submittedAt: '2024-01-14T15:20:00Z',
      reviewedAt: '2024-01-15T09:00:00Z',
      reviewedBy: 'admin@robotoverlord.com',
      evidence: [
        {
          type: 'text',
          content: 'Account history showing 2 years of positive contributions',
          description: 'Evidence of good standing'
        }
      ]
    },
    {
      id: '3',
      userId: 'user789',
      userEmail: 'newbie@example.com',
      userName: 'NewCitizen',
      type: 'warning',
      originalAction: 'Formal Warning',
      originalReason: 'Off-topic posting',
      appealReason: 'misunderstanding',
      appealText: 'I am new to the platform and did not understand the community guidelines. I thought my post was relevant to the discussion.',
      status: 'approved',
      priority: 'low',
      submittedAt: '2024-01-13T12:00:00Z',
      reviewedAt: '2024-01-14T10:30:00Z',
      reviewedBy: 'moderator@robotoverlord.com',
      reviewerNotes: 'Appeal approved. User is new and showed genuine misunderstanding. Warning removed.',
      evidence: []
    }
  ];

  useEffect(() => {
    loadAppeals();
  }, [filters]);

  const loadAppeals = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data
      let filteredAppeals = mockAppeals;
      
      if (filters.status !== 'all') {
        filteredAppeals = filteredAppeals.filter(appeal => appeal.status === filters.status);
      }
      
      if (filters.type !== 'all') {
        filteredAppeals = filteredAppeals.filter(appeal => appeal.type === filters.type);
      }
      
      if (filters.priority !== 'all') {
        filteredAppeals = filteredAppeals.filter(appeal => appeal.priority === filters.priority);
      }
      
      if (filters.userId) {
        filteredAppeals = filteredAppeals.filter(appeal => 
          appeal.userEmail.toLowerCase().includes(filters.userId.toLowerCase()) ||
          appeal.userName.toLowerCase().includes(filters.userId.toLowerCase())
        );
      }

      setAppeals(filteredAppeals);
      
    } catch (error) {
      console.error('Failed to load appeals:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load appeals'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<AppealFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleAppealReview = async (appealId: string, decision: 'approved' | 'rejected') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAppeals(prev => prev.map(appeal => 
        appeal.id === appealId 
          ? { 
              ...appeal, 
              status: decision,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.email || 'admin@robotoverlord.com',
              reviewerNotes: reviewNotes
            }
          : appeal
      ));
      
      setSelectedAppeal(null);
      setReviewNotes('');
      
      addNotification({
        type: 'success',
        title: 'Appeal Reviewed',
        message: `Appeal has been ${decision}`
      });
      
    } catch (error) {
      console.error('Failed to review appeal:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to review appeal'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content_removal': return '🗑️';
      case 'account_suspension': return '⏸️';
      case 'ban': return '🚫';
      case 'warning': return '⚠️';
      default: return '📋';
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
                <h1 className="text-2xl font-bold text-light-text">Appeals System</h1>
                <div className="text-sm text-muted-light mt-2">
                  MODERATION APPEALS MANAGEMENT
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" onClick={() => loadAppeals()}>
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-base">
              Review and process user appeals for moderation decisions. Ensure fair and 
              consistent handling of all appeals according to community guidelines.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Filter Appeals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFiltersChange({ type: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Types</option>
                  <option value="content_removal">Content Removal</option>
                  <option value="account_suspension">Account Suspension</option>
                  <option value="ban">Ban</option>
                  <option value="warning">Warning</option>
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
                  Time Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFiltersChange({ dateRange: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  User
                </label>
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => handleFiltersChange({ userId: e.target.value })}
                  placeholder="Filter by user..."
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appeals List */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Appeals Queue ({appeals.length} appeals)</CardTitle>
          </CardHeader>
          <CardContent>
            {appeals.length > 0 ? (
              <div className="space-y-4">
                {appeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(appeal.type)}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-light-text">
                              {appeal.userName} ({appeal.userEmail})
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appeal.status)}`}>
                              {appeal.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(appeal.priority)}`}>
                              {appeal.priority.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-light">
                            {formatDate(appeal.submittedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedAppeal(appeal)}
                        >
                          👁️ Review
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium text-light-text">Original Action:</span>
                        <span className="ml-2 text-muted-light">{appeal.originalAction}</span>
                      </div>
                      <div>
                        <span className="font-medium text-light-text">Appeal Type:</span>
                        <span className="ml-2 text-muted-light capitalize">
                          {appeal.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="font-medium text-light-text mb-1">Original Reason:</div>
                      <div className="text-sm text-muted-light bg-muted/30 p-2 rounded">
                        {appeal.originalReason}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="font-medium text-light-text mb-1">Appeal Text:</div>
                      <div className="text-sm text-muted-light bg-muted/30 p-2 rounded">
                        {appeal.appealText}
                      </div>
                    </div>

                    {appeal.reviewerNotes && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="font-medium text-blue-800 mb-1">Reviewer Notes:</div>
                        <div className="text-sm text-blue-700">{appeal.reviewerNotes}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          Reviewed by {appeal.reviewedBy} on {appeal.reviewedAt && formatDate(appeal.reviewedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyAppealsState />
            )}
          </CardContent>
        </Card>

        {/* Appeal Review Modal */}
        {selectedAppeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-light-text">Review Appeal</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAppeal(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-light-text">User:</label>
                      <div className="text-muted-light">{selectedAppeal.userName} ({selectedAppeal.userEmail})</div>
                    </div>
                    <div>
                      <label className="font-medium text-light-text">Submitted:</label>
                      <div className="text-muted-light">{formatDate(selectedAppeal.submittedAt)}</div>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-light-text">Original Action:</label>
                    <div className="text-muted-light bg-muted/30 p-2 rounded mt-1">
                      {selectedAppeal.originalAction} - {selectedAppeal.originalReason}
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-light-text">Appeal Text:</label>
                    <div className="text-muted-light bg-muted/30 p-3 rounded mt-1">
                      {selectedAppeal.appealText}
                    </div>
                  </div>

                  {selectedAppeal.evidence.length > 0 && (
                    <div>
                      <label className="font-medium text-light-text">Evidence:</label>
                      <div className="space-y-2 mt-1">
                        {selectedAppeal.evidence.map((evidence, index) => (
                          <div key={index} className="bg-muted/30 p-2 rounded">
                            <div className="font-medium text-sm">{evidence.description}</div>
                            <div className="text-sm text-muted-light">{evidence.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAppeal.relatedContent && (
                    <div>
                      <label className="font-medium text-light-text">Related Content:</label>
                      <div className="bg-muted/30 p-3 rounded mt-1">
                        <div className="font-medium">{selectedAppeal.relatedContent.title}</div>
                        <div className="text-sm text-muted-light mt-1">
                          {selectedAppeal.relatedContent.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedAppeal.status === 'pending' || selectedAppeal.status === 'under_review' ? (
                    <div>
                      <label className="font-medium text-light-text">Review Notes:</label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add your review notes..."
                        className="w-full p-3 border border-border rounded-md bg-card text-light-text mt-1"
                        rows={4}
                      />
                      
                      <div className="flex space-x-3 mt-4">
                        <Button
                          variant="primary"
                          onClick={() => handleAppealReview(selectedAppeal.id, 'approved')}
                        >
                          ✅ Approve Appeal
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleAppealReview(selectedAppeal.id, 'rejected')}
                        >
                          ❌ Reject Appeal
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedAppeal(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="font-medium text-blue-800">Appeal Status: {selectedAppeal.status}</div>
                      {selectedAppeal.reviewerNotes && (
                        <div className="text-sm text-blue-700 mt-2">{selectedAppeal.reviewerNotes}</div>
                      )}
                      <div className="text-xs text-blue-600 mt-1">
                        Reviewed by {selectedAppeal.reviewedBy} on {selectedAppeal.reviewedAt && formatDate(selectedAppeal.reviewedAt)}
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

export default function AppealsSystemPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AppealsSystemContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
