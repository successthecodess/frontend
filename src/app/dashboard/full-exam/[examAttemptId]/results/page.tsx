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
  Eye,
  Calendar,
  Mail,
  Star,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { examApi } from '@/lib/examApi';

// Lazy load heavy components
const ReactMarkdown = lazy(() => import('react-markdown'));
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then(mod => ({ default: mod.Prism })));

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examAttemptId = params.examAttemptId as string;

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedFRQ, setExpandedFRQ] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

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

        {/* FRQ Section - Only load when expanded */}
        {results.frqDetails && results.frqDetails.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="h-6 w-6 text-purple-600" />
              Free Response Questions
            </h3>
            <div className="space-y-4">
              {results.frqDetails.map((frq: any, index: number) => (
                <div key={index} className="border-2 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFRQ(expandedFRQ === index ? null : index)}
                    className="w-full p-6 bg-purple-50 hover:bg-purple-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold">FRQ {index + 1}: {['Methods & Control', 'Classes', 'ArrayList', '2D Array'][index]}</h4>
                        <p className="text-sm text-gray-600">Click to view solution</p>
                      </div>
                    </div>
                    <Eye className="h-6 w-6 text-purple-600" />
                  </button>

                  {expandedFRQ === index && (
                    <div className="p-6 bg-white border-t-2">
                      <Suspense fallback={<div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>}>
                        <div className="mb-4">
                          <h5 className="font-bold mb-2">Your Solution:</h5>
                          <SyntaxHighlighter
                            language="java"
                            customStyle={{ borderRadius: '0.5rem', padding: '1rem' }}
                          >
                            {frq.userCode || '// No solution submitted'}
                          </SyntaxHighlighter>
                        </div>
                        <Button onClick={() => handleScheduleReview(index + 1)} className="w-full">
                          <Mail className="h-4 w-4 mr-2" />
                          Request Review
                        </Button>
                      </Suspense>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" variant="outline">Return to Dashboard</Button>
          </Link>
          <Link href="/dashboard/full-exam">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <RefreshCw className="h-5 w-5 mr-2" />
              Take Another Exam
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}