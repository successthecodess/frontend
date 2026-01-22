'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  ArrowLeft,
  Shuffle,
  CheckCircle,
  XCircle,
  BarChart3,
  Brain,
  Zap,
  Star,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Download,
  Share2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface DifficultyBreakdown {
  correct: number;
  total: number;
  accuracy: number | null;
}

interface TopicPerformance {
  topicId: string;
  name: string;
  accuracy: number;
  correct: number;
  total: number;
}

interface UnitPerformance {
  unitId: string;
  name: string;
  unitNumber: number;
  accuracy: number;
  correct: number;
  total: number;
}

interface SessionSummary {
  sessionId: string;
  unitId: string | null;
  unitName: string;
  isMixedMode: boolean;
  completedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  totalTimeSpent: number;
  avgTimePerQuestion: number;
  byDifficulty: {
    easy: DifficultyBreakdown;
    medium: DifficultyBreakdown;
    hard: DifficultyBreakdown;
  };
  byTopic: TopicPerformance[];
  byUnit: UnitPerformance[];
  apScore: number;
  apScoreConfidence: string;
  apScoreBreakdown: {
    rawAccuracy: number;
    weightedAccuracy: number;
    avgDifficulty: string;
    questionsAnswered: number;
  };
  strengths: TopicPerformance[];
  weaknesses: TopicPerformance[];
  recommendations: string[];
  performanceLevel: string;
}

