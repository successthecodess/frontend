'use client';

import { Card } from '@/components/ui/card';
import { Brain, Target, TrendingUp, Award } from 'lucide-react';
import type { StudySession, ProgressMetrics } from '@/types';

interface SessionProgressCardProps {
  session: StudySession;
  progress?: ProgressMetrics;
  targetQuestions: number;
}

export function SessionProgressCard({
  session,
  progress,
  targetQuestions,
}: SessionProgressCardProps) {
  const accuracy = session.totalQuestions > 0
    ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
    : 0;

  const questionsRemaining = targetQuestions - session.totalQuestions;

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-bold">Session Progress</h2>
      
      <div className="space-y-4">
        {/* Accuracy */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Accuracy</span>
            <span className="font-bold text-indigo-600">{accuracy}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* Student's Difficulty Level */}
        {progress && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              <span>Your Level</span>
            </div>
            <span className="font-bold capitalize text-indigo-600">
              {progress.currentDifficulty.toLowerCase()}
            </span>
          </div>
        )}

        {/* Correct Streak */}
        {progress && progress.consecutiveCorrect > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Correct Streak</span>
            </div>
            <span className="font-bold text-green-600">
              {progress.consecutiveCorrect} 🔥
            </span>
          </div>
        )}

        {/* Mastery Level */}
        {progress && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="h-4 w-4" />
              <span>Mastery Level</span>
            </div>
            <span className="font-bold text-purple-600">
              {progress.masteryLevel}%
            </span>
          </div>
        )}

        {/* Questions Remaining */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Questions Remaining</span>
            <span className="font-bold text-gray-900">
              {questionsRemaining} / {targetQuestions}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}