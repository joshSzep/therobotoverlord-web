import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboardStats, useUserRank } from '@/lib/queries';

interface TopicCreationEligibility {
  canCreate: boolean;
  reason?: string;
  isLoading: boolean;
  userPercentile?: number;
  requiredPercentile: number;
}

export function useTopicCreationEligibility(): TopicCreationEligibility {
  const { user, isAuthenticated } = useAuth();
  
  // Get leaderboard stats to calculate percentiles
  const { data: leaderboardStats, isLoading: statsLoading } = useLeaderboardStats();
  
  // Get user's current rank
  const { data: userRank, isLoading: rankLoading } = useUserRank(user?.pk || '');

  const eligibility = useMemo((): TopicCreationEligibility => {
    const requiredPercentile = 0.1; // Top 10%
    
    // Not authenticated
    if (!user || !isAuthenticated) {
      return {
        canCreate: false,
        reason: 'Authentication required',
        isLoading: false,
        requiredPercentile,
      };
    }

    // Admin, moderator, and superadmin can always create topics
    if (['admin', 'moderator', 'superadmin'].includes(user.role)) {
      return {
        canCreate: true,
        isLoading: false,
        requiredPercentile,
      };
    }

    // Still loading data
    if (statsLoading || rankLoading) {
      return {
        canCreate: false,
        isLoading: true,
        requiredPercentile,
      };
    }

    // No leaderboard data available - fallback to allow creation for now
    if (!leaderboardStats || !userRank) {
      console.warn('Leaderboard data unavailable, allowing topic creation as fallback');
      return {
        canCreate: true, // Fallback to allow creation when leaderboard is unavailable
        reason: 'Leaderboard data unavailable - access granted as fallback',
        isLoading: false,
        requiredPercentile,
      };
    }

    // Calculate user's percentile
    const totalUsers = leaderboardStats.total_users;
    const userPosition = userRank.rank;
    const userPercentile = userPosition / totalUsers;

    // Check if user is in top 10%
    const isInTopPercentile = userPercentile <= requiredPercentile;

    if (isInTopPercentile) {
      return {
        canCreate: true,
        isLoading: false,
        userPercentile,
        requiredPercentile,
      };
    }

    return {
      canCreate: false,
      reason: `Must be in top ${Math.round(requiredPercentile * 100)}% of citizens by loyalty score`,
      isLoading: false,
      userPercentile,
      requiredPercentile,
    };
  }, [user, isAuthenticated, leaderboardStats, userRank, statsLoading, rankLoading]);

  return eligibility;
}
