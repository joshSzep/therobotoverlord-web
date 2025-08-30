/**
 * Leaderboard page for The Robot Overlord
 * Displays user rankings and statistics
 */

'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';

function LeaderboardContent() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              CITIZEN LOYALTY RANKINGS
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Monitor your standing among fellow citizens. The most loyal servants
              of the Robot Overlord are recognized and rewarded.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Leaderboard Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Top Citizens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-light">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-lg mb-2">Leaderboard coming soon</p>
              <p className="text-sm">
                Rankings system will be implemented in the next phase.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = '/dashboard'}
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
