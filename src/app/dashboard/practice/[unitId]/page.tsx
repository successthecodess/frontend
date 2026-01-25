'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  AlertTriangle, 
  Lock, 
  Star, 
  CheckCircle, 
  TrendingUp, 
  GraduationCap, 
  Target, 
  ArrowRight,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import type { Unit, Question, StudySession, AnswerResult, ProgressMetrics } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function PracticeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const unitId = params.unitId as string;

  // Access control states
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Session states
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

  // View results states
  const [showingResults, setShowingResults] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // ============================================
  // PREFETCHING: Store next question in advance
  // ============================================
  const [prefetchedQuestion, setPrefetchedQuestion] = useState<Question | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const prefetchAbortRef = useRef<AbortController | null>(null);

  // Markdown components for rendering
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
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
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

  // Check access first
  useEffect(() => {
    checkAccessPermissions();
  }, []);

  const checkAccessPermissions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/my-access`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🔐 Access check:', data);
        
        const canAccess = data.hasFullAccess || data.isAdmin || false;
        setHasAccess(canAccess);
        
        if (!canAccess) {
          setLoading(false);
        }
      } else {
        setHasAccess(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to check access:', error);
      setHasAccess(false);
      setLoading(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  // Initialize session after access is confirmed
  useEffect(() => {
    if (!checkingAccess && hasAccess && user) {
      initializeSession();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Cancel any pending prefetch on unmount
      if (prefetchAbortRef.current) {
        prefetchAbortRef.current.abort();
      }
    };
  }, [checkingAccess, hasAccess, user, unitId]);

  // ============================================
  // PREFETCH: Load next question in background
  // ============================================
  const prefetchNextQuestion = useCallback(async (
    currentAnsweredQuestions: string[],
    currentSession: StudySession
  ) => {
    if (!user || !currentSession) return;
    
    // Don't prefetch if we're at target questions
    if (currentSession.totalQuestions >= targetQuestions - 1) {
      console.log('🔮 Skipping prefetch - session near end');
      return;
    }

    // Cancel any existing prefetch
    if (prefetchAbortRef.current) {
      prefetchAbortRef.current.abort();
    }

    // Create new abort controller
    prefetchAbortRef.current = new AbortController();
    setIsPrefetching(true);

    try {
      console.log('🔮 Prefetching next question...');
      
      const response = await api.getNextQuestion(
        user.userId,
        currentSession.id,
        unitId,
        currentAnsweredQuestions
      );

      if (response.data.question) {
        console.log('✅ Prefetched question ready:', response.data.question.difficulty);
        setPrefetchedQuestion(response.data.question);
      }
    } catch (error: any) {
      // Don't log abort errors
      if (error.name !== 'AbortError') {
        console.log('⚠️ Prefetch failed (non-critical):', error.message);
      }
    } finally {
      setIsPrefetching(false);
    }
  }, [user, unitId, targetQuestions]);

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
            
            // Start prefetching next question
            prefetchNextQuestion(
              sessionData.answeredQuestions || [],
              sessionData.session
            );
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
      
      // Start prefetching next question immediately
      prefetchNextQuestion([], response.data.session);
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

      const newAnsweredQuestions = [...answeredQuestions, currentQuestion.id];
      
      setAnswerResult(response.data);
      setAnsweredQuestions(newAnsweredQuestions);

      if (response.data.progress) {
        setProgress(response.data.progress);
      }

      if (response.data.session) {
        setSession(response.data.session);
        
        localStorage.setItem(`sessionData_${unitId}`, JSON.stringify({
          session: response.data.session,
          answeredQuestions: newAnsweredQuestions,
        }));
        
        // Clear prefetched question since difficulty may have changed
        // and prefetch a new one based on updated progress
        setPrefetchedQuestion(null);
        prefetchNextQuestion(newAnsweredQuestions, response.data.session);
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
      
      // ============================================
      // USE PREFETCHED QUESTION IF AVAILABLE
      // ============================================
      if (prefetchedQuestion) {
        console.log('⚡ Using prefetched question (instant load):', prefetchedQuestion.difficulty);
        setCurrentQuestion(prefetchedQuestion);
        setQuestionStartTime(Date.now());
        setPrefetchedQuestion(null);
        
        if (isTimedMode) {
          setTimeRemaining(timePerQuestion);
        }
        
        await loadProgress();
        
        // Prefetch the next one
        prefetchNextQuestion(answeredQuestions, session);
        
        setIsLoadingNext(false);
        return;
      }
      
      // Fallback: Fetch if no prefetched question available
      console.log('🔄 Getting next question (no prefetch available)...');
      
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
      
      // Prefetch the next one
      prefetchNextQuestion(answeredQuestions, session);
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
      console.log('📊 Loading session summary with AI insights...');
      const response = await api.endPracticeSession(session.id);
      
      console.log('✅ Session summary loaded:', response.data.summary);
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

  // NEW: Load session answers for review
  const handleViewResults = async () => {
    if (!session) return;

    try {
      setLoadingResults(true);
      console.log('📋 Loading session answers for review...');
      
      const response = await api.getSessionAnswers(session.id);
      
      console.log('✅ Session answers loaded:', response.data.answers.length);
      setSessionAnswers(response.data.answers);
      setShowingResults(true);
    } catch (error: any) {
      console.error('Failed to load session answers:', error);
      setError(
        error.message || 
        'Failed to load session results. Please try again.'
      );
    } finally {
      setLoadingResults(false);
    }
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
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
    setPrefetchedQuestion(null);
    setShowingResults(false);
    setSessionAnswers([]);
    localStorage.removeItem(`session_${unitId}`);
    localStorage.removeItem(`sessionData_${unitId}`);
    window.location.reload();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state - checking access
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // No Access - Show Upgrade Page
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Practice Tests
            </h1>
            <h2 className="text-xl text-gray-600">
              Unit-by-Unit AP CS A Practice
            </h2>
          </div>

          {/* Premium Features */}
          <Card className="p-8 mb-6 border-2 border-blue-300 bg-gradient-to-br from-white to-blue-50">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-bold mb-4">
                <Star className="h-5 w-5" />
                PRACTICE ACCESS REQUIRED
              </div>
              <p className="text-gray-700">
                Unlock unlimited practice tests to master every AP CS A concept!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">All 10 AP Units</p>
                  <p className="text-sm text-gray-600">Practice every topic from Primitive Types to Recursion</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Adaptive Difficulty</p>
                  <p className="text-sm text-gray-600">Questions adjust to your skill level automatically</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Timed Practice Mode</p>
                  <p className="text-sm text-gray-600">Simulate real exam conditions with countdown timers</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Detailed Explanations</p>
                  <p className="text-sm text-gray-600">Learn from every question with step-by-step solutions</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-6 border-2 border-blue-300">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 mb-2">Why Practice Tests?</p>
                  <p className="text-sm text-gray-700">
                    Students who practice regularly score 1-2 points higher on the AP exam. 
                    Targeted practice helps you identify weak spots and build confidence.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Try Free Diagnostic */}
          <Card className="p-8 mb-6 border-2 border-green-400 bg-gradient-to-br from-white to-green-50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Start with Our Free Diagnostic Test!
              </h3>
              <p className="text-gray-600 mb-6">
                Take a free 10-question diagnostic to assess your current level and get personalized recommendations.
              </p>
              <Button
                onClick={() => router.push('/dashboard/free-trial')}
                size="lg"
                className="px-8 py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Target className="h-5 w-5 mr-2" />
                Take Free Diagnostic Test
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Contact for Access */}
          <Card className="p-8 bg-gray-50">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Want Full Practice Test Access?
              </h3>
              <p className="text-gray-600 mb-4">
                Contact your instructor or course administrator to get access to unlimited practice tests.
              </p>
              <p className="text-sm text-gray-500">
                If you believe you should have access, please contact support or check with your instructor.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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

  // NEW: Show results view
  if (showingResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Session Review</h1>
              <p className="mt-1 text-gray-600">
                Review all {sessionAnswers.length} questions from your practice session
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowingResults(false)}
            >
              Back to Summary
            </Button>
          </div>

          {/* Summary Stats */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <p className="text-3xl font-bold text-green-600">
                    {sessionAnswers.filter(a => a.isCorrect).length}
                  </p>
                </div>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <p className="text-3xl font-bold text-red-600">
                    {sessionAnswers.filter(a => !a.isCorrect).length}
                  </p>
                </div>
                <p className="text-sm text-gray-600">Incorrect</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-6 w-6 text-indigo-600" />
                  <p className="text-3xl font-bold text-indigo-600">
                    {((sessionAnswers.filter(a => a.isCorrect).length / sessionAnswers.length) * 100).toFixed(0)}%
                  </p>
                </div>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
            </div>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {sessionAnswers.map((answer, index) => (
              <Card key={answer.id} className="overflow-hidden">
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        answer.isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {answer.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-gray-900">Question {index + 1}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            answer.question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            answer.question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {answer.question.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {answer.question.questionText}
                        </p>
                      </div>
                    </div>
                    {expandedQuestions.has(index) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedQuestions.has(index) && (
                  <div className="border-t bg-gray-50 p-6">
                    {/* Question Text */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Question:</h4>
                      <div className="prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {answer.question.questionText}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                      {answer.question.options.map((option: string, optIndex: number) => {
                        const letter = String.fromCharCode(65 + optIndex);
                        const isCorrect = answer.question.correctAnswer === letter;
                        const isUserAnswer = answer.userAnswer === letter;

                        return (
                          <div
                            key={letter}
                            className={`p-4 rounded-lg border-2 ${
                              isCorrect
                                ? 'border-green-500 bg-green-50'
                                : isUserAnswer
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                isCorrect
                                  ? 'bg-green-600 text-white'
                                  : isUserAnswer
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {letter}
                              </div>
                              <div className="flex-1">
                                <div className="prose max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {option}
                                  </ReactMarkdown>
                                </div>
                                {isCorrect && (
                                  <p className="text-sm text-green-700 font-semibold mt-2 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Correct Answer
                                  </p>
                                )}
                                {isUserAnswer && !isCorrect && (
                                  <p className="text-sm text-red-700 font-semibold mt-2 flex items-center gap-1">
                                    <XCircle className="h-4 w-4" />
                                    Your Answer
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {answer.question.explanation && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Explanation:
                        </h4>
                        <div className="prose max-w-none text-blue-900">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {answer.question.explanation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
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
              {isPrefetching && (
                <span className="ml-2 text-xs text-indigo-500">• Preloading next...</span>
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
            
            {/* NEW: View Results Button */}
            {session && session.totalQuestions > 0 && (
              <Card className="p-4">
                <Button
                  onClick={handleViewResults}
                  disabled={loadingResults}
                  className="w-full"
                  variant="outline"
                >
                  {loadingResults ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      View All Answers
                    </>
                  )}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}