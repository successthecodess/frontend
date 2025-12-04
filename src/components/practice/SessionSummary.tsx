'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Clock, TrendingUp, Home, RefreshCw } from 'lucide-react';
import type { Unit } from '@/types';

interface SessionSummaryProps {
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    accuracyRate: number;
    totalDuration: number;
    averageTime: number;
    responses: Array<{
      questionId: string;
      isCorrect: boolean;
      timeSpent: number;
      topic: string;
    }>;
  };
  unit: Unit;
  onReturnToDashboard: () => void;
  onRetry: () => void;
}

export function SessionSummary({
  summary,
  unit,
  onReturnToDashboard,
  onRetry,
}: SessionSummaryProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (summary.accuracyRate >= 90) {
      return {
        title: 'Outstanding! 🌟',
        message: 'You have excellent mastery of this material!',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    } else if (summary.accuracyRate >= 75) {
      return {
        title: 'Great Work! 🎯',
        message: 'You\'re showing strong understanding. Keep it up!',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    } else if (summary.accuracyRate >= 60) {
      return {
        title: 'Good Progress 📈',
        message: 'You\'re learning well. Review the feedback to improve further.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      };
    } else {
      return {
        title: 'Keep Practicing 💪',
        message: 'Review the concepts and try again. You\'ll improve with practice!',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      };
    }
  };

  const performance = getPerformanceMessage();

  // Group responses by topic
  const topicStats: Record<string, { correct: number; total: number }> = {};
  summary.responses.forEach((response) => {
    if (!topicStats[response.topic]) {
      topicStats[response.topic] = { correct: 0, total: 0 };
    }
    topicStats[response.topic].total++;
    if (response.isCorrect) {
      topicStats[response.topic].correct++;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Session Complete!</h1>
          <p className="mt-2 text-lg text-gray-600">{unit.name}</p>
        </div>

        {/* Performance Message */}
        <Card className={`mb-6 border-2 ${performance.borderColor} ${performance.bgColor} p-6`}>
          <h2 className={`text-2xl font-bold ${performance.color}`}>
            {performance.title}
          </h2>
          <p className="mt-2 text-gray-700">{performance.message}</p>
        </Card>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Questions */}
          <Card className="p-6 text-center">
            <Target className="mx-auto mb-2 h-8 w-8 text-indigo-600" />
            <p className="text-sm text-gray-600">Questions</p>
            <p className="text-3xl font-bold text-gray-900">
              {summary.totalQuestions}
            </p>
          </Card>

          {/* Accuracy */}
          <Card className="p-6 text-center">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-3xl font-bold text-gray-900">
              {summary.accuracyRate}%
            </p>
          </Card>

          {/* Correct Answers */}
          <Card className="p-6 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <span className="text-lg font-bold text-green-600">✓</span>
            </div>
            <p className="text-sm text-gray-600">Correct</p>
            <p className="text-3xl font-bold text-green-600">
              {summary.correctAnswers}
            </p>
          </Card>

          {/* Time */}
          <Card className="p-6 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-blue-600" />
            <p className="text-sm text-gray-600">Total Time</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatTime(summary.totalDuration)}
            </p>
          </Card>
        </div>

        {/* Performance Breakdown */}
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-900">
            Performance Breakdown
          </h3>
          
          {/* Overall Progress Bar */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Overall Performance
              </span>
              <span className="text-sm font-bold text-indigo-600">
                {summary.correctAnswers} / {summary.totalQuestions}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                style={{ width: `${summary.accuracyRate}%` }}
              />
            </div>
          </div>

          {/* Topic Breakdown */}
          {Object.keys(topicStats).length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                By Topic
              </h4>
              <div className="space-y-3">
                {Object.entries(topicStats).map(([topic, stats]) => {
                  const accuracy = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={topic}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-gray-700">{topic}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {stats.correct} / {stats.total} ({accuracy}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            accuracy >= 80
                              ? 'bg-green-500'
                              : accuracy >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Additional Stats */}
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-900">
            Time Analysis
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-gray-600">Average per Question</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatTime(summary.averageTime)}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm text-gray-600">Total Session Time</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatTime(summary.totalDuration)}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={onReturnToDashboard}
            size="lg"
            variant="outline"
            className="flex-1 gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
          <Button
            onClick={onRetry}
            size="lg"
            className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <RefreshCw className="h-4 w-4" />
            Practice Again
          </Button>
        </div>
      </div>
    </div>
  );
}