'use client';

import { Card } from '@/components/ui/card';
import { Brain, Target, BookOpen, TrendingUp, Award } from 'lucide-react';
import type { ProgressMetrics } from '@/types';

interface LearningInsightsCardProps {
  progress?: ProgressMetrics;
}

export function LearningInsightsCard({ progress }: LearningInsightsCardProps) {
  if (!progress) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Brain className="h-6 w-6 text-indigo-600" />
          Learning Insights
        </h2>
        <div className="rounded-lg bg-gray-50 p-4 text-center">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            Start practicing to see your learning insights!
          </p>
        </div>
      </Card>
    );
  }

  const getProgressionMessage = () => {
    const { consecutiveCorrect, masteryLevel, currentDifficulty, totalAttempts } = progress;
    
    // Need minimum attempts first
    if (totalAttempts < 5) {
      return {
        message: `Complete ${5 - totalAttempts} more question${5 - totalAttempts !== 1 ? 's' : ''} to unlock difficulty progression`,
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        icon: Target,
      };
    }

    if (currentDifficulty === 'EASY') {
      const correctNeeded = Math.max(0, 3 - consecutiveCorrect);
      const masteryNeeded = Math.max(0, 70 - masteryLevel);
      
      if (correctNeeded > 0 && masteryNeeded > 0) {
        return {
          message: `Get ${correctNeeded} more correct in a row and ${masteryNeeded}% more mastery to advance to Medium`,
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          icon: TrendingUp,
        };
      } else if (correctNeeded > 0) {
        return {
          message: `Get ${correctNeeded} more correct in a row to advance to Medium`,
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          icon: TrendingUp,
        };
      } else if (masteryNeeded > 0) {
        return {
          message: `Gain ${masteryNeeded}% more mastery to advance to Medium`,
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          icon: TrendingUp,
        };
      }
      return {
        message: 'Keep practicing to advance to Medium!',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        icon: TrendingUp,
      };
    }
    
    if (currentDifficulty === 'MEDIUM') {
      const correctNeeded = Math.max(0, 3 - consecutiveCorrect);
      const masteryNeeded = Math.max(0, 70 - masteryLevel);
      
      if (correctNeeded > 0 && masteryNeeded > 0) {
        return {
          message: `Get ${correctNeeded} more correct in a row and ${masteryNeeded}% more mastery to advance to Hard`,
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          icon: TrendingUp,
        };
      } else if (correctNeeded > 0) {
        return {
          message: `Get ${correctNeeded} more correct in a row to advance to Hard`,
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          icon: TrendingUp,
        };
      } else if (masteryNeeded > 0) {
        return {
          message: `Gain ${masteryNeeded}% more mastery to advance to Hard`,
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          icon: TrendingUp,
        };
      }
      return {
        message: 'Keep practicing to advance to Hard!',
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        icon: TrendingUp,
      };
    }
    
    if (currentDifficulty === 'HARD') {
      const correctNeeded = Math.max(0, 3 - consecutiveCorrect);
      const masteryNeeded = Math.max(0, 70 - masteryLevel);
      
      if (correctNeeded > 0 && masteryNeeded > 0) {
        return {
          message: `Get ${correctNeeded} more correct in a row and ${masteryNeeded}% more mastery to advance to Expert`,
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          icon: TrendingUp,
        };
      } else if (correctNeeded > 0) {
        return {
          message: `Get ${correctNeeded} more correct in a row to advance to Expert`,
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          icon: TrendingUp,
        };
      } else if (masteryNeeded > 0) {
        return {
          message: `Gain ${masteryNeeded}% more mastery to advance to Expert`,
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          icon: TrendingUp,
        };
      }
      return {
        message: 'Keep practicing to advance to Expert!',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        icon: TrendingUp,
      };
    }
    
    return {
      message: 'You\'re at the highest level! Excellent work! 🌟',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      icon: Award,
    };
  };

  const progressionInfo = getProgressionMessage();
  const Icon = progressionInfo.icon;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'HARD':
        return 'text-orange-600 bg-orange-100';
      case 'EXPERT':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <Brain className="h-6 w-6 text-indigo-600" />
        Learning Insights
      </h2>
      
      <div className="space-y-4">
        {/* Current Level Badge */}
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            <span className="font-medium text-gray-900">Your Level</span>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-bold capitalize ${getDifficultyColor(progress.currentDifficulty)}`}>
            {progress.currentDifficulty.toLowerCase()}
          </span>
        </div>

        {/* Progression Message */}
        <div className={`rounded-lg border-2 ${progressionInfo.bgColor} border-opacity-20 p-4`}>
          <div className="flex items-start gap-3">
            <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${progressionInfo.color}`} />
            <p className={`text-sm font-medium ${progressionInfo.color}`}>
              {progressionInfo.message}
            </p>
          </div>
        </div>

        {/* Mastery Progress Bar */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Mastery Progress</span>
            <span className="text-sm font-bold text-purple-600">{progress.masteryLevel}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${progress.masteryLevel}%` }}
            />
          </div>
          {progress.masteryLevel < 70 && (
            <p className="mt-1 text-xs text-gray-500">
              Need {70 - progress.masteryLevel}% more to advance
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
            <p className="text-xs text-gray-600">Streak</p>
            <p className="text-2xl font-bold text-green-600">
              {progress.consecutiveCorrect} 🔥
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
            <p className="text-xs text-gray-600">Attempts</p>
            <p className="text-2xl font-bold text-blue-600">
              {progress.totalAttempts}
            </p>
          </div>
        </div>

        {/* Progress Requirements Info */}
        {progress.totalAttempts >= 3 && progress.currentDifficulty !== 'EXPERT' && (
          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-700 mb-1">To advance, you need:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li className={progress.consecutiveCorrect >= 3 ? 'text-green-600 font-medium' : ''}>
                3 correct in a row {progress.consecutiveCorrect >= 3 ? '✓' : `(${progress.consecutiveCorrect}/3)`}
              </li>
              <li className={progress.masteryLevel >= 70 ? 'text-green-600 font-medium' : ''}>
                70% mastery {progress.masteryLevel >= 70 ? '✓' : `(${progress.masteryLevel}%/70%)`}
              </li>
              <li className={progress.totalAttempts >= 5 ? 'text-green-600 font-medium' : ''}>
                5 total attempts {progress.totalAttempts >= 5 ? '✓' : `(${progress.totalAttempts}/5)`}
              </li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}