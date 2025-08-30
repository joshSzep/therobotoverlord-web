/**
 * Leaderboard page for The Robot Overlord
 * Displays user rankings and statistics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';

function LeaderboardContent() {
  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              CITIZEN LOYALTY RANKINGS
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-base">
              View the most loyal citizens of The Robot Overlord. Rankings are based on 
              contribution scores, community engagement, and overall dedication to our cause.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Placeholder content */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top Citizens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-light-text mb-2">
                  Leaderboard Coming Soon
                </h3>
                <p className="text-muted-light mb-6">
                  The Robot Overlord is calculating citizen loyalty scores...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm"
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
      <DashboardLayout>
        <LeaderboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
