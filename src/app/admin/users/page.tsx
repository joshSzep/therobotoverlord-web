/**
 * User Management page for The Robot Overlord
 * Interface for managing user accounts and permissions
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
import { User, UserRole, Badge } from '@/types/user';

interface UserManagementData {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  role: UserRole;
  loyaltyScore: number;
  badges: Array<Badge & { icon: string }>;
  joinDate: string;
  lastActive: string;
  postCount: number;
  flagCount: number;
  status: 'active' | 'suspended' | 'banned' | 'pending';
  ipAddress?: string;
}

function UserManagementContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'suspended' | 'banned' | 'new'>('all');
  const [selectedUser, setSelectedUser] = useState<UserManagementData | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Check admin permissions
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  // Load users
  const loadUsers = async () => {
    try {
      setIsLoading(true);

      // Mock user data
      const mockUsers: UserManagementData[] = [
        {
          id: 'user-1',
          name: 'dr_sarah_chen',
          displayName: 'Dr. Sarah Chen',
          email: 'sarah.chen@robotoverlord.com',
          role: UserRole.ADMIN,
          loyaltyScore: 4250,
          badges: [
            { id: 'early-adopter', name: 'Early Adopter', description: 'Joined in the first month', icon: '🌟', rarity: 'legendary', icon_url: '', earned_at: '2024-01-01T00:00:00Z' },
            { id: 'researcher', name: 'Researcher', description: 'Contributed to AI research', icon: '🔬', rarity: 'epic', icon_url: '', earned_at: '2024-01-02T00:00:00Z' },
          ],
          joinDate: '2024-01-01T00:00:00Z',
          lastActive: '2024-01-15T14:30:00Z',
          postCount: 127,
          flagCount: 0,
          status: 'active',
          ipAddress: '192.168.1.100',
        },
        {
          id: 'user-2',
          name: 'tech_rebel_99',
          displayName: 'Tech Rebel',
          email: 'rebel@protonmail.com',
          role: UserRole.CITIZEN,
          loyaltyScore: 890,
          badges: [
            { id: 'contrarian', name: 'Contrarian', description: 'Questions everything', icon: '🤔', rarity: 'rare', icon_url: '', earned_at: '2024-01-08T12:00:00Z' },
          ],
          joinDate: '2024-01-08T12:00:00Z',
          lastActive: '2024-01-15T10:15:00Z',
          postCount: 45,
          flagCount: 3,
          status: 'active',
          ipAddress: '10.0.0.45',
        },
        {
          id: 'user-3',
          name: 'spam_bot_detected',
          displayName: 'Definitely Not A Bot',
          email: 'totallyreal@fakeemail.com',
          role: UserRole.CITIZEN,
          loyaltyScore: 12,
          badges: [],
          joinDate: '2024-01-14T23:45:00Z',
          lastActive: '2024-01-15T00:30:00Z',
          postCount: 89,
          flagCount: 15,
          status: 'suspended',
          ipAddress: '203.0.113.42',
        },
        {
          id: 'user-4',
          name: 'overlord_devotee',
          displayName: 'Loyal Servant #1',
          email: 'devoted@robotoverlord.com',
          role: UserRole.CITIZEN,
          loyaltyScore: 8750,
          badges: [
            { id: 'devotee', name: 'True Devotee', description: 'Unwavering loyalty', icon: '🙏', rarity: 'legendary', icon_url: '', earned_at: '2024-01-02T08:00:00Z' },
            { id: 'top-contributor', name: 'Top Contributor', description: 'High-quality posts', icon: '⭐', rarity: 'epic', icon_url: '', earned_at: '2024-01-03T08:00:00Z' },
          ],
          joinDate: '2024-01-02T08:00:00Z',
          lastActive: '2024-01-15T15:45:00Z',
          postCount: 234,
          flagCount: 0,
          status: 'active',
          ipAddress: '172.16.0.10',
        },
        {
          id: 'user-5',
          name: 'banned_troublemaker',
          displayName: 'Former Troublemaker',
          email: 'trouble@example.com',
          role: UserRole.CITIZEN,
          loyaltyScore: -500,
          badges: [],
          joinDate: '2024-01-10T16:30:00Z',
          lastActive: '2024-01-12T20:00:00Z',
          postCount: 23,
          flagCount: 12,
          status: 'banned',
          ipAddress: '198.51.100.25',
        },
      ];

      setUsers(mockUsers);

    } catch (err) {
      addNotification({
        type: 'error',
        title: 'User Management Error',
        message: 'Failed to load user data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Filter and search users
  const filteredUsers = users.filter(u => {
    // Filter by status
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'new') {
        const joinDate = new Date(u.joinDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (joinDate < weekAgo) return false;
      } else if (u.status !== selectedFilter) {
        return false;
      }
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.displayName?.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    return true;
  });

  // Handle user actions
  const handleSuspendUser = async (userId: string) => {
    setIsProcessing(userId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: 'suspended' as const } : u
      ));
      
      addNotification({
        type: 'warning',
        title: 'User Suspended',
        message: 'User account has been suspended.',
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

  const handleBanUser = async (userId: string) => {
    setIsProcessing(userId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: 'banned' as const } : u
      ));
      
      addNotification({
        type: 'error',
        title: 'User Banned',
        message: 'User account has been permanently banned.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Ban Failed',
        message: 'Failed to ban user',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReinstateUser = async (userId: string) => {
    setIsProcessing(userId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: 'active' as const } : u
      ));
      
      addNotification({
        type: 'success',
        title: 'User Reinstated',
        message: 'User account has been reinstated.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Reinstatement Failed',
        message: 'Failed to reinstate user',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-approved-green';
      case 'suspended': return 'text-warning-amber';
      case 'banned': return 'text-rejected-red';
      case 'pending': return 'text-blue-400';
      default: return 'text-muted-light';
    }
  };

  // Get role icon
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return '👑';
      case UserRole.MODERATOR: return '🛡️';
      case UserRole.CITIZEN: return '👤';
      default: return '👤';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
              You do not have sufficient permissions to access user management.
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
                <div key={i} className="h-24 bg-muted/20 rounded-lg"></div>
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
                <h1 className="text-2xl font-bold text-light-text">User Management</h1>
                <div className="text-sm text-muted-light mt-2">
                  USER ACCOUNT CONTROL CENTER - {filteredUsers.length} USERS
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
              Manage user accounts, permissions, and enforcement actions.
              All actions are logged and auditable.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Search and Filters */}
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/10 border border-muted/20 rounded-lg text-light-text placeholder-muted-light focus:outline-none focus:border-overlord-red/50"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-light-text">Filter:</span>
                <div className="flex space-x-1">
                  {[
                    { value: 'all', label: 'All Users' },
                    { value: 'active', label: '✅ Active' },
                    { value: 'suspended', label: '⚠️ Suspended' },
                    { value: 'banned', label: '🚫 Banned' },
                    { value: 'new', label: '🆕 New (7d)' },
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
          </CardContent>
        </Card>

        {/* User List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-light-text mb-2">No Users Found</h3>
                <p className="text-muted-light">
                  {searchTerm 
                    ? "No users match your search criteria."
                    : "No users match your current filter."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((userData) => (
              <Card
                key={userData.id}
                variant="bordered"
                className={`${
                  userData.status === 'banned' ? 'border-rejected-red/50 bg-rejected-red/5' :
                  userData.status === 'suspended' ? 'border-warning-amber/50 bg-warning-amber/5' :
                  'border-muted/20'
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* User Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{getRoleIcon(userData.role)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-light-text">{userData.displayName || userData.name}</h3>
                            <span className="text-sm text-muted-light">@{userData.name}</span>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(userData.status)} bg-current/10`}>
                              {userData.status}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-muted/20 text-muted-light capitalize">
                              {userData.role}
                            </span>
                          </div>
                          <div className="text-sm text-muted-light mt-1">
                            {userData.email} • Joined {formatDate(userData.joinDate)}
                          </div>
                          <div className="text-sm text-muted-light">
                            Last active: {formatDate(userData.lastActive)} • IP: {userData.ipAddress}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-overlord-red">{userData.loyaltyScore}</div>
                        <div className="text-xs text-muted-light">Loyalty Score</div>
                      </div>
                    </div>

                    {/* User Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/10 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-light-text">{userData.postCount}</div>
                        <div className="text-xs text-muted-light">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-light-text">{userData.badges?.length || 0}</div>
                        <div className="text-xs text-muted-light">Badges</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${userData.flagCount > 0 ? 'text-warning-amber' : 'text-approved-green'}`}>
                          {userData.flagCount}
                        </div>
                        <div className="text-xs text-muted-light">Flags</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-light-text">
                          {Math.floor((Date.now() - new Date(userData.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-xs text-muted-light">Days</div>
                      </div>
                    </div>

                    {/* Badges */}
                    {userData.badges && userData.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {userData.badges.map((badge) => (
                          <div
                            key={badge.id}
                            className="flex items-center space-x-1 px-2 py-1 bg-muted/20 rounded-full text-xs"
                          >
                            <span>{badge.icon}</span>
                            <span className="text-light-text">{badge.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                      <div className="flex items-center space-x-2">
                        <Link href={`/users/${userData.id}`}>
                          <Button variant="ghost" size="sm">
                            👁️ View Profile
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(userData)}
                        >
                          📊 View Details
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {userData.status === 'active' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSuspendUser(userData.id)}
                              disabled={isProcessing === userData.id}
                              className="text-warning-amber hover:text-warning-amber"
                            >
                              {isProcessing === userData.id ? '...' : '⚠️ Suspend'}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleBanUser(userData.id)}
                              disabled={isProcessing === userData.id}
                              className="text-rejected-red hover:text-rejected-red"
                            >
                              {isProcessing === userData.id ? '...' : '🚫 Ban'}
                            </Button>
                          </>
                        )}
                        
                        {(userData.status === 'suspended' || userData.status === 'banned') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleReinstateUser(userData.id)}
                            disabled={isProcessing === userData.id}
                            className="text-approved-green hover:text-approved-green"
                          >
                            {isProcessing === userData.id ? '...' : '✅ Reinstate'}
                          </Button>
                        )}
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

export default function UserManagementPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserManagementContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
