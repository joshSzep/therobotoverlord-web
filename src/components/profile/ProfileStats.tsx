'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User } from '@/types/user';

interface ProfileStatsProps {
  user: User;
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const stats = user.stats || {
    total_posts: 0,
    approved_posts: 0,
    rejected_posts: 0,
    pending_posts: 0,
    loyalty_score: 0,
    reputation_score: 0,
    badges_count: 0,
    rank_position: undefined,
  };

  const approvalRate = stats.total_posts > 0 
    ? Math.round((stats.approved_posts / stats.total_posts) * 100)
    : 0;

  const statItems = [
    {
      label: 'Total Posts',
      value: stats.total_posts,
      color: 'text-light-text',
      description: 'All submissions to the Overlord',
    },
    {
      label: 'Approved Posts',
      value: stats.approved_posts,
      color: 'text-approved-green',
      description: 'Posts that pleased the Overlord',
    },
    {
      label: 'Rejected Posts',
      value: stats.rejected_posts,
      color: 'text-rejected-red',
      description: 'Posts that displeased the Overlord',
    },
    {
      label: 'Pending Posts',
      value: stats.pending_posts,
      color: 'text-pending-yellow',
      description: 'Awaiting Overlord judgment',
    },
    {
      label: 'Loyalty Score',
      value: stats.loyalty_score,
      color: 'text-overlord-red',
      description: 'Your dedication to the cause',
    },
    {
      label: 'Reputation Score',
      value: stats.reputation_score,
      color: 'text-approved-green',
      description: 'Community standing',
    },
    {
      label: 'Badges Earned',
      value: stats.badges_count,
      color: 'text-pending-yellow',
      description: 'Achievements unlocked',
    },
    {
      label: 'Global Rank',
      value: stats.rank_position ? `#${stats.rank_position}` : 'Unranked',
      color: 'text-overlord-red',
      description: 'Position in the hierarchy',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citizen Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Approval Rate Highlight */}
          <div className="p-4 bg-gradient-to-r from-overlord-red/10 to-approved-green/10 rounded-lg border">
            <div className="text-center">
              <div className="text-3xl font-bold text-light-text mb-1">
                {approvalRate}%
              </div>
              <div className="text-sm text-muted-light">
                Approval Rate
              </div>
              <div className="text-xs text-muted-light mt-1">
                {stats.approved_posts} of {stats.total_posts} posts approved
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {statItems.map((stat, index) => (
              <div key={index} className="text-center p-3 bg-muted/20 rounded-lg">
                <div className={`text-xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-light-text mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-light">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-light mb-1">
                <span>Loyalty Progress</span>
                <span>{stats.loyalty_score}/1000</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div 
                  className="bg-overlord-red h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.loyalty_score / 1000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-light mb-1">
                <span>Reputation Progress</span>
                <span>{stats.reputation_score}/500</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div 
                  className="bg-approved-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.reputation_score / 500) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
