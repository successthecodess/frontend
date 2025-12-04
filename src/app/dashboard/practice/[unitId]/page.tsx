'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { FeedbackCard } from '@/components/practice/FeedbackCard';
import { SessionProgressCard } from '@/components/practice/SessionProgressCard';
import { LearningInsightsCard } from '@/components/practice/LearningInsightsCard';
import { SessionSummary } from '@/components/practice/SessionSummary';
import { Loader2 } from 'lucide-react';
import type { Unit, Question, StudySession, AnswerResult, ProgressMetrics } from '@/types';

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [session, setSession] = useState<StudySession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<ProgressMetrics | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [targetQuestions, setTargetQuestions] = useState(10);

  // Load session from localStorage or create new one
  useEffect(() => {
    const initializeSession = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get target questions from query params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const questionsParam = urlParams.get('questions');
        const storedTarget = localStorage.getItem('targetQuestions');
        const target = questionsParam ? parseInt(questionsParam) : (storedTarget ? parseInt(storedTarget) : 10);
        setTargetQuestions(target);
        localStorage.setItem('targetQuestions', target.toString());

        // Load unit data
        const unitResponse = await api.getUnit(unitId);
        setUnit(unitResponse.data);

        // Check for existing session in localStorage
        const storedSessionId = localStorage.getItem(`session_${unitId}`);
        
        if (storedSessionId) {
          // Try to resume session
          try {
            const sessionData = JSON.parse(localStorage.getItem(`sessionData_${unitId}`) || '{}');
            setSession(sessionData.session);
            setAnsweredQuestions(sessionData.answeredQuestions || []);
            
            // Load progress
            await loadProgress();
            
            // Get next question
            const questionResponse = await api.getNextQuestion(
              user.id,
              storedSessionId,
              unitId,
              sessionData.answeredQuestions || []
            );

            if (questionResponse.data.question) {
              console.log('📝 Loaded question:', questionResponse.data.question.difficulty);
              setCurrentQuestion(questionResponse.data.question);
            } else {
              // Session complete
              await loadSessionSummary();
            }
          } catch (error) {
            console.error('Failed to resume session, starting new one:', error);
            localStorage.removeItem(`session_${unitId}`);
            localStorage.removeItem(`sessionData_${unitId}`);
            await startNewSession(target);
          }
        } else {
          // Start new session
          await startNewSession(target);
        }
      } catch (error: any) {
        console.error('Failed to initialize session:', error);
        setError(error.message || 'Failed to start practice session');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [user, unitId]);

  const startNewSession = async (target: number) => {
    if (!user) return;

    try {
      const response = await api.startPracticeSession(
        user.id,
        unitId,
        undefined,
        user.emailAddresses[0]?.emailAddress,
        user.fullName || user.firstName || undefined,
        target
      );

      console.log('🎯 Session started with difficulty:', response.data.recommendedDifficulty);
      console.log('📝 First question difficulty:', response.data.question.difficulty);

      setSession(response.data.session);
      setCurrentQuestion(response.data.question);
      
      if (response.data.progress) {
        setProgress(response.data.progress);
      }

      // Store session ID
      localStorage.setItem(`session_${unitId}`, response.data.session.id);
      localStorage.setItem(`sessionData_${unitId}`, JSON.stringify({
        session: response.data.session,
        answeredQuestions: [],
      }));

      await loadProgress();
      await loadInsights();
    } catch (error: any) {
      throw error;
    }
  };

  const loadProgress = async () => {
    if (!user) return;

    try {
      const response = await api.getUserProgress(user.id, unitId);
      if (response.data.progress) {
        console.log('📊 Current progress:', response.data.progress);
        setProgress(response.data.progress);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const loadInsights = async () => {
    if (!user) return;

    try {
      await api.getLearningInsights(user.id, unitId);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const handleSubmitAnswer = async (answer: string, timeSpent: number) => {
    if (!session || !currentQuestion || !user) return;

    setIsSubmitting(true);
    try {
      console.log('📝 Submitting answer for question:', currentQuestion.difficulty);
      
      const response = await api.submitAnswer(
        user.id,
        session.id,
        currentQuestion.id,
        answer,
        timeSpent
      );

      console.log('✅ Answer submitted. Result:', response.data.isCorrect ? 'Correct' : 'Incorrect');
      console.log('📊 New difficulty level:', response.data.progress?.currentDifficulty);

      setAnswerResult(response.data);
      setAnsweredQuestions([...answeredQuestions, currentQuestion.id]);

      // Update progress from backend response
      if (response.data.progress) {
        setProgress(response.data.progress);
      }

      // Update session stats from backend response
      if (response.data.session) {
        setSession(response.data.session);
        
        // Save to localStorage
        localStorage.setItem(`sessionData_${unitId}`, JSON.stringify({
          session: response.data.session,
          answeredQuestions: [...answeredQuestions, currentQuestion.id],
        }));
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
  if (!session || !user) return;

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
    
    console.log('🔄 Getting next question...');
    console.log('📊 Unit ID:', unitId); // Use unitId from params, NOT unit.id
    console.log('📊 Current student level:', progress?.currentDifficulty);
    
    const response = await api.getNextQuestion(
      user.id,
      session.id,
      unitId, // CRITICAL: Use unitId from params!
      answeredQuestions
    );

    if (!response.data.question) {
      console.log('🎉 No more questions! Session complete.');
      await loadSessionSummary();
      return;
    }

    console.log('📝 Next question loaded:', response.data.question.difficulty);
    console.log('📊 Should match student level:', progress?.currentDifficulty);

    setCurrentQuestion(response.data.question);
    
    // Reload progress to get updated difficulty
    await loadProgress();
  } catch (error: any) {
    console.error('Failed to get next question:', error);
    
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
      const response = await api.endPracticeSession(session.id);
      setSessionSummary(response.data.summary);
      
      // Clear localStorage
      localStorage.removeItem(`session_${unitId}`);
      localStorage.removeItem(`sessionData_${unitId}`);
    } catch (error: any) {
      console.error('Failed to load session summary:', error);
      setError(error.message || 'Failed to load session summary');
    }
  };

  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    // Clear state and localStorage
    localStorage.removeItem(`session_${unitId}`);
    localStorage.removeItem(`sessionData_${unitId}`);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-gray-600">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sessionSummary) {
    return (
      <SessionSummary
        summary={sessionSummary}
        unit={unit!}
        onReturnToDashboard={handleReturnToDashboard}
        onRetry={handleRetry}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  const questionsRemaining = targetQuestions - (session?.totalQuestions || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {unit?.name || 'Practice Session'}
          </h1>
          <p className="mt-1 text-gray-600">
            Question {(session?.totalQuestions || 0) + 1} of {targetQuestions}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {answerResult ? (
              <FeedbackCard
                result={answerResult}
                onNext={handleNextQuestion}
                isLoading={isLoadingNext}
                questionsRemaining={questionsRemaining}
              />
            ) : (
              <QuestionCard
                question={currentQuestion}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SessionProgressCard
              session={session!}
              progress={progress || undefined}
              targetQuestions={targetQuestions}
            />
            <LearningInsightsCard progress={progress || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
