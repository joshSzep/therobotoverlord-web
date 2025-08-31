/**
 * Post reporting component for The Robot Overlord
 * Allows users to report posts for moderation review
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';
import { postsService } from '@/services';

interface PostReportingProps {
  postId: string;
  postTitle: string;
  onReportSubmitted?: () => void;
  className?: string;
}

interface ReportReason {
  id: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

const REPORT_REASONS: ReportReason[] = [
  {
    id: 'spam',
    label: 'Spam or Promotional Content',
    description: 'Unwanted commercial content or repetitive posts',
    severity: 'medium'
  },
  {
    id: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Targeting individuals with harmful content',
    severity: 'high'
  },
  {
    id: 'hate_speech',
    label: 'Hate Speech',
    description: 'Content promoting hatred against groups or individuals',
    severity: 'high'
  },
  {
    id: 'misinformation',
    label: 'Misinformation',
    description: 'False or misleading information',
    severity: 'medium'
  },
  {
    id: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Content not suitable for the community',
    severity: 'medium'
  },
  {
    id: 'copyright',
    label: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
    severity: 'medium'
  },
  {
    id: 'off_topic',
    label: 'Off-Topic',
    description: 'Content not relevant to the topic or community',
    severity: 'low'
  },
  {
    id: 'violence',
    label: 'Violence or Threats',
    description: 'Content promoting or threatening violence',
    severity: 'high'
  },
  {
    id: 'privacy',
    label: 'Privacy Violation',
    description: 'Sharing personal information without consent',
    severity: 'high'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Other violation not listed above',
    severity: 'medium'
  }
];

export function PostReporting({
  postId,
  postTitle,
  onReportSubmitted,
  className = '',
}: PostReportingProps) {
  const { addNotification } = useAppStore();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customDetails, setCustomDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please select a reason for reporting this post',
      });
      return;
    }

    if (selectedReason === 'other' && !customDetails.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Details',
        message: 'Please provide details for the "Other" reason',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedReasonData = REPORT_REASONS.find(r => r.id === selectedReason);
      const reportData = {
        reason: selectedReason,
        details: customDetails.trim() || selectedReasonData?.description || '',
      };

      const response = await postsService.reportPost(postId, reportData);

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Report Submitted',
          message: 'Thank you for reporting this post. Our moderators will review it shortly.',
        });

        // Reset form
        setSelectedReason('');
        setCustomDetails('');
        setShowForm(false);
        
        onReportSubmitted?.();
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit report';
      addNotification({
        type: 'error',
        title: 'Report Error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-rejected-red/30 bg-rejected-red/5 text-rejected-red';
      case 'medium':
        return 'border-warning-amber/30 bg-warning-amber/5 text-warning-amber';
      case 'low':
        return 'border-muted/30 bg-muted/5 text-muted-light';
      default:
        return 'border-muted/30 bg-muted/5 text-light-text';
    }
  };

  if (!showForm) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowForm(true)}
        className={`text-warning-amber hover:bg-warning-amber/10 ${className}`}
      >
        🚩 Report Post
      </Button>
    );
  }

  return (
    <Card variant="bordered" className={`border-warning-amber/30 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-light-text">Report Post</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
            disabled={isSubmitting}
          >
            ✕
          </Button>
        </div>
        <p className="text-sm text-muted-light">
          Reporting: <span className="text-light-text font-medium">&quot;{postTitle}&quot;</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Report Reasons */}
        <div>
          <label className="block text-sm font-medium text-light-text mb-3">
            Why are you reporting this post? *
          </label>
          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason.id}
                className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedReason === reason.id
                    ? 'border-overlord-red bg-overlord-red/10'
                    : getSeverityColor(reason.severity)
                } hover:bg-opacity-75`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 w-4 h-4 text-overlord-red bg-dark-bg border-muted/30 focus:ring-overlord-red focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-light-text mb-1">
                      {reason.label}
                    </div>
                    <div className="text-sm text-muted-light">
                      {reason.description}
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded bg-muted/20 text-muted-light">
                    {reason.severity}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <label className="block text-sm font-medium text-light-text mb-2">
            Additional Details {selectedReason === 'other' && '*'}
          </label>
          <textarea
            value={customDetails}
            onChange={(e) => setCustomDetails(e.target.value)}
            placeholder={
              selectedReason === 'other'
                ? 'Please describe the issue in detail...'
                : 'Optional: Provide additional context or specific examples...'
            }
            className="w-full px-3 py-2 bg-dark-bg border border-muted/30 rounded-md text-light-text placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-overlord-red focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-xs text-muted-light mt-1">
            {customDetails.length}/500 characters
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-warning-amber/10 border border-warning-amber/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <span className="text-warning-amber text-lg">⚠️</span>
            <div className="text-sm">
              <p className="text-warning-amber font-medium mb-1">
                Important Notice
              </p>
              <ul className="text-muted-light space-y-1">
                <li>• False reports may result in account restrictions</li>
                <li>• Reports are reviewed by human moderators</li>
                <li>• You will be notified of the outcome</li>
                <li>• Serious violations may result in immediate action</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => setShowForm(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitReport}
            disabled={!selectedReason || isSubmitting || (selectedReason === 'other' && !customDetails.trim())}
            className="bg-warning-amber hover:bg-warning-amber/80 text-dark-bg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
