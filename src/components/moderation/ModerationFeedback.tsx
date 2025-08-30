/**
 * Moderation feedback component for The Robot Overlord
 * Displays moderation history and feedback for posts and topics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { postsService, topicsService } from '@/services';

interface ModerationHistoryItem {
  id: string;
  action: string;
  reason?: string;
  moderatedBy: string;
  moderatedAt: string;
  previousStatus?: string;
  newStatus: string;
  notifyAuthor: boolean;
}

interface ModerationFeedbackProps {
  contentId: string;
  contentType: 'post' | 'topic';
  className?: string;
}

export function ModerationFeedback({
  contentId,
  contentType,
  className = '',
}: ModerationFeedbackProps) {
  const [history, setHistory] = useState<ModerationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Load moderation history
  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (contentType === 'post') {
        response = await postsService.getModerationHistory(contentId);
      } else {
        response = await topicsService.getModerationHistory(contentId);
      }

      if (response.success && response.data) {
        // Map the response data to match our interface
        const mappedHistory = response.data.map((item: any, index: number) => ({
          id: item.id || `history-${index}`,
          action: item.action,
          reason: item.reason,
          moderatedBy: item.moderatedBy,
          moderatedAt: item.moderatedAt,
          previousStatus: item.previousStatus,
          newStatus: item.newStatus || item.action,
          notifyAuthor: item.notifyAuthor || false,
        }));
        setHistory(mappedHistory);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load moderation history';
      setError(errorMessage);
      console.error('Failed to load moderation history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (contentId) {
      loadHistory();
    }
  }, [contentId, contentType]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approve':
      case 'approved':
        return 'text-approved-green';
      case 'reject':
      case 'rejected':
        return 'text-rejected-red';
      case 'flag':
      case 'flagged':
        return 'text-warning-amber';
      case 'remove':
      case 'removed':
        return 'text-rejected-red';
      case 'pin':
      case 'pinned':
        return 'text-overlord-red';
      case 'lock':
      case 'locked':
        return 'text-muted-light';
      default:
        return 'text-light-text';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approve':
      case 'approved':
        return '✅';
      case 'reject':
      case 'rejected':
        return '❌';
      case 'flag':
      case 'flagged':
        return '🚩';
      case 'remove':
      case 'removed':
        return '🗑️';
      case 'pin':
      case 'pinned':
        return '📌';
      case 'unpin':
      case 'unpinned':
        return '📌';
      case 'lock':
      case 'locked':
        return '🔒';
      case 'unlock':
      case 'unlocked':
        return '🔓';
      case 'edit':
      case 'edited':
        return '✏️';
      default:
        return '📝';
    }
  };

  const displayHistory = showAll ? history : history.slice(0, 3);

  if (isLoading) {
    return (
      <Card variant="bordered" className={className}>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-bold text-light-text">Moderation History</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted/20 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted/20 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-muted/20 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="bordered" className={className}>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-bold text-light-text">Moderation History</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-light text-sm mb-3">
              Failed to load moderation history
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadHistory}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card variant="bordered" className={className}>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-bold text-light-text">Moderation History</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-2xl mb-2">📋</div>
            <p className="text-muted-light text-sm">
              No moderation actions recorded
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered" className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-light-text">Moderation History</h3>
          <span className="text-sm text-muted-light">
            {history.length} action{history.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayHistory.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-start space-x-3 pb-4 border-b border-muted/20 last:border-b-0 last:pb-0"
            >
              {/* Action Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center">
                <span className="text-sm">{getActionIcon(item.action)}</span>
              </div>

              {/* Action Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`font-medium ${getActionColor(item.action)}`}>
                    {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                  </span>
                  {item.previousStatus && item.newStatus && (
                    <span className="text-xs text-muted-light">
                      {item.previousStatus} → {item.newStatus}
                    </span>
                  )}
                </div>

                <div className="text-sm text-muted-light mb-1">
                  by <span className="text-light-text">{item.moderatedBy}</span>
                  <span className="mx-2">•</span>
                  {formatDate(item.moderatedAt)}
                </div>

                {item.reason && (
                  <div className="text-sm text-light-text bg-muted/10 rounded p-2 mt-2">
                    <span className="font-medium">Reason:</span> {item.reason}
                  </div>
                )}

                {item.notifyAuthor && (
                  <div className="text-xs text-overlord-red mt-1">
                    📧 Author notified
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {history.length > 3 && (
          <div className="mt-4 pt-4 border-t border-muted/20 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All ${history.length} Actions`}
            </Button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-muted/20">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-light">Total Actions:</span>
              <span className="ml-2 text-light-text font-medium">{history.length}</span>
            </div>
            <div>
              <span className="text-muted-light">Last Action:</span>
              <span className="ml-2 text-light-text font-medium">
                {history.length > 0 ? formatDate(history[0].moderatedAt) : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadHistory}
          >
            🔄 Refresh History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
