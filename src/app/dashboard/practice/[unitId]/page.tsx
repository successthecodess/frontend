'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { FeedbackCard } from '@/components/practice/FeedbackCard';
import { SessionProgressCard } from '@/components/practice/SessionProgressCard';
import { LearningInsightsCard } from '@/components/practice/LearningInsightsCard';
import { SessionSummary } from '@/components/practice/SessionSummary';
import { LoadingState } from '@/components/LoadingState';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Clock, AlertTriangle } from 'lucide-react';
import type { Unit, Question, StudySession, AnswerResult, ProgressMetrics } from '@/types';

function PracticeSessionContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
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
  
  // Timer states
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(90);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load session from localStorage or create new one
  useEffect(() => {
    const initializeSession = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get settings from query params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const questionsParam = urlParams.get('questions');
        const timedParam = urlParams.get('timed');
        const timeParam = urlParams.get('timePerQuestion');
        
        const storedTarget = localStorage.getItem('targetQuestions');
        const storedTimed = localStorage.getItem('isTimedMode');
        const storedTime = localStorage.getItem('timePerQuestion');

        const target = questionsParam ? parseInt(questionsParam) : (storedTarget ? parseInt(storedTarget) : 10);
        const timed = timedParam ? timedParam === 'true' : (storedTimed === 'true');
        const time = timeParam ? parseInt(timeParam) : (storedTime ? parseInt(storedTime) : 90);

        setTargetQuestions(target);
        setIsTimedMode(timed);
        setTimePerQuestion(time);
        setTimeRemaining(time);

        localStorage.setItem('targetQuestions', target.toString());
        localStorage.setItem('isTimedMode', timed.toString());
        localStorage.setItem('timePerQuestion', time.toString());

        // Load unit data
        const unitResponse = await api.getUnit(unitId);
        setUnit(unitResponse.data);

        // Check for existing session in localStorage
        const storedSessionId = localStorage.getItem(`session_${unitId}`);
        
        if (storedSessionId) {
          try {
            const sessionData = JSON.parse(localStorage.getItem(`sessionData_${unitId}`) || '{}');
            setSession(sessionData.session);
            setAnsweredQuestions(sessionData.answeredQuestions || []);
            
            await loadProgress();
            
            const questionResponse = await api.getNextQuestion(
              user.userId,
              storedSessionId,
              unitId,
              sessionData.answeredQuestions || []
            );

            if (questionResponse.data.question) {
              console.log('📝 Loaded question:', questionResponse.data.question.difficulty);
              setCurrentQuestion(questionResponse.data.question);
              setQuestionStartTime(Date.now());
              if (timed) {
                setTimeRemaining(time);
              }
            } else {
              await loadSessionSummary();
            }
          } catch (error) {
            console.error('Failed to resume session, starting new one:', error);
            localStorage.removeItem(`session_${unitId}`);
            localStorage.removeItem(`sessionData_${unitId}`);
            await startNewSession(target);
          }
        } else {
          await startNewSession(target);
        }
      } catch (error: any) {
        console.error('Failed to initialize session:', error);
        setError(
          error.message || 
          'Failed to start practice session. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, unitId]);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimedMode || answerResult || !currentQuestion) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimedMode, answerResult, currentQuestion]);

  const handleTimeUp = async () => {
    if (!session || !currentQuestion || !user || isSubmitting) return;

    console.log('⏰ Time is up! Auto-submitting...');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    await handleSubmitAnswer('', timeSpent);
  };

  const startNewSession = async (target: number) => {
    if (!user) return;

    try {
      const response = await api.startPracticeSession(
        user.userId,
        unitId,
        undefined,
        user.email,
        user.name,
        target
      );

      console.log('🎯 Session started with difficulty:', response.data.recommendedDifficulty);
      console.log('📝 First question difficulty:', response.data.question.difficulty);

      setSession(response.data.session);
      setCurrentQuestion(response.data.question);
      setQuestionStartTime(Date.now());
      
      if (response.data.progress) {
        setProgress(response.data.progress);
      }

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
      const response = await api.getUserProgress(user.userId, unitId);
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
      await api.getLearningInsights(user.userId, unitId);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const handleSubmitAnswer = async (answer: string, timeSpent: number) => {
    if (!session || !currentQuestion || !user) return;

    setIsSubmitting(true);
    setError(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    try {
      console.log('📝 Submitting answer for question:', currentQuestion.difficulty);
      
      const response = await api.submitAnswer(
        user.userId,
        session.id,
        currentQuestion.id,
        answer,
        timeSpent
      );

      console.log('✅ Answer submitted. Result:', response.data.isCorrect ? 'Correct' : 'Incorrect');
      console.log('📊 New difficulty level:', response.data.progress?.currentDifficulty);

      setAnswerResult(response.data);
      setAnsweredQuestions([...answeredQuestions, currentQuestion.id]);

      if (response.data.progress) {
        setProgress(response.data.progress);
      }

      if (response.data.session) {
        setSession(response.data.session);
        
        localStorage.setItem(`sessionData_${unitId}`, JSON.stringify({
          session: response.data.session,
          answeredQuestions: [...answeredQuestions, currentQuestion.id],
        }));
      }

      loadInsights();
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      setError(
        error.message || 
        'Failed to submit your answer. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!session || !user) return;

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
      
      const response = await api.getNextQuestion(
        user.userId,
        session.id,
        unitId,
        answeredQuestions
      );

      if (!response.data.question) {
        console.log('🎉 No more questions! Session complete.');
        await loadSessionSummary();
        return;
      }

      console.log('📝 Next question loaded:', response.data.question.difficulty);

      setCurrentQuestion(response.data.question);
      setQuestionStartTime(Date.now());
      
      if (isTimedMode) {
        setTimeRemaining(timePerQuestion);
      }
      
      await loadProgress();
    } catch (error: any) {
      console.error('Failed to get next question:', error);
      
      if (error.message?.includes('completed all') || 
          error.message?.includes('No more questions available') ||
          error.message?.includes('Session complete')) {
        console.log('🎉 Session complete via error message');
        await loadSessionSummary();
      } else {
        setError(
          error.message || 
          'Failed to load next question. Please check your connection and try again.'
        );
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
      
      localStorage.removeItem(`session_${unitId}`);
      localStorage.removeItem(`sessionData_${unitId}`);
    } catch (error: any) {
      console.error('Failed to load session summary:', error);
      setError(
        error.message || 
        'Failed to load session summary. Please try again.'
      );
    }
  };

  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    localStorage.removeItem(`session_${unitId}`);
    localStorage.removeItem(`sessionData_${unitId}`);
    window.location.reload();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingState message="Loading practice session..." fullScreen />;
  }

  if (error && !currentQuestion) {
    return (
      <ErrorDisplay
        title="Unable to load practice session"
        message={error}
        onRetry={handleRetry}
        onGoHome={handleReturnToDashboard}
        fullScreen
      />
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
    return <LoadingState message="Loading question..." fullScreen />;
  }

  const questionsRemaining = targetQuestions - (session?.totalQuestions || 0);
  const isTimeLow = timeRemaining <= 30;
  const isTimeCritical = timeRemaining <= 10;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {unit?.name || 'Practice Session'}
            </h1>
            <p className="mt-1 text-gray-600">
              Question {(session?.totalQuestions || 0) + 1} of {targetQuestions}
              {isTimedMode && ' • Timed Mode'}
            </p>
          </div>
          
          {/* Timer Display */}
          {isTimedMode && !answerResult && (
            <div className={`flex items-center gap-3 rounded-lg px-6 py-3 ${
              isTimeCritical 
                ? 'bg-red-100 border-2 border-red-500 animate-pulse' 
                : isTimeLow 
                ? 'bg-yellow-100 border-2 border-yellow-500' 
                : 'bg-blue-100 border-2 border-blue-500'
            }`}>
              <Clock className={`h-6 w-6 ${
                isTimeCritical ? 'text-red-600' : isTimeLow ? 'text-yellow-600' : 'text-blue-600'
              }`} />
              <div>
                <p className={`text-2xl font-bold ${
                  isTimeCritical ? 'text-red-900' : isTimeLow ? 'text-yellow-900' : 'text-blue-900'
                }`}>
                  {formatTime(timeRemaining)}
                </p>
                <p className={`text-xs ${
                  isTimeCritical ? 'text-red-700' : isTimeLow ? 'text-yellow-700' : 'text-blue-700'
                }`}>
                  {isTimeCritical ? 'Hurry!' : isTimeLow ? 'Time running out' : 'Time remaining'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Warning banner for time running out */}
        {isTimedMode && isTimeLow && !answerResult && (
          <div className={`mb-6 rounded-lg p-4 ${
            isTimeCritical ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${
                isTimeCritical ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <p className={`text-sm font-medium ${
                isTimeCritical ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {isTimeCritical 
                  ? '⚠️ Less than 10 seconds left! Answer will auto-submit at 0:00' 
                  : '⏰ Less than 30 seconds remaining'}
              </p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && currentQuestion && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-600 hover:text-red-800"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

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
                startTime={questionStartTime}
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

export default function PracticePage() {
  return (
    <ProtectedRoute 
      requireFeature="practice_test"
      requireCourse="apcs-a"
      fallbackUrl="/dashboard"
    >
      <PracticeSessionContent />
    </ProtectedRoute>
  );
}