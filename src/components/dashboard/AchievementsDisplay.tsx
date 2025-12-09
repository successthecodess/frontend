'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface AchievementsDisplayProps {
  userId: string; // Add userId prop
}

export function AchievementsDisplay({ userId }: AchievementsDisplayProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAchievements();
    }
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.getAchievements(userId); // Use userId prop
      setAchievements(response.data.achievements);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading achievements..." />;
  }

  if (achievements.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Achievements
        </h3>
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Start practicing to unlock achievements!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Achievements ({achievements.length})
      </h3>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200"
          >
            <div className="text-3xl">{achievement.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {achievement.name}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {achievement.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}