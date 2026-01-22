'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  Code,
} from 'lucide-react';
import { examApi } from '@/lib/examApi';
import type { FullExamAttempt, ExamAttemptMCQ } from '@/types/exam';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Helper function to process line breaks while preserving code blocks
const processLineBreaks = (text: string): string => {
  if (!text) return '';
  
  // Split by code blocks (``` ... ```) to preserve them
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    // Odd indices are code blocks - leave them unchanged
    if (index % 2 === 1) return part;
    
    // For non-code parts, convert single newlines to markdown line breaks (two spaces + newline)
    // But don't convert if there are already two consecutive newlines (paragraph break)
    return part.replace(/(?<!\n)\n(?!\n)/g, '  \n');
  }).join('');
};

export default function FullExamPage() {
  const params = useParams();
  const router = useRouter();
  const examAttemptId = params.examAttemptId as string;

  const [examAttempt, setExamAttempt] = useState<FullExamAttempt | null>(null);
  const [currentSection, setCurrentSection] = useState<'MCQ' | 'FRQ'>('MCQ');
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // MCQ Timer (90 minutes = 5400 seconds)
  const [mcqTimeRemaining, setMcqTimeRemaining] = useState(5400);
  const [mcqStartTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadExamAttempt();
  }, [examAttemptId]);

  // Handle navigation to FRQ section
  useEffect(() => {
    if (currentSection === 'FRQ') {
      router.push(`/dashboard/full-exam/${examAttemptId}/frq`);
    }
  }, [currentSection, examAttemptId, router]);

  // Timer
  useEffect(() => {
    if (currentSection !== 'MCQ' || !examAttempt) return;

    timerRef.current = setInterval(() => {
      setMcqTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmitMCQ();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSection, examAttempt]);

  const loadExamAttempt = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExamAttempt(examAttemptId);
      setExamAttempt(response.data.examAttempt);
    } catch (error) {
      console.error('Failed to load exam:', error);
      alert('Failed to load exam');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMCQAnswer = async (answer: string) => {
    if (!examAttempt) return;

    const currentQuestion = examAttempt.mcqResponses[currentMCQIndex];
    const timeSpent = Math.floor((Date.now() - mcqStartTime) / 1000);

    try {
      await examApi.submitMCQAnswer({
        examAttemptId,
        orderIndex: currentQuestion.orderIndex,
        userAnswer: answer,
        timeSpent,
      });

      // Update local state
      const updated = { ...examAttempt };
      updated.mcqResponses[currentMCQIndex].userAnswer = answer;
      setExamAttempt(updated);
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleFlagQuestion = async () => {
    if (!examAttempt) return;

    const currentQuestion = examAttempt.mcqResponses[currentMCQIndex];

    try {
      await examApi.flagMCQForReview({
        examAttemptId,
        orderIndex: currentQuestion.orderIndex,
        flagged: !currentQuestion.flaggedForReview,
      });

      // Update local state
      const updated = { ...examAttempt };
      updated.mcqResponses[currentMCQIndex].flaggedForReview = !currentQuestion.flaggedForReview;
      setExamAttempt(updated);
    } catch (error) {
      console.error('Failed to flag question:', error);
    }
  };

  const handleAutoSubmitMCQ = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    alert('Time is up for MCQ section! Moving to FRQ section...');
    setCurrentSection('FRQ');
  };

  const handleFinishMCQ = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const unanswered = examAttempt?.mcqResponses.filter(r => !r.userAnswer).length || 0;
    
    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Are you sure you want to move to FRQ section?`
      );
      if (!confirm) return;
    }

    setCurrentSection('FRQ');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Markdown components for rendering
  const markdownComponents = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      // Check if it's a code block (has language or is multiline without inline flag)
      if (!inline && (match || codeString.includes('\n'))) {
        return (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match ? match[1] : 'java'}
            PreTag="div"
            customStyle={{
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.875rem',
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        );
      }
      
      // Inline code
      return (
        <code 
          className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" 
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }: any) => {
      // Just return children - the code component handles the styling
      return <>{children}</>;
    },
    p: ({ children }: any) => (
      <p className="mb-4 text-gray-900 leading-relaxed last:mb-0">{children}</p>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-gray-100">{children}</thead>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-300">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
        {children}
      </td>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="text-gray-900">{children}</li>
    ),
  };

  if (loading || !examAttempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show loading state while navigating to FRQ
  if (currentSection === 'FRQ') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Moving to FRQ section...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = examAttempt.mcqResponses[currentMCQIndex];
  const answered = examAttempt.mcqResponses.filter(r => r.userAnswer).length;
  const flagged = examAttempt.mcqResponses.filter(r => r.flaggedForReview).length;
  const isTimeLow = mcqTimeRemaining <= 600; // 10 minutes
  const isTimeCritical = mcqTimeRemaining <= 300; // 5 minutes

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Section Info */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Section I: Multiple Choice
              </h1>
              <p className="text-sm text-gray-600">
                Question {currentMCQIndex + 1} of 42
              </p>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-3 px-6 py-3 rounded-lg ${
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
                  {formatTime(mcqTimeRemaining)}
                </p>
                <p className={`text-xs ${
                  isTimeCritical ? 'text-red-700' : isTimeLow ? 'text-yellow-700' : 'text-blue-700'
                }`}>
                  Time Remaining
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Answered: <span className="font-semibold text-green-600">{answered}/42</span>
              </p>
              <p className="text-sm text-gray-600">
                Flagged: <span className="font-semibold text-yellow-600">{flagged}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <Card className="p-4 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-7 gap-2">
              {examAttempt.mcqResponses.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentMCQIndex(index)}
                  className={`w-10 h-10 rounded flex items-center justify-center text-sm font-semibold transition-all ${
                    index === currentMCQIndex
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2'
                      : q.flaggedForReview
                      ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                      : q.userAnswer
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </Card>

          {/* Question Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-8">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-600">
                      {currentMCQIndex + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Question {currentMCQIndex + 1}</h2>
                    <p className="text-sm text-gray-600">
                      Unit {currentQuestion.question.unit?.unitNumber}: {currentQuestion.question.unit?.name}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFlagQuestion}
                  className={currentQuestion.flaggedForReview ? 'border-yellow-500 bg-yellow-50' : ''}
                >
                  <Flag className={`h-4 w-4 ${currentQuestion.flaggedForReview ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </Button>
              </div>

              {/* Question Text with Markdown Support */}
              <div className="mb-8">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {processLineBreaks(currentQuestion.question.questionText)}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Answer Options with Markdown Support */}
              <div className="space-y-3">
                {currentQuestion.question.options?.map((option: string, index: number) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = currentQuestion.userAnswer === letter;

                  return (
                    <button
                      key={letter}
                      onClick={() => handleMCQAnswer(letter)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {letter}
                        </div>
                        <div className="flex-1 pt-1 prose max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {processLineBreaks(option)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentMCQIndex(Math.max(0, currentMCQIndex - 1))}
                disabled={currentMCQIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentMCQIndex === 41 ? (
                <Button onClick={handleFinishMCQ} size="lg">
                  Finish MCQ Section & Continue to FRQ
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentMCQIndex(Math.min(41, currentMCQIndex + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}