'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Target,
  Clock,
  TrendingUp,
  RotateCcw,
  Home,
} from 'lucide-react';
import type { SessionSummary } from '@/types';

interface SessionCompleteProps {
  summary: SessionSummary;
  unitName: string;
  onRetry: () => void;
  onBackToDashboard: () => void;
}

export function SessionComplete({
  summary,
  unitName,
  onRetry,
  onBackToDashboard,
}: SessionCompleteProps) {
  const accuracyPercentage = summary.accuracyRate || 0;
  const grade = getGrade(accuracyPercentage);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <CheckCircle className="h-12 w-12" />
            </div>
          </div>
          <h1 className="mb-2 text-center text-3xl font-bold">
            Session Complete!
          </h1>
          <p className="text-center text-lg text-white/90">{unitName}</p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-6 p-8 md:grid-cols-4">
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-indigo-600">
              {summary.totalQuestions}
            </div>
            <p className="text-sm text-gray-600">Questions</p>
          </div>

          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-green-600">
              {summary.correctAnswers}
            </div>
            <p className="text-sm text-gray-600">Correct</p>
          </div>

          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-purple-600">
              {accuracyPercentage}%
            </div>
            <p className="text-sm text-gray-600">Accuracy</p>
          </div>

          <div className="text-center">
            <Badge
              variant={
                grade === 'A'
                  ? 'default'
                  : grade === 'B'
                  ? 'secondary'
                  : 'outline'
              }
              className="mb-2 text-2xl font-bold px-4 py-2"
            >
              {grade}
            </Badge>
            <p className="text-sm text-gray-600">Grade</p>
          </div>
        </div>
      </Card>

      {/* Detailed Stats */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        {/* Time Stats */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Time Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Time</span>
              <span className="font-semibold text-gray-900">
                {formatTime(summary.totalDuration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg per Question</span>
              <span className="font-semibold text-gray-900">
                {summary.averageTime}s
              </span>
            </div>
          </div>
        </Card>

        {/* Performance */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Correct</span>
              <span className="font-semibold text-green-600">
                {summary.correctAnswers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Incorrect</span>
              <span className="font-semibold text-red-600">
                {summary.totalQuestions - summary.correctAnswers}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Response Breakdown */}
      {summary.responses && summary.responses.length > 0 && (
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Question Breakdown
            </h3>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {summary.responses.map((response, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">
                    Q{idx + 1}
                  </span>
                  {response.topic && (
                    <Badge variant="outline" className="text-xs">
                      {response.topic}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {response.timeSpent && (
                    <span className="text-xs text-gray-500">
                      {response.timeSpent}s
                    </span>
                  )}
                  {response.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={onBackToDashboard}
          variant="outline"
          className="flex-1 gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button onClick={onRetry} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          Practice Again
        </Button>
      </div>
    </div>
  );
}

function getGrade(accuracy: number): string {
  if (accuracy >= 90) return 'A';
  if (accuracy >= 80) return 'B';
  if (accuracy >= 70) return 'C';
  if (accuracy >= 60) return 'D';
  return 'F';
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}