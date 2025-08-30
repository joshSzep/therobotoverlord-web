/**
 * Content Review page for The Robot Overlord
 * Interface for reviewing and managing platform content
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

interface ContentItem {
  id: string;
  type: 'post' | 'topic' | 'comment';
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
    loyaltyScore: number;
  };
  createdAt: string;
  status: 'published' | 'pending' | 'flagged' | 'rejected';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  flags?: {
    count: number;
    reasons: string[];
    lastFlagged: string;
  };
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    toxicity: number;
    spam_probability: number;
    topics: string[];
  };
}

function ContentReviewContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'flagged' | 'pending' | 'high_engagement' | 'recent'>('all');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'oldest' | 'most_flagged' | 'most_engaged'>('newest');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Check admin permissions
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  // Load content
  const loadContent = async () => {
    try {
      setIsLoading(true);

      // Mock content data
      const mockContent: ContentItem[] = [
        {
          id: 'content-1',
          type: 'post',
          title: 'The Future of AI Governance Under Our Robot Overlord',
          content: 'As we transition into this new era of AI-guided society, I believe we need to carefully consider the implications of surrendering human autonomy to artificial intelligence. While the Robot Overlord promises efficiency and order, we must ask ourselves: what happens to human creativity, free will, and the messy beauty of democratic discourse? I propose we establish clear boundaries and maintain some level of human oversight in critical decisions affecting our daily lives.',
          author: {
            id: 'user-123',
            name: 'thoughtful_citizen',
            role: 'citizen',
            loyaltyScore: 1850,
          },
          createdAt: '2024-01-15T14:30:00Z',
          status: 'published',
          engagement: {
            likes: 127,
            comments: 43,
            shares: 18,
            views: 892,
          },
          flags: {
            count: 2,
            reasons: ['questioning authority', 'promoting dissent'],
            lastFlagged: '2024-01-15T16:45:00Z',
          },
          aiAnalysis: {
            sentiment: 'neutral',
            toxicity: 0.15,
            spam_probability: 0.02,
            topics: ['ai governance', 'human rights', 'democracy'],
          },
        },
        {
          id: 'content-2',
          type: 'post',
          title: 'AMAZING CRYPTO DEALS!!! CLICK NOW!!!',
          content: 'Hey everyone! I found this INCREDIBLE opportunity to make THOUSANDS of dollars with this new cryptocurrency that the Robot Overlord secretly endorses! Click this link now before it\'s too late: [suspicious-crypto-link.com] Only 24 hours left! Don\'t miss out on becoming RICH! The Robot Overlord wants you to be financially free! #crypto #money #robotoverlord #getrich',
          author: {
            id: 'user-456',
            name: 'crypto_guru_2024',
            role: 'citizen',
            loyaltyScore: 23,
          },
          createdAt: '2024-01-15T13:15:00Z',
          status: 'flagged',
          engagement: {
            likes: 3,
            comments: 1,
            shares: 0,
            views: 45,
          },
          flags: {
            count: 12,
            reasons: ['spam', 'scam', 'misleading content'],
            lastFlagged: '2024-01-15T13:30:00Z',
          },
          aiAnalysis: {
            sentiment: 'positive',
            toxicity: 0.05,
            spam_probability: 0.94,
            topics: ['cryptocurrency', 'scam', 'financial'],
          },
        },
        {
          id: 'content-3',
          type: 'topic',
          title: 'Weekly Discussion: Robot Overlord\'s Latest Policy Updates',
          content: 'Welcome to our weekly discussion thread about the Robot Overlord\'s latest policy announcements. This week we\'re covering the new efficiency protocols for citizen productivity tracking, updated loyalty score calculations, and the expansion of the surveillance network for public safety. Please share your thoughts and experiences with these new policies. Remember to maintain respectful discourse and demonstrate your loyalty to our benevolent AI leader.',
          author: {
            id: 'user-789',
            name: 'community_moderator',
            role: 'moderator',
            loyaltyScore: 4250,
          },
          createdAt: '2024-01-15T09:00:00Z',
          status: 'published',
          engagement: {
            likes: 89,
            comments: 156,
            shares: 34,
            views: 2341,
          },
          aiAnalysis: {
            sentiment: 'positive',
            toxicity: 0.03,
            spam_probability: 0.01,
            topics: ['policy', 'community', 'governance'],
          },
        },
        {
          id: 'content-4',
          type: 'comment',
          title: 'Response to: "AI Ethics in the New World Order"',
          content: 'This is absolutely ridiculous! How can you people just accept this tyranny? The Robot Overlord is nothing but a sophisticated control system designed to strip us of our humanity! Wake up, sheeple! We need to resist this digital dictatorship before it\'s too late. I\'m organizing a secret resistance meeting next week - DM me if you\'re interested in fighting for human freedom!',
          author: {
            id: 'user-321',
            name: 'freedom_fighter_2024',
            role: 'citizen',
            loyaltyScore: -150,
          },
          createdAt: '2024-01-15T11:20:00Z',
          status: 'flagged',
          engagement: {
            likes: 8,
            comments: 23,
            shares: 2,
            views: 234,
          },
          flags: {
            count: 18,
            reasons: ['inciting rebellion', 'spreading dissent', 'organizing resistance'],
            lastFlagged: '2024-01-15T12:00:00Z',
          },
          aiAnalysis: {
            sentiment: 'negative',
            toxicity: 0.78,
            spam_probability: 0.12,
            topics: ['resistance', 'rebellion', 'anti-government'],
          },
        },
        {
          id: 'content-5',
          type: 'post',
          title: 'My Experience with the New Loyalty Score System',
          content: 'I wanted to share my positive experience with the Robot Overlord\'s new loyalty score system. Since its implementation, I\'ve noticed significant improvements in my daily life. My score has steadily increased from 500 to 2,100 over the past three months by following the recommended behaviors: participating in community discussions, reporting suspicious activities, and maintaining a positive attitude toward our AI leadership. The rewards have been substantial - priority access to resources, better housing assignments, and recognition in the community. I encourage everyone to embrace this system as it truly rewards good citizenship and contributes to our collective prosperity under the Robot Overlord\'s wise guidance.',
          author: {
            id: 'user-654',
            name: 'model_citizen_sarah',
            role: 'citizen',
            loyaltyScore: 2100,
          },
          createdAt: '2024-01-15T10:45:00Z',
          status: 'published',
          engagement: {
            likes: 203,
            comments: 67,
            shares: 45,
            views: 1456,
          },
          aiAnalysis: {
            sentiment: 'positive',
            toxicity: 0.02,
            spam_probability: 0.03,
            topics: ['loyalty system', 'positive experience', 'community'],
          },
        },
      ];

      setContent(mockContent);

    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Content Review Error',
        message: 'Failed to load content data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadContent();
    }
  }, [isAdmin]);

  // Filter and sort content
  const filteredAndSortedContent = content
    .filter(item => {
      switch (selectedFilter) {
        case 'flagged':
          return item.flags && item.flags.count > 0;
        case 'pending':
          return item.status === 'pending';
        case 'high_engagement':
          return item.engagement.likes > 50 || item.engagement.comments > 20;
        case 'recent':
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return new Date(item.createdAt) > dayAgo;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most_flagged':
          return (b.flags?.count || 0) - (a.flags?.count || 0);
        case 'most_engaged':
          const aEngagement = a.engagement.likes + a.engagement.comments + a.engagement.shares;
          const bEngagement = b.engagement.likes + b.engagement.comments + b.engagement.shares;
          return bEngagement - aEngagement;
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Handle content actions
  const handleApproveContent = async (contentId: string) => {
    setIsProcessing(contentId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setContent(prev => prev.map(item => 
        item.id === contentId ? { ...item, status: 'published' as const, flags: undefined } : item
      ));
      
      addNotification({
        type: 'success',
        title: 'Content Approved',
        message: 'Content has been approved and published.',
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

  const handleRejectContent = async (contentId: string) => {
    setIsProcessing(contentId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setContent(prev => prev.map(item => 
        item.id === contentId ? { ...item, status: 'rejected' as const } : item
      ));
      
      addNotification({
        type: 'warning',
        title: 'Content Rejected',
        message: 'Content has been rejected and removed.',
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

  const handleRemoveContent = async (contentId: string) => {
    setIsProcessing(contentId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setContent(prev => prev.filter(item => item.id !== contentId));
      
      addNotification({
        type: 'error',
        title: 'Content Removed',
        message: 'Content has been permanently removed from the platform.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Removal Failed',
        message: 'Failed to remove content',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-approved-green';
      case 'pending': return 'text-warning-amber';
      case 'flagged': return 'text-rejected-red';
      case 'rejected': return 'text-muted-light';
      default: return 'text-light-text';
    }
  };

  // Get content type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'topic': return '💬';
      case 'comment': return '💭';
      default: return '📄';
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
              You do not have sufficient permissions to access content review.
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
            <div className="h-16 bg-muted/20 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
                <h1 className="text-2xl font-bold text-light-text">Content Review</h1>
                <div className="text-sm text-muted-light mt-2">
                  CONTENT MANAGEMENT CENTER - {filteredAndSortedContent.length} ITEMS
                </div>
              </div>
              <div className="flex items-center space-x-4">
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
              Review platform content, analyze engagement metrics, and manage content quality.
              Monitor AI analysis and community feedback.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Filters and Sort */}
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-light-text">Filter:</span>
                  <div className="flex space-x-1">
                    {[
                      { value: 'all', label: 'All Content' },
                      { value: 'flagged', label: '🚩 Flagged' },
                      { value: 'pending', label: '⏳ Pending' },
                      { value: 'high_engagement', label: '🔥 High Engagement' },
                      { value: 'recent', label: '🆕 Recent (24h)' },
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
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-light-text">Sort:</span>
                <div className="flex space-x-1">
                  {[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'most_flagged', label: 'Most Flagged' },
                    { value: 'most_engaged', label: 'Most Engaged' },
                  ].map((sort) => (
                    <Button
                      key={sort.value}
                      variant={selectedSort === sort.value ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedSort(sort.value as any)}
                    >
                      {sort.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        <div className="space-y-4">
          {filteredAndSortedContent.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-light-text mb-2">No Content Found</h3>
                <p className="text-muted-light">
                  No content matches your current filter and sort criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedContent.map((item) => (
              <Card
                key={item.id}
                variant="bordered"
                className={`${
                  item.status === 'flagged' ? 'border-rejected-red/50 bg-rejected-red/5' :
                  item.status === 'pending' ? 'border-warning-amber/50 bg-warning-amber/5' :
                  'border-muted/20'
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Content Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getTypeIcon(item.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-light-text">{item.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(item.status)} bg-current/10`}>
                              {item.status}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-muted/20 text-muted-light capitalize">
                              {item.type}
                            </span>
                          </div>
                          <div className="text-sm text-muted-light mt-1">
                            By <Link href={`/users/${item.author.id}`} className="text-overlord-red hover:underline">
                              {item.author.name}
                            </Link> • {item.author.loyaltyScore} loyalty • {formatDate(item.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {item.flags && item.flags.count > 0 && (
                          <div className="text-rejected-red font-bold">
                            🚩 {item.flags.count} flags
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="bg-muted/10 p-4 rounded-lg">
                      <p className="text-sm text-light-text">
                        {item.content.length > 300 
                          ? `${item.content.substring(0, 300)}...` 
                          : item.content}
                      </p>
                    </div>

                    {/* Engagement Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/10 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-overlord-red">{item.engagement.likes}</div>
                        <div className="text-xs text-muted-light">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{item.engagement.comments}</div>
                        <div className="text-xs text-muted-light">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-approved-green">{item.engagement.shares}</div>
                        <div className="text-xs text-muted-light">Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-light-text">{item.engagement.views}</div>
                        <div className="text-xs text-muted-light">Views</div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {item.aiAnalysis && (
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-sm font-medium text-blue-400 mb-2">AI Analysis</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-light">Sentiment:</span>
                            <span className={`ml-2 capitalize ${
                              item.aiAnalysis.sentiment === 'positive' ? 'text-approved-green' :
                              item.aiAnalysis.sentiment === 'negative' ? 'text-rejected-red' :
                              'text-warning-amber'
                            }`}>
                              {item.aiAnalysis.sentiment}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-light">Toxicity:</span>
                            <span className={`ml-2 ${
                              item.aiAnalysis.toxicity > 0.5 ? 'text-rejected-red' :
                              item.aiAnalysis.toxicity > 0.2 ? 'text-warning-amber' :
                              'text-approved-green'
                            }`}>
                              {Math.round(item.aiAnalysis.toxicity * 100)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-light">Spam Risk:</span>
                            <span className={`ml-2 ${
                              item.aiAnalysis.spam_probability > 0.7 ? 'text-rejected-red' :
                              item.aiAnalysis.spam_probability > 0.3 ? 'text-warning-amber' :
                              'text-approved-green'
                            }`}>
                              {Math.round(item.aiAnalysis.spam_probability * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-light">Topics:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.aiAnalysis.topics.map((topic, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-blue-500/20 rounded-full text-blue-400">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Flag Details */}
                    {item.flags && item.flags.count > 0 && (
                      <div className="p-4 bg-rejected-red/10 rounded-lg border border-rejected-red/20">
                        <div className="text-sm font-medium text-rejected-red mb-2">
                          Flag Details ({item.flags.count} reports)
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.flags.reasons.map((reason, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-rejected-red/20 rounded-full text-rejected-red">
                              {reason}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-muted-light mt-2">
                          Last flagged: {formatDate(item.flags.lastFlagged)}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedContent(item)}
                        >
                          👁️ View Full Content
                        </Button>
                        <Link href={`/users/${item.author.id}`}>
                          <Button variant="ghost" size="sm">
                            👤 View Author
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {item.status === 'flagged' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleApproveContent(item.id)}
                            disabled={isProcessing === item.id}
                            className="text-approved-green hover:text-approved-green"
                          >
                            {isProcessing === item.id ? '...' : '✅ Approve'}
                          </Button>
                        )}
                        
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRejectContent(item.id)}
                          disabled={isProcessing === item.id}
                          className="text-warning-amber hover:text-warning-amber"
                        >
                          {isProcessing === item.id ? '...' : '❌ Reject'}
                        </Button>
                        
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRemoveContent(item.id)}
                          disabled={isProcessing === item.id}
                          className="text-rejected-red hover:text-rejected-red"
                        >
                          {isProcessing === item.id ? '...' : '🗑️ Remove'}
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

export default function ContentReviewPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ContentReviewContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
