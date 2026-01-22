'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, TrendingUp, Eye, Award, ArrowLeft } from 'lucide-react';
import { examApi } from '@/lib/examApi';

export default function MyExamsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [examAttempts, setExamAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadExamHistory();
    }
  }, [user]);

  const loadExamHistory = async () => {
    if (!user) return;

    try {
      const response = await examApi.getUserExamHistory(user.userId);
      setExamAttempts(response.data.attempts || []);
    } catch (error) {
      console.error('Failed to load exam history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAPScoreColor = (score: number) => {
    if (score === 5) return 'text-green-600 bg-green-100';
    if (score === 4) return 'text-blue-600 bg-blue-100';
    if (score === 3) return 'text-yellow-600 bg-yellow-100';
    if (score === 2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-600" />
            My Full Exam Attempts
          </h1>
          <p className="text-gray-600 mt-2">
            All your completed practice exams and results
          </p>
        </div>

        {examAttempts.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Exam Attempts Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't taken any full practice exams yet.
            </p>
            <Button onClick={() => router.push('/dashboard/full-exam')}>
              Take Your First Exam
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {examAttempts.map((attempt) => (
              <Card
                key={attempt.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/full-exam/${attempt.id}/results`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        Attempt #{attempt.attemptNumber}
                      </h3>
                      {attempt.predictedAPScore && (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getAPScoreColor(attempt.predictedAPScore)}`}>
                          <Award className="h-4 w-4" />
                          AP Score: {attempt.predictedAPScore}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        {attempt.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-gray-600">MCQ Score</p>
                          <p className="font-semibold">{attempt.mcqScore}/42 ({attempt.mcqPercentage?.toFixed(1)}%)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="font-semibold">
                            {new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-600">Total Time</p>
                          <p className="font-semibold">{Math.floor((attempt.totalTimeSpent || 0) / 60)} minutes</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/full-exam/${attempt.id}/results`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Detailed Results
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}