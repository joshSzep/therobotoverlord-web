'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { OverlordMessage, OverlordHeader, OverlordContent } from '@/components/overlord/OverlordMessage';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileBadges } from '@/components/profile/ProfileBadges';
import { ProfileActivity } from '@/components/profile/ProfileActivity';
import { UserRole, UserStatus } from '@/types/user';

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'activity' | 'settings'>('overview');

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-light">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-overlord-red text-white';
      case UserRole.MODERATOR: return 'bg-approved-green text-white';
      case UserRole.CITIZEN: return 'bg-muted text-light-text';
      default: return 'bg-muted text-light-text';
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE: return 'bg-approved-green text-white';
      case UserStatus.SUSPENDED: return 'bg-pending-yellow text-dark-text';
      case UserStatus.BANNED: return 'bg-rejected-red text-white';
      default: return 'bg-muted text-light-text';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            CITIZEN PROFILE MANAGEMENT
          </OverlordHeader>
          <OverlordContent>
            <p className="text-sm">
              Monitor your loyalty metrics and manage your citizen profile.
              Your compliance is tracked. Your dedication is measured.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-overlord-red to-approved-green rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h1 className="text-2xl font-bold text-light-text">{user.username}</h1>
                  <div className="flex gap-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-light">{user.email}</p>
                <p className="text-sm text-muted-light">
                  Citizen since: {new Date(user.created_at).toLocaleDateString()}
                </p>
                {user.bio && (
                  <p className="text-light-text mt-2">{user.bio}</p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-overlord-red">{user.stats?.loyalty_score || 0}</div>
                  <div className="text-xs text-muted-light">Loyalty Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-approved-green">{user.stats?.approved_posts || 0}</div>
                  <div className="text-xs text-muted-light">Approved Posts</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'edit', label: 'Edit Profile' },
            { key: 'activity', label: 'Activity' },
            { key: 'settings', label: 'Settings' },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'primary' : 'ghost'}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileStats user={user} />
            <ProfileBadges user={user} />
          </div>
        )}

        {activeTab === 'edit' && (
          <ProfileEditForm user={user} onUpdate={updateUser} isLoading={isLoading} />
        )}

        {activeTab === 'activity' && (
          <ProfileActivity userId={user.id} />
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold text-light-text mb-2">Privacy Settings</h3>
                  <p className="text-sm text-muted-light mb-4">
                    Manage your privacy preferences and data visibility.
                  </p>
                  <Button variant="secondary" size="sm">
                    Manage Privacy
                  </Button>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold text-light-text mb-2">Notification Preferences</h3>
                  <p className="text-sm text-muted-light mb-4">
                    Configure how you receive notifications from the Robot Overlord.
                  </p>
                  <Button variant="secondary" size="sm">
                    Manage Notifications
                  </Button>
                </div>

                <div className="p-4 bg-rejected-red/10 border border-rejected-red rounded-lg">
                  <h3 className="font-semibold text-rejected-red mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-light mb-4">
                    Irreversible actions that affect your account.
                  </p>
                  <Button variant="danger" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
