/**
 * Leaderboard type definitions for The Robot Overlord
 * Based on backend API schema
 */

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  rankChange?: number;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: string;
    status: string;
    isVerified: boolean;
  };
  score: number;
  previousScore?: number;
  scoreChange?: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    category: string;
  }>;
  stats: {
    postsCreated: number;
    topicsCreated: number;
    upvotesReceived: number;
    downvotesReceived: number;
    loyaltyScore: number;
    reputationScore: number;
    streakDays: number;
    moderationActions?: number;
    helpfulVotes?: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    icon: string;
    unlockedAt: string;
  }>;
  lastActiveAt: string;
}

export interface LeaderboardFilters {
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  category?: 'overall' | 'posts' | 'topics' | 'engagement' | 'moderation' | 'loyalty' | 'reputation';
  role?: 'citizen' | 'moderator' | 'admin';
  minScore?: number;
  maxScore?: number;
  hasAvatar?: boolean;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal' | 'special' | 'tournament';
  category: 'posts' | 'topics' | 'engagement' | 'loyalty' | 'moderation' | 'creativity';
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  participantCount: number;
  maxParticipants?: number;
  prizes: Array<{
    rank: number;
    title: string;
    description: string;
    badge?: {
      id: string;
      name: string;
      icon: string;
    };
    loyaltyBonus?: number;
    specialPrivileges?: string[];
    monetaryValue?: number;
  }>;
  rules: string[];
  eligibility: {
    minLoyaltyScore?: number;
    requiredRole?: string[];
    excludedUsers?: string[];
    regionRestrictions?: string[];
  };
  currentLeader?: {
    userId: string;
    username: string;
    avatar?: string;
    score: number;
  };
  userParticipation?: {
    isRegistered: boolean;
    isEligible: boolean;
    currentRank?: number;
    currentScore?: number;
    registeredAt?: string;
  };
  metadata: {
    totalPrizeValue?: number;
    sponsoredBy?: string;
    hashtags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'posting' | 'engagement' | 'social' | 'loyalty' | 'moderation' | 'special' | 'seasonal';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: Array<{
    type: 'posts_created' | 'upvotes_received' | 'topics_created' | 'days_active' | 'loyalty_score' | 'replies_given' | 'helpful_votes';
    target: number;
    timeframe?: 'day' | 'week' | 'month' | 'year' | 'all';
    description: string;
  }>;
  rewards: {
    loyaltyPoints: number;
    reputationPoints?: number;
    badge?: string;
    title?: string;
    specialPrivileges?: string[];
  };
  unlockedBy: number;
  isSecret: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: string;
  progress?: Array<{
    requirementType: string;
    current: number;
    target: number;
    percentage: number;
    completed: boolean;
  }>;
}

export interface Streak {
  id: string;
  userId: string;
  type: 'daily' | 'posting' | 'engagement' | 'voting' | 'moderation';
  current: number;
  longest: number;
  lastActivity: string;
  startDate: string;
  isActive: boolean;
  milestones: Array<{
    days: number;
    reachedAt: string;
    reward?: {
      loyaltyPoints: number;
      badge?: string;
    };
  }>;
}

export interface LeaderboardStatistics {
  totalParticipants: number;
  averageScore: number;
  medianScore: number;
  topScore: number;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  categoryBreakdown: Record<string, number>;
  recentActivity: Array<{
    userId: string;
    username: string;
    avatar?: string;
    action: string;
    points: number;
    timestamp: string;
  }>;
  trends: Array<{
    date: string;
    averageScore: number;
    participants: number;
    newEntries: number;
  }>;
}

export interface RankingHistory {
  userId: string;
  entries: Array<{
    date: string;
    rank: number;
    score: number;
    category: string;
    change: number;
  }>;
  summary: {
    bestRank: number;
    worstRank: number;
    averageRank: number;
    totalGames: number;
    improvementTrend: 'up' | 'down' | 'stable';
  };
}

export interface CompetitionLeaderboard {
  competitionId: string;
  entries: LeaderboardEntry[];
  lastUpdated: string;
  nextUpdate?: string;
  isLive: boolean;
}
