'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  BarChart3,
  Sparkles,
  Award,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

interface SessionSummaryProps {
  summary: any;
  unit: any;
  onReturnToDashboard: () => void;
  onRetry: () => void;
}

export function SessionSummary({
  summary,
  unit,
  onReturnToDashboard,
  onRetry,
}: SessionSummaryProps) {
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    // Show AI section after a brief delay for dramatic effect
    const timer = setTimeout(() => setShowAI(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const aiAnalysis = summary.aiAnalysis;
  const accuracy = summary.accuracy;

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600';
    if (score === 5) return 'text-green-600';
    if (score === 4) return 'text-blue-600';
    if (score === 3) return 'text-yellow-600';
    if (score === 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score === 5) return 'bg-green-100';
    if (score === 4) return 'bg-blue-100';
    if (score === 3) return 'bg-yellow-100';
    if (score === 2) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Session Complete!</h1>
          <p className="text-xl text-gray-600">{unit?.name}</p>
        </div>

        {/* Main Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Correct</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.correctAnswers}/{summary.totalQuestions}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{accuracy.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mastery</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.masteryLevel}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Analysis Section */}
        {aiAnalysis && showAI && (
          <div className="space-y-4 mb-6 animate-fade-in">
            {/* Predicted AP Score */}
            {aiAnalysis.predictedAPScore && (
              <Card className={`p-6 border-2 ${getScoreBgColor(aiAnalysis.predictedAPScore)} border-current`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 rounded-full ${getScoreBgColor(aiAnalysis.predictedAPScore)} border-4 border-white shadow-lg flex items-center justify-center`}>
                      <span className={`text-4xl font-bold ${getScoreColor(aiAnalysis.predictedAPScore)}`}>
                        {aiAnalysis.predictedAPScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className={`h-5 w-5 ${getScoreColor(aiAnalysis.predictedAPScore)}`} />
                      <h3 className={`text-lg font-bold ${getScoreColor(aiAnalysis.predictedAPScore)}`}>
                        Predicted AP Score
                      </h3>
                    </div>
                    <p className="text-gray-700">{aiAnalysis.scoreExplanation}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* AI Summary */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis</h3>
                  <p className="text-gray-700 leading-relaxed">{aiAnalysis.summary}</p>
                </div>
              </div>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <Card className="p-6 bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-green-900">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Areas for Improvement */}
              <Card className="p-6 bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <h3 className="font-bold text-orange-900">Areas to Improve</h3>
                </div>
                <ul className="space-y-2">
                  {aiAnalysis.weaknesses.map((weakness: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="p-6 bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-3">Recommended Next Steps</h3>
                  <ul className="space-y-2">
                    {aiAnalysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                        <span className="text-blue-600 font-bold mt-0.5">{idx + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Performance Breakdown */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Breakdown
          </h3>

          {/* By Difficulty */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">By Difficulty</h4>
            <div className="space-y-3">
              {Object.entries(summary.difficultyBreakdown).map(([diff, stats]: [string, any]) => {
                const percentage = (stats.correct / stats.total) * 100;
                return (
                  <div key={diff}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{diff}</span>
                      <span className="text-sm text-gray-600">
                        {stats.correct}/{stats.total} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Topic */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">By Topic</h4>
            <div className="space-y-3">
              {Object.entries(summary.topicBreakdown).map(([topic, stats]: [string, any]) => {
                const percentage = (stats.correct / stats.total) * 100;
                return (
                  <div key={topic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{topic}</span>
                      <span className="text-sm text-gray-600">
                        {stats.correct}/{stats.total} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onRetry}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Practice Again
          </Button>
          <Button
            onClick={onReturnToDashboard}
            className="flex-1"
            size="lg"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}