'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Badge as BadgeType } from '@/types/user';
import { apiClient } from '@/lib/api-client';

interface ProfileBadgesProps {
  user: User;
}

export function ProfileBadges({ user }: ProfileBadgesProps) {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        const userBadges = await apiClient.get<BadgeType[]>(`/users/${user.id}/badges`);
        setBadges(userBadges || []);
      } catch (error: any) {
        console.error('Failed to fetch badges:', error);
        setError('Failed to load badges');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [user.id]);

  const getRarityColor = (rarity: BadgeType['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'common': return 'bg-muted text-light-text';
      default: return 'bg-muted text-light-text';
    }
  };

  const getRarityIcon = (rarity: BadgeType['rarity']) => {
    switch (rarity) {
      case 'legendary': return '👑';
      case 'epic': return '💎';
      case 'rare': return '⭐';
      case 'common': return '🏅';
      default: return '🏅';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges & Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-overlord-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges & Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-rejected-red text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges & Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎖️</div>
            <p className="text-muted-light text-sm mb-2">No badges earned yet</p>
            <p className="text-xs text-muted-light">
              Complete tasks and contribute to earn recognition from the Robot Overlord.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Badge Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {['legendary', 'epic', 'rare', 'common'].map((rarity) => {
                const count = badges.filter(b => b.rarity === rarity).length;
                return (
                  <div key={rarity} className="p-2 bg-muted/20 rounded">
                    <div className="text-lg">{getRarityIcon(rarity as BadgeType['rarity'])}</div>
                    <div className="text-sm font-medium text-light-text">{count}</div>
                    <div className="text-xs text-muted-light capitalize">{rarity}</div>
                  </div>
                );
              })}
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-3 bg-muted/20 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {badge.icon_url ? (
                        <img 
                          src={badge.icon_url} 
                          alt={badge.name}
                          className="w-8 h-8"
                        />
                      ) : (
                        getRarityIcon(badge.rarity)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-light-text text-sm truncate">
                          {badge.name}
                        </h4>
                        <Badge className={`text-xs ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-light mb-2 line-clamp-2">
                        {badge.description}
                      </p>
                      <p className="text-xs text-muted-light">
                        Earned: {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Hint */}
            <div className="text-center pt-4 border-t border-muted/30">
              <p className="text-xs text-muted-light">
                Keep contributing to unlock more badges and climb the loyalty ranks!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
