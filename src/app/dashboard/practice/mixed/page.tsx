'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Trophy,
  Shuffle,
  BookOpen,
  AlertTriangle,
  Target,
  ArrowRight,
  Brain,
  Award,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { MarkdownContent } from '@/components/practice/MarkdownContent';
import type { AnswerResult, ProgressMetrics } from '@/types';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  unit?: {
    id: string;
    unitNumber: number;
    name: string;
    color: string;
  };
  topic?: {
    id: string;
    name: string;
  };
}

interface SessionResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  timeSpent: number;
  questionResults: {
    questionId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    timeSpent: number;
  }[];
}

interface Session {
  id: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export default function MixedPracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Get user ID - handle different possible property names
  const getUserId = (): string | null => {
    if (!user) return null;
    return (user as any).id || (user as any).userId || (user as any)._id || (user as any).sub || null;
  };

  const userId = getUserId();

  // URL params
  const targetQuestions = parseInt(searchParams.get('questions') || '10');
  const isTimedMode = searchParams.get('timed') === 'true';
  const timePerQuestion = parseInt(searchParams.get('timePerQuestion') || '90');

  // Session states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<ProgressMetrics | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('EASY');
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionResult | null>(null);

  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(timePerQuestion);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [questionTimeSpent, setQuestionTimeSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Prefetching states
  const [prefetchedQuestion, setPrefetchedQuestion] = useState<Question | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const prefetchAbortRef = useRef<AbortController | null>(null);

  // Initialize session
  useEffect(() => {
    if (userId) {
      initializeSession();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
      if (prefetchAbortRef.current) {
        prefetchAbortRef.current.abort();
      }
    };
  }, [userId]);

  // Question time tracking (for display when not in timed mode)
  useEffect(() => {
    if (answerResult || !currentQuestion) {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
      return;
    }

    questionTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      setQuestionTimeSpent(elapsed);
    }, 1000);

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [currentQuestion, answerResult, questionStartTime]);

  // Timer countdown effect (for timed mode)
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

  // Prefetch next question with current difficulty
  const prefetchNextQuestion = useCallback(async (
    currentAnsweredQuestions: string[],
    currentSessionId: string,
    difficulty: string
  ) => {
    if (!userId || !currentSessionId) return;
    
    // Don't prefetch if we're at or near the end
    if (currentAnsweredQuestions.length >= targetQuestions - 1) {
      console.log('🔮 Skipping prefetch - session near end');
      return;
    }

    if (prefetchAbortRef.current) {
      prefetchAbortRef.current.abort();
    }

    prefetchAbortRef.current = new AbortController();
    setIsPrefetching(true);

    try {
      console.log('🔮 Prefetching next question at difficulty:', difficulty);
      
      const response = await api.getNextQuestion(
        userId,
        currentSessionId,
        undefined,
        currentAnsweredQuestions,
        true,
        difficulty
      );

      if (response.data?.question) {
        console.log('✅ Prefetched question ready:', response.data.question.difficulty);
        setPrefetchedQuestion(response.data.question);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.log('⚠️ Prefetch failed (non-critical):', error.message);
      }
    } finally {
      setIsPrefetching(false);
    }
  }, [userId, targetQuestions]);

  const initializeSession = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      localStorage.setItem('mixedTargetQuestions', targetQuestions.toString());
      localStorage.setItem('mixedIsTimedMode', isTimedMode.toString());
      localStorage.setItem('mixedTimePerQuestion', timePerQuestion.toString());

      const storedSessionId = localStorage.getItem('mixedSession');
      
