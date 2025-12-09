'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Changed
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
  userId: string; // Add userId prop
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
        api.getDashboardOverview(userId), // Use userId prop
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Questions */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-100 p-3">
              <Target className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Questions Answered</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.totalQuestions}
              </p>
            </div>
          </div>
        </Card>

        {/* Accuracy */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overall Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.overallAccuracy}%
              </p>
            </div>
          </div>
        </Card>

        {/* Study Time */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.totalStudyTime}m
              </p>
            </div>
          </div>
        </Card>

        {/* Current Streak */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-orange-100 p-3">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {streakData?.currentStreak || 0} days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Streak Info */}
      {streakData && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Keep Your Streak Going! 🔥
              </h3>
              <p className="text-sm text-gray-600">
                You've practiced for {streakData.totalDaysActive} days total.
                Your longest streak is {streakData.longestStreak} days.
              </p>
            </div>
            <div className="text-right">
              <Badge variant={streakData.currentStreak > 0 ? 'default' : 'secondary'}>
                {streakData.currentStreak > 0 ? 'Active' : 'Start Today!'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Units Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Unit Progress
        </h3>

        {unitProgress.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              Start practicing to see your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {unitProgress.map((unit) => (
              <div key={unit.unitId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: unit.unitColor || '#6366f1' }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Unit {unit.unitNumber}: {unit.unitName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {unit.totalAttempts} attempts • {unit.accuracy}% accuracy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <p className="text-sm font-medium text-gray-600">Units Mastered</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {overview.unitsMastered}
            <span className="text-lg text-gray-500">/{unitProgress.length}</span>
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-gray-600">Correct Answers</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {overview.correctAnswers}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-medium text-gray-600">Recent Activity</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {overview.recentActivity}
            <span className="text-sm text-gray-500 ml-1">this week</span>
          </p>
        </Card>
      </div>
    </div>
  );
}