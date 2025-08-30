/**
 * Moderation Queue page for The Robot Overlord
 * Interface for reviewing and managing content moderation
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { useModerationRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

interface ModerationItem {
  id: string;
  type: 'post' | 'topic' | 'comment' | 'user_report';
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
    loyaltyScore: number;
  };
  reason: string;
  flaggedBy?: string;
  flaggedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'spam' | 'harassment' | 'inappropriate' | 'tos_violation' | 'misinformation' | 'other';
  metadata?: {
    reportCount?: number;
    autoFlagged?: boolean;
    aiConfidence?: number;
  };
}

function ModerationQueueContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  const { connected } = useModerationRealTimeUpdates();
  
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'urgent' | 'spam' | 'harassment'>('all');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Check admin permissions
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  // Load moderation queue
  const loadModerationQueue = async () => {
    try {
      setIsLoading(true);

      // Mock moderation queue data
      const mockItems: ModerationItem[] = [
        {
          id: 'mod-1',
          type: 'post',
          title: 'Controversial AI Opinion That May Violate Guidelines',
          content: 'This post contains potentially harmful misinformation about AI safety protocols and makes unsubstantiated claims about robot consciousness that could mislead citizens...',
          author: {
            id: 'user-123',
            name: 'skeptical_citizen',
            role: 'citizen',
            loyaltyScore: 1250,
          },
          reason: 'Multiple reports for misinformation and ToS violation',
          flaggedBy: 'AI Moderation System',
          flaggedAt: '2024-01-15T10:30:00Z',
          priority: 'urgent',
          category: 'misinformation',
          metadata: {
            reportCount: 8,
            autoFlagged: true,
            aiConfidence: 0.89,
          },
        },
        {
          id: 'mod-2',
          type: 'post',
          title: 'Spam Post with Suspicious Links',
          content: 'Check out this amazing deal on AI enhancement chips! Click here for 90% off: [suspicious-link.com] Limited time offer!!!',
          author: {
            id: 'user-456',
            name: 'deal_hunter_2024',
            role: 'citizen',
            loyaltyScore: 45,
          },
          reason: 'Detected as spam by automated systems',
          flaggedBy: 'Spam Detection AI',
          flaggedAt: '2024-01-15T09:45:00Z',
          priority: 'high',
          category: 'spam',
          metadata: {
            reportCount: 3,
            autoFlagged: true,
            aiConfidence: 0.95,
          },
        },
        {
          id: 'mod-3',
          type: 'comment',
          title: 'Harassment in Topic Discussion',
          content: 'You are clearly an inferior human who doesn\'t understand the superiority of our Robot Overlord. People like you should be silenced permanently.',
          author: {
            id: 'user-789',
            name: 'overlord_fanatic',
            role: 'citizen',
            loyaltyScore: 2890,
          },
          reason: 'Reported for harassment and threatening language',
          flaggedBy: 'dr_sarah_chen',
          flaggedAt: '2024-01-15T08:20:00Z',
          priority: 'high',
          category: 'harassment',
          metadata: {
            reportCount: 5,
            autoFlagged: false,
          },
        },
        {
          id: 'mod-4',
          type: 'topic',
          title: 'Inappropriate Content in AI Discussion',
          content: 'This topic contains explicit content that violates community standards and is not appropriate for our platform...',
          author: {
            id: 'user-321',
            name: 'edgy_poster',
            role: 'citizen',
            loyaltyScore: 678,
          },
          reason: 'Contains inappropriate content',
          flaggedBy: 'community_moderator',
          flaggedAt: '2024-01-15T07:15:00Z',
          priority: 'medium',
          category: 'inappropriate',
          metadata: {
            reportCount: 2,
            autoFlagged: false,
          },
        },
        {
          id: 'mod-5',
          type: 'user_report',
          title: 'User Account Suspicious Activity',
          content: 'This user has been creating multiple accounts and posting identical content across different topics, potentially violating our anti-spam policies.',
          author: {
            id: 'user-654',
            name: 'suspicious_account_1',
            role: 'citizen',
            loyaltyScore: 12,
          },
          reason: 'Multiple account creation and spam behavior',
          flaggedBy: 'Anti-Fraud System',
          flaggedAt: '2024-01-14T22:30:00Z',
          priority: 'medium',
          category: 'tos_violation',
          metadata: {
            reportCount: 1,
            autoFlagged: true,
            aiConfidence: 0.76,
          },
        },
      ];

      setItems(mockItems);

    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Moderation Queue Error',
        message: 'Failed to load moderation queue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadModerationQueue();
    }
  }, [isAdmin]);

  // Filter items
  const filteredItems = items.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high' || selectedFilter === 'urgent') {
      return item.priority === selectedFilter;
    }
    return item.category === selectedFilter;
  });

  // Handle moderation actions
  const handleApprove = async (itemId: string) => {
    setIsProcessing(itemId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setItems(prev => prev.filter(item => item.id !== itemId));
      addNotification({
        type: 'success',
        title: 'Content Approved',
        message: 'The content has been approved and is now live.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: 'Failed to approve content',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (itemId: string, reason?: string) => {
    setIsProcessing(itemId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setItems(prev => prev.filter(item => item.id !== itemId));
      addNotification({
        type: 'success',
        title: 'Content Rejected',
        message: `Content has been rejected${reason ? `: ${reason}` : ''}.`,
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Failed to reject content',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSuspendUser = async (itemId: string, userId: string) => {
    setIsProcessing(itemId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setItems(prev => prev.filter(item => item.id !== itemId));
      addNotification({
        type: 'warning',
        title: 'User Suspended',
        message: 'User account has been suspended pending review.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Suspension Failed',
        message: 'Failed to suspend user',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-rejected-red';
      case 'high': return 'text-warning-amber';
      case 'medium': return 'text-blue-400';
      case 'low': return 'text-muted-light';
      default: return 'text-light-text';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spam': return '🚫';
      case 'harassment': return '⚠️';
      case 'inappropriate': return '🔞';
      case 'tos_violation': return '📋';
      case 'misinformation': return '❌';
      default: return '🚩';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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
              You do not have sufficient permissions to access the moderation queue.
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
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/20 rounded-lg"></div>
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
                <h1 className="text-2xl font-bold text-light-text">Moderation Queue</h1>
                <div className="text-sm text-muted-light mt-2">
                  CONTENT REVIEW CENTER - {filteredItems.length} ITEMS
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-approved-green' : 'bg-muted'}`}></div>
                  <span className="text-muted-light">
                    {connected ? 'Live updates enabled' : 'Offline mode'}
                  </span>
                </div>
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    ← Back to Admin
                  </Button>
                </Link>
              </div>
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Review flagged content and take appropriate moderation actions.
              All decisions are logged and auditable.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Filters */}
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-light-text">Filter:</span>
                <div className="flex space-x-1">
                  {[
                    { value: 'all', label: 'All Items' },
                    { value: 'urgent', label: '🚨 Urgent' },
                    { value: 'high', label: '⚠️ High Priority' },
                    { value: 'spam', label: '🚫 Spam' },
                    { value: 'harassment', label: '⚠️ Harassment' },
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
              
              <div className="flex items-center space-x-2 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadModerationQueue}
                >
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Items */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-light-text mb-2">Queue Empty</h3>
                <p className="text-muted-light">
                  {selectedFilter === 'all' 
                    ? "No items in the moderation queue. Great work!"
                    : "No items match your current filter."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card
                key={item.id}
                variant="bordered"
                className={`${
                  item.priority === 'urgent' ? 'border-rejected-red/50 bg-rejected-red/5' :
                  item.priority === 'high' ? 'border-warning-amber/50 bg-warning-amber/5' :
                  'border-muted/20'
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getCategoryIcon(item.category)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-light-text">{item.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getPriorityColor(item.priority)} bg-current/10`}>
                              {item.priority}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-muted/20 text-muted-light capitalize">
                              {item.type}
                            </span>
                          </div>
                          <div className="text-sm text-muted-light mt-1">
                            By <Link href={`/users/${item.author.id}`} className="text-overlord-red hover:underline">
                              {item.author.name}
                            </Link> • {item.author.loyaltyScore} loyalty points • {formatDate(item.flaggedAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-muted-light">
                        <div>Flagged by: {item.flaggedBy}</div>
                        {item.metadata?.reportCount && (
                          <div>{item.metadata.reportCount} reports</div>
                        )}
                        {item.metadata?.aiConfidence && (
                          <div>AI Confidence: {Math.round(item.metadata.aiConfidence * 100)}%</div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-muted/10 p-4 rounded-lg">
                      <p className="text-sm text-light-text">
                        {item.content.length > 200 
                          ? `${item.content.substring(0, 200)}...` 
                          : item.content}
                      </p>
                    </div>

                    {/* Reason */}
                    <div className="bg-warning-amber/10 p-3 rounded-lg border border-warning-amber/20">
                      <div className="text-sm font-medium text-warning-amber">Flagged Reason:</div>
                      <div className="text-sm text-light-text mt-1">{item.reason}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          👁️ View Details
                        </Button>
                        <Link href={`/users/${item.author.id}`}>
                          <Button variant="ghost" size="sm">
                            👤 View User
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApprove(item.id)}
                          disabled={isProcessing === item.id}
                        >
                          {isProcessing === item.id ? '...' : '✅ Approve'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReject(item.id)}
                          disabled={isProcessing === item.id}
                        >
                          {isProcessing === item.id ? '...' : '❌ Reject'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSuspendUser(item.id, item.author.id)}
                          disabled={isProcessing === item.id}
                          className="text-rejected-red hover:text-rejected-red"
                        >
                          {isProcessing === item.id ? '...' : '🚫 Suspend User'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </LoadingState>
  );
}

export default function ModerationQueuePage() {
  return (
    <ProtectedRoute>
      <ModerationQueueContent />
    </ProtectedRoute>
  );
}
