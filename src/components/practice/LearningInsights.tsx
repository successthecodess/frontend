import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';
import type { DifficultyLevel } from '@/types';

interface LearningInsightsProps {
  insights: {
    masteryLevel?: number;
    currentDifficulty?: DifficultyLevel;
    accuracy?: number;
    totalAttempts?: number;
    averageTimePerQuestion?: number;
    nextReviewDate?: string;
    weakTopics?: string[];
    strongTopics?: string[];
    recommendations?: string[];
  };
  currentDifficulty?: DifficultyLevel;
}

export function LearningInsights({ insights, currentDifficulty }: LearningInsightsProps) {
  const difficulty = currentDifficulty || insights.currentDifficulty || 'EASY';

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Learning Insights
      </h3>

      <div className="space-y-4">
        {/* Mastery Level */}
        {typeof insights.masteryLevel === 'number' && (
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Mastery</span>
              <span className="font-semibold text-gray-900">
                {Math.round(insights.masteryLevel)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                style={{ width: `${insights.masteryLevel}%` }}
              />
            </div>
          </div>
        )}

        {/* Current Difficulty */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Level</span>
          <Badge
            variant={
              difficulty === 'EXPERT'
                ? 'default'
                : difficulty === 'HARD'
                ? 'default'
                : difficulty === 'MEDIUM'
                ? 'secondary'
                : 'outline'
            }
            className="capitalize"
          >
            {difficulty.toLowerCase()}
          </Badge>
        </div>

        {/* Accuracy */}
        {typeof insights.accuracy === 'number' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Accuracy</span>
            <span className="font-semibold text-gray-900">
              {Math.round(insights.accuracy)}%
            </span>
          </div>
        )}

        {/* Average Time */}
        {typeof insights.averageTimePerQuestion === 'number' && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Avg Time</span>
            </div>
            <span className="font-semibold text-gray-900">
              {Math.round(insights.averageTimePerQuestion)}s
            </span>
          </div>
        )}

        {/* Strong Topics */}
        {insights.strongTopics && insights.strongTopics.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Strong Areas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.strongTopics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-green-700">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Weak Topics */}
        {insights.weakTopics && insights.weakTopics.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span>Needs Practice</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.weakTopics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-orange-700">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div className="rounded-lg bg-indigo-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-900">
              <Target className="h-4 w-4" />
              <span>Recommendations</span>
            </div>
            <ul className="space-y-1 text-sm text-indigo-800">
              {insights.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 text-xs">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}