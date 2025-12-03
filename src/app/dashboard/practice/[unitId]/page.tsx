'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { FeedbackCard } from '@/components/practice/FeedbackCard';
import { ProgressBar } from '@/components/practice/ProgressBar';
import { LearningInsights } from '@/components/practice/LearningInsights';
import { SessionComplete } from '@/components/practice/SessionComplete';
import { SessionSettings } from '@/components/practice/SessionSettings';
import { EmptyQuestionBank } from '@/components/dashboard/EmptyQuestionBank';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, X, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { Question, PracticeSession, AnswerResult, ProgressMetrics, Unit, SessionSummary } from '@/types';

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const unitParam = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressMetrics | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [targetQuestions, setTargetQuestions] = useState(40);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noQuestionsAvailable, setNoQuestionsAvailable] = useState(false);

  useEffect(() => {
    if (unitParam) {
      loadUnit();
    }
  }, [unitParam]);

  useEffect(() => {
    if (isLoaded && user && unit && !session) {
      setIsLoading(false);
      setShowSettings(true);
    }
  }, [isLoaded, user, unit, session]);

  const loadUnit = async () => {
    try {
      const response = await api.getUnit(unitParam);
      setUnit(response.data.unit);
    } catch (error) {
      console.error('Failed to load unit:', error);
      setError('Failed to load unit');
      setIsLoading(false);
    }
  };

  const handleStartWithSettings = async (questionCount: number) => {
    if (!unit) return;
    setIsLoading(true);
    setError(null);
    setNoQuestionsAvailable(false);
    
    try {
      const response = await api.startPracticeSession(
        user!.id, 
        unit.id,
        undefined,
        user?.primaryEmailAddress?.emailAddress,
        user?.fullName || user?.firstName || undefined,
        questionCount
      );
      
      setSession(response.data.session);
      setCurrentQuestion(response.data.question);
      setTargetQuestions(questionCount);
      setShowSettings(false);
      setProgress({
        currentDifficulty: response.data.recommendedDifficulty,
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        masteryLevel: 0,
      });

      loadInsights();
    } catch (error: any) {
      console.error('Failed to start session:', error);
      
      if (error.message?.includes('No approved questions') || 
          error.message?.includes('No questions available')) {
        setNoQuestionsAvailable(true);
      } else {
        setError(error.message || 'Failed to start session');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    if (!user || !unit) return;
    
    try {
      const response = await api.getLearningInsights(user.id, unit.id);
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

const handleSubmitAnswer = async (answer: string, timeSpent: number) => {
  if (!session || !currentQuestion || !user) return;

  setIsSubmitting(true);
  try {
    const response = await api.submitAnswer(
      user.id,
      session.id,
      currentQuestion.id,
      answer,
      timeSpent
    );

    setAnswerResult(response.data);
    setAnsweredQuestions([...answeredQuestions, currentQuestion.id]);

    // Update progress from backend response
    if (response.data.progress) {
      setProgress(response.data.progress);
    }

    // Update session stats from backend response
    if (response.data.session) {
      setSession(response.data.session);
      
      // Check if this was the last question
      if (response.data.session.totalQuestions >= targetQuestions) {
        console.log('🎉 That was the last question!');
        // Don't load summary yet, wait for user to click "Continue"
      }
    }

    // Reload insights after answer
    loadInsights();
  } catch (error: any) {
    console.error('Failed to submit answer:', error);
    setError(error.message || 'Failed to submit answer');
  } finally {
    setIsSubmitting(false);
  }
};

const handleNextQuestion = async () => {
  if (!session || !user || !unit) return;

  // Check if session is complete BEFORE trying to get next question
  if (session.totalQuestions >= targetQuestions) {
    console.log('🎉 Session complete! Loading summary...');
    await loadSessionSummary();
    return;
  }

  try {
    setIsLoadingNext(true);
    setAnswerResult(null);
    setError(null);
    
    const response = await api.getNextQuestion(
      user.id,
      session.id,
      unit.id,
      answeredQuestions
    );

    if (!response.data.question) {
      console.log('🎉 No more questions! Session complete.');
      await loadSessionSummary();
      return;
    }

    setCurrentQuestion(response.data.question);
  } catch (error: any) {
    console.error('Failed to get next question:', error);
    
    // If error mentions completion, show summary
    if (error.message?.includes('completed all') || 
        error.message?.includes('No more questions available') ||
        error.message?.includes('Session complete')) {
      console.log('🎉 Session complete via error message');
      await loadSessionSummary();
    } else {
      setError(error.message || 'Failed to get next question');
    }
  } finally {
    setIsLoadingNext(false);
  }
};

  const loadSessionSummary = async () => {
    if (!session) return;

    try {
      console.log('📊 Loading session summary for:', session.id);
      const response = await api.endPracticeSession(session.id);
      console.log('✅ Session summary loaded:', response.data);
      setSessionSummary(response.data.summary);
      setShowCompletion(true);
    } catch (error: any) {
      console.error('❌ Failed to load session summary:', error);
      setError(error.message || 'Failed to load session summary');
    }
  };

  const handleEndSession = async () => {
    if (!session) return;

    if (
      confirm(
        'Are you sure you want to end this session? Your progress will be saved.'
      )
    ) {
      await loadSessionSummary();
    }
  };

  const handleRetry = () => {
    setSession(null);
    setCurrentQuestion(null);
    setAnswerResult(null);
    setAnsweredQuestions([]);
    setProgress(null);
    setSessionSummary(null);
    setShowCompletion(false);
    setShowSettings(true);
    setError(null);
    setNoQuestionsAvailable(false);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard/practice');
  };

  if (noQuestionsAvailable && unit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyQuestionBank
          unitName={unit.name}
          unitNumber={unit.unitNumber}
          onBack={() => router.push('/dashboard/practice')}
        />
      </div>
    );
  }

  if (isLoading || !isLoaded || !unit) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Error</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleBackToDashboard} variant="outline">
                Back to Dashboard
              </Button>
              <Button onClick={handleRetry}>Try Again</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SessionSettings
          unitName={unit.name}
          onStart={handleStartWithSettings}
          onCancel={handleBackToDashboard}
        />
      </div>
    );
  }

  if (showCompletion && sessionSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SessionComplete
          summary={sessionSummary}
          unitName={unit.name}
          onRetry={handleRetry}
          onBackToDashboard={handleBackToDashboard}
        />
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Starting session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackToDashboard}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Exit
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Unit {unit.unitNumber}: {unit.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Question {session.totalQuestions + 1} of {targetQuestions}
                </p>
              </div>
            </div>
            <Button
              onClick={handleEndSession}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <ProgressBar
            current={session.totalQuestions}
            total={targetQuestions}
            correct={session.correctAnswers}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {answerResult ? (
              <FeedbackCard
                result={answerResult}
                onNext={handleNextQuestion}
                isLoading={isLoadingNext}
                questionsRemaining={targetQuestions - session.totalQuestions}
              />
            ) : (
              <QuestionCard
                question={currentQuestion}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmitting}
                questionNumber={session.totalQuestions + 1}
                totalQuestions={targetQuestions}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Progress */}
            {progress && (
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Session Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-semibold text-gray-900">
                      {session.totalQuestions > 0
                        ? Math.round(
                            (session.correctAnswers / session.totalQuestions) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      session.totalQuestions > 0
                        ? (session.correctAnswers / session.totalQuestions) * 100
                        : 0
                    }
                    className="h-2"
                  />

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Difficulty</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {progress.currentDifficulty.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Correct Streak</span>
                    <span className="font-semibold text-green-600">
                      {progress.consecutiveCorrect} 🔥
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mastery Level</span>
                    <span className="font-semibold text-purple-600">
                      {Math.round(progress.masteryLevel)}%
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Learning Insights */}
            {insights && (
              <LearningInsights
                insights={insights}
                currentDifficulty={progress?.currentDifficulty}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}