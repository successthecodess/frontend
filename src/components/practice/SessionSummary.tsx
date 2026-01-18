// components/practice/SessionSummary.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  BarChart3,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Home,
  Star,
  AlertCircle
} from 'lucide-react';
import type { Unit } from '@/types';

interface SessionSummaryProps {
  summary: {
    unitName: string;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    totalTimeSpent: number;
    avgTimePerQuestion: number;
    byDifficulty: {
      easy: { correct: number; total: number; accuracy: number | null };
      medium: { correct: number; total: number; accuracy: number | null };
      hard: { correct: number; total: number; accuracy: number | null };
    };
    byTopic: Array<{
      topicId: string;
      name: string;
      accuracy: number;
      correct: number;
      total: number;
    }>;
    apScore: number;
    apScoreConfidence: string;
    apScoreBreakdown: {
      rawAccuracy: number;
      weightedAccuracy: number;
      avgDifficulty: string;
      questionsAnswered: number;
    };
    strengths: Array<{ name: string; accuracy: number }>;
    weaknesses: Array<{ name: string; accuracy: number }>;
    recommendations: string[];
    performanceLevel: string;
  };
  unit: Unit;
  onReturnToDashboard: () => void;
  onRetry: () => void;
}

export function SessionSummary({ 
  summary, 
  unit, 
  onReturnToDashboard, 
  onRetry 
}: SessionSummaryProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 4) return 'bg-green-100 border-green-300';
    if (score >= 3) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (level: string) => {
    const styles: Record<string, string> = {
      'Excellent': 'bg-green-100 text-green-800 border-green-300',
      'Good': 'bg-blue-100 text-blue-800 border-blue-300',
      'Satisfactory': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Needs Improvement': 'bg-orange-100 text-orange-800 border-orange-300',
      'Struggling': 'bg-red-100 text-red-800 border-red-300'
    };
    return styles[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Session Complete!
          </h1>
          <p className="text-gray-600">{summary.unitName}</p>
          <div className={`inline-block mt-3 px-4 py-1 rounded-full border ${getPerformanceBadge(summary.performanceLevel)}`}>
            {summary.performanceLevel}
          </div>
        </div>

        {/* AP Score Card */}
        <Card className={`p-6 mb-6 border-2 ${getScoreBg(summary.apScore)}`}>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Predicted AP Score</p>
            <div className="flex items-center justify-center gap-4">
              <div className={`text-6xl font-bold ${getScoreColor(summary.apScore)}`}>
                {summary.apScore}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= summary.apScore 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Confidence: <span className="font-medium">{summary.apScoreConfidence}</span>
                </p>
              </div>
            </div>
            {summary.apScoreConfidence === 'Low' || summary.apScoreConfidence === 'Very Low' ? (
              <p className="text-xs text-gray-500 mt-3">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Complete more questions for a more accurate prediction
              </p>
            ) : null}
          </div>
        </Card>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
            <p className="text-2xl font-bold text-gray-900">{summary.accuracy}%</p>
            <p className="text-sm text-gray-600">Accuracy</p>
          </Card>
          
          <Card className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">
              {summary.correctAnswers}/{summary.totalQuestions}
            </p>
            <p className="text-sm text-gray-600">Correct</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(summary.totalTimeSpent)}
            </p>
            <p className="text-sm text-gray-600">Total Time</p>
          </Card>
          
          <Card className="p-4 text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(summary.avgTimePerQuestion)}
            </p>
            <p className="text-sm text-gray-600">Avg per Q</p>
          </Card>
        </div>

        {/* Difficulty Breakdown */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Performance by Difficulty
          </h3>
          <div className="space-y-4">
            {(['easy', 'medium', 'hard'] as const).map((diff) => {
              const data = summary.byDifficulty[diff];
              if (data.total === 0) return null;
              
              const colors = {
                easy: { bg: 'bg-green-500', light: 'bg-green-100' },
                medium: { bg: 'bg-yellow-500', light: 'bg-yellow-100' },
                hard: { bg: 'bg-red-500', light: 'bg-red-100' }
              };
              
              return (
                <div key={diff}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium capitalize">{diff}</span>
                    <span className={getAccuracyColor(data.accuracy || 0)}>
                      {data.correct}/{data.total} ({data.accuracy}%)
                    </span>
                  </div>
                  <div className={`h-3 rounded-full ${colors[diff].light}`}>
                    <div 
                      className={`h-full rounded-full ${colors[diff].bg} transition-all`}
                      style={{ width: `${data.accuracy || 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <Card className="p-6 border-green-200 bg-green-50/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Strengths
            </h3>
            {summary.strengths.length > 0 ? (
              <ul className="space-y-2">
                {summary.strengths.map((s, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-gray-700">{s.name}</span>
                    <span className="text-green-600 font-medium">{Math.round(s.accuracy)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Complete more questions to identify strengths</p>
            )}
          </Card>

          {/* Weaknesses */}
          <Card className="p-6 border-red-200 bg-red-50/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Areas to Improve
            </h3>
            {summary.weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {summary.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-gray-700">{w.name}</span>
                    <span className="text-red-600 font-medium">{Math.round(w.accuracy)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Great job! No major weaknesses identified</p>
            )}
          </Card>
        </div>

        {/* Recommendations */}
        {summary.recommendations.length > 0 && (
          <Card className="p-6 mb-6 border-indigo-200 bg-indigo-50/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {summary.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Topic Breakdown */}
        {summary.byTopic.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance by Topic
            </h3>
            <div className="space-y-3">
              {summary.byTopic.map((topic) => (
                <div key={topic.topicId} className="flex items-center justify-between">
                  <span className="text-gray-700 flex-1">{topic.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {topic.correct}/{topic.total}
                    </span>
                    <span className={`font-medium w-12 text-right ${getAccuracyColor(topic.accuracy)}`}>
                      {Math.round(topic.accuracy)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRetry}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Practice Again
          </Button>
          <Button
            onClick={onReturnToDashboard}
            variant="outline"
            size="lg"
          >
            <Home className="h-5 w-5 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}