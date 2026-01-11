'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Code,
  BarChart3,
  BookOpen,
  ArrowRight,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { examApi } from '@/lib/examApi';

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examAttemptId = params.examAttemptId as string;

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    loadResults();
  }, [examAttemptId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExamResults(examAttemptId);

      if (response.data.status === 'SUBMITTED') {
        // Still grading - poll every 5 seconds
        setPolling(true);
        setTimeout(() => loadResults(), 5000);
      } else {
        setResults(response.data);
        setPolling(false);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
      alert('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results || results.status !== 'GRADED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Card className="p-12 max-w-2xl text-center">
          <div className="animate-pulse">
            <Loader2 className="h-16 w-16 text-indigo-600 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Grading Your FRQ Responses...
            </h2>
            <p className="text-gray-600 mb-6">
              Our AI is carefully evaluating your code using official AP CS A rubrics.
              This usually takes 30-60 seconds.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✓ MCQ Section: Graded ({results?.mcqScore}/42)</p>
              <p className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                FRQ Section: Grading in progress...
              </p>
            </div>
            <Button
              onClick={loadResults}
              variant="outline"
              className="mt-6"
              disabled={polling}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${polling ? 'animate-spin' : ''}`} />
              Check Status
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getAPScoreColor = (score: number) => {
    if (score === 5) return 'from-green-500 to-emerald-600';
    if (score === 4) return 'from-blue-500 to-indigo-600';
    if (score === 3) return 'from-yellow-500 to-orange-500';
    if (score === 2) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const getAPScoreLabel = (score: number) => {
    if (score === 5) return 'Extremely Well Qualified';
    if (score === 4) return 'Well Qualified';
    if (score === 3) return 'Qualified';
    if (score === 2) return 'Possibly Qualified';
    return 'No Recommendation';
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { label: 'Exceptional', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 80) return { label: 'Strong', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 70) return { label: 'Good', color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (percentage >= 60) return { label: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Needs Improvement', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const mcqPerformance = getPerformanceLevel(results.mcqPercentage || 0);
  const frqPerformance = getPerformanceLevel(results.frqTotalScore / 36 * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Exam Complete!
          </h1>
          <p className="text-gray-600">
            Here's your detailed performance report
          </p>
        </div>

        {/* AP Score Card */}
        <Card className={`p-8 mb-8 bg-gradient-to-br ${getAPScoreColor(results.predictedAPScore)} text-white`}>
          <div className="text-center">
            <p className="text-white/90 text-lg mb-2">Predicted AP Score</p>
            <div className="text-8xl font-bold mb-4">{results.predictedAPScore}</div>
            <p className="text-2xl font-semibold mb-2">{getAPScoreLabel(results.predictedAPScore)}</p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <Target className="h-5 w-5" />
              <span className="font-semibold">{results.percentageScore?.toFixed(1)}% Overall</span>
            </div>
          </div>
        </Card>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* MCQ Score */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Multiple Choice</h3>
                <p className="text-sm text-gray-600">Section I • 55% of score</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Score</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {results.mcqScore}/42
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                    style={{ width: `${(results.mcqScore / 42) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {results.mcqScore}
                  </p>
                  <p className="text-xs text-gray-600">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {42 - results.mcqScore}
                  </p>
                  <p className="text-xs text-gray-600">Incorrect</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {results.mcqPercentage?.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-600">Accuracy</p>
                </div>
              </div>

              <div className={`${mcqPerformance.bg} rounded-lg p-3 text-center`}>
                <p className={`font-semibold ${mcqPerformance.color}`}>
                  {mcqPerformance.label} Performance
                </p>
              </div>
            </div>
          </Card>

          {/* FRQ Score */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                <Code className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Free Response</h3>
                <p className="text-sm text-gray-600">Section II • 45% of score</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Score</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {results.frqTotalScore?.toFixed(1)}/36
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-1000"
                    style={{ width: `${(results.frqTotalScore / 36) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-4 border-t">
                {results.frqDetails?.map((frq: any, index: number) => (
                  <div key={index} className="text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {frq.score?.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-600">Q{index + 1}</p>
                  </div>
                ))}
              </div>

              <div className={`${frqPerformance.bg} rounded-lg p-3 text-center`}>
                <p className={`font-semibold ${frqPerformance.color}`}>
                  {frqPerformance.label} Performance
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* FRQ Detailed Breakdown */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Code className="h-6 w-6 text-purple-600" />
            FRQ Detailed Results
          </h3>

          <div className="space-y-6">
            {results.frqDetails?.map((frq: any, index: number) => (
              <div key={index} className="border rounded-lg p-6 bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Question {index + 1}: {['Methods & Control', 'Classes', 'ArrayList', '2D Array'][index]}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Score: <span className="font-semibold text-purple-600">{frq.score?.toFixed(1)}/{frq.maxScore}</span>
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${
                    (frq.score / frq.maxScore) >= 0.8 ? 'bg-green-100 text-green-800' :
                    (frq.score / frq.maxScore) >= 0.6 ? 'bg-blue-100 text-blue-800' :
                    (frq.score / frq.maxScore) >= 0.4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {((frq.score / frq.maxScore) * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Rubric Breakdown */}
                {frq.evaluation?.rubricScores && (
                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-semibold text-gray-700">Rubric Breakdown:</p>
                    {frq.evaluation.rubricScores.map((rubric: any, i: number) => (
                      <div key={i} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {rubric.criterion}
                          </span>
                          <span className={`text-sm font-bold ${
                            rubric.earned === rubric.possible ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {rubric.earned}/{rubric.possible} pts
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{rubric.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Penalties */}
                {frq.evaluation?.penalties && frq.evaluation.penalties.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-red-900 mb-2">Penalties Applied:</p>
                    {frq.evaluation.penalties.map((penalty: any, i: number) => (
                      <div key={i} className="text-xs text-red-800 mb-1">
                        • {penalty.type}: -{penalty.points} pt(s) - {penalty.reason}
                      </div>
                    ))}
                  </div>
                )}

                {/* General Feedback */}
                {frq.evaluation?.generalFeedback && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Feedback:</p>
                    <p className="text-sm text-blue-800">{frq.evaluation.generalFeedback}</p>
                  </div>
                )}

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {frq.evaluation?.strengths && frq.evaluation.strengths.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Strengths:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {frq.evaluation.strengths.map((strength: string, i: number) => (
                          <li key={i}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {frq.evaluation?.improvements && frq.evaluation.improvements.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Areas for Improvement:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {frq.evaluation.improvements.map((improvement: string, i: number) => (
                          <li key={i}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Unit Performance */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            Performance by Unit
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {results.unitBreakdown && Object.entries(results.unitBreakdown).map(([key, data]: [string, any]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{data.unitName}</p>
                    <p className="text-xs text-gray-600">
                      {data.mcqCorrect}/{data.mcqTotal} questions correct
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${
                    data.mcqPercentage >= 75 ? 'text-green-600' :
                    data.mcqPercentage >= 60 ? 'text-blue-600' :
                    data.mcqPercentage >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {data.mcqPercentage.toFixed(0)}%
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      data.mcqPercentage >= 75 ? 'bg-green-500' :
                      data.mcqPercentage >= 60 ? 'bg-blue-500' :
                      data.mcqPercentage >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${data.mcqPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {results.strengths?.map((strength: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Weaknesses */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Focus Areas
            </h3>
            <ul className="space-y-2">
              {results.weaknesses?.map((weakness: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                  <Target className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Personalized Recommendations
          </h3>

          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Overall Assessment:</p>
              <p className="text-gray-700">{results.recommendations?.overall}</p>
            </div>

            {results.recommendations?.studyFocus && results.recommendations.studyFocus.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">Study Focus:</p>
                <ul className="space-y-1">
                  {results.recommendations.studyFocus.map((focus: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-600" />
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.recommendations?.nextSteps && results.recommendations.nextSteps.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">Next Steps:</p>
                <ul className="space-y-1">
                  {results.recommendations.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-600" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Return to Dashboard
            </Button>
          </Link>
          <Link href="/full-exam">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <RefreshCw className="h-5 w-5 mr-2" />
              Take Another Exam
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Your results have been saved. You can access them anytime from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}