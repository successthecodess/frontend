'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AchievementsDisplay } from '@/components/dashboard/AchievementsDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, ArrowRight, Lock, Mail, FileText, Calendar, TrendingUp, Eye, Award } from 'lucide-react';
import { examApi } from '@/lib/examApi';

interface UserAccess {
  hasFreeTrialAccess: boolean;
  hasBasicAccess: boolean;
  hasFullAccess: boolean;
  hasPremiumAccess: boolean;
  canAccessPractice: boolean;
  canAccessTests: boolean;
  canAccessCourse: boolean;
  canAccessPremiumExam: boolean;
  accessTier: 'none' | 'trial' | 'basic' | 'full' | 'premium';
}

interface ExamAttempt {
  id: string;
  attemptNumber: number;
  status: string;
  mcqScore: number;
  mcqPercentage: number;
  predictedAPScore: number;
  createdAt: string;
  completedAt: string;
  totalTimeSpent: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to be ready
    if (!authLoading) {
      if (!user) {
        // No user, redirect to login
        router.push('/login');
      } else {
        // User exists, check access
        checkAccess();
        loadExamHistory();
      }
    }
  }, [user, authLoading, router]);

  const checkAccess = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/my-access`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const accessData = await response.json();
        setUserAccess(accessData);
      } else {
        // Token invalid, redirect to login
        localStorage.removeItem('authToken');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to check access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExamHistory = async () => {
    if (!user) return;

    setLoadingExams(true);
    try {
      const response = await examApi.getUserExamHistory(user.userId);
      setExamAttempts(response.data.attempts || []);
    } catch (error) {
      console.error('Failed to load exam history:', error);
      // Set empty array on error
      setExamAttempts([]);
    } finally {
      setLoadingExams(false);
    }
  };

  const getAPScoreColor = (score: number) => {
    if (score === 5) return 'text-green-600 bg-green-100';
    if (score === 4) return 'text-blue-600 bg-blue-100';
    if (score === 3) return 'text-yellow-600 bg-yellow-100';
    if (score === 2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Show loading while auth or access is being checked
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If no user after loading, return null (will redirect)
  if (!user) {
    return null;
  }

  // Show free trial prompt only if they have NO access (not even trial used)
  const showFreeTrialPrompt = userAccess && userAccess.accessTier === 'none' && userAccess.hasFreeTrialAccess;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track your progress and achievements
          </p>
          {userAccess && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              Access Level: {userAccess.accessTier.toUpperCase()}
            </div>
          )}
        </div>

        {/* Free Trial Prompt - Only for users with NO access */}
        {showFreeTrialPrompt && (
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 sm:p-8 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
                <Gift className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  🎉 Try Our Free Diagnostic Quiz!
                </h3>
                <p className="text-white/90 mb-4 text-sm sm:text-base">
                  Test your AP Computer Science A knowledge with 10 carefully selected questions covering all units. Get instant feedback and see where you stand!
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => router.push('/dashboard/free-trial')}
                    className="bg-white text-indigo-600 hover:bg-gray-100"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <span>✓ 10 questions</span>
                    <span>•</span>
                    <span>✓ Instant feedback</span>
                    <span>•</span>
                    <span>✓ No commitment</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* My Exams Section - ONLY show if user has premium access AND has attempts */}
        {userAccess?.canAccessPremiumExam && examAttempts.length > 0 && !loadingExams && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-indigo-600" />
                  My Full Exams
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  View your completed exam attempts and detailed results
                </p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/full-exam')}
                variant="outline"
                size="sm"
              >
                Take New Exam
              </Button>
            </div>

            <div className="space-y-3">
              {examAttempts.slice(0, 5).map((attempt) => (
                <div
                  key={attempt.id}
                  className="border rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/full-exam/${attempt.id}/results`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          Attempt #{attempt.attemptNumber}
                        </span>
                        {attempt.predictedAPScore && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getAPScoreColor(attempt.predictedAPScore)}`}>
                            <Award className="h-3 w-3" />
                            AP Score: {attempt.predictedAPScore}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          {attempt.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <TrendingUp className="h-4 w-4" />
                          <span>MCQ: {attempt.mcqScore}/42 ({attempt.mcqPercentage?.toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{Math.floor((attempt.totalTimeSpent || 0) / 60)} min</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/full-exam/${attempt.id}/results`);
                          }}
                          className="md:ml-auto"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {examAttempts.length > 5 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/my-exams')}
                  >
                    View All {examAttempts.length} Attempts
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Premium Exam CTA - ONLY show if they have access AND no attempts AND not loading */}
        {userAccess?.canAccessPremiumExam && examAttempts.length === 0 && !loadingExams && (
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ready for the Full AP CS A Exam?
                </h3>
                <p className="text-gray-700 mb-4">
                  Take a complete 3-hour practice exam with 42 MCQ and 4 FRQ questions. Get your predicted AP score and detailed performance analysis!
                </p>
                <Button
                  onClick={() => router.push('/dashboard/full-exam')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Take Full Exam
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Dashboard Overview */}
        <DashboardOverview userId={user.userId} />
        
        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceChart userId={user.userId} />
          <AchievementsDisplay userId={user.userId} />
        </div>
      </div>
    </div>
  );
}