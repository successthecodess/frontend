'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Code,
  Save,
  Send,
  AlertTriangle,
  CheckCircle,
  FileText,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { examApi } from '@/lib/examApi';
import type { FullExamAttempt, PartResponse } from '@/types/exam';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function FRQExamPage() {
  const params = useParams();
  const router = useRouter();
  const examAttemptId = params.examAttemptId as string;

  const [examAttempt, setExamAttempt] = useState<FullExamAttempt | null>(null);
  const [currentFRQIndex, setCurrentFRQIndex] = useState(0);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [partCodes, setPartCodes] = useState<Record<string, string>>({});
  const [initializedFRQs, setInitializedFRQs] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // FRQ Timer (90 minutes = 5400 seconds)
  const [frqTimeRemaining, setFrqTimeRemaining] = useState(5400);
  const [frqStartTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadExamAttempt();
  }, [examAttemptId]);

  useEffect(() => {
    if (!examAttempt) return;

    timerRef.current = setInterval(() => {
      setFrqTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examAttempt]);

  // FIXED: Initialize part codes only once per FRQ
  useEffect(() => {
    if (!examAttempt) return;
    
    // ALWAYS reset part index when changing FRQs
    setCurrentPartIndex(0);
    
    // Only initialize if we haven't initialized this FRQ yet
    if (initializedFRQs.has(currentFRQIndex)) {
      return;
    }
    
    const currentFRQ = examAttempt.frqResponses[currentFRQIndex];
    const parts = currentFRQ.question.frqParts || [];
    
    setPartCodes(prevCodes => {
      const newPartCodes: Record<string, string> = { ...prevCodes };
      
      if (currentFRQ.partResponses && currentFRQ.partResponses.length > 0) {
        // Load from saved responses
        currentFRQ.partResponses.forEach((response: PartResponse) => {
          const key = `${currentFRQIndex}-${response.partLetter}`;
          newPartCodes[key] = response.userCode || '';
        });
      } else if (parts.length > 0) {
        // Initialize with starter code for new parts
        parts.forEach((part: any) => {
          const key = `${currentFRQIndex}-${part.partLetter}`;
          newPartCodes[key] = part.starterCode || currentFRQ.question.starterCode || '';
        });
      } else {
        // Single part question
        const key = `${currentFRQIndex}-single`;
        newPartCodes[key] = currentFRQ.userCode || currentFRQ.question.starterCode || '';
      }
      
      return newPartCodes;
    });
    
    // Mark this FRQ as initialized
    setInitializedFRQs(prev => new Set([...prev, currentFRQIndex]));
  }, [currentFRQIndex, examAttempt]);

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

  const getCurrentCode = () => {
    if (!examAttempt) return '';
    
    const currentFRQ = examAttempt.frqResponses[currentFRQIndex];
    const parts = currentFRQ.question.frqParts || [];
    
    if (parts.length > 0) {
      // Safety check: ensure currentPartIndex is valid
      const validPartIndex = Math.min(currentPartIndex, parts.length - 1);
      const currentPart = parts[validPartIndex];
      
      if (!currentPart) {
        console.warn('No valid part found, returning empty string');
        return '';
      }
      
      const key = `${currentFRQIndex}-${currentPart.partLetter}`;
      return partCodes[key] || '';
    } else {
      const key = `${currentFRQIndex}-single`;
      return partCodes[key] || '';
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    
    if (!examAttempt) return;
    
    const currentFRQ = examAttempt.frqResponses[currentFRQIndex];
    const parts = currentFRQ.question.frqParts || [];
    
    let key: string;
    if (parts.length > 0) {
      // Safety check: ensure currentPartIndex is valid
      const validPartIndex = Math.min(currentPartIndex, parts.length - 1);
      const currentPart = parts[validPartIndex];
      
      if (!currentPart) {
        console.warn('No valid part found, cannot save code');
        return;
      }
      
      key = `${currentFRQIndex}-${currentPart.partLetter}`;
    } else {
      key = `${currentFRQIndex}-single`;
    }
    
    // Update the code in state
    setPartCodes(prev => ({ ...prev, [key]: newCode }));

    // Clear existing timeout
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    
    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      handleSaveFRQ();
    }, 3000);
    
    setAutoSaveTimeout(timeout);
  };

  const handleSaveFRQ = async () => {
    if (!examAttempt) return;

    const currentFRQ = examAttempt.frqResponses[currentFRQIndex];
    const parts = currentFRQ.question.frqParts || [];
    const timeSpent = Math.floor((Date.now() - frqStartTime) / 1000);

    // Save the current state of partCodes before making the API call
    const currentPartCodes = { ...partCodes };

    try {
      setSaving(true);
      
      const partResponses: PartResponse[] | undefined = parts.length > 0
        ? parts.map((part: any): PartResponse => {
            const key = `${currentFRQIndex}-${part.partLetter}`;
            return {
              partLetter: part.partLetter,
              userCode: currentPartCodes[key] || '',
              timeSpent: timeSpent,
            };
          })
        : undefined;
      
      const combinedCode = parts.length > 0
        ? parts.map((part: any) => {
            const key = `${currentFRQIndex}-${part.partLetter}`;
            return `// Part ${part.partLetter}\n${currentPartCodes[key] || ''}\n`;
          }).join('\n')
        : currentPartCodes[`${currentFRQIndex}-single`] || '';

      await examApi.submitFRQAnswer({
        examAttemptId,
        frqNumber: currentFRQ.frqNumber,
        userCode: combinedCode,
        partResponses: partResponses,
        timeSpent,
      });

      // Update examAttempt but DON'T touch partCodes
      setExamAttempt(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.frqResponses[currentFRQIndex] = {
          ...updated.frqResponses[currentFRQIndex],
          userCode: combinedCode,
          partResponses: partResponses,
        };
        return updated;
      });

      console.log('✅ FRQ saved successfully');
    } catch (error) {
      console.error('❌ Failed to save FRQ:', error);
      // partCodes remain unchanged on error
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = () => {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    handleSaveFRQ();
  };

  const handleAutoSubmitExam = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    alert('Time is up! Submitting your exam...');
    await handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (!examAttempt) return;

    // Save current FRQ before submitting
    await handleSaveFRQ();

    const unanswered = examAttempt.frqResponses.filter(r => !r.userCode || r.userCode.trim() === '').length;
    
    if (unanswered > 0 && frqTimeRemaining > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered FRQ(s). Are you sure you want to submit your exam?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      const totalTimeSpent = Math.floor((Date.now() - new Date(examAttempt.startedAt).getTime()) / 1000);
      
      await examApi.submitFullExam({
        examAttemptId,
        totalTimeSpent,
      });

      if (timerRef.current) clearInterval(timerRef.current);

      router.push(`/dashboard/full-exam/${examAttemptId}/results`);
    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert('Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    p: ({children}: any) => (
      <p className="mb-3 text-gray-900 leading-relaxed last:mb-0">{children}</p>
    ),
    table: ({children}: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
          {children}
        </table>
      </div>
    ),
    thead: ({children}: any) => (
      <thead className="bg-gray-100">{children}</thead>
    ),
    th: ({children}: any) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-300">
        {children}
      </th>
    ),
    td: ({children}: any) => (
      <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
        {children}
      </td>
    ),
    ul: ({children}: any) => (
      <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
    ),
    ol: ({children}: any) => (
      <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
    ),
    li: ({children}: any) => (
      <li className="text-gray-900">{children}</li>
    ),
  };

  if (loading || !examAttempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentFRQ = examAttempt.frqResponses[currentFRQIndex];
  const parts = currentFRQ.question.frqParts || [];
  const answered = examAttempt.frqResponses.filter(r => r.userCode && r.userCode.trim() !== '').length;
  const isTimeLow = frqTimeRemaining <= 600;
  const isTimeCritical = frqTimeRemaining <= 300;

  const getFRQTypeName = (frqNumber: number) => {
    switch (frqNumber) {
      case 1: return 'Methods and Control Structures';
      case 2: return 'Classes';
      case 3: return 'Data Analysis with ArrayList';
      case 4: return '2D Array';
      default: return `Question ${frqNumber}`;
    }
  };

  const currentPart = parts.length > 0 && currentPartIndex < parts.length 
    ? parts[currentPartIndex] 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Section Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Section II: Free Response Questions
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Question {currentFRQIndex + 1} of 4 • {getFRQTypeName(currentFRQIndex + 1)}
                  {currentPart && ` • Part (${currentPart.partLetter})`}
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg ${
              isTimeCritical
                ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
                : isTimeLow
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600'
            }`}>
              <Clock className="h-6 w-6 text-white" />
              <div>
                <p className="text-3xl font-bold text-white">
                  {formatTime(frqTimeRemaining)}
                </p>
                <p className="text-xs text-white/90 font-medium">
                  Time Remaining
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-2xl text-green-600">{answered}</span>
                  <span className="text-gray-400">/4</span>
                </p>
              </div>
              {saving && (
                <p className="text-xs text-blue-600 flex items-center gap-1 justify-end font-medium">
                  Saving...
                </p>
              )}
              {!saving && (
                <p className="text-xs text-green-600 flex items-center gap-1 justify-end font-medium">
                  <CheckCircle className="h-3 w-3" />
                  Auto-saved
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Navigator</h3>
              </div>

              <div className="space-y-3">
                {examAttempt.frqResponses.map((frq, index) => (
                  <button
                    key={frq.id}
                    onClick={() => setCurrentFRQIndex(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                      index === currentFRQIndex
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-lg scale-105'
                        : frq.userCode && frq.userCode.trim() !== ''
                        ? 'border-green-200 bg-green-50 hover:border-green-400 hover:shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${
                        index === currentFRQIndex
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                          : frq.userCode && frq.userCode.trim() !== ''
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        Question {index + 1}
                      </span>
                      {frq.userCode && frq.userCode.trim() !== '' && (
                        <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-medium ml-11">
                      {getFRQTypeName(index + 1)}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <Button
                  onClick={handleManualSave}
                  variant="outline"
                  className="w-full border-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Current
                </Button>
                <Button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Exam
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* FRQ Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question Context (if multi-part) */}
            {parts.length > 0 && (
              <Card className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-3">Question Context</h3>
                    <div className="prose prose-lg max-w-none bg-white/60 rounded-lg p-4 backdrop-blur-sm">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {currentFRQ.question.promptText}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Class Information */}
                {currentFRQ.question.starterCode && (
                  <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-indigo-200 shadow-inner">
                    <p className="text-xs font-bold text-indigo-900 mb-3 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Class Information:
                    </p>
                    <SyntaxHighlighter
                      language="java"
                      style={vscDarkPlus}
                      customStyle={{
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {currentFRQ.question.starterCode}
                    </SyntaxHighlighter>
                  </div>
                )}

                {/* Part Tabs */}
                <div className="mt-5 flex gap-2 flex-wrap">
                  {parts.map((part: any, index: number) => (
                    <button
                      key={part.partLetter}
                      onClick={() => setCurrentPartIndex(index)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 shadow-md ${
                        index === currentPartIndex
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105 shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-indigo-50 hover:shadow-lg border border-gray-200'
                      }`}
                    >
                      Part ({part.partLetter})
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Current Part Prompt */}
            <Card className="p-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Code className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Question {currentFRQIndex + 1}
                    {currentPart && ` Part (${currentPart.partLetter})`}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                      {currentPart ? `${currentPart.maxPoints} points` : `${currentFRQ.question.maxPoints} points`}
                    </span>
                    <span className="text-sm text-gray-600 font-medium">
                      Write your complete Java code
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200 shadow-inner">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {currentPart ? currentPart.promptText : currentFRQ.question.promptText}
                  </ReactMarkdown>
                </div>
              </div>
            </Card>

            {/* Code Editor */}
            <Card className="p-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                    <Code className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Your Solution {currentPart && `- Part (${currentPart.partLetter})`}
                  </h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">Java Editor</span>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg bg-white">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono ml-3">
                    Solution.java
                  </span>
                </div>
                <Editor
                  height="550px"
                  defaultLanguage="java"
                  value={getCurrentCode()}
                  onChange={handleCodeChange}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'on',
                    bracketPairColorization: { enabled: true },
                    autoIndent: 'full',
                    formatOnPaste: true,
                    formatOnType: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                    fontLigatures: true,
                  }}
                />
              </div>

              <div className="mt-5 flex items-start gap-3 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-inner">
                <AlertTriangle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Grading Notes:
                  </p>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Your code will be evaluated using official AP CS A rubrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Points are awarded for correct implementation of required features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Minor syntax errors may not be penalized if intent is clear</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Write complete, compilable Java code with proper structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="font-semibold text-green-700">Auto-save is active - your work is saved automatically</span>
                    </li>
                    {parts.length > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">→</span>
                        <span className="font-semibold text-purple-700">Navigate between parts using the tabs above</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentFRQIndex(Math.max(0, currentFRQIndex - 1))}
                  disabled={currentFRQIndex === 0}
                  className="border-2 hover:bg-gray-50 transition-all shadow-md"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Question
                </Button>
                
                {/* Part Navigation */}
                {parts.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPartIndex(Math.max(0, currentPartIndex - 1))}
                      disabled={currentPartIndex === 0}
                      className="border-2 hover:bg-indigo-50 transition-all shadow-md"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous Part
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPartIndex(Math.min(parts.length - 1, currentPartIndex + 1))}
                      disabled={currentPartIndex === parts.length - 1}
                      className="border-2 hover:bg-indigo-50 transition-all shadow-md"
                    >
                      Next Part
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>

              {currentFRQIndex === 3 ? (
                <Button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Submitting Exam...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit Full Exam
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentFRQIndex(Math.min(3, currentFRQIndex + 1))}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Next Question
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning for low time */}
      {isTimeLow && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <Card className={`p-5 shadow-2xl border-2 ${
            isTimeCritical ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isTimeCritical ? 'bg-red-500' : 'bg-yellow-500'
              }`}>
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className={`font-bold text-lg ${
                  isTimeCritical ? 'text-red-900' : 'text-yellow-900'
                }`}>
                  {isTimeCritical ? '⚠️ Less than 5 minutes!' : '⏰ Less than 10 minutes'}
                </p>
                <p className={`text-sm ${
                  isTimeCritical ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  Make sure to save and submit your work
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}