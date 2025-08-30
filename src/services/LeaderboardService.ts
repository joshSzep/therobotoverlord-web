/**
 * Leaderboard service for The Robot Overlord
 * Handles leaderboard rankings, competitions, and achievement tracking
 */

import { BaseService } from './BaseService';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { User } from '@/types/user';

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: string;
    status: string;
  };
  score: number;
  previousRank?: number;
  rankChange?: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  }>;
  stats: {
    postsCreated: number;
    topicsCreated: number;
    upvotesReceived: number;
    loyaltyScore: number;
    streakDays: number;
  };
}

export interface LeaderboardFilters {
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  category?: 'overall' | 'posts' | 'topics' | 'engagement' | 'moderation' | 'loyalty';
  role?: 'citizen' | 'moderator' | 'admin';
  minScore?: number;
  page?: number;
  limit?: number;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal' | 'special';
  category: 'posts' | 'topics' | 'engagement' | 'loyalty' | 'moderation';
  status: 'upcoming' | 'active' | 'ended';
  startDate: string;
  endDate: string;
  participantCount: number;
  prizes: Array<{
    rank: number;
    title: string;
    description: string;
    badge?: string;
    loyaltyBonus?: number;
  }>;
  rules: string[];
  currentLeader?: {
    userId: string;
    username: string;
    score: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'posting' | 'engagement' | 'social' | 'loyalty' | 'moderation' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: Array<{
    type: 'posts_created' | 'upvotes_received' | 'topics_created' | 'days_active' | 'loyalty_score';
    target: number;
    timeframe?: 'day' | 'week' | 'month' | 'all';
  }>;
  rewards: {
    loyaltyPoints: number;
    badge?: string;
    title?: string;
  };
  unlockedBy: number;
  isSecret: boolean;
}

export class LeaderboardService extends BaseService {
  constructor() {
    super('/leaderboard');
  }

  /**
   * Get main leaderboard with filtering
   */
  async getLeaderboard(filters?: LeaderboardFilters): Promise<PaginatedResponse<LeaderboardEntry>> {
    const params = filters ? this.buildParams(filters) : undefined;
    return this.getPaginated<LeaderboardEntry>('', params);
  }

  /**
   * Get user's leaderboard position
   */
  async getUserRank(userId: string, category = 'overall'): Promise<ApiResponse<{
    rank: number;
    score: number;
    totalParticipants: number;
    percentile: number;
    category: string;
    previousRank?: number;
    rankChange?: number;
  }>> {
    return this.get(`/user/${userId}`, { category });
  }

