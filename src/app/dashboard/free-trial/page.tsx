'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Lock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Helper to parse and render text with code blocks
const renderTextWithCode = (text: string) => {
  if (!text) return null;

  const parts = text.split(/(```(?:java|python|javascript|cpp|c)?\n[\s\S]*?```)/g);

  return parts.map((part, index) => {
    const codeMatch = part.match(/```(java|python|javascript|cpp|c)?\n([\s\S]*?)```/);
    
    if (codeMatch) {
      const language = codeMatch[1] || 'java';
      const code = codeMatch[2].trim();
      
      return (
        <SyntaxHighlighter
          key={index}
          language={language}
          style={vscDarkPlus}
          className="rounded-lg my-2 text-sm"
          customStyle={{ margin: '0.5rem 0', padding: '1rem' }}
        >
          {code}
        </SyntaxHighlighter>
      );
    }
    
    return <span key={index}>{part}</span>;
  });
};

export default function FreeTrialPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]); // Pre-fetch all questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Memoize current question
  const currentQuestion = useMemo(
    () => allQuestions[currentQuestionIndex],
    [allQuestions, currentQuestionIndex]
  );

  useEffect(() => {
    if (user) {
      checkTrialStatus();
    }
  }, [user]);

  // Prefetch next question in background
  useEffect(() => {
    if (session && currentQuestionIndex < 9 && !allQuestions[currentQuestionIndex + 1]) {
      prefetchNextQuestion(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, session, allQuestions]);

  const checkTrialStatus = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/free-trial/status/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setHasUsedTrial(data.hasUsedFreeTrial);
    } catch (error) {
      console.error('Failed to check trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/free-trial/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.userId,
            userEmail: user.email,
            userName: user.name,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start trial');
      }

      const data = await response.json();
      setSession(data.data.session);
      setAllQuestions([data.data.question]); // Start with first question
      setCurrentQuestionIndex(0);
    } catch (error: any) {
      console.error('Failed to start trial:', error);
      alert(error.message || 'Failed to start free trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prefetch next question in background
  const prefetchNextQuestion = async (nextIndex: number) => {
    if (!session || nextIndex >= 10) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/free-trial/question/${session.id}/${nextIndex + 1}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      
      // Add to questions array
      setAllQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[nextIndex] = data.data.question;
        return newQuestions;
      });
    } catch (error) {
      console.error('Failed to prefetch question:', error);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !user || !currentQuestion) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/free-trial/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.userId,
            sessionId: session.id,
            questionId: currentQuestion.id,
            userAnswer: selectedAnswer,
            timeSpent: 60,
            questionNumber: currentQuestionIndex + 1,
          }),
        }
      );

      const data = await response.json();
      setResult(data.data);
      setShowResult(true);

      if (data.data.isComplete) {
        setSummary({
          totalQuestions: data.data.session.totalQuestions,
          correctAnswers: data.data.session.correctAnswers,
          accuracy: Math.round((data.data.session.correctAnswers / data.data.session.totalQuestions) * 100),
        });
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= 10) {
      return;
    }

    // Start transition animation
    setIsTransitioning(true);

    // If question is already prefetched, transition immediately
    if (allQuestions[nextIndex]) {
      setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer('');
        setResult(null);
        setCurrentQuestionIndex(nextIndex);
        setIsTransitioning(false);
      }, 300); // Smooth 300ms transition
    } else {
      // Fetch if not prefetched
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/free-trial/question/${session.id}/${nextIndex + 1}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        
        setAllQuestions(prev => {
          const newQuestions = [...prev];
          newQuestions[nextIndex] = data.data.question;
          return newQuestions;
        });

        setTimeout(() => {
          setShowResult(false);
          setSelectedAnswer('');
          setResult(null);
          setCurrentQuestionIndex(nextIndex);
          setIsTransitioning(false);
        }, 300);
      } catch (error) {
        console.error('Failed to load next question:', error);
        alert('Failed to load next question. Please refresh the page.');
        setIsTransitioning(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Trial already used
  if (hasUsedTrial && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Thanks for Trying Our Free Trial!
          </h2>
          <p className="text-gray-600 mb-6">
            You've already completed your one-time free diagnostic quiz. To continue practicing and access our full question bank, please contact your instructor for access.
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show summary after completion
  if (summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-2xl p-8 animate-in fade-in duration-500">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Free Trial Complete!
            </h2>
            <p className="text-gray-600">
              Here's how you performed on the diagnostic quiz
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-3xl font-bold text-gray-900">{summary.totalQuestions}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Correct</p>
              <p className="text-3xl font-bold text-green-600">{summary.correctAnswers}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-3xl font-bold text-indigo-600">{summary.accuracy}%</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">
              🎓 Want to Continue Learning?
            </h3>
            <p className="text-sm text-yellow-800 mb-4">
              That was just a taste! Get full access to:
            </p>
            <ul className="text-sm text-yellow-800 space-y-2 mb-4">
              <li>• Unlimited practice questions across all 10 AP CS A units</li>
              <li>• Adaptive difficulty that adjusts to your level</li>
              <li>• Full-length practice tests</li>
              <li>• Detailed analytics and progress tracking</li>
              <li>• Premium exam mode with AP score predictions</li>
            </ul>
            <p className="text-sm text-yellow-800 font-medium">
              Contact your instructor to get full access!
            </p>
          </div>

          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Show question
  if (session && currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of 10
              </span>
              <span className="text-sm text-gray-600">
                Free Diagnostic Quiz
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestionIndex + 1) / 10) * 100}%` }}
              />
            </div>
          </div>

          <Card 
            className={`p-8 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {!showResult ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {currentQuestion.unit?.name}
                    </span>
                    {currentQuestion.topic && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {currentQuestion.topic.name}
                      </span>
                    )}
                  </div>
                  <div className="text-lg text-gray-900">
                    {renderTextWithCode(currentQuestion.questionText)}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {currentQuestion.options?.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedAnswer === option
                          ? 'border-indigo-600 bg-indigo-50 scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-medium flex-shrink-0">{String.fromCharCode(65 + index)}.</span>
                        <div className="flex-1">{renderTextWithCode(option)}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer || isSubmitting}
                  className="w-full transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="mb-6 animate-in fade-in duration-300">
                  <div className={`flex items-center gap-3 mb-4 ${
                    result.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.isCorrect ? (
                      <CheckCircle className="h-8 w-8 animate-in zoom-in duration-300" />
                    ) : (
                      <XCircle className="h-8 w-8 animate-in zoom-in duration-300" />
                    )}
                    <h3 className="text-2xl font-bold">
                      {result.isCorrect ? 'Correct!' : 'Incorrect'}
                    </h3>
                  </div>

                  {!result.isCorrect && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top duration-300">
                      <p className="text-sm text-red-900 font-medium mb-1">Correct Answer:</p>
                      <div className="text-red-800">{renderTextWithCode(result.correctAnswer)}</div>
                    </div>
                  )}

                  {result.explanation && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in slide-in-from-top duration-300 delay-75">
                      <p className="text-sm text-blue-900 font-medium mb-1">Explanation:</p>
                      <div className="text-blue-800 text-sm">{renderTextWithCode(result.explanation)}</div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={nextQuestion} 
                  className="w-full transition-all"
                  disabled={isTransitioning}
                >
                  {isTransitioning ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Loading...
                    </>
                  ) : currentQuestionIndex < 9 ? (
                    <>
                      Next Question
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    'View Results'
                  )}
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-2xl p-8 animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Gift className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Try Our Free Diagnostic Quiz
          </h1>
          <p className="text-gray-600">
            Test your AP Computer Science A knowledge with 10 carefully selected questions
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-white rounded-lg border text-center">
            <p className="text-3xl font-bold text-indigo-600">10</p>
            <p className="text-sm text-gray-600">Questions</p>
          </div>
          <div className="p-4 bg-white rounded-lg border text-center">
            <p className="text-3xl font-bold text-indigo-600">All Units</p>
            <p className="text-sm text-gray-600">Covered</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">What's Included:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Questions from all 10 AP CS A units</li>
            <li>✓ Coverage of key topics including file scanning</li>
            <li>✓ Instant feedback on each answer</li>
            <li>✓ Detailed explanations</li>
            <li>✓ Performance summary at the end</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a one-time free trial. After completing the quiz, contact your instructor for full access to unlimited practice questions and tests.
          </p>
        </div>

        <Button onClick={startTrial} className="w-full" size="lg">
          Start Free Diagnostic Quiz
        </Button>
      </Card>
    </div>
  );
}