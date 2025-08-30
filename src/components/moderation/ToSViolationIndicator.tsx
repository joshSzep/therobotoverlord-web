/**
 * Terms of Service violation indicator component for The Robot Overlord
 * Displays violation warnings and severity levels for posts and topics
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface ToSViolation {
  id: string;
  type: 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'inappropriate_content' | 
        'copyright' | 'violence' | 'privacy' | 'impersonation' | 'fraud' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  confidence: number; // 0-100
  autoDetected: boolean;
  reviewRequired: boolean;
}

interface ToSViolationIndicatorProps {
  violations: ToSViolation[];
  contentType: 'post' | 'topic';
  showDetails?: boolean;
  className?: string;
}

const VIOLATION_CONFIG = {
  spam: {
    label: 'Spam',
    icon: '🚫',
    description: 'Promotional or repetitive content'
  },
  harassment: {
    label: 'Harassment',
    icon: '⚠️',
    description: 'Targeting individuals with harmful content'
  },
  hate_speech: {
    label: 'Hate Speech',
    icon: '🚨',
    description: 'Content promoting hatred or discrimination'
  },
  misinformation: {
    label: 'Misinformation',
    icon: '❌',
    description: 'False or misleading information'
  },
  inappropriate_content: {
    label: 'Inappropriate',
    icon: '🔞',
    description: 'Content not suitable for the community'
  },
  copyright: {
    label: 'Copyright',
    icon: '©️',
    description: 'Unauthorized use of copyrighted material'
  },
  violence: {
    label: 'Violence',
    icon: '⚡',
    description: 'Content promoting or threatening violence'
  },
  privacy: {
    label: 'Privacy',
    icon: '🔒',
    description: 'Sharing personal information without consent'
  },
  impersonation: {
    label: 'Impersonation',
    icon: '🎭',
    description: 'Pretending to be someone else'
  },
  fraud: {
    label: 'Fraud',
    icon: '💰',
    description: 'Deceptive or fraudulent content'
  },
  other: {
    label: 'Other',
    icon: '❓',
    description: 'Other terms of service violation'
  }
};

export function ToSViolationIndicator({
  violations,
  contentType,
  showDetails = false,
  className = '',
}: ToSViolationIndicatorProps) {
  if (!violations || violations.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rejected-red text-white border-rejected-red';
      case 'high':
        return 'bg-rejected-red/20 text-rejected-red border-rejected-red/30';
      case 'medium':
        return 'bg-warning-amber/20 text-warning-amber border-warning-amber/30';
      case 'low':
        return 'bg-muted/20 text-muted-light border-muted/30';
      default:
        return 'bg-muted/20 text-light-text border-muted/30';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'CRITICAL';
      case 'high':
        return 'HIGH';
      case 'medium':
        return 'MEDIUM';
      case 'low':
        return 'LOW';
      default:
        return 'UNKNOWN';
    }
  };

  const getHighestSeverity = () => {
    const severityOrder = ['critical', 'high', 'medium', 'low'];
    for (const severity of severityOrder) {
      if (violations.some(v => v.severity === severity)) {
        return severity;
      }
    }
    return 'low';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const highestSeverity = getHighestSeverity();
  const criticalViolations = violations.filter(v => v.severity === 'critical');
  const highViolations = violations.filter(v => v.severity === 'high');
  const requiresReview = violations.some(v => v.reviewRequired);

  // Compact indicator for non-detailed view
  if (!showDetails) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(highestSeverity)}`}>
          🚨 ToS VIOLATION
        </div>
        <span className="text-xs text-muted-light">
          {violations.length} issue{violations.length !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  // Detailed violation display
  return (
    <Card variant="bordered" className={`border-rejected-red/30 ${className}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🚨</span>
            <h3 className="text-lg font-bold text-rejected-red">
              Terms of Service Violations
            </h3>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(highestSeverity)}`}>
            {getSeverityLabel(highestSeverity)} RISK
          </div>
        </div>

        {/* Critical Alert */}
        {criticalViolations.length > 0 && (
          <div className="bg-rejected-red/20 border border-rejected-red/30 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-rejected-red text-lg">⚠️</span>
              <span className="text-rejected-red font-bold">CRITICAL VIOLATION DETECTED</span>
            </div>
            <p className="text-sm text-light-text">
              This {contentType} contains content that severely violates our Terms of Service. 
              Immediate moderation action may be required.
            </p>
          </div>
        )}

        {/* Review Required Alert */}
        {requiresReview && (
          <div className="bg-warning-amber/20 border border-warning-amber/30 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-warning-amber text-lg">👁️</span>
              <span className="text-warning-amber font-bold">MANUAL REVIEW REQUIRED</span>
            </div>
            <p className="text-sm text-light-text">
              This content requires human moderator review before any automated actions.
            </p>
          </div>
        )}

        {/* Violations List */}
        <div className="space-y-3">
          {violations.map((violation) => {
            const config = VIOLATION_CONFIG[violation.type];
            return (
              <div
                key={violation.id}
                className={`p-3 rounded-lg border ${getSeverityColor(violation.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{config.icon}</span>
                    <div>
                      <span className="font-medium">{config.label}</span>
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-bold ${getSeverityColor(violation.severity)}`}>
                        {getSeverityLabel(violation.severity)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-light">
                    {Math.round(violation.confidence)}% confidence
                  </div>
                </div>

                <p className="text-sm mb-2">{violation.description}</p>

                <div className="flex items-center justify-between text-xs text-muted-light">
                  <div className="flex items-center space-x-3">
                    <span>Detected {formatDate(violation.detectedAt)}</span>
                    <span className="flex items-center space-x-1">
                      {violation.autoDetected ? (
                        <>
                          <span>🤖</span>
                          <span>Auto-detected</span>
                        </>
                      ) : (
                        <>
                          <span>👤</span>
                          <span>Manual report</span>
                        </>
                      )}
                    </span>
                  </div>
                  {violation.reviewRequired && (
                    <span className="text-warning-amber">Review Required</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-muted/20">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-light">Total Violations:</span>
              <span className="ml-2 text-light-text font-medium">{violations.length}</span>
            </div>
            <div>
              <span className="text-muted-light">Highest Severity:</span>
              <span className={`ml-2 font-medium ${getSeverityColor(highestSeverity).split(' ')[1]}`}>
                {getSeverityLabel(highestSeverity)}
              </span>
            </div>
          </div>
          
          {(criticalViolations.length > 0 || highViolations.length > 0) && (
            <div className="mt-3 text-xs text-muted-light">
              <span>⚠️ High-risk violations: {criticalViolations.length + highViolations.length}</span>
            </div>
          )}
        </div>

        {/* Action Required Notice */}
        <div className="mt-4 p-3 bg-overlord-red/10 border border-overlord-red/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-overlord-red">📋</span>
            <span className="text-overlord-red font-medium">Moderator Action Required</span>
          </div>
          <p className="text-sm text-light-text">
            This {contentType} requires immediate moderator attention due to Terms of Service violations. 
            Please review and take appropriate action.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
