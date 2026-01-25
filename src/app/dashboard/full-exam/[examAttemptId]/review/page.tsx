'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Flag,
  FileText,
  Filter,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { examApi } from '@/lib/examApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MCQReviewPage() {
  const params = useParams();
  const router = useRouter();
  const examAttemptId = params.examAttemptId as string;

  const [examAttempt, setExamAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMCQ, setSelectedMCQ] = useState<number>(0);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

  useEffect(() => {
    loadExamDetails();
  }, [examAttemptId]);

  const loadExamDetails = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExamAttempt(examAttemptId);
      console.log('📊 Loaded exam for review:', response.data.examAttempt);
      setExamAttempt(response.data.examAttempt);
    } catch (error) {
      console.error('Failed to load exam:', error);
      alert('Failed to load exam details');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

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
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
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

  if (loading || !examAttempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const filteredQuestions = examAttempt.mcqResponses.filter((mcq: any) => {
    if (filter === 'all') return true;
    if (filter === 'correct') return mcq.isCorrect;
    if (filter === 'incorrect') return !mcq.isCorrect && mcq.userAnswer;
    if (filter === 'unanswered') return !mcq.userAnswer;
    return true;
  });

  const mcqCorrect = examAttempt.mcqResponses.filter((r: any) => r.isCorrect).length;
  const mcqIncorrect = examAttempt.mcqResponses.filter((r: any) => !r.isCorrect && r.userAnswer).length;
  const mcqUnanswered = examAttempt.mcqResponses.filter((r: any) => !r.userAnswer).length;

  const getFilterLabel = (filterType: typeof filter) => {
    switch (filterType) {
      case 'all': return 'All Questions';
      case 'correct': return 'Correct Answers';
      case 'incorrect': return 'Incorrect Answers';
      case 'unanswered': return 'Unanswered Questions';
    }
  };

  const getEmptyMessage = () => {
    switch (filter) {
      case 'correct':
        return mcqCorrect === 0 
          ? "You didn't get any questions correct in this exam. Review the explanations to improve!"
          : "No correct answers found.";
      case 'incorrect':
        return mcqIncorrect === 0
          ? "Great job! You didn't get any questions wrong."
          : "No incorrect answers found.";
      case 'unanswered':
        return mcqUnanswered === 0
          ? "Excellent! You answered all questions in this exam."
          : "No unanswered questions found.";
      default:
        return "No questions found.";
    }
  };

  // Show empty state if no filtered results
  const showEmptyState = filteredQuestions.length === 0;

  // Get current question safely
  const currentQuestion = showEmptyState ? null : filteredQuestions[selectedMCQ];
  const actualIndex = currentQuestion ? examAttempt.mcqResponses.indexOf(currentQuestion) : -1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/full-exam/${examAttemptId}/results`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                MCQ Review - All Questions & Answers
              </h1>
              <p className="text-gray-600">
                Review each question with correct answers and explanations
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <h3 className="text-white/90 text-sm mb-1">Total Score</h3>
            <p className="text-3xl font-bold">{mcqCorrect}/42</p>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <h3 className="text-green-700 text-sm mb-1 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Correct
            </h3>
            <p className="text-3xl font-bold text-green-600">{mcqCorrect}</p>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="text-red-700 text-sm mb-1 flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              Incorrect
            </h3>
            <p className="text-3xl font-bold text-red-600">{mcqIncorrect}</p>
          </Card>
          <Card className="p-4 bg-gray-50 border-gray-200">
            <h3 className="text-gray-700 text-sm mb-1 flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Unanswered
            </h3>
            <p className="text-3xl font-bold text-gray-600">{mcqUnanswered}</p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filter Questions:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter('all');
                setSelectedMCQ(0);
              }}
            >
              All ({examAttempt.mcqResponses.length})
            </Button>
            <Button
              variant={filter === 'correct' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter('correct');
                setSelectedMCQ(0);
              }}
              className={filter === 'correct' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Correct ({mcqCorrect})
            </Button>
            <Button
              variant={filter === 'incorrect' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter('incorrect');
                setSelectedMCQ(0);
              }}
              className={filter === 'incorrect' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Incorrect ({mcqIncorrect})
            </Button>
            <Button
              variant={filter === 'unanswered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter('unanswered');
                setSelectedMCQ(0);
              }}
            >
              <FileText className="h-4 w-4 mr-1" />
              Unanswered ({mcqUnanswered})
            </Button>
          </div>
        </Card>

        {/* Empty State OR Question Review */}
        {showEmptyState ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No {getFilterLabel(filter)} Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {getEmptyMessage()}
            </p>
            <Button
              onClick={() => {
                setFilter('all');
                setSelectedMCQ(0);
              }}
            >
              View All Questions
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Question Navigator */}
            <Card className="p-4 h-fit sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Questions ({filteredQuestions.length})
              </h3>
              <div className="grid grid-cols-7 gap-2 max-h-[600px] overflow-y-auto">
                {filteredQuestions.map((mcq: any, index: number) => {
                  const originalIndex = examAttempt.mcqResponses.indexOf(mcq);
                  return (
                    <button
                      key={mcq.id}
                      onClick={() => setSelectedMCQ(index)}
                      className={`w-10 h-10 rounded flex items-center justify-center text-sm font-semibold transition-all ${
                        index === selectedMCQ
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2'
                          : mcq.flaggedForReview
                          ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                          : mcq.isCorrect
                          ? 'bg-green-100 text-green-800'
                          : mcq.userAnswer
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {originalIndex + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
                  <span>Incorrect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                  <span>Flagged</span>
                </div>
              </div>
            </Card>

            {/* Question Detail */}
            {currentQuestion && (
              <Card className="p-6 lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Question {actualIndex + 1}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Unit {currentQuestion.question.unit?.unitNumber}: {currentQuestion.question.unit?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentQuestion.flaggedForReview && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Flag className="h-3 w-3" />
                        Flagged
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      currentQuestion.isCorrect
                        ? 'bg-green-100 text-green-800'
                        : currentQuestion.userAnswer
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentQuestion.isCorrect ? '✓ Correct' : currentQuestion.userAnswer ? '✗ Incorrect' : 'Not Answered'}
                    </span>
                  </div>
                </div>

                {/* Unanswered Alert */}
                {!currentQuestion.userAnswer && (
                  <div className="mb-6 bg-gray-100 border-2 border-gray-400 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900">This question was not answered</p>
                        <p className="text-sm text-gray-700">The correct answer is highlighted in green below</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {currentQuestion.question.questionText}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-3 mb-6">
                  {currentQuestion.question.options?.map((option: string, index: number) => {
                    const letter = String.fromCharCode(65 + index);
                    const isUserAnswer = currentQuestion.userAnswer === letter;
                    const isCorrectAnswer = currentQuestion.question.correctAnswer === letter;

                    return (
                      <div
                        key={letter}
                        className={`p-4 rounded-lg border-2 transition-all relative ${
                          isCorrectAnswer
                            ? 'border-green-600 bg-green-50 shadow-lg ring-2 ring-green-300'
                            : isUserAnswer && !isCorrectAnswer
                            ? 'border-red-600 bg-red-50 shadow-lg ring-2 ring-red-300'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-md border-2 flex items-center justify-center font-bold text-lg ${
                            isCorrectAnswer
                              ? 'bg-green-600 border-green-700 text-white'
                              : isUserAnswer && !isCorrectAnswer
                              ? 'bg-red-600 border-red-700 text-white'
                              : 'bg-gray-100 border-gray-300 text-gray-600'
                          }`}>
                            {isCorrectAnswer || (isUserAnswer && !isCorrectAnswer) ? '✓' : letter}
                          </div>
                          
                          <div className="flex-1">
                            <div className="prose max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {option}
                              </ReactMarkdown>
                            </div>
                            
                            {isCorrectAnswer && (
                              <div className="mt-3 flex items-center gap-2 bg-green-100 rounded-md px-3 py-2 border border-green-300">
                                <CheckCircle className="h-5 w-5 text-green-700" />
                                <p className="text-sm text-green-800 font-bold">
                                  ✓ CORRECT ANSWER
                                </p>
                              </div>
                            )}
                            
                            {isUserAnswer && !isCorrectAnswer && (
                              <div className="mt-3 flex items-center gap-2 bg-red-100 rounded-md px-3 py-2 border border-red-300">
                                <XCircle className="h-5 w-5 text-red-700" />
                                <p className="text-sm text-red-800 font-bold">
                                  ✗ YOUR ANSWER (Incorrect)
                                </p>
                              </div>
                            )}

                            {isUserAnswer && isCorrectAnswer && (
                              <div className="mt-3 flex items-center gap-2 bg-green-100 rounded-md px-3 py-2 border border-green-300">
                                <CheckCircle className="h-5 w-5 text-green-700" />
                                <p className="text-sm text-green-800 font-bold">
                                  ✓ YOUR ANSWER - Well done!
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Correct Answer Display */}
                <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-700 flex-shrink-0" />
                    <p className="text-sm font-bold text-green-900">
                      Correct Answer: <span className="text-green-700 text-lg">{currentQuestion.question.correctAnswer}</span>
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                {currentQuestion.question.explanation && (
                  <div className="border-t-2 pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-bold text-gray-900 text-lg">Explanation:</h4>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                      <div className="prose max-w-none text-gray-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {currentQuestion.question.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Spent */}
                {currentQuestion.timeSpent && (
                  <div className="border-t pt-4 mt-6">
                    <p className="text-sm text-gray-600">
                      Time spent: {Math.floor(currentQuestion.timeSpent / 60)}m {currentQuestion.timeSpent % 60}s
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMCQ(Math.max(0, selectedMCQ - 1))}
                    disabled={selectedMCQ === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-gray-600 font-medium">
                    Question {selectedMCQ + 1} of {filteredQuestions.length}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setSelectedMCQ(Math.min(filteredQuestions.length - 1, selectedMCQ + 1))}
                    disabled={selectedMCQ === filteredQuestions.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}