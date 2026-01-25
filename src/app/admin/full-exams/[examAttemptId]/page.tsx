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
  Flag,
  Code,
  FileText,
  Download,
  Mail,
  TrendingUp,
  Award,
} from 'lucide-react';
import { examApi } from '@/lib/examApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function AdminExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examAttemptId = params.examAttemptId as string;

  const [examAttempt, setExamAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'mcq' | 'frq'>('overview');
  const [selectedMCQ, setSelectedMCQ] = useState<number>(0);
  const [selectedFRQ, setSelectedFRQ] = useState<number>(0);

  useEffect(() => {
    loadExamDetails();
  }, [examAttemptId]);

  const loadExamDetails = async () => {
    try {
      setLoading(true);
      const response = await examApi.adminGetExamDetails(examAttemptId);
      console.log('📊 Full API Response:', response);
      console.log('📊 Exam Attempt:', response.data.examAttempt);
      console.log('📊 FRQ Responses:', response.data.examAttempt?.frqResponses);
      setExamAttempt(response.data.examAttempt);
    } catch (error) {
      console.error('Failed to load exam details:', error);
      alert('Failed to load exam details');
      router.push('/admin/full-exams');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailStudent = () => {
    const subject = encodeURIComponent(`Full Exam Review - Attempt #${examAttempt.attemptNumber}`);
    const body = encodeURIComponent(
`Hello ${examAttempt.user.name || examAttempt.user.email},

I've reviewed your Full Exam attempt #${examAttempt.attemptNumber} and would like to discuss your performance.

Exam Details:
- MCQ Score: ${examAttempt.mcqScore}/42 (${examAttempt.mcqPercentage?.toFixed(1)}%)
- Completed: ${new Date(examAttempt.submittedAt).toLocaleDateString()}
- Total Time: ${Math.floor((examAttempt.totalTimeSpent || 0) / 60)} minutes

Let's schedule a time to go over your results and areas for improvement.

Best regards,
Instructor`
    );

    window.location.href = `mailto:${examAttempt.user.email}?subject=${subject}&body=${body}`;
  };

  const exportToCSV = () => {
    const csvData = [
      ['Question #', 'Unit', 'User Answer', 'Correct Answer', 'Result', 'Time Spent'],
      ...examAttempt.mcqResponses.map((mcq: any, index: number) => [
        index + 1,
        mcq.question.unit?.name || 'Unknown',
        mcq.userAnswer || 'Not answered',
        mcq.question.correctAnswer,
        mcq.isCorrect ? 'Correct' : 'Incorrect',
        `${mcq.timeSpent || 0}s`,
      ]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-${examAttemptId}-mcq-results.csv`;
    a.click();
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

  const mcqCorrect = examAttempt.mcqResponses.filter((r: any) => r.isCorrect).length;
  const mcqIncorrect = examAttempt.mcqResponses.filter((r: any) => !r.isCorrect && r.userAnswer).length;
  const mcqUnanswered = examAttempt.mcqResponses.filter((r: any) => !r.userAnswer).length;
  const mcqFlagged = examAttempt.mcqResponses.filter((r: any) => r.flaggedForReview).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/full-exams')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Exams
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Exam Attempt #{examAttempt.attemptNumber}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{examAttempt.user.name || examAttempt.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(examAttempt.submittedAt || examAttempt.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor((examAttempt.totalTimeSpent || 0) / 60)} minutes</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEmailStudent}>
                <Mail className="h-4 w-4 mr-2" />
                Email Student
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Award className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('mcq')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'mcq'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              MCQ Responses (42)
            </button>
            <button
              onClick={() => setActiveTab('frq')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'frq'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="h-4 w-4 inline mr-2" />
              FRQ Responses (4)
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Score Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <h3 className="text-white/90 mb-2">MCQ Score</h3>
                <p className="text-4xl font-bold mb-1">{examAttempt.mcqScore}/42</p>
                <p className="text-white/90">{examAttempt.mcqPercentage?.toFixed(1)}% Correct</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-gray-600 mb-2">Total Time</h3>
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  {Math.floor((examAttempt.totalTimeSpent || 0) / 60)}m
                </p>
                <p className="text-gray-600">
                  {(examAttempt.totalTimeSpent || 0) % 60}s
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-gray-600 mb-2">Status</h3>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {examAttempt.status}
                </p>
                <p className="text-gray-600">
                  Submitted {new Date(examAttempt.submittedAt).toLocaleTimeString()}
                </p>
              </Card>
            </div>

            {/* MCQ Breakdown */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">MCQ Performance Breakdown</h3>
              
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-600">{mcqCorrect}</p>
                  <p className="text-sm text-gray-600">Correct</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-red-600">{mcqIncorrect}</p>
                  <p className="text-sm text-gray-600">Incorrect</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-600">{mcqUnanswered}</p>
                  <p className="text-sm text-gray-600">Unanswered</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Flag className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-yellow-600">{mcqFlagged}</p>
                  <p className="text-sm text-gray-600">Flagged</p>
                </div>
              </div>

              {/* Unit Breakdown */}
              {examAttempt.unitBreakdown && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Performance by Unit</h4>
                  <div className="space-y-3">
                    {Object.entries(examAttempt.unitBreakdown).map(([key, data]: [string, any]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{data.unitName}</p>
                            <p className="text-sm text-gray-600">
                              {data.mcqCorrect}/{data.mcqTotal} correct
                            </p>
                          </div>
                          <div className={`text-2xl font-bold ${
                            data.mcqPercentage >= 75 ? 'text-green-600' :
                            data.mcqPercentage >= 60 ? 'text-blue-600' :
                            data.mcqPercentage >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {data.mcqPercentage.toFixed(0)}%
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              data.mcqPercentage >= 75 ? 'bg-green-500' :
                              data.mcqPercentage >= 60 ? 'bg-blue-500' :
                              data.mcqPercentage >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${data.mcqPercentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {examAttempt.strengths?.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {examAttempt.weaknesses?.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                      <TrendingUp className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* MCQ Tab */}
        {activeTab === 'mcq' && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Question Navigator */}
            <Card className="p-4 h-fit">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-7 gap-2">
                {examAttempt.mcqResponses.map((mcq: any, index: number) => (
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
                    {index + 1}
                  </button>
                ))}
              </div>
            </Card>

            {/* Question Detail */}
            <Card className="p-6 lg:col-span-3">
              {(() => {
                const mcq = examAttempt.mcqResponses[selectedMCQ];
                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Question {selectedMCQ + 1}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Unit {mcq.question.unit?.unitNumber}: {mcq.question.unit?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {mcq.flaggedForReview && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            Flagged
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          mcq.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : mcq.userAnswer
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {mcq.isCorrect ? 'Correct' : mcq.userAnswer ? 'Incorrect' : 'Not Answered'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {mcq.question.questionText}
                        </ReactMarkdown>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {mcq.question.options?.map((option: string, index: number) => {
                        const letter = String.fromCharCode(65 + index);
                        const isUserAnswer = mcq.userAnswer === letter;
                        const isCorrect = mcq.question.correctAnswer === letter;

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
                                  <p className="text-sm text-green-700 font-semibold mt-2">✓ Correct Answer</p>
                                )}
                                {isUserAnswer && !isCorrect && (
                                  <p className="text-sm text-red-700 font-semibold mt-2">✗ Student's Answer</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {mcq.question.explanation && (
                      <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Explanation:</h4>
                        <div className="prose max-w-none text-gray-700">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {mcq.question.explanation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
 {/* Correct Answer */}
          <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
            <p className="text-xs font-semibold text-gray-600 mb-1">Correct Answer:</p>
            <div className="flex items-center gap-2">
             
                {mcq.question.correctAnswer}
             
           {/* //   <span className="text-sm font-semibold text-green-700">✓ This is correct</span> */}
            </div>
          </div>
        
                    {mcq.timeSpent && (
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm text-gray-600">
                          Time spent: {Math.floor(mcq.timeSpent / 60)}m {mcq.timeSpent % 60}s
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </Card>
          </div>
        )}

        {/* FRQ Tab */}
        {activeTab === 'frq' && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* FRQ Navigator */}
            <Card className="p-4 h-fit">
              <h3 className="font-semibold text-gray-900 mb-4">FRQ Questions</h3>
              <div className="space-y-2">
                {examAttempt.frqResponses.map((frq: any, index: number) => (
                  <button
                    key={frq.id}
                    onClick={() => setSelectedFRQ(index)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      index === selectedFRQ
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">FRQ {index + 1}</p>
                    <p className="text-sm text-gray-600">
                      {['Methods & Control', 'Classes', 'ArrayList', '2D Array'][index]}
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            {/* FRQ Detail */}
            <Card className="p-6 lg:col-span-3">
              {(() => {
                const frq = examAttempt.frqResponses[selectedFRQ];
                const parts = frq.question.frqParts || [];
                
                // Log everything for debugging
                console.log(`\n=== FRQ ${selectedFRQ + 1} DEBUG ===`);
                console.log('Full FRQ object:', frq);
                console.log('userCode:', frq.userCode);
                console.log('partResponses (raw):', frq.partResponses);
                console.log('partResponses type:', typeof frq.partResponses);
                console.log('question.frqParts:', parts);
                
                return (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        FRQ {selectedFRQ + 1}: {['Methods & Control', 'Classes', 'ArrayList', '2D Array'][selectedFRQ]}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {frq.question.maxPoints} points total
                      </p>
                    </div>

                    {/* Question Prompt */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Question Prompt:</h4>
                      <div className="prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {frq.question.promptText || frq.question.questionText}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Student's Code */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Student's Solution:</h4>
                      
                      {/* Simple, straightforward display */}
                      {frq.userCode && frq.userCode.trim() ? (
                        <div>
                          <p className="text-sm font-semibold text-blue-600 mb-3">
                            Student's code ({frq.userCode.length} characters):
                          </p>
                          <SyntaxHighlighter
                            language="java"
                            style={vscDarkPlus}
                            customStyle={{
                              borderRadius: '0.5rem',
                              padding: '1rem',
                            }}
                          >
                            {frq.userCode}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          <Code className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">No solution submitted</p>
                          <p className="text-sm text-gray-500 mt-1">Student did not provide code for this question</p>
                        </div>
                      )}
                    </div>

                    {/* Sample Solution and Rubric */}
                    {parts.length > 0 ? (
                      <div className="space-y-6">
                        <h4 className="font-bold text-gray-900 text-lg border-t pt-6">Sample Solutions & Rubrics</h4>
                        {parts.map((part: any, partIndex: number) => (
                          <div key={partIndex} className="border-l-4 border-blue-500 pl-6 bg-blue-50 p-4 rounded-r-lg">
                            <h5 className="font-bold text-gray-900 mb-3">
                              Part ({part.partLetter}) - {part.maxPoints} points
                            </h5>
                            
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Prompt:</p>
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                  {part.promptText}
                                </ReactMarkdown>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Sample Solution:</p>
                              <SyntaxHighlighter
                                language="java"
                                style={vscDarkPlus}
                                customStyle={{
                                  borderRadius: '0.5rem',
                                  padding: '1rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {part.sampleSolution || '// Sample solution not available'}
                              </SyntaxHighlighter>
                            </div>

                            {part.rubricPoints && part.rubricPoints.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <p className="text-sm font-semibold text-blue-900 mb-3">Scoring Rubric:</p>
                                <div className="space-y-2">
                                  {part.rubricPoints.map((rubric: any, rIndex: number) => (
                                    <div key={rIndex} className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          {rubric.criterion} ({rubric.points} {rubric.points === 1 ? 'point' : 'points'})
                                        </p>
                                        {rubric.description && (
                                          <p className="text-xs text-gray-600 mt-1">{rubric.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 border-t pt-6">
                        <h5 className="font-bold text-gray-900 mb-3">Sample Solution:</h5>
                        <div className="prose max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {frq.question.explanation || 'Sample solution not available'}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}