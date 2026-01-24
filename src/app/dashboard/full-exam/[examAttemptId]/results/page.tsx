'use client';

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  FileText,
  Code,
  BarChart3,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Calendar,
  Mail,
  Star,
  Loader2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
import { examApi } from '@/lib/examApi';
import remarkGfm from 'remark-gfm';

// Lazy load heavy components
const ReactMarkdown = lazy(() => import('react-markdown'));
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then(mod => ({ default: mod.Prism })));
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examAttemptId = params.examAttemptId as string;

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedFRQ, setExpandedFRQ] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  // Markdown components for better rendering
  const markdownComponents = {
    code: ({node, inline, className, children, ...props}: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1rem',
            fontSize: '0.875rem',
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
          {children}
        </code>
      );
    },
    p: ({ node, ...props }: any) => <p className="mb-2 text-gray-800" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc ml-4 mb-2" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal ml-4 mb-2" {...props} />,
    li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold" {...props} />,
  };

  // Memoize calculations
  const mcqOnlyAPScore = useMemo(() => {
    if (!results) return 1;
    const mcqWeighted = (results.mcqScore / 42) * 55;
    const estimatedTotal = mcqWeighted + (45 * 0.6);
    
    if (estimatedTotal >= 75) return 5;
    if (estimatedTotal >= 62) return 4;
    if (estimatedTotal >= 50) return 3;
    if (estimatedTotal >= 37) return 2;
    return 1;
  }, [results]);

  const apScoreRanges = useMemo(() => {
    if (!results) return [];
    const mcqWeighted = (results.mcqScore / 42) * 55;
    
    return [
      {
        label: 'If FRQ is Excellent (90%)',
        score: mcqWeighted + (45 * 0.9),
        apScore: mcqWeighted + (45 * 0.9) >= 75 ? 5 : mcqWeighted + (45 * 0.9) >= 62 ? 4 : mcqWeighted + (45 * 0.9) >= 50 ? 3 : mcqWeighted + (45 * 0.9) >= 37 ? 2 : 1,
      },
      {
        label: 'If FRQ is Good (75%)',
        score: mcqWeighted + (45 * 0.75),
        apScore: mcqWeighted + (45 * 0.75) >= 75 ? 5 : mcqWeighted + (45 * 0.75) >= 62 ? 4 : mcqWeighted + (45 * 0.75) >= 50 ? 3 : mcqWeighted + (45 * 0.75) >= 37 ? 2 : 1,
      },
      {
        label: 'If FRQ is Average (60%)',
        score: mcqWeighted + (45 * 0.6),
        apScore: mcqWeighted + (45 * 0.6) >= 75 ? 5 : mcqWeighted + (45 * 0.6) >= 62 ? 4 : mcqWeighted + (45 * 0.6) >= 50 ? 3 : mcqWeighted + (45 * 0.6) >= 37 ? 2 : 1,
      },
      {
        label: 'If FRQ is Below Average (40%)',
        score: mcqWeighted + (45 * 0.4),
        apScore: mcqWeighted + (45 * 0.4) >= 75 ? 5 : mcqWeighted + (45 * 0.4) >= 62 ? 4 : mcqWeighted + (45 * 0.4) >= 50 ? 3 : mcqWeighted + (45 * 0.4) >= 37 ? 2 : 1,
      },
    ];
  }, [results]);

  const mcqPerformance = useMemo(() => {
    if (!results) return { label: 'N/A', color: 'text-gray-600', bg: 'bg-gray-50' };
    const percentage = results.mcqPercentage || 0;
    if (percentage >= 90) return { label: 'Exceptional', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 80) return { label: 'Strong', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 70) return { label: 'Good', color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (percentage >= 60) return { label: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Needs Improvement', color: 'text-orange-600', bg: 'bg-orange-50' };
  }, [results]);

  // Process unit breakdown data
  const unitPerformance = useMemo(() => {
    if (!results?.unitBreakdown) return [];
    
    const breakdown = typeof results.unitBreakdown === 'string' 
      ? JSON.parse(results.unitBreakdown) 
      : results.unitBreakdown;

    if (!Array.isArray(breakdown)) {
      // Convert object to array
      return Object.values(breakdown)
        .map((unit: any) => ({
          ...unit,
          total: unit.mcqTotal || 0,
          correct: unit.mcqCorrect || 0,
          accuracyPercentage: unit.mcqTotal > 0 ? (unit.mcqCorrect / unit.mcqTotal) * 100 : 0,
        }))
        .sort((a: any, b: any) => b.accuracyPercentage - a.accuracyPercentage);
    }

    return breakdown
      .map((unit: any) => ({
        ...unit,
        accuracyPercentage: unit.total > 0 ? (unit.correct / unit.total) * 100 : 0,
      }))
      .sort((a: any, b: any) => b.accuracyPercentage - a.accuracyPercentage);
  }, [results]);

  useEffect(() => {
    loadResults();
    loadUserInfo();
  }, [examAttemptId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExamResults(examAttemptId);
      console.log('📊 Loaded exam results:', response.data);
      console.log('📊 FRQ Details:', response.data.frqDetails);
      setResults(response.data);
    } catch (error) {
      console.error('Failed to load results:', error);
      alert('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserEmail(user.email || '');
        setUserName(user.name || 'Student');
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

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

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return { bg: 'bg-green-500', text: 'text-green-700', icon: TrendingUp };
    if (percentage >= 80) return { bg: 'bg-blue-500', text: 'text-blue-700', icon: TrendingUp };
    if (percentage >= 70) return { bg: 'bg-indigo-500', text: 'text-indigo-700', icon: Minus };
    if (percentage >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-700', icon: Minus };
    return { bg: 'bg-red-500', text: 'text-red-700', icon: TrendingDown };
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Mastered';
    if (percentage >= 80) return 'Strong';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Satisfactory';
    return 'Needs Work';
  };

  const handleScheduleReview = (frqNumber: number) => {
    const subject = encodeURIComponent(`FRQ ${frqNumber} Review Request - Full Exam`);
    const body = encodeURIComponent(
`Hello,

I recently completed a full practice exam and would like to schedule a review session to go over my Free Response Question ${frqNumber}.

Exam Details:
- Exam Attempt ID: ${examAttemptId}
- FRQ Number: ${frqNumber}
- MCQ Score: ${results.mcqScore}/42 (${results.mcqPercentage?.toFixed(1) || 0}%)
- Date Completed: ${new Date(results.submittedAt).toLocaleDateString()}

Please let me know your availability.

Best regards,
${userName}
${userEmail}
`
    );
    window.location.href = `mailto:daniel@enginearu.com?subject=${subject}&body=${body}`;
  };

  const handleScheduleGeneralReview = () => {
    const subject = encodeURIComponent(`Full Exam Review Request`);
    const body = encodeURIComponent(
`Hello,

I recently completed a full practice exam and would like to schedule a comprehensive review session.

Exam Details:
- Exam Attempt ID: ${examAttemptId}
- MCQ Score: ${results.mcqScore}/42 (${results.mcqPercentage?.toFixed(1) || 0}%)
- Date Completed: ${new Date(results.submittedAt).toLocaleDateString()}

Best regards,
${userName}
${userEmail}
`
    );
    window.location.href = `mailto:daniel@enginearu.com?subject=${subject}&body=${body}`;
  };

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Exam Complete!</h1>
          <p className="text-gray-600">Review your MCQ performance and FRQ solutions below</p>
        </div>

        {/* Score Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <div className="text-center">
              <p className="text-white/90 text-lg mb-2">MCQ Performance</p>
              <div className="text-7xl font-bold mb-4">{results.mcqScore || 0}/42</div>
              <p className="text-2xl font-semibold">{(results.mcqPercentage || 0).toFixed(1)}%</p>
            </div>
          </Card>

          <Card className={`p-8 bg-gradient-to-br ${getAPScoreColor(mcqOnlyAPScore)} text-white`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="h-6 w-6 fill-white" />
                <p className="text-white/90 text-lg">Estimated AP Score</p>
              </div>
              <div className="text-8xl font-bold mb-3">{mcqOnlyAPScore}</div>
              <p className="text-xl font-semibold">{getAPScoreLabel(mcqOnlyAPScore)}</p>
            </div>
          </Card>
        </div>

        {/* AP Score Ranges */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            AP Score Potential with Different FRQ Performance
          </h3>
          <div className="space-y-3">
            {apScoreRanges.map((range, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 bg-gradient-to-r ${getAPScoreColor(range.apScore)} text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{range.label}</p>
                    <p className="text-sm text-white/90">{range.score.toFixed(1)}% Overall</p>
                  </div>
                  <div className="text-4xl font-bold">{range.apScore}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Unit Performance Breakdown */}
        {unitPerformance.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-indigo-600" />
              Performance by Unit
            </h3>
            <div className="space-y-3">
              {unitPerformance.map((unit: any, index: number) => {
                const perfColor = getPerformanceColor(unit.accuracyPercentage);
                const PerformanceIcon = perfColor.icon;
                
                return (
                  <div key={index} className="bg-white border-2 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-gray-900">
                              Unit {unit.unitNumber}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-700">{unit.unitName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600">
                            {unit.correct}/{unit.total} correct
                          </span>
                          <div className={`flex items-center gap-1 text-sm font-semibold ${perfColor.text}`}>
                            <PerformanceIcon className="h-4 w-4" />
                            {getPerformanceLabel(unit.accuracyPercentage)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {unit.accuracyPercentage.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${perfColor.bg} transition-all duration-500`}
                        style={{ width: `${unit.accuracyPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unit Performance Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Analysis
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-indigo-600 font-medium">Strongest Unit:</p>
                  <p className="text-gray-900 font-semibold">
                    {unitPerformance[0]?.unitName || 'N/A'} ({unitPerformance[0]?.accuracyPercentage.toFixed(0)}%)
                  </p>
                </div>
                <div>
                  <p className="text-indigo-600 font-medium">Needs Focus:</p>
                  <p className="text-gray-900 font-semibold">
                    {unitPerformance[unitPerformance.length - 1]?.unitName || 'N/A'} ({unitPerformance[unitPerformance.length - 1]?.accuracyPercentage.toFixed(0)}%)
                  </p>
                </div>
                <div>
                  <p className="text-indigo-600 font-medium">Units Mastered:</p>
                  <p className="text-gray-900 font-semibold">
                    {unitPerformance.filter((u: any) => u.accuracyPercentage >= 90).length} of {unitPerformance.length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Schedule Review CTA */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-12 w-12" />
              <div>
                <h4 className="text-xl font-bold">Want Personalized Feedback?</h4>
                <p className="text-white/90">Schedule a review session with an instructor</p>
              </div>
            </div>
            <Button
              onClick={handleScheduleGeneralReview}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Mail className="h-5 w-5 mr-2" />
              Schedule Review
            </Button>
          </div>
        </Card>

        {/* MCQ Details */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Multiple Choice Details
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Score</span>
                <span className="text-2xl font-bold">{results.mcqScore}/42</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  style={{ width: `${((results.mcqScore || 0) / 42) * 100}%` }}
                />
              </div>
            </div>
            <div className={`${mcqPerformance.bg} rounded-lg p-3 text-center`}>
              <p className={`font-semibold ${mcqPerformance.color}`}>{mcqPerformance.label} Performance</p>
            </div>
          </div>
        </Card>

        {/* FRQ Section with Rubrics - MERGED FROM ADMIN VIEW */}
        {results.frqDetails && results.frqDetails.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="h-6 w-6 text-purple-600" />
              Free Response Questions & Scoring Rubrics
            </h3>
            <div className="space-y-4">
              {results.frqDetails.map((frq: any, index: number) => (
                <div key={index} className="border-2 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFRQ(expandedFRQ === index ? null : index)}
                    className="w-full p-6 bg-purple-50 hover:bg-purple-100 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold">
                          FRQ {index + 1}: {['Methods & Control', 'Classes', 'ArrayList', '2D Array'][index]}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {expandedFRQ === index ? 'Click to collapse' : 'Click to view solution & rubric'}
                        </p>
                      </div>
                    </div>
                    {expandedFRQ === index ? (
                      <ChevronUp className="h-6 w-6 text-purple-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-purple-600" />
                    )}
                  </button>

                  {expandedFRQ === index && (
                    <div className="p-6 bg-white border-t-2">
                      <Suspense fallback={
                        <div className="text-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </div>
                      }>
                        {/* Question Prompt */}
                        {frq.question?.promptText && (
                          <div className="mb-6">
                            <h5 className="font-bold text-lg mb-2 flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              Question Prompt
                            </h5>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {frq.question.promptText}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* Your Solution */}
                        <div className="mb-6">
                          <h5 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Code className="h-5 w-5 text-green-600" />
                            Your Solution
                          </h5>
                          {frq.userCode && frq.userCode.trim() ? (
                            <SyntaxHighlighter
                              language="java"
                              style={vscDarkPlus}
                              customStyle={{ borderRadius: '0.5rem', padding: '1rem' }}
                            >
                              {frq.userCode}
                            </SyntaxHighlighter>
                          ) : (
                            <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                              <Code className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-600 font-medium">No solution submitted</p>
                            </div>
                          )}
                        </div>

                        {/* Sample Solutions & Rubrics - MERGED FROM ADMIN */}
                        {frq.question?.frqParts && frq.question.frqParts.length > 0 ? (
                          <div className="space-y-6">
                            <h5 className="font-bold text-lg border-t pt-6 flex items-center gap-2">
                              <Target className="h-5 w-5 text-purple-600" />
                              Sample Solutions & Scoring Rubrics ({frq.question.maxPoints || 9} points total)
                            </h5>
                            {frq.question.frqParts.map((part: any, partIndex: number) => (
                              <div key={partIndex} className="border-l-4 border-purple-500 pl-6 bg-purple-50 p-4 rounded-r-lg">
                                <h6 className="font-bold text-gray-900 mb-3">
                                  Part ({part.partLetter}) - {part.maxPoints} points
                                </h6>
                                
                                {/* Part Prompt */}
                                {part.partDescription && (
                                  <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Prompt:</p>
                                    <div className="prose prose-sm max-w-none">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                        {part.partDescription}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                )}

                                {/* Scoring Criteria */}
                                {part.rubricItems && part.rubricItems.length > 0 && (
                                  <div className="bg-white rounded-lg p-4 border border-purple-200 mb-4">
                                    <p className="text-sm font-semibold text-purple-900 mb-3">Scoring Criteria:</p>
                                    <div className="space-y-2">
                                      {part.rubricItems.map((rubric: any, rIndex: number) => (
                                        <div key={rIndex} className="flex items-start gap-2">
                                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                              {rubric.criterion} ({rubric.points} {rubric.points === 1 ? 'point' : 'points'})
                                            </p>
                                            {rubric.description && (
                                              <p className="text-xs text-gray-600 mt-1">{rubric.description}</p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Sample Solution */}
                                {part.sampleSolution && (
                                  <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                      <BookOpen className="h-4 w-4 text-indigo-600" />
                                      Sample Solution:
                                    </p>
                                    <SyntaxHighlighter
                                      language="java"
                                      style={vscDarkPlus}
                                      customStyle={{
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {part.sampleSolution}
                                    </SyntaxHighlighter>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Fallback for questions without parts */
                          frq.question?.explanation && (
                            <div className="bg-gray-50 rounded-lg p-4 border-t pt-6">
                              <h5 className="font-bold text-gray-900 mb-3">Sample Solution:</h5>
                              <div className="prose max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                  {frq.question.explanation}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )
                        )}

                        {/* Request Review Button */}
                        <Button 
                          onClick={() => handleScheduleReview(index + 1)} 
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 mt-6" 
                          size="lg"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Request Detailed Review for This Question
                        </Button>
                      </Suspense>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
    
        {/* Strengths and Weaknesses */}
        {(results.strengths?.length > 0 || results.weaknesses?.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {results.strengths?.length > 0 && (
              <Card className="p-6 bg-green-50 border-2 border-green-200">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {results.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-green-900">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {results.weaknesses?.length > 0 && (
              <Card className="p-6 bg-orange-50 border-2 border-orange-200">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-orange-800">
                  <Target className="h-5 w-5" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {results.weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-orange-900">
                      <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        {/* Recommendations */}
        {results.recommendations?.length > 0 && (
          <Card className="p-6 mb-8 bg-blue-50 border-2 border-blue-200">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-800">
              <BookOpen className="h-5 w-5" />
              Study Recommendations
            </h3>
            <ul className="space-y-2">
              {results.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-900">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Return to Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/full-exam">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <RefreshCw className="h-5 w-5 mr-2" />
              Take Another Exam
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}