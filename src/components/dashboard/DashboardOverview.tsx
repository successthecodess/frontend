'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  Flame,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { ErrorDisplay } from '@/components/ErrorDisplay';

interface DashboardData {
  overview: {
    totalQuestions: number;
    correctAnswers: number;
    overallAccuracy: number;
    totalStudyTime: number;
    unitsMastered: number;
    recentActivity: number;
  };
  unitProgress: Array<{
    unitId: string;
    unitNumber: number;
    unitName: string;
    unitColor: string;
    masteryLevel: number;
    currentDifficulty: string;
    totalAttempts: number;
    accuracy: number;
    lastPracticed: string;
  }>;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  lastActiveDate: string | null;
}

interface DashboardOverviewProps {
  userId: string;
}

export function DashboardOverview({ userId }: DashboardOverviewProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewResponse, streakResponse] = await Promise.all([
        api.getDashboardOverview(userId),
        api.getStreaks(userId),
      ]);

      setDashboardData(overviewResponse.data);
      setStreakData(streakResponse.data);
    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  if (error || !dashboardData) {
    return (
      <ErrorDisplay
        message={error || 'No data available'}
        onRetry={loadDashboardData}
      />
    );
  }

  const { overview, unitProgress } = dashboardData;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Questions */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-full bg-indigo-100 p-2 sm:p-3 flex-shrink-0">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Questions Answered</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {overview.totalQuestions}
              </p>
            </div>
          </div>
        </Card>

        {/* Accuracy */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-full bg-green-100 p-2 sm:p-3 flex-shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Overall Accuracy</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {overview.overallAccuracy}%
              </p>
            </div>
          </div>
        </Card>

        {/* Study Time */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-full bg-blue-100 p-2 sm:p-3 flex-shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Study Time</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {overview.totalStudyTime}m
              </p>
            </div>
          </div>
        </Card>

        {/* Current Streak */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-full bg-orange-100 p-2 sm:p-3 flex-shrink-0">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Current Streak</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {streakData?.currentStreak || 0} days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Streak Info */}
      {streakData && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                Keep Your Streak Going! 🔥
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                You've practiced for {streakData.totalDaysActive} days total.
                Your longest streak is {streakData.longestStreak} days.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <Badge variant={streakData.currentStreak > 0 ? 'default' : 'secondary'}>
                {streakData.currentStreak > 0 ? 'Active' : 'Start Today!'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Units Progress */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Unit Progress
        </h3>

        {unitProgress.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-gray-600">
              Start practicing to see your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {unitProgress.map((unit) => (
              <div key={unit.unitId} className="space-y-2">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0 mt-2 sm:mt-0"
                      style={{ backgroundColor: unit.unitColor || '#6366f1' }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        Unit {unit.unitNumber}: {unit.unitName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {unit.totalAttempts} attempts • {unit.accuracy}% accuracy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <Badge variant="outline" className="text-xs capitalize">
                      {unit.currentDifficulty.toLowerCase()}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-900">
                      {unit.masteryLevel}%
                    </span>
                  </div>
                </div>
                <Progress value={unit.masteryLevel} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-gray-600">Units Mastered</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {overview.unitsMastered}
            <span className="text-base sm:text-lg text-gray-500">/{unitProgress.length}</span>
          </p>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-gray-600">Correct Answers</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {overview.correctAnswers}
          </p>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-gray-600">Recent Activity</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {overview.recentActivity}
            <span className="text-xs sm:text-sm text-gray-500 ml-1">this week</span>
          </p>
        </Card>
      </div>
    </div>
  );
}