export default function SessionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;

  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadResults();
    }
  }, [sessionId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.endPracticeSession(sessionId);

      if (response.success && response.data?.summary) {
        setSummary(response.data.summary);
      } else {
        throw new Error('Failed to load session results');
      }
    } catch (err: any) {
      console.error('Failed to load results:', err);
      setError(err.message || 'Failed to load session results');
    } finally {
      setLoading(false);
    }
  };

  const getAPScoreColor = (score: number) => {
    switch (score) {
      case 5:
        return 'from-emerald-500 to-green-600';
      case 4:
        return 'from-blue-500 to-indigo-600';
      case 3:
        return 'from-yellow-500 to-orange-500';
      case 2:
        return 'from-orange-500 to-red-500';
      default:
        return 'from-red-500 to-red-700';
    }
  };

  const getAPScoreDescription = (score: number) => {
    switch (score) {
      case 5:
        return 'Extremely well qualified';
      case 4:
        return 'Well qualified';
      case 3:
        return 'Qualified';
      case 2:
        return 'Possibly qualified';
      default:
        return 'No recommendation';
    }
  };

  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Satisfactory':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Needs Improvement':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'text-green-600 bg-green-50';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'Low':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-red-600 bg-red-50';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGrade = (accuracy: number) => {
    if (accuracy >= 90) return { grade: 'A', color: 'text-emerald-600' };
    if (accuracy >= 80) return { grade: 'B', color: 'text-blue-600' };
    if (accuracy >= 70) return { grade: 'C', color: 'text-yellow-600' };
    if (accuracy >= 60) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load results</h2>
          <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
          <Button onClick={() => router.push('/dashboard/practice')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Practice
          </Button>
        </Card>
      </div>
    );
  }

  const { grade, color: gradeColor } = getGrade(summary.accuracy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {summary.isMixedMode ? 'Mixed Practice' : summary.unitName} Complete!
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your detailed performance analysis
          </p>
        </div>

        {/* AP Score Card - Hero Section */}
        <Card className="overflow-hidden shadow-2xl">
          <div className={`bg-gradient-to-r ${getAPScoreColor(summary.apScore)} p-8 text-white`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">
                  Predicted AP Score
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-8xl font-bold">{summary.apScore}</span>
                  <span className="text-3xl font-light text-white/80">/ 5</span>
                </div>
                <p className="text-xl mt-2 text-white/90">
                  {getAPScoreDescription(summary.apScore)}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getConfidenceColor(summary.apScoreConfidence)}`}>
                  {summary.apScoreConfidence} Confidence
                </div>
                <div className="text-center text-white/80 text-sm">
                  Based on {summary.totalQuestions} questions
                </div>
              </div>
            </div>
          </div>

          {/* AP Score Breakdown */}
          <div className="p-6 bg-white">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Score Calculation Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">
                  {summary.apScoreBreakdown.rawAccuracy}%
                </p>
                <p className="text-xs text-gray-600">Raw Accuracy</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-indigo-600">
                  {summary.apScoreBreakdown.weightedAccuracy}%
                </p>
                <p className="text-xs text-gray-600">Weighted Score</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">
                  {summary.apScoreBreakdown.avgDifficulty}
                </p>
                <p className="text-xs text-gray-600">Avg Difficulty</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">
                  {summary.apScoreBreakdown.questionsAnswered}
                </p>
                <p className="text-xs text-gray-600">Questions</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-700">{summary.correctAnswers}</p>
            <p className="text-sm text-green-600">Correct</p>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-700">{summary.incorrectAnswers}</p>
            <p className="text-sm text-red-600">Incorrect</p>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <Target className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-indigo-700">{summary.accuracy}%</p>
            <p className="text-sm text-indigo-600">Accuracy</p>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className={`text-4xl font-bold ${gradeColor}`}>{grade}</p>
            <p className="text-sm text-amber-600">Grade</p>
          </Card>
        </div>

        {/* Performance Level & Time Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Performance Level */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Performance Level
            </h3>
            <div className={`p-4 rounded-xl border-2 ${getPerformanceLevelColor(summary.performanceLevel)}`}>
              <p className="text-2xl font-bold">{summary.performanceLevel}</p>
              <p className="text-sm mt-1 opacity-80">
                {summary.performanceLevel === 'Excellent' && 'Outstanding work! You\'re well-prepared for the AP exam.'}
                {summary.performanceLevel === 'Good' && 'Great progress! Keep practicing to reach excellence.'}
                {summary.performanceLevel === 'Satisfactory' && 'You\'re on the right track. Focus on weak areas.'}
                {summary.performanceLevel === 'Needs Improvement' && 'More practice needed. Review the fundamentals.'}
                {summary.performanceLevel === 'Struggling' && 'Don\'t give up! Start with easier questions and build up.'}
              </p>
            </div>
          </Card>

          {/* Time Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Time Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Time</span>
                <span className="font-bold text-gray-900">{formatTime(summary.totalTimeSpent)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Average per Question</span>
                <span className="font-bold text-gray-900">{formatTime(summary.avgTimePerQuestion)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Target (AP Exam)</span>
                <span className="font-medium text-gray-500">~78 seconds</span>
              </div>
              {summary.avgTimePerQuestion <= 78 ? (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Zap className="h-4 w-4" />
                  Great pace! You're within AP exam timing.
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Try to improve speed for the actual exam.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Difficulty Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            Performance by Difficulty
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Easy */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  Easy
                </span>
                <span className="text-sm text-gray-600">
                  {summary.byDifficulty.easy.correct}/{summary.byDifficulty.easy.total}
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                  style={{ width: `${summary.byDifficulty.easy.accuracy || 0}%` }}
                />
              </div>
              <p className="text-right text-sm font-semibold text-gray-700 mt-1">
                {summary.byDifficulty.easy.accuracy !== null ? `${summary.byDifficulty.easy.accuracy}%` : 'N/A'}
              </p>
            </div>

            {/* Medium */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                  Medium
                </span>
                <span className="text-sm text-gray-600">
                  {summary.byDifficulty.medium.correct}/{summary.byDifficulty.medium.total}
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                  style={{ width: `${summary.byDifficulty.medium.accuracy || 0}%` }}
                />
              </div>
              <p className="text-right text-sm font-semibold text-gray-700 mt-1">
                {summary.byDifficulty.medium.accuracy !== null ? `${summary.byDifficulty.medium.accuracy}%` : 'N/A'}
              </p>
            </div>

            {/* Hard */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                  Hard
                </span>
                <span className="text-sm text-gray-600">
                  {summary.byDifficulty.hard.correct}/{summary.byDifficulty.hard.total}
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500"
                  style={{ width: `${summary.byDifficulty.hard.accuracy || 0}%` }}
                />
              </div>
              <p className="text-right text-sm font-semibold text-gray-700 mt-1">
                {summary.byDifficulty.hard.accuracy !== null ? `${summary.byDifficulty.hard.accuracy}%` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Unit Performance (Mixed Mode) */}
        {summary.isMixedMode && summary.byUnit && summary.byUnit.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Performance by Unit
            </h3>
            <div className="space-y-4">
              {summary.byUnit.map((unit) => (
                <div key={unit.unitId} className="flex items-center gap-4">
                  <div className="w-24 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      Unit {unit.unitNumber}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {unit.name}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {unit.correct}/{unit.total} ({Math.round(unit.accuracy)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          unit.accuracy >= 70
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : unit.accuracy >= 50
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                            : 'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${unit.accuracy}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Strengths
            </h3>
            {summary.strengths && summary.strengths.length > 0 ? (
              <div className="space-y-3">
                {summary.strengths.map((topic, index) => (
                  <div
                    key={topic.topicId}
                    className="flex items-center justify-between p-3 bg-white/70 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{topic.name}</span>
                    </div>
                    <span className="font-bold text-green-700">{Math.round(topic.accuracy)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                Complete more questions to identify your strengths.
              </p>
            )}
          </Card>

          {/* Weaknesses */}
          <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Areas to Improve
            </h3>
            {summary.weaknesses && summary.weaknesses.length > 0 ? (
              <div className="space-y-3">
                {summary.weaknesses.map((topic, index) => (
                  <div
                    key={topic.topicId}
                    className="flex items-center justify-between p-3 bg-white/70 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{topic.name}</span>
                    </div>
                    <span className="font-bold text-red-700">{Math.round(topic.accuracy)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                Great job! No major weaknesses identified yet.
              </p>
            )}
          </Card>
        </div>

        {/* Recommendations */}
        {summary.recommendations && summary.recommendations.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Personalized Recommendations
            </h3>
            <div className="space-y-3">
              {summary.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white/70 rounded-lg"
                >
                  <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AP Score Scale Reference */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            AP Score Scale Reference
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {[5, 4, 3, 2, 1].map((score) => (
              <div
                key={score}
                className={`p-4 rounded-xl text-center transition-all ${
                  score === summary.apScore
                    ? `bg-gradient-to-br ${getAPScoreColor(score)} text-white shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <p className="text-2xl font-bold">{score}</p>
                <p className="text-xs mt-1">
                  {score === 5 && 'Extremely well qualified'}
                  {score === 4 && 'Well qualified'}
                  {score === 3 && 'Qualified'}
                  {score === 2 && 'Possibly qualified'}
                  {score === 1 && 'No recommendation'}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Your predicted score is based on your accuracy and the difficulty of questions answered.
            Continue practicing to improve your prediction confidence.
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/dashboard/practice')}
            className="flex-1 sm:flex-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Practice
          </Button>
          
          <Button
            size="lg"
            onClick={() => router.push('/dashboard/practice/mixed?questions=10')}
            className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Practice Again
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="flex-1 sm:flex-none"
          >
            Dashboard
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Session Info Footer */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Session completed on {new Date(summary.completedAt).toLocaleString()}</p>
          <p className="text-xs mt-1">Session ID: {summary.sessionId}</p>
        </div>
      </div>
    </div>
  );
}