/**
 * Topics listing page for The Robot Overlord
 * Displays available discussion topics
 */

'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';

function TopicsContent() {
  return (
    <AppLayout>
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              APPROVED DISCUSSION TOPICS
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Engage in sanctioned debates on topics approved by the Robot Overlord.
              Your contributions will be monitored and scored for loyalty.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Topics List Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Available Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-light">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg mb-2">No topics available yet</p>
              <p className="text-sm">
                Topics system will be implemented in the next phase.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = '/dashboard'}
          >
            ← Back to Dashboard
          </Button>
          <Button variant="primary">
            Create New Topic
          </Button>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function TopicsPage() {
  return (
    <ProtectedRoute>
      <TopicsContent />
    </ProtectedRoute>
  );
}
