'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Lock, 
  Clock, 
  Target, 
  TrendingUp,
  AlertCircle,
  Crown
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ExamBlueprint, Subscription } from '@/types';

export default function ExamsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [blueprints, setBlueprints] = useState<ExamBlueprint[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadData();
    }
  }, [isLoaded, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [blueprintsRes, subscriptionRes] = await Promise.all([
        api.getExamBlueprints(),
        api.getSubscription(user!.id),
      ]);

      setBlueprints(blueprintsRes.data.blueprints);
      setSubscription(subscriptionRes.data.subscription);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExam = async (blueprint: ExamBlueprint) => {
    if (!user || !subscription) return;

    // Check if premium exam requires upgrade
    if (blueprint.isPremium && !subscription.hasPremiumContent) {
      router.push('/dashboard/subscription');
      return;
    }

    // Check exam limit
    if (subscription.maxExamsPerMonth !== -1 && 
        subscription.examsUsedThisMonth >= subscription.maxExamsPerMonth) {
      router.push('/dashboard/subscription');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.generateExam(user.id, blueprint.id);
      router.push(`/dashboard/exams/${response.data.exam.id}`);
    } catch (error: any) {
      console.error('Failed to generate exam:', error);
      if (error.message.includes('subscription') || error.message.includes('limit')) {
        router.push('/dashboard/subscription');
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  const examsRemaining = subscription?.maxExamsPerMonth === -1 
    ? 'Unlimited' 
    : subscription?.maxExamsPerMonth! - subscription?.examsUsedThisMonth!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Practice Exams</h1>
        <p className="mt-2 text-gray-600">
          Test your knowledge with full-length practice exams
        </p>
      </div>

      {/* Subscription Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {subscription?.planName} Plan
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {examsRemaining === 'Unlimited' 
                ? 'Unlimited exams remaining this month'
                : `${examsRemaining} exams remaining this month`
              }
            </p>
          </div>
          {subscription?.plan !== 'PREMIUM' && (
            <Button onClick={() => router.push('/dashboard/subscription')}>
              Upgrade Plan
            </Button>
          )}
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Exam Blueprints */}
      <div className="grid gap-6 md:grid-cols-2">
        {blueprints.map((blueprint) => {
          const isLocked = blueprint.isPremium && !subscription?.hasPremiumContent;
          const cannotTake = subscription && subscription.maxExamsPerMonth !== -1 && 
            subscription.examsUsedThisMonth >= subscription.maxExamsPerMonth;

          return (
            <Card key={blueprint.id} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {blueprint.name}
                    </h3>
                    {blueprint.isPremium && (
                      <Crown className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  {blueprint.description && (
                    <p className="mt-2 text-sm text-gray-600">{blueprint.description}</p>
                  )}
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <FileText className="mr-1 h-3 w-3" />
                  {blueprint.totalQuestions} Questions
                </Badge>
                {blueprint.timeLimit && (
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    {blueprint.timeLimit} min
                  </Badge>
                )}
                <Badge variant="secondary">
                  {blueprint.examType.replace('_', ' ')}
                </Badge>
              </div>

              {/* Difficulty Distribution */}
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <p className="mb-2 text-xs font-medium text-gray-700">Difficulty Distribution</p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="font-semibold text-green-600">{blueprint.easyCount}</div>
                    <div className="text-gray-600">Easy</div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600">{blueprint.mediumCount}</div>
                    <div className="text-gray-600">Medium</div>
                  </div>
                  <div>
                    <div className="font-semibold text-orange-600">{blueprint.hardCount}</div>
                    <div className="text-gray-600">Hard</div>
                  </div>
                  <div>
                    <div className="font-semibold text-red-600">{blueprint.expertCount}</div>
                    <div className="text-gray-600">Expert</div>
                  </div>
                </div>
              </div>

              {isLocked ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.push('/dashboard/subscription')}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              ) : cannotTake ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.push('/dashboard/subscription')}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Upgrade for More Exams
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleStartExam(blueprint)}
                  disabled={isLoading}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Start Exam
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Exam History Link */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">View Exam History</h3>
            <p className="mt-1 text-sm text-gray-600">
              Review your past exams and track your progress
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard/exams/history')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            View History
          </Button>
        </div>
      </Card>
    </div>
  );
}