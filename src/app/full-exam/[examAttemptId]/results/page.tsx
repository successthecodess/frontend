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
  RefreshCw,
  Eye,
  Calendar,
  Mail,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { examApi } from '@/lib/examApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
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

  useEffect(() => {
    loadResults();
    loadUserInfo();
  }, [examAttemptId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExamResults(examAttemptId);
      setResults(response.data);
    } catch (error) {
      console.error('Failed to load results:', error);
      alert('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      // Get user info from localStorage or API
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

  // Calculate AP score based on MCQ alone (55% weight)
  const calculateMCQOnlyAPScore = (mcqScore: number) => {
    // MCQ contributes 55% to total score
    const mcqWeighted = (mcqScore / 42) * 55;
    
    // Since FRQ is unknown, we calculate what AP score range this puts them in
    // Assuming average FRQ performance (60% = 27 points)
    const estimatedTotal = mcqWeighted + (45 * 0.6);
    
    if (estimatedTotal >= 75) return 5;
    if (estimatedTotal >= 62) return 4;
    if (estimatedTotal >= 50) return 3;
    if (estimatedTotal >= 37) return 2;
    return 1;
  };

  const handleScheduleReview = (frqNumber: number) => {
    const subject = encodeURIComponent(`FRQ ${frqNumber} Review Request - Full Exam`);
    
    const body = encodeURIComponent(
`Hello,

I recently completed a full practice exam and would like to schedule a review session to go over my Free Response Question ${frqNumber}.

Exam Details:
- Exam Attempt ID: ${examAttemptId}
- FRQ Number: ${frqNumber}
- MCQ Score: ${results.mcqScore}/42 (${results.mcqPercentage?.toFixed(1)}%)
- Date Completed: ${new Date(results.submittedAt).toLocaleDateString()}

I'd like to review my solution and get personalized feedback on:
- Code structure and implementation
- Areas where I can improve
- How to maximize points on similar questions

Please let me know your availability for a review session.

Thank you!

Best regards,
${userName}
${userEmail}
`
    );

    // Open default email client with pre-filled content
    window.location.href = `mailto:daniel@enginearu.com?subject=${subject}&body=${body}`;
  };

  const handleScheduleGeneralReview = () => {
    const subject = encodeURIComponent(`Full Exam Review Request`);
    
    const body = encodeURIComponent(
`Hello,

I recently completed a full practice exam and would like to schedule a comprehensive review session.

Exam Details:
- Exam Attempt ID: ${examAttemptId}
- MCQ Score: ${results.mcqScore}/42 (${results.mcqPercentage?.toFixed(1)}%)
- Date Completed: ${new Date(results.submittedAt).toLocaleDateString()}
- Total Time: ${Math.floor((results.totalTimeSpent || 0) / 60)} minutes

Areas I'd like to focus on:
${results.weaknesses?.map((w: string) => `- ${w}`).join('\n')}

I'd like to review:
1. All FRQ solutions with detailed feedback
2. Difficult MCQ questions I got wrong
3. Strategies to improve my score
4. Time management tips

Please let me know your availability for a review session.

Thank you!

Best regards,
${userName}
${userEmail}
`
    );

    window.location.href = `mailto:daniel@enginearu.com?subject=${subject}&body=${body}`;
  };

  const getAPScoreColor = (score: number) => {
    if (score === 5) return 'from-green-500 to-emerald-600';
    if (score === 4) return 'from-blue-500 to-indigo-600';
    if (score === 3) return 'from-yellow-500 to-orange-500';
    if (score === 2) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const getAPScoreTextColor = (score: number) => {
    if (score === 5) return 'text-green-600';
    if (score === 4) return 'text-blue-600';
    if (score === 3) return 'text-yellow-600';
    if (score === 2) return 'text-orange-600';
    return 'text-red-600';
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
  };

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  const mcqPerformance = getPerformanceLevel(results.mcqPercentage || 0);
  const mcqOnlyAPScore = calculateMCQOnlyAPScore(results.mcqScore || 0);

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
            Review your MCQ performance and FRQ solutions below
          </p>
        </div>

        {/* Score Summary Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* MCQ Score Card */}
          <Card className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <div className="text-center">
              <p className="text-white/90 text-lg mb-2">MCQ Performance</p>
              <div className="text-7xl font-bold mb-4">{results.mcqScore}/42</div>
              <p className="text-2xl font-semibold mb-2">{results.mcqPercentage?.toFixed(1)}% Correct</p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Section I: Multiple Choice</span>
              </div>
            </div>
          </Card>

          {/* Estimated AP Score Card (Based on MCQ) */}
          <Card className={`p-8 bg-gradient-to-br ${getAPScoreColor(mcqOnlyAPScore)} text-white`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="h-6 w-6 fill-white" />
                <p className="text-white/90 text-lg">Estimated AP Score</p>
                <Star className="h-6 w-6 fill-white" />
              </div>
              <div className="text-8xl font-bold mb-3">{mcqOnlyAPScore}</div>
              <p className="text-xl font-semibold mb-2">{getAPScoreLabel(mcqOnlyAPScore)}</p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <Award className="h-5 w-5" />
                <span className="font-semibold text-sm">Based on MCQ Performance</span>
              </div>
            </div>
          </Card>
        </div>

        {/* AP Score Context */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-purple-900 text-lg mb-2">About Your AP Score</h3>
              <p className="text-purple-800 mb-3">
                Your estimated AP score of <strong>{mcqOnlyAPScore}</strong> is calculated based on your MCQ performance (55% of total score) 
                and assumes average FRQ performance (60%). Your actual AP score will depend on your FRQ responses.
              </p>
              <p className="text-sm text-purple-700">
                <strong>Note:</strong> Review your FRQ solutions below and compare them to the rubrics to better estimate your final score. 
                The ranges below show what you could achieve with different FRQ performance levels.
              </p>
            </div>
          </div>
        </Card>

        {/* AP Score Estimator */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            AP Score Potential with Different FRQ Performance
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Based on your MCQ score of {results.mcqScore}/42, here's your AP score potential:
          </p>

          <div className="space-y-3">
            {results.apScoreRanges?.map((range: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 bg-gradient-to-r ${getAPScoreColor(range.apScore)}`}
              >
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="font-semibold">{range.label}</p>
                    <p className="text-sm text-white/90">
                      {range.score.toFixed(1)}% Overall
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{range.apScore}</div>
                    <p className="text-xs text-white/90">AP Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Review your FRQ solutions below and compare them to the sample solutions and rubrics to estimate which range you fall into.
            </p>
          </div>
        </Card>

        {/* Schedule Full Review CTA */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-1">Want Personalized Feedback?</h4>
                <p className="text-white/90">
                  Schedule a comprehensive review session to go over your entire exam with an instructor
                </p>
              </div>
            </div>
            <Button
              onClick={handleScheduleGeneralReview}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold whitespace-nowrap"
            >
              <Mail className="h-5 w-5 mr-2" />
              Schedule Full Review
            </Button>
          </div>
        </Card>

        {/* MCQ Score Breakdown */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Multiple Choice Details</h3>
              <p className="text-sm text-gray-600">Section I • 55% of AP score</p>
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

        {/* FRQ Solutions and Rubrics */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Code className="h-6 w-6 text-purple-600" />
            Free Response Questions - Review Solutions
          </h3>
          
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-900">
              <strong>Section II: 45% of AP Score</strong> - Review your code against the sample solutions and rubrics below. 
              Schedule a tutoring session to get personalized feedback on your FRQ responses.
            </p>
          </div>

          <div className="space-y-6">
            {results.frqDetails?.map((frq: any, index: number) => (
              <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFRQ(expandedFRQ === index ? null : index)}
                  className="w-full p-6 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900">
                        FRQ {index + 1}: {['Methods & Control', 'Classes', 'ArrayList', '2D Array'][index]}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {frq.question.maxPoints} points • Click to view solution and rubric
                      </p>
                    </div>
                  </div>
                  <Eye className={`h-6 w-6 text-purple-600 transition-transform ${
                    expandedFRQ === index ? 'rotate-180' : ''
                  }`} />
                </button>

                {expandedFRQ === index && (
                  <div className="p-6 bg-white border-t-2 border-purple-200">
                    {/* Question Prompt */}
                    <div className="mb-6">
                      <h5 className="font-bold text-gray-900 mb-3">Question Prompt:</h5>
                      <div className="prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {frq.question.promptText || frq.question.questionText}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Your Solution */}
                    <div className="mb-6">
                      <h5 className="font-bold text-gray-900 mb-3">Your Solution:</h5>
                      <SyntaxHighlighter
                        language="java"
                        style={vscDarkPlus}
                        customStyle={{
                          borderRadius: '0.5rem',
                          padding: '1rem',
                        }}
                      >
                        {frq.userCode || '// No solution submitted'}
                      </SyntaxHighlighter>
                      {frq.timeSpent && (
                        <p className="text-sm text-gray-600 mt-2">
                          Time spent: {Math.floor(frq.timeSpent / 60)} minutes {frq.timeSpent % 60} seconds
                        </p>
                      )}
                    </div>

                    {/* Sample Solution and Rubric for each part */}
                    {frq.question.frqParts && frq.question.frqParts.length > 0 ? (
                      <div className="space-y-6">
                        {frq.question.frqParts.map((part: any, partIndex: number) => (
                          <div key={partIndex} className="border-l-4 border-green-500 pl-6">
                            <h5 className="font-bold text-gray-900 mb-3">
                              Part ({part.partLetter}) - {part.maxPoints} points
                            </h5>
                            
                            {/* Part Prompt */}
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Prompt:</p>
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                  {part.promptText}
                                </ReactMarkdown>
                              </div>
                            </div>

                            {/* Sample Solution */}
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Sample Solution:</p>
                              <SyntaxHighlighter
                                language="java"
                                style={vscDarkPlus}
                                customStyle={{
                                  borderRadius: '0.5rem',
                                  padding: '1rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {part.sampleSolution || '// Sample solution not available'}
                              </SyntaxHighlighter>
                            </div>

                            {/* Rubric */}
                            {part.rubricPoints && part.rubricPoints.length > 0 && (
                              <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm font-semibold text-green-900 mb-3">Scoring Rubric:</p>
                                <div className="space-y-2">
                                  {part.rubricPoints.map((rubric: any, rIndex: number) => (
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Single-part FRQ */
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-bold text-gray-900 mb-3">Sample Solution:</h5>
                          <div className="prose max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                              {frq.question.explanation || 'Sample solution not available'}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Schedule Review Button for Individual FRQ */}
                    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-indigo-900">Want personalized feedback on this FRQ?</p>
                          <p className="text-sm text-indigo-700">Schedule a session to review FRQ {index + 1} in detail</p>
                        </div>
                        <Button 
                          onClick={() => handleScheduleReview(index + 1)}
                          className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Request Review
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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