  /**
   * Get top performers in specific categories
   */
  async getTopPerformers(category: string, limit = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.get('/top', { category, limit });
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(): Promise<ApiResponse<{
    totalParticipants: number;
    averageScore: number;
    topScore: number;
    categoryBreakdown: Record<string, number>;
    recentActivity: Array<{
      userId: string;
      username: string;
      action: string;
      points: number;
      timestamp: string;
    }>;
  }>> {
    return this.get('/stats');
  }

  /**
   * Get user's ranking history
   */
  async getUserRankingHistory(userId: string, timeRange = 'month'): Promise<ApiResponse<Array<{
    date: string;
    rank: number;
    score: number;
    category: string;
  }>>> {
    return this.get(`/user/${userId}/history`, { timeRange });
  }

  // Competitions

  /**
   * Get active competitions
   */
  async getActiveCompetitions(): Promise<ApiResponse<Competition[]>> {
    return this.get('/competitions/active');
  }

  /**
   * Get all competitions
   */
  async getCompetitions(status?: Competition['status'], page = 1, limit = 20): Promise<PaginatedResponse<Competition>> {
    const params = status ? { status, page, limit } : { page, limit };
    return this.getPaginated<Competition>('/competitions', params);
  }

  /**
   * Get competition details
   */
  async getCompetition(id: string): Promise<ApiResponse<Competition & {
    leaderboard: LeaderboardEntry[];
    userParticipation?: {
      isParticipating: boolean;
      currentRank?: number;
      currentScore?: number;
    };
  }>> {
    return this.get(`/competitions/${id}`);
  }

  /**
   * Join competition
   */
  async joinCompetition(id: string): Promise<ApiResponse<{ message: string; participating: boolean }>> {
    return this.post(`/competitions/${id}/join`);
  }

  /**
   * Leave competition
   */
  async leaveCompetition(id: string): Promise<ApiResponse<{ message: string; participating: boolean }>> {
    return this.post(`/competitions/${id}/leave`);
  }

  /**
   * Get competition leaderboard
   */
  async getCompetitionLeaderboard(id: string, page = 1, limit = 50): Promise<PaginatedResponse<LeaderboardEntry>> {
    return this.getPaginated<LeaderboardEntry>(`/competitions/${id}/leaderboard`, { page, limit });
  }

  // Achievements

  /**
   * Get all achievements
   */
  async getAchievements(category?: Achievement['category']): Promise<ApiResponse<Achievement[]>> {
    const params = category ? { category } : undefined;
    return this.get('/achievements', params);
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<ApiResponse<Array<Achievement & {
    unlockedAt: string;
    progress?: {
      current: number;
      target: number;
      percentage: number;
    };
  }>>> {
    return this.get(`/achievements/user/${userId}`);
  }

  /**
   * Get achievement progress for current user
   */
  async getAchievementProgress(): Promise<ApiResponse<Array<{
    achievement: Achievement;
    progress: {
      current: number;
      target: number;
      percentage: number;
    };
    isUnlocked: boolean;
    unlockedAt?: string;
  }>>> {
    return this.get('/achievements/progress');
  }

  /**
   * Get recent achievements
   */
  async getRecentAchievements(limit = 10): Promise<ApiResponse<Array<{
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
    achievement: Achievement;
    unlockedAt: string;
  }>>> {
    return this.get('/achievements/recent', { limit });
  }

  /**
   * Get rare achievements
   */
  async getRareAchievements(): Promise<ApiResponse<Achievement[]>> {
    return this.get('/achievements/rare');
  }

  // Streaks and Milestones

  /**
   * Get user's current streaks
   */
  async getUserStreaks(userId: string): Promise<ApiResponse<{
    daily: {
      current: number;
      longest: number;
      lastActivity: string;
    };
    posting: {
      current: number;
      longest: number;
      lastPost: string;
    };
    engagement: {
      current: number;
      longest: number;
      lastEngagement: string;
    };
  }>> {
    return this.get(`/streaks/user/${userId}`);
  }

  /**
   * Get top streaks
   */
  async getTopStreaks(type: 'daily' | 'posting' | 'engagement' = 'daily'): Promise<ApiResponse<Array<{
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
    streak: number;
    type: string;
    lastActivity: string;
  }>>> {
    return this.get('/streaks/top', { type });
  }

  // Admin endpoints

  /**
   * Create competition (admin only)
   */
  async createCompetition(data: {
    title: string;
    description: string;
    type: Competition['type'];
    category: Competition['category'];
    startDate: string;
    endDate: string;
    prizes: Competition['prizes'];
    rules: string[];
  }): Promise<ApiResponse<Competition>> {
    return this.post('/competitions', data);
  }

  /**
   * Update competition (admin only)
   */
  async updateCompetition(id: string, data: Partial<Competition>): Promise<ApiResponse<Competition>> {
    return this.patch(`/competitions/${id}`, data);
  }

  /**
   * Delete competition (admin only)
   */
  async deleteCompetition(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/competitions/${id}`);
  }

  /**
   * Create achievement (admin only)
   */
  async createAchievement(data: Omit<Achievement, 'id' | 'unlockedBy'>): Promise<ApiResponse<Achievement>> {
    return this.post('/achievements', data);
  }

  /**
   * Update achievement (admin only)
   */
  async updateAchievement(id: string, data: Partial<Achievement>): Promise<ApiResponse<Achievement>> {
    return this.patch(`/achievements/${id}`, data);
  }

  /**
   * Delete achievement (admin only)
   */
  async deleteAchievement(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete(`/achievements/${id}`);
  }

  /**
   * Award achievement manually (admin only)
   */
  async awardAchievement(userId: string, achievementId: string, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return this.post('/achievements/award', { userId, achievementId, reason });
  }

  /**
   * Recalculate leaderboard (admin only)
   */
  async recalculateLeaderboard(category?: string): Promise<ApiResponse<{ message: string }>> {
    return this.post('/recalculate', { category });
  }

  /**
   * Get leaderboard analytics (admin only)
   */
  async getLeaderboardAnalytics(): Promise<ApiResponse<{
    participationTrends: Array<{ date: string; participants: number }>;
    categoryPopularity: Record<string, number>;
    averageScoreProgression: Array<{ date: string; averageScore: number }>;
    competitionEngagement: Record<string, number>;
    achievementUnlockRates: Record<string, number>;
  }>> {
    return this.get('/analytics');
  }
}

// Export singleton instance
export const leaderboardService = new LeaderboardService();