      if (storedSessionId) {
        try {
          const sessionData = JSON.parse(localStorage.getItem('mixedSessionData') || '{}');
          setSession(sessionData.session);
          setSessionId(storedSessionId);
          setAnsweredQuestionIds(sessionData.answeredQuestions || []);
          setCurrentDifficulty(sessionData.currentDifficulty || 'EASY');
          
          // Check if session is already complete
          if ((sessionData.answeredQuestions || []).length >= targetQuestions) {
            console.log('🎉 Session already complete, navigating to results...');
            localStorage.removeItem('mixedSession');
            localStorage.removeItem('mixedSessionData');
            router.push(`/dashboard/practice/mixed/results/${storedSessionId}`);
            return;
          }
          
          const questionResponse = await api.getNextQuestion(
            userId,
            storedSessionId,
            undefined,
            sessionData.answeredQuestions || [],
            true,
            sessionData.currentDifficulty || 'EASY'
          );

          if (questionResponse.data?.question) {
            console.log('📝 Loaded question:', questionResponse.data.question.difficulty);
            setCurrentQuestion(questionResponse.data.question);
            setQuestionStartTime(Date.now());
            setQuestionTimeSpent(0);
            if (isTimedMode) {
              setTimeRemaining(timePerQuestion);
            }
            
            // Only prefetch if not near the end
            if ((sessionData.answeredQuestions || []).length < targetQuestions - 1) {
              prefetchNextQuestion(
                sessionData.answeredQuestions || [],
                storedSessionId,
                sessionData.currentDifficulty || 'EASY'
              );
            }
          } else {
            // No more questions, go to results
            localStorage.removeItem('mixedSession');
            localStorage.removeItem('mixedSessionData');
            router.push(`/dashboard/practice/mixed/results/${storedSessionId}`);
          }
        } catch (error) {
          console.error('Failed to resume session, starting new one:', error);
          localStorage.removeItem('mixedSession');
          localStorage.removeItem('mixedSessionData');
          await startNewSession();
        }
      } else {
        await startNewSession();
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

  const handleTimeUp = useCallback(async () => {
    if (!sessionId || !currentQuestion || !userId || isSubmitting) return;

    console.log('⏰ Time is up! Auto-submitting...');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    await handleSubmitAnswer('', timeSpent);
  }, [sessionId, currentQuestion, userId, isSubmitting, questionStartTime]);

  const startNewSession = async () => {
    if (!userId) return;

    try {
      setCurrentDifficulty('EASY');
      
      const response = await api.startPracticeSession(
        userId,
        undefined,
        undefined,
        (user as any)?.email,
        (user as any)?.name || (user as any)?.displayName,
        targetQuestions,
        true
      );

      if (response.success && response.data) {
        console.log('🎯 Mixed session started:', response.data);
        
        const newSession: Session = {
          id: response.data.sessionId,
          totalQuestions: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
        };
        
        setSession(newSession);
        setSessionId(response.data.sessionId);
        
        // Use the question from startSession response directly
        if (response.data.question) {
          console.log('📝 First question:', response.data.question.difficulty);
          setCurrentQuestion(response.data.question);
          setQuestionStartTime(Date.now());
          setQuestionTimeSpent(0);
          if (isTimedMode) {
            setTimeRemaining(timePerQuestion);
          }
        }

        // Set progress from response
        if (response.data.progress) {
          setProgress(response.data.progress);
          setCurrentDifficulty(response.data.progress.currentDifficulty || 'EASY');
        }

        localStorage.setItem('mixedSession', response.data.sessionId);
        localStorage.setItem('mixedSessionData', JSON.stringify({
          session: newSession,
          answeredQuestions: [],
          currentDifficulty: response.data.progress?.currentDifficulty || 'EASY',
        }));

        // Only prefetch if more than 1 question
        if (targetQuestions > 1) {
          prefetchNextQuestion([], response.data.sessionId, 'EASY');
        }
      } else {
        throw new Error(response.message || 'Failed to start session');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleSubmitAnswer = async (answer: string, timeSpent?: number) => {
    if (!sessionId || !currentQuestion || !userId) return;

    setIsSubmitting(true);
    setError(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
    
    const actualTimeSpent = timeSpent ?? Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      console.log('📝 Submitting answer for question:', currentQuestion.difficulty);
      console.log('📝 Answer being submitted:', answer);
      
      const response = await api.submitAnswer(
        userId,
        sessionId,
        currentQuestion.id,
        answer,
        actualTimeSpent
      );

      if (response.success) {
        const correct = response.data.isCorrect;
        console.log('✅ Answer submitted. Result:', correct ? 'Correct' : 'Incorrect');

        const newAnsweredQuestions = [...answeredQuestionIds, currentQuestion.id];
        
        // Update session counts
        const updatedSession: Session = {
          id: sessionId,
          totalQuestions: (session?.totalQuestions || 0) + 1,
          correctAnswers: (session?.correctAnswers || 0) + (correct ? 1 : 0),
          incorrectAnswers: (session?.incorrectAnswers || 0) + (correct ? 0 : 1),
        };
        
        setSession(updatedSession);
        setAnswerResult(response.data);
        setAnsweredQuestionIds(newAnsweredQuestions);

        // Update progress and difficulty from server response
        if (response.data.progress) {
          setProgress(response.data.progress);
          
          // Update current difficulty based on server response
          const newDifficulty = response.data.progress.currentDifficulty || currentDifficulty;
          console.log('📊 Difficulty update - Old:', currentDifficulty, 'New:', newDifficulty);
          
          // IMPORTANT: If difficulty changed, clear prefetched question
          if (newDifficulty !== currentDifficulty) {
            console.log('🔄 Difficulty changed! Clearing prefetched question.');
            setPrefetchedQuestion(null);
          }
          
          setCurrentDifficulty(newDifficulty);
          
          localStorage.setItem('mixedSessionData', JSON.stringify({
            session: updatedSession,
            answeredQuestions: newAnsweredQuestions,
            currentDifficulty: newDifficulty,
          }));
          
          // Only prefetch if not at target questions
          if (newAnsweredQuestions.length < targetQuestions) {
            prefetchNextQuestion(newAnsweredQuestions, sessionId, newDifficulty);
          }
        } else {
          localStorage.setItem('mixedSessionData', JSON.stringify({
            session: updatedSession,
            answeredQuestions: newAnsweredQuestions,
            currentDifficulty: currentDifficulty,
          }));
          
          // Only prefetch if not at target questions
          if (newAnsweredQuestions.length < targetQuestions) {
            setPrefetchedQuestion(null);
            prefetchNextQuestion(newAnsweredQuestions, sessionId, currentDifficulty);
          }
        }
      }
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
    if (!sessionId || !userId) return;

    // Use answeredQuestionIds.length for accurate count
    const questionsCompleted = answeredQuestionIds.length;
    
    console.log('📊 Questions completed:', questionsCompleted, '/', targetQuestions);

    if (questionsCompleted >= targetQuestions) {
      console.log('🎉 Session complete! Navigating to results...');
      
      // Clean up
      localStorage.removeItem('mixedSession');
      localStorage.removeItem('mixedSessionData');
      
      // Navigate to results page
      router.push(`/dashboard/practice/mixed/results/${sessionId}`);
      return;
    }

    try {
      setIsLoadingNext(true);
      setAnswerResult(null);
      setSelectedAnswer('');
      setError(null);
      
      // Check prefetch - MUST match current difficulty
      if (prefetchedQuestion && prefetchedQuestion.difficulty === currentDifficulty) {
        console.log('⚡ Using prefetched question:', prefetchedQuestion.difficulty);
        setCurrentQuestion(prefetchedQuestion);
        setQuestionStartTime(Date.now());
        setQuestionTimeSpent(0);
        setPrefetchedQuestion(null);
        
        if (isTimedMode) {
          setTimeRemaining(timePerQuestion);
        }
        
        // Prefetch next one if not near the end
        if (questionsCompleted < targetQuestions - 1) {
          prefetchNextQuestion(answeredQuestionIds, sessionId, currentDifficulty);
        }
        setIsLoadingNext(false);
        return;
      }
      
      // Prefetch doesn't match or doesn't exist - fetch fresh
      console.log('🔄 Getting next question at difficulty:', currentDifficulty);
      setPrefetchedQuestion(null); // Clear stale prefetch
      
      const response = await api.getNextQuestion(
        userId,
        sessionId,
        undefined,
        answeredQuestionIds,
        true,
        currentDifficulty
      );

      if (!response.data?.question) {
        console.log('🎉 No more questions! Session complete.');
        localStorage.removeItem('mixedSession');
        localStorage.removeItem('mixedSessionData');
        router.push(`/dashboard/practice/mixed/results/${sessionId}`);
        return;
      }

      // Update current difficulty from response if provided
      if (response.data.currentDifficulty) {
        setCurrentDifficulty(response.data.currentDifficulty);
      }

      console.log('📝 Next question:', response.data.question.difficulty);
      setCurrentQuestion(response.data.question);
      setQuestionStartTime(Date.now());
      setQuestionTimeSpent(0);
      
      if (isTimedMode) {
        setTimeRemaining(timePerQuestion);
      }
      
      // Prefetch if more questions remain
      if (questionsCompleted < targetQuestions - 1) {
        prefetchNextQuestion(
          answeredQuestionIds, 
          sessionId, 
          response.data.currentDifficulty || currentDifficulty
        );
      }
    } catch (error: any) {
      console.error('Failed to get next question:', error);
      
      if (error.message?.includes('completed all') || 
          error.message?.includes('No more questions') ||
          error.message?.includes('Session complete')) {
        localStorage.removeItem('mixedSession');
        localStorage.removeItem('mixedSessionData');
        router.push(`/dashboard/practice/mixed/results/${sessionId}`);
      } else {
        setError(error.message || 'Failed to load next question.');
      }
    } finally {
      setIsLoadingNext(false);
    }
  };

  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleReturnToPractice = () => {
    router.push('/dashboard/practice');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setSessionSummary(null);
    setAnswerResult(null);
    setSelectedAnswer('');
    setCurrentQuestion(null);
    setPrefetchedQuestion(null);
    setAnsweredQuestionIds([]);
    setSession(null);
    setProgress(null);
    setCurrentDifficulty('EASY');
    localStorage.removeItem('mixedSession');
    localStorage.removeItem('mixedSessionData');
    initializeSession();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toUpperCase()) {
      case 'EASY':
        return 'bg-green-100 text-green-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'HARD':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading mixed practice...</p>
        </div>
      </div>
    );
  }

  // Error state (no question loaded)
  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load practice session</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry}>
              Try Again
            </Button>
            <Button variant="outline" onClick={handleReturnToPractice}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Practice
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Session complete - Summary (Fallback)
  if (sessionSummary) {
    const accuracy = sessionSummary.accuracy || 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mixed Practice Complete!
              </h1>
              <p className="text-gray-600">
                Great job practicing across all units!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="text-3xl font-bold text-green-600">
                  {sessionSummary.correctAnswers}
                </div>
                <div className="text-sm text-green-700">Correct</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                <div className="text-3xl font-bold text-red-600">
                  {sessionSummary.incorrectAnswers}
                </div>
                <div className="text-sm text-red-700">Incorrect</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">
                  {accuracy.toFixed(0)}%
                </div>
                <div className="text-sm text-purple-700">Accuracy</div>
              </div>
            </div>

            {/* Link to full results */}
            {sessionId && (
              <Button
                size="lg"
                className="w-full mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={() => router.push(`/dashboard/practice/mixed/results/${sessionId}`)}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Detailed Results & AP Score
              </Button>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReturnToPractice}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Practice
              </Button>
              <Button
                className="flex-1"
                onClick={handleRetry}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Question not loaded yet
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  // Calculate these based on answeredQuestionIds for accuracy
  const questionsCompleted = answeredQuestionIds.length;
  const questionsRemaining = targetQuestions - questionsCompleted;
  const isTimeLow = timeRemaining <= 30;
  const isTimeCritical = timeRemaining <= 10;
  const isLastQuestion = questionsCompleted >= targetQuestions;
  const accuracy = session?.totalQuestions 
    ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
    : 0;

  // Main practice view
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shuffle className="h-8 w-8 text-purple-600" />
              Mixed Practice
            </h1>
            <p className="mt-1 text-gray-600">
              Question {questionsCompleted + (answerResult ? 0 : 1)} of {targetQuestions}
              {isTimedMode && ' • Timed Mode'}
              {' • '}
              <span className={`font-semibold ${getDifficultyColor(currentDifficulty)} px-2 py-0.5 rounded`}>
                {currentDifficulty}
              </span>
              {isPrefetching && (
                <span className="ml-2 text-xs text-purple-500">• Preloading next...</span>
              )}
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
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-600 hover:text-red-800"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {answerResult ? (
              /* Feedback Card */
              <Card className="overflow-hidden">
                {/* Result Header */}
                <div
                  className={`p-6 ${
                    answerResult.isCorrect
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-red-500 to-rose-500'
                  }`}
                >
                  <div className="flex items-center gap-4 text-white">
                    {answerResult.isCorrect ? (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                        <CheckCircle className="h-10 w-10" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                        <XCircle className="h-10 w-10" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {answerResult.isCorrect ? 'Correct!' : 'Incorrect'}
                      </h2>
                      <p className="mt-1 text-white/90">
                        {answerResult.isCorrect
                          ? 'Great job! Keep up the excellent work.'
                          : "Don't worry, let's learn from this."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Your Answer */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">
                      Your Answer:
                    </h3>
                    <div
                      className={`rounded-lg p-4 ${
                        answerResult.isCorrect
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-red-50 border-2 border-red-200'
                      }`}
                    >
                      <MarkdownContent content={answerResult.userAnswer || 'No answer selected'} />
                    </div>
                  </div>

                  {/* Correct Answer (if wrong) */}
                  {!answerResult.isCorrect && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-700">
                        Correct Answer:
                      </h3>
                      <div className="rounded-lg bg-green-50 border-2 border-green-200 p-4">
                        <MarkdownContent content={answerResult.correctAnswer} />
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                      Explanation:
                    </h3>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                      <MarkdownContent content={answerResult.explanation} />
                    </div>
                  </div>

                  {/* Progress Stats */}
                  {progress && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-center">
                        <p className="text-xs text-gray-600">Difficulty</p>
                        <p className="text-lg font-bold text-indigo-600 capitalize">
                          {progress.currentDifficulty?.toLowerCase() || 'N/A'}
                        </p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <p className="text-xs text-gray-600">Streak</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {progress.consecutiveCorrect || 0} 🔥
                        </p>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3 text-center">
                        <p className="text-xs text-gray-600">Mastery</p>
                        <p className="text-lg font-bold text-purple-600">
                          {Math.round(progress.masteryLevel || 0)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last Question Message */}
                  {questionsCompleted >= targetQuestions && (
                    <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 p-4">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-yellow-900">
                            Last Question Complete! 🎉
                          </p>
                          <p className="text-sm text-yellow-800">
                            Click continue to see your session summary
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Button */}
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-600">
                      {questionsCompleted >= targetQuestions ? (
                        <span className="font-semibold text-indigo-600">
                          Ready to view results
                        </span>
                      ) : (
                        `${targetQuestions - questionsCompleted} question${targetQuestions - questionsCompleted !== 1 ? 's' : ''} remaining`
                      )}
                    </p>
                    <Button
                      onClick={handleNextQuestion}
                      disabled={isLoadingNext}
                      size="lg"
                      className="gap-2"
                    >
                      {isLoadingNext ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : questionsCompleted >= targetQuestions ? (
                        <>
                          View Results
                          <Trophy className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              /* Question Card */
              <Card className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {currentQuestion.unit && (
                        <Badge
                          className="text-white"
                          style={{ backgroundColor: currentQuestion.unit.color || '#8b5cf6' }}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Unit {currentQuestion.unit.unitNumber}
                        </Badge>
                      )}
                      {currentQuestion.topic && (
                        <Badge variant="secondary">{currentQuestion.topic.name}</Badge>
                      )}
                      <Badge variant="outline" className={`capitalize ${getDifficultyColor(currentQuestion.difficulty)}`}>
                        {currentQuestion.difficulty.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  {!isTimedMode && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {formatTime(questionTimeSpent)}
                    </div>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <MarkdownContent content={currentQuestion.questionText} />
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;

                    return (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => !isSubmitting && setSelectedAnswer(option)}
                      >
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1 cursor-pointer text-base leading-relaxed">
                          <MarkdownContent content={option} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      if (selectedAnswer) {
                        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
                        handleSubmitAnswer(selectedAnswer, timeSpent);
                      }
                    }}
                    disabled={!selectedAnswer || isSubmitting}
                    size="lg"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Progress Card */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-bold">Session Progress</h2>
              
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="font-bold text-indigo-600">
                      {questionsCompleted} / {targetQuestions}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${(questionsCompleted / targetQuestions) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Accuracy */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Accuracy</span>
                    <span className="font-bold text-indigo-600">{accuracy}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>

                {/* Current Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="h-4 w-4" />
                    <span>Current Level</span>
                  </div>
                  <span className={`font-bold capitalize px-2 py-1 rounded ${getDifficultyColor(currentDifficulty)}`}>
                    {currentDifficulty.toLowerCase()}
                  </span>
                </div>

                {/* Correct Streak */}
                {progress && (progress.consecutiveCorrect || 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Correct Streak</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {progress.consecutiveCorrect} 🔥
                    </span>
                  </div>
                )}

                {/* Mastery Level */}
                {progress && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="h-4 w-4" />
                      <span>Mastery Level</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {progress.masteryLevel || 0}%
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="border-t pt-4 grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{session?.correctAnswers || 0}</p>
                    <p className="text-xs text-green-700">Correct</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{session?.incorrectAnswers || 0}</p>
                    <p className="text-xs text-red-700">Incorrect</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Adaptive Learning Info Card */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <Brain className="h-6 w-6 text-indigo-600" />
                Adaptive Learning
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentDifficulty === 'EASY' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={currentDifficulty === 'EASY' ? 'font-semibold text-green-700' : 'text-gray-600'}>
                    Easy - Building foundations
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentDifficulty === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                  <span className={currentDifficulty === 'MEDIUM' ? 'font-semibold text-yellow-700' : 'text-gray-600'}>
                    Medium - Strengthening skills
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentDifficulty === 'HARD' ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <span className={currentDifficulty === 'HARD' ? 'font-semibold text-red-700' : 'text-gray-600'}>
                    Hard - Mastery level
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <p className="text-xs text-indigo-700">
                    💡 Get 3 correct in a row to level up! Miss 2 in a row to get easier questions.
                  </p>
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Mixed Practice Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Questions come from all 10 AP units randomly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Difficulty adapts based on your performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Great preparation for the real AP exam format</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}