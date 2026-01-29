'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Download,
  Mail,
} from 'lucide-react';
import { examApi } from '@/lib/examApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function AdminSessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await examApi.adminGetSessionDetails(sessionId);
      setSession(response.data.session);
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Failed to load session details');
      router.push('/admin/practice-tests');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailStudent = () => {
    if (!session) return;

    const subject = encodeURIComponent(`Practice Session Review - ${new Date(session.endedAt).toLocaleDateString()}`);
    const body = encodeURIComponent(
`Hello ${session.user.name || session.user.email},

I've reviewed your practice session from ${new Date(session.endedAt).toLocaleDateString()}.

Session Details:
- Type: ${session.sessionType}
- Questions: ${session.totalQuestions}
- Accuracy: ${session.accuracyRate?.toFixed(1)}%
- Duration: ${Math.floor((session.totalDuration || 0) / 60)} minutes

Let's discuss your progress and areas for improvement.

Best regards,
Instructor`
    );

    window.location.href = `mailto:${session.user.email}?subject=${subject}&body=${body}`;
  };


const exportToCSV = () => {
  if (!session) return;

  try {
    setExporting(true);

    // Helper function to escape CSV fields
    const escapeCSV = (field: string | number | null | undefined): string => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      // If field contains comma, newline, or quotes, wrap in quotes and escape internal quotes
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Create CSV header
    const headers = [
      'Question #',
      'Unit',
      'Topic',
      'Difficulty',
      'User Answer',
      'Correct Answer',
      'Result',
      'Time Spent (s)',
      'Question Text',
    ];

    // Create CSV rows
    const rows = session.responses.map((response: any, index: number) => {
      const questionText = response.question.questionText
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200); // Limit length for CSV

      return [
        index + 1,
        response.question.unit?.name || 'Unknown',
        response.question.topic?.name || 'N/A',
        response.difficultyAtTime,
        response.userAnswer || 'Not answered',
        response.question.correctAnswer,
        response.isCorrect ? 'Correct' : 'Incorrect',
        response.timeSpent || 0,
        questionText,
      ].map(escapeCSV);
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${sessionId}-${new Date(session.endedAt).toLocaleDateString().replace(/\//g, '-')}-results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('✅ CSV exported successfully');
  } catch (error) {
    console.error('❌ Failed to export CSV:', error);
    alert('Failed to export CSV. Please try again.');
  } finally {
    setExporting(false);
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

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentResponse = session.responses[selectedQuestion];
  const correct = session.responses.filter((r: any) => r.isCorrect).length;
  const incorrect = session.responses.filter((r: any) => !r.isCorrect).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/practice-tests')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Practice Tests
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Session Details</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{session.user.name || session.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(session.endedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor((session.totalDuration || 0) / 60)} minutes</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEmailStudent}>
                <Mail className="h-4 w-4 mr-2" />
                Email Student
              </Button>
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <h3 className="text-white/90 mb-2">Session Type</h3>
            <p className="text-3xl font-bold mb-1">{session.sessionType}</p>
            <p className="text-white/90">{session.totalQuestions} Questions</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-gray-600 mb-2">Accuracy</h3>
            <p className="text-4xl font-bold text-gray-900 mb-1">
              {session.accuracyRate?.toFixed(1)}%
            </p>
            <p className="text-gray-600">{correct} / {session.totalQuestions}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-gray-600 mb-2">Avg Time per Q</h3>
            <p className="text-4xl font-bold text-gray-900 mb-1">
              {session.averageTime?.toFixed(0)}s
            </p>
            <p className="text-gray-600">Total: {Math.floor((session.totalDuration || 0) / 60)}m</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-gray-600 mb-2">Performance</h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{correct}</p>
                <p className="text-xs text-gray-600">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{incorrect}</p>
                <p className="text-xs text-gray-600">Incorrect</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Unit Breakdown */}
        {session.unitBreakdown && session.unitBreakdown.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance by Unit</h3>
            <div className="space-y-4">
              {session.unitBreakdown.map((unit: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Unit {unit.unitNumber}: {unit.unitName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {unit.correct}/{unit.total} correct
                      </p>
                    </div>
                    <div className={`text-2xl font-bold ${
                      unit.percentage >= 75 ? 'text-green-600' :
                      unit.percentage >= 60 ? 'text-blue-600' :
                      unit.percentage >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {unit.percentage.toFixed(0)}%
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        unit.percentage >= 75 ? 'bg-green-500' :
                        unit.percentage >= 60 ? 'bg-blue-500' :
                        unit.percentage >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${unit.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Question Details */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <Card className="p-4 h-fit">
            <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {session.responses.map((response: any, index: number) => (
                <button
                  key={response.id}
                  onClick={() => setSelectedQuestion(index)}
                  className={`w-10 h-10 rounded flex items-center justify-center text-sm font-semibold transition-all ${
                    index === selectedQuestion
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2'
                      : response.isCorrect
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
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
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
                <span>Incorrect</span>
              </div>
            </div>
          </Card>

          {/* Question Detail */}
          <Card className="p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Question {selectedQuestion + 1}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-600">
                    Unit {currentResponse.question.unit?.unitNumber}: {currentResponse.question.unit?.name}
                  </p>
                  {currentResponse.question.topic && (
                    <>
                      <span className="text-gray-400">•</span>
                      <p className="text-sm text-gray-600">{currentResponse.question.topic.name}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  currentResponse.difficultyAtTime === 'EASY'
                    ? 'bg-green-100 text-green-800'
                    : currentResponse.difficultyAtTime === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentResponse.difficultyAtTime}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  currentResponse.isCorrect
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentResponse.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {currentResponse.question.questionText}
                </ReactMarkdown>
              </div>
            </div>

            {/* Show incorrect answer summary if student got it wrong */}
            {!currentResponse.isCorrect && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 mb-2">Incorrect Answer</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-red-800">
                        <span className="font-medium">Student answered:</span> {currentResponse.userAnswer || 'No answer'}
                      </p>
                      <p className="text-red-800">
                        <span className="font-medium">Correct answer:</span> {currentResponse.question.correctAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentResponse.question.options?.map((option: string, index: number) => {
                const letter = String.fromCharCode(65 + index);
                const isUserAnswer = currentResponse.userAnswer === letter;
                const isCorrect = currentResponse.question.correctAnswer === letter;

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
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="h-4 w-4 text-green-700" />
                            <p className="text-sm text-green-700 font-semibold">Correct Answer</p>
                          </div>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <div className="flex items-center gap-2 mt-2">
                            <XCircle className="h-4 w-4 text-red-700" />
                            <p className="text-sm text-red-700 font-semibold">Student's Answer (Incorrect)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            {currentResponse.question.explanation && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Explanation:
                </h4>
                <div className="prose max-w-none text-gray-700 bg-gray-50 rounded-lg p-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {currentResponse.question.explanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Time Spent */}
            {currentResponse.timeSpent && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time spent: {Math.floor(currentResponse.timeSpent / 60)}m {currentResponse.timeSpent % 60}s
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedQuestion(Math.max(0, selectedQuestion - 1))}
                disabled={selectedQuestion === 0}
              >
                Previous Question
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedQuestion(Math.min(session.responses.length - 1, selectedQuestion + 1))}
                disabled={selectedQuestion === session.responses.length - 1}
              >
                Next Question
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}