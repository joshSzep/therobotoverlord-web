/**
 * Sanctions Management Interface for The Robot Overlord
 * Manages user sanctions including warnings, suspensions, and bans
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

interface Sanction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'warning' | 'temporary_suspension' | 'permanent_ban' | 'content_restriction';
  status: 'active' | 'expired' | 'revoked' | 'appealed';
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  reason: string;
  description: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
  escalationLevel: number;
  previousSanctions: number;
}

interface SanctionFilters {
  status: string;
  type: string;
  severity: string;
  userId: string;
  dateRange: string;
}

function SanctionsManagementContent() {
  const { user } = useAuth();
  const { addNotification } = useAppStore();
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSanction, setSelectedSanction] = useState<Sanction | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [filters, setFilters] = useState<SanctionFilters>({
    status: 'active',
    type: 'all',
    severity: 'all',
    userId: '',
    dateRange: '30d'
  });

  // Mock sanctions data
  const mockSanctions: Sanction[] = [
    {
      id: '1',
      userId: 'user123',
      userEmail: 'troublemaker@example.com',
      userName: 'TroubleMaker',
      type: 'temporary_suspension',
      status: 'active',
      severity: 'moderate',
      reason: 'Repeated spam posting',
      description: 'User has been posting spam content across multiple topics despite previous warnings.',
      issuedBy: 'admin@robotoverlord.com',
      issuedAt: '2024-01-15T10:00:00Z',
      expiresAt: '2024-01-22T10:00:00Z',
      escalationLevel: 2,
      previousSanctions: 3
    },
    {
      id: '2',
      userId: 'user456',
      userEmail: 'banned@example.com',
      userName: 'BannedUser',
      type: 'permanent_ban',
      status: 'active',
      severity: 'critical',
      reason: 'Harassment and doxxing',
      description: 'User engaged in serious harassment and attempted to dox other community members.',
      issuedBy: 'admin@robotoverlord.com',
      issuedAt: '2024-01-10T15:30:00Z',
      escalationLevel: 4,
      previousSanctions: 8
    }
  ];

  useEffect(() => {
    loadSanctions();
  }, [filters]);

  const loadSanctions = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredSanctions = mockSanctions;
      
      if (filters.status !== 'all') {
        filteredSanctions = filteredSanctions.filter(sanction => sanction.status === filters.status);
      }
      
      if (filters.type !== 'all') {
        filteredSanctions = filteredSanctions.filter(sanction => sanction.type === filters.type);
      }
      
      if (filters.severity !== 'all') {
        filteredSanctions = filteredSanctions.filter(sanction => sanction.severity === filters.severity);
      }
      
      if (filters.userId) {
        filteredSanctions = filteredSanctions.filter(sanction => 
          sanction.userEmail.toLowerCase().includes(filters.userId.toLowerCase()) ||
          sanction.userName.toLowerCase().includes(filters.userId.toLowerCase())
        );
      }

      setSanctions(filteredSanctions);
      
    } catch (error) {
      console.error('Failed to load sanctions:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load sanctions'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<SanctionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRevokeSanction = async (sanctionId: string) => {
    if (!revokeReason.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a reason for revoking the sanction'
      });
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSanctions(prev => prev.map(sanction => 
        sanction.id === sanctionId 
          ? { 
              ...sanction, 
              status: 'revoked',
              revokedAt: new Date().toISOString(),
              revokedBy: user?.email || 'admin@robotoverlord.com',
              revokeReason: revokeReason
            }
          : sanction
      ));
      
      setSelectedSanction(null);
      setRevokeReason('');
      
      addNotification({
        type: 'success',
        title: 'Sanction Revoked',
        message: 'Sanction has been revoked successfully'
      });
      
    } catch (error) {
      console.error('Failed to revoke sanction:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to revoke sanction'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      case 'revoked': return 'text-blue-600 bg-blue-100';
      case 'appealed': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'severe': return 'text-orange-600 bg-orange-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'minor': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'temporary_suspension': return '⏸️';
      case 'permanent_ban': return '🚫';
      case 'content_restriction': return '📝';
      default: return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <LoadingState isLoading={isLoading}>
      <div className="space-y-6">
        {/* Header */}
        <OverlordMessage variant="default">
          <OverlordHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-light-text">Sanctions Management</h1>
                <div className="text-sm text-muted-light mt-2">
                  USER DISCIPLINE AND ENFORCEMENT
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" onClick={() => loadSanctions()}>
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </OverlordHeader>
          <OverlordContent>
            <p className="text-base">
              Manage user sanctions including warnings, suspensions, and bans. 
              Monitor active sanctions and handle escalations according to community guidelines.
            </p>
          </OverlordContent>
        </OverlordMessage>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Filter Sanctions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFiltersChange({ status: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
                  <option value="appealed">Appealed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFiltersChange({ type: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Types</option>
                  <option value="warning">Warning</option>
                  <option value="temporary_suspension">Temporary Suspension</option>
                  <option value="permanent_ban">Permanent Ban</option>
                  <option value="content_restriction">Content Restriction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => handleFiltersChange({ severity: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="all">All Severities</option>
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Time Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFiltersChange({ dateRange: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  User
                </label>
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => handleFiltersChange({ userId: e.target.value })}
                  placeholder="Filter by user..."
                  className="w-full p-2 border border-border rounded-md bg-card text-light-text"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sanctions List */}
        <Card>
          <CardHeader>
            <CardTitle>🚨 Sanctions ({sanctions.length} sanctions)</CardTitle>
          </CardHeader>
          <CardContent>
            {sanctions.length > 0 ? (
              <div className="space-y-4">
                {sanctions.map((sanction) => (
                  <div
                    key={sanction.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(sanction.type)}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-light-text">
                              {sanction.userName} ({sanction.userEmail})
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sanction.status)}`}>
                              {sanction.status.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(sanction.severity)}`}>
                              {sanction.severity.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-light">
                            Issued: {formatDate(sanction.issuedAt)} by {sanction.issuedBy}
                          </div>
                          {sanction.expiresAt && (
                            <div className="text-sm text-muted-light">
                              Expires: {formatDate(sanction.expiresAt)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedSanction(sanction)}
                        >
                          👁️ View
                        </Button>
                        {sanction.status === 'active' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setSelectedSanction(sanction)}
                          >
                            ❌ Revoke
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium text-light-text">Type:</span>
                        <span className="ml-2 text-muted-light capitalize">
                          {sanction.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-light-text">Escalation Level:</span>
                        <span className="ml-2 text-muted-light">
                          Level {sanction.escalationLevel} ({sanction.previousSanctions} previous)
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="font-medium text-light-text mb-1">Reason:</div>
                      <div className="text-sm text-muted-light bg-muted/30 p-2 rounded">
                        {sanction.reason}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="font-medium text-light-text mb-1">Description:</div>
                      <div className="text-sm text-muted-light bg-muted/30 p-2 rounded">
                        {sanction.description}
                      </div>
                    </div>

                    {sanction.revokeReason && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="font-medium text-blue-800 mb-1">Revocation Reason:</div>
                        <div className="text-sm text-blue-700">{sanction.revokeReason}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          Revoked by {sanction.revokedBy} on {sanction.revokedAt && formatDate(sanction.revokedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚨</div>
                <h3 className="text-xl font-bold text-light-text mb-2">
                  No Sanctions Found
                </h3>
                <p className="text-muted-light mb-6">
                  No sanctions match your current filters
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleFiltersChange({
                    status: 'all',
                    type: 'all',
                    severity: 'all',
                    userId: '',
                    dateRange: '30d'
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sanction Details Modal */}
        {selectedSanction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-light-text">Sanction Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSanction(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-light-text">User:</label>
                      <div className="text-muted-light">{selectedSanction.userName} ({selectedSanction.userEmail})</div>
                    </div>
                    <div>
                      <label className="font-medium text-light-text">Status:</label>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSanction.status)}`}>
                        {selectedSanction.status.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-light-text">Reason:</label>
                    <div className="text-muted-light bg-muted/30 p-2 rounded mt-1">
                      {selectedSanction.reason}
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-light-text">Description:</label>
                    <div className="text-muted-light bg-muted/30 p-3 rounded mt-1">
                      {selectedSanction.description}
                    </div>
                  </div>

                  {selectedSanction.status === 'active' ? (
                    <div>
                      <label className="font-medium text-light-text">Revoke Reason:</label>
                      <textarea
                        value={revokeReason}
                        onChange={(e) => setRevokeReason(e.target.value)}
                        placeholder="Provide a reason for revoking this sanction..."
                        className="w-full p-3 border border-border rounded-md bg-card text-light-text mt-1"
                        rows={4}
                      />
                      
                      <div className="flex space-x-3 mt-4">
                        <Button
                          variant="danger"
                          onClick={() => handleRevokeSanction(selectedSanction.id)}
                        >
                          ❌ Revoke Sanction
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedSanction(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="font-medium text-blue-800">Sanction Status: {selectedSanction.status}</div>
                      {selectedSanction.revokeReason && (
                        <div className="text-sm text-blue-700 mt-2">{selectedSanction.revokeReason}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              ← Back to Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </LoadingState>
  );
}

export default function SanctionsManagementPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SanctionsManagementContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
