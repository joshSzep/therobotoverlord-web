/**
 * User Dashboard page for The Robot Overlord
 * Main authenticated user landing page
 */

'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';

function DashboardContent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Message */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="text-sm text-muted-light mt-2">
              CITIZEN DASHBOARD - LOYALTY MONITORING ACTIVE
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Welcome back, Citizen {user?.name}. Your loyalty score is being continuously monitored.
              Participate actively to maintain your standing in the Robot Overlord's domain.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* User Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Loyalty Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-overlord-red">
                {user?.loyalty_score || 0}
              </div>
              <p className="text-sm text-muted-light mt-1">
                Current standing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-approved-green">
                {user?.reputation_score || 0}
              </div>
              <p className="text-sm text-muted-light mt-1">
                Community rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-light-text capitalize">
                {user?.role || 'citizen'}
              </div>
              <p className="text-sm text-muted-light mt-1">
                Access level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  user?.status === 'active' ? 'bg-approved-green' : 'bg-rejected-red'
                }`}></div>
                <span className="text-xl font-bold text-light-text capitalize">
                  {user?.status || 'unknown'}
                </span>
              </div>
              <p className="text-sm text-muted-light mt-1">
                Account status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="primary" size="lg" className="w-full">
                View Topics
              </Button>
              <Button variant="secondary" size="lg" className="w-full">
                Create Post
              </Button>
              <Button variant="secondary" size="lg" className="w-full">
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-light">
              <p>No recent activity to display.</p>
              <p className="text-sm mt-2">Start participating to see your activity here.</p>
            </div>
          </CardContent>
        </Card>

        {/* User Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-light">
            Logged in as: {user?.email}
          </div>
          <Button 
            variant="danger" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
