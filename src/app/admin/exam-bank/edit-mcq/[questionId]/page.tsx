'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Eye, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { examApi } from '@/lib/examApi';
import type { ExamUnit } from '@/types/exam';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MCQFormData {
  unitId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  approved: boolean;
}

export default function EditMCQPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.questionId as string;
  
  const [units, setUnits] = useState<ExamUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [formData, setFormData] = useState<MCQFormData>({
    unitId: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    difficulty: 'MEDIUM',
    approved: false,
  });

  useEffect(() => {
    loadUnits();
    loadQuestion();
  }, [questionId]);

  const loadUnits = async () => {
    try {
      const res = await examApi.getExamUnits();
      setUnits(res.data.units);
    } catch (error) {
      console.error('Failed to load units:', error);
    }
  };

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const res = await examApi.getExamBankQuestions();
      const question = res.data.questions.find((q: any) => q.id === questionId);
      
      if (!question) {
        alert('Question not found');
        router.push('/admin/exam-bank');
        return;
      }

      if (question.questionType !== 'MCQ') {
        alert('This is not an MCQ question');
        router.push('/admin/exam-bank');
        return;
      }

      // Populate form data
      setFormData({
        unitId: question.unitId || '',
        questionText: question.questionText || '',
        optionA: question.options?.[0] || '',
        optionB: question.options?.[1] || '',
        optionC: question.options?.[2] || '',
        optionD: question.options?.[3] || '',
        correctAnswer: question.correctAnswer || 'A',
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'MEDIUM',
        approved: question.approved || false,
      });
    } catch (error) {
      console.error('Failed to load question:', error);
      alert('Failed to load question');
      router.push('/admin/exam-bank');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const options = [
        formData.optionA,
        formData.optionB,
        formData.optionC,
        formData.optionD,
      ];

      await examApi.updateQuestion(questionId, {
        unitId: formData.unitId,
        questionText: formData.questionText,
        options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        approved: formData.approved,
      });

      alert('MCQ question updated successfully!');
      router.push('/admin/exam-bank');
    } catch (error: any) {
      console.error('Failed to update question:', error);
      alert(error.message || 'Failed to update question');
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (letter: 'A' | 'B' | 'C' | 'D', value: string) => {
    setFormData({
      ...formData,
      [`option${letter}`]: value,
    });
  };

  const handlePreviewOpen = () => {
    setShowPreview(true);
    setSelectedAnswer('');
    setShowExplanation(false);
  };

  const handleAnswerSelect = (letter: string) => {
    setSelectedAnswer(letter);
    setShowExplanation(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HARD': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSelectedUnit = () => {
    return units.find(u => u.id === formData.unitId);
  };

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
    p: ({children}: any) => (
      <p className="mb-3 text-gray-900 leading-relaxed last:mb-0">{children}</p>
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/exam-bank">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit MCQ Question</h1>
            <p className="text-gray-600 mt-1">Update multiple choice question in the exam bank</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handlePreviewOpen}
          variant="outline"
          className="bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Question
        </Button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            {/* Preview Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 z-10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Student Preview</h2>
                  <p className="text-indigo-100">This is how students will see your question</p>
                </div>
                <Button
                  onClick={() => setShowPreview(false)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-8 space-y-6 bg-gray-50">
              <Card className="p-8 border-2 border-indigo-200 shadow-lg bg-white">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-gray-600">
                        {getSelectedUnit() ? `Unit ${getSelectedUnit()?.unitNumber}: ${getSelectedUnit()?.name}` : 'No unit selected'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(formData.difficulty)}`}>
                        {formData.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Question Text with Markdown */}
                <div className="mb-8">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {formData.questionText || '*No question text provided yet*'}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                    const optionValue = formData[`option${letter}` as keyof MCQFormData] as string;
                    const isCorrect = letter === formData.correctAnswer;
                    const isSelected = letter === selectedAnswer;
                    
                    return (
                      <button
                        key={letter}
                        onClick={() => handleAnswerSelect(letter)}
                        disabled={!optionValue}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          !optionValue
                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                            : isSelected
                            ? isCorrect
                              ? 'bg-green-50 border-green-500 shadow-md'
                              : 'bg-red-50 border-red-500 shadow-md'
                            : showExplanation && isCorrect
                            ? 'bg-green-50 border-green-500'
                            : 'bg-white border-gray-300 hover:border-indigo-400 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                            isSelected
                              ? isCorrect
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                              : showExplanation && isCorrect
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {letter}
                          </div>
                          <div className="flex-1">
                            <div className="prose max-w-none">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                              >
                                {optionValue || `*Option ${letter} not provided*`}
                              </ReactMarkdown>
                            </div>
                          </div>
                          {showExplanation && (
                            <div className="flex-shrink-0">
                              {isCorrect ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                              ) : isSelected ? (
                                <XCircle className="h-6 w-6 text-red-600" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && formData.explanation && (
                  <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">?</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-900 mb-2">Explanation</h4>
                        <div className="prose max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {formData.explanation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!showExplanation && (
                  <div className="mt-6 text-center text-gray-500 text-sm">
                    Click an answer to see the explanation
                  </div>
                )}
              </Card>
            </div>

            {/* Preview Footer */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 shadow-2xl">
              <div className="flex items-center justify-end">
                <Button 
                  onClick={() => setShowPreview(false)}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.unitId}
              onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a unit</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  Unit {unit.unitNumber}: {unit.name} ({unit.examWeight})
                </option>
              ))}
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="Enter the question... Use ```java for code blocks"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: Use <code className="bg-gray-100 px-1 py-0.5 rounded">```java</code> for code blocks, <code className="bg-gray-100 px-1 py-0.5 rounded">`code`</code> for inline code
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Answer Options <span className="text-red-500">*</span>
            </label>

            {(['A', 'B', 'C', 'D'] as const).map((letter) => (
              <div key={letter} className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-10 flex items-center justify-center rounded font-semibold ${
                  letter === formData.correctAnswer
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {letter}
                </div>
                <textarea
                  required
                  value={formData[`option${letter}` as keyof MCQFormData] as string}
                  onChange={(e) => handleOptionChange(letter, e.target.value)}
                  placeholder={`Option ${letter} - Use \`code\` for inline code`}
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
                {letter === formData.correctAnswer && (
                  <div className="flex-shrink-0 px-3 py-2 bg-green-100 text-green-700 rounded text-sm font-semibold">
                    Correct
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="Explain why this is the correct answer... Use ```java for code blocks"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports Markdown formatting including code blocks
            </p>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Approved */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="approved"
              checked={formData.approved}
              onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="approved" className="text-sm text-gray-700">
              Approve for use in exams
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Link href="/admin/exam-bank">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update MCQ Question
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}