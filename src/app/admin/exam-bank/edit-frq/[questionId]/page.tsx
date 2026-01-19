'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Table as TableIcon, 
  Eye, 
  Code, 
  FileText,
  Sparkles,
  Award,
  BookOpen,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { examApi } from '@/lib/examApi';
import type { ExamUnit } from '@/types/exam';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FRQPart {
  partLetter: string;
  promptText: string;
  starterCode: string;
  maxPoints: number;
  rubricPoints: { criterion: string; points: number; description: string }[];
  sampleSolution: string;
}

interface TableData {
  rows: number;
  cols: number;
  data: string[][];
}

// Helper function to convert single newlines to line breaks
// This adds two spaces before each newline, which Markdown renders as <br/>
const processLineBreaks = (text: string): string => {
  if (!text) return '';
  
  // Split by code blocks to avoid processing inside them
  const codeBlockRegex = /(```[\s\S]*?```|`[^`]+`)/g;
  const parts = text.split(codeBlockRegex);
  
  return parts.map((part) => {
    // If it's a code block, don't process
    if (part.startsWith('```') || part.startsWith('`')) {
      return part;
    }
    // Replace single newlines (not double) with two spaces + newline
    return part.replace(/(?<!\n)\n(?!\n)/g, '  \n');
  }).join('');
};

// Shared markdown components
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
    <p className="mb-4 text-gray-800 leading-relaxed last:mb-0">{children}</p>
  ),
  table: ({children}: any) => (
    <div className="overflow-x-auto my-6">
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

export default function EditFRQPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.questionId as string;
  
  const [units, setUnits] = useState<ExamUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPartIndex, setPreviewPartIndex] = useState(0);
  const [formData, setFormData] = useState({
    unitId: '',
    frqType: 'METHODS_CONTROL',
    questionText: '',
    promptText: '',
    starterCode: '',
    maxPoints: 9,
    explanation: '',
    approved: false,
  });
  
  const [parts, setParts] = useState<FRQPart[]>([
    {
      partLetter: 'a',
      promptText: '',
      starterCode: '',
      maxPoints: 5,
      rubricPoints: [{ criterion: '', points: 1, description: '' }],
      sampleSolution: '',
    },
  ]);

  const [showTableBuilder, setShowTableBuilder] = useState<number | null>(null);
  const [tableData, setTableData] = useState<TableData>({
    rows: 3,
    cols: 3,
    data: Array(3).fill(null).map(() => Array(3).fill('')),
  });
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);

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

      setFormData({
        unitId: question.unitId || '',
        frqType: question.frqType || 'METHODS_CONTROL',
        questionText: question.questionText || '',
        promptText: question.promptText || '',
        starterCode: question.starterCode || '',
        maxPoints: question.maxPoints || 9,
        explanation: question.explanation || '',
        approved: question.approved || false,
      });

      if (question.frqParts && question.frqParts.length > 0) {
        setParts(question.frqParts.map((part: any) => ({
          partLetter: part.partLetter,
          promptText: part.promptText || '',
          starterCode: part.starterCode || '',
          maxPoints: part.maxPoints || 5,
          rubricPoints: part.rubricPoints || [{ criterion: '', points: 1, description: '' }],
          sampleSolution: part.sampleSolution || '',
        })));
      }
    } catch (error) {
      console.error('Failed to load question:', error);
      alert('Failed to load question');
      router.push('/admin/exam-bank');
    } finally {
      setLoading(false);
    }
  };

  const addPart = () => {
    const nextLetter = String.fromCharCode(97 + parts.length);
    setParts([
      ...parts,
      {
        partLetter: nextLetter,
        promptText: '',
        starterCode: '',
        maxPoints: 4,
        rubricPoints: [{ criterion: '', points: 1, description: '' }],
        sampleSolution: '',
      },
    ]);
  };

  const removePart = (index: number) => {
    if (parts.length === 1) return;
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: string, value: any) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  const addRubricPoint = (partIndex: number) => {
    const updated = [...parts];
    updated[partIndex].rubricPoints.push({ criterion: '', points: 1, description: '' });
    setParts(updated);
  };

  const removeRubricPoint = (partIndex: number, rubricIndex: number) => {
    const updated = [...parts];
    updated[partIndex].rubricPoints = updated[partIndex].rubricPoints.filter((_, i) => i !== rubricIndex);
    setParts(updated);
  };

  const updateRubricPoint = (partIndex: number, rubricIndex: number, field: string, value: any) => {
    const updated = [...parts];
    updated[partIndex].rubricPoints[rubricIndex] = {
      ...updated[partIndex].rubricPoints[rubricIndex],
      [field]: value,
    };
    setParts(updated);
  };

  const calculateTotalPoints = () => {
    return parts.reduce((sum, part) => sum + part.maxPoints, 0);
  };

  const getFRQTypeName = (frqType: string) => {
    switch (frqType) {
      case 'METHODS_CONTROL': return 'Methods and Control Structures';
      case 'CLASSES': return 'Classes';
      case 'ARRAYLIST': return 'Data Analysis with ArrayList';
      case 'TWO_D_ARRAY': return '2D Array';
      default: return frqType;
    }
  };

  const openTableBuilder = (partIndex: number) => {
    setShowTableBuilder(partIndex);
    setTableData({
      rows: 3,
      cols: 3,
      data: Array(3).fill(null).map(() => Array(3).fill('')),
    });
    setSelectedCell(null);
  };

  const addRow = () => {
    const newRow = Array(tableData.cols).fill('');
    setTableData({
      ...tableData,
      rows: tableData.rows + 1,
      data: [...tableData.data, newRow],
    });
  };

  const addColumn = () => {
    const newData = tableData.data.map(row => [...row, '']);
    setTableData({
      ...tableData,
      cols: tableData.cols + 1,
      data: newData,
    });
  };

  const deleteRow = (rowIndex: number) => {
    if (tableData.rows <= 1) return;
    setTableData({
      ...tableData,
      rows: tableData.rows - 1,
      data: tableData.data.filter((_, i) => i !== rowIndex),
    });
    setSelectedCell(null);
  };

  const deleteColumn = (colIndex: number) => {
    if (tableData.cols <= 1) return;
    setTableData({
      ...tableData,
      cols: tableData.cols - 1,
      data: tableData.data.map(row => row.filter((_, i) => i !== colIndex)),
    });
    setSelectedCell(null);
  };

  const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData.data];
    newData[rowIndex][colIndex] = value;
    setTableData({ ...tableData, data: newData });
  };

  const generateTableMarkdown = () => {
    if (tableData.data.length === 0) return '';
    
    let markdown = '\n\n';
    markdown += '| ' + tableData.data[0].map(cell => cell || ' ').join(' | ') + ' |\n';
    markdown += '| ' + tableData.data[0].map(() => '---').join(' | ') + ' |\n';
    
    for (let i = 1; i < tableData.data.length; i++) {
      markdown += '| ' + tableData.data[i].map(cell => cell || ' ').join(' | ') + ' |\n';
    }
    
    markdown += '\n';
    return markdown;
  };

  const insertTable = () => {
    const tableMarkdown = generateTableMarkdown();
    
    if (showTableBuilder === -1) {
      setFormData({ 
        ...formData, 
        promptText: formData.promptText + tableMarkdown 
      });
    } else if (showTableBuilder !== null) {
      const updated = [...parts];
      updated[showTableBuilder].promptText += tableMarkdown;
      setParts(updated);
    }
    
    setShowTableBuilder(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const totalPoints = calculateTotalPoints();

      await examApi.updateQuestion(questionId, {
        unitId: formData.unitId,
        frqType: formData.frqType,
        questionText: formData.questionText,
        promptText: formData.promptText,
        starterCode: formData.starterCode || undefined,
        frqParts: parts,
        maxPoints: totalPoints,
        explanation: formData.explanation || undefined,
        approved: formData.approved,
      });

      alert('FRQ question updated successfully!');
      router.push('/admin/exam-bank');
    } catch (error: any) {
      console.error('Failed to update question:', error);
      alert(error.message || 'Failed to update question');
    } finally {
      setSaving(false);
    }
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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-10">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/exam-bank">
              <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-8 w-8 text-yellow-300" />
                <h1 className="text-4xl font-bold text-white">Edit FRQ Question</h1>
              </div>
              <p className="text-indigo-100 text-lg">Update your AP Computer Science A Free Response Question</p>
            </div>
            <Button
              type="button"
              onClick={() => setShowPreview(true)}
              className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
              size="lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              Preview Question
            </Button>
          </div>
        </div>
      </div>

      {/* Student Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-white shadow-2xl">
            {/* Preview Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 z-10 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Student Preview</h2>
                    <p className="text-indigo-100">Experience the question as students will see it</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowPreview(false)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  variant="outline"
                >
                  Close Preview
                </Button>
              </div>

              {/* Part Tabs */}
              {parts.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => setPreviewPartIndex(-1)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                      previewPartIndex === -1
                        ? 'bg-white text-indigo-600 scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur'
                    }`}
                  >
                    <BookOpen className="inline h-4 w-4 mr-2" />
                    Context
                  </button>
                  {parts.map((part, index) => (
                    <button
                      key={index}
                      onClick={() => setPreviewPartIndex(index)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                        index === previewPartIndex
                          ? 'bg-white text-indigo-600 scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur'
                      }`}
                    >
                      Part ({part.partLetter})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Content */}
            <div className="p-8 space-y-6 bg-gray-50">
              {previewPartIndex === -1 ? (
                <>
                  <Card className="p-8 border-2 border-indigo-200 shadow-lg bg-white">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Question Context</h3>
                        <div className="prose prose-lg max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {processLineBreaks(formData.promptText) || '*No context provided yet. Add your question scenario above.*'}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {formData.starterCode && (
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="h-5 w-5 text-indigo-600" />
                          <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Class Information</p>
                        </div>
                        <SyntaxHighlighter
                          language="java"
                          style={vscDarkPlus}
                          customStyle={{
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            fontSize: '0.875rem',
                          }}
                        >
                          {formData.starterCode}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </Card>

                  <div className="text-center py-12">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-100 rounded-full text-indigo-700">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-medium">Select a part above to preview its instructions</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Card className="p-8 border-2 border-purple-200 shadow-lg bg-white">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Code className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-3xl font-bold text-gray-900">
                            {formData.questionText || 'Untitled Question'}
                          </h2>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                            Part ({parts[previewPartIndex].partLetter})
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-lg">
                            <Award className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-gray-700">{parts[previewPartIndex].maxPoints} points</span>
                          </div>
                          <span className="text-gray-600">{getFRQTypeName(formData.frqType)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {processLineBreaks(parts[previewPartIndex].promptText) || '*No instructions provided for this part yet.*'}
                      </ReactMarkdown>
                    </div>
                  </Card>

                  <Card className="p-8 border-2 border-gray-300 shadow-lg bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                          <Code className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Your Solution - Part ({parts[previewPartIndex].partLetter})
                          </h3>
                          <p className="text-sm text-gray-600">Write your Java code below</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b-2 border-gray-700">
                        <div className="flex items-center gap-3">
                          <Code className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-mono text-gray-300">Solution.java</span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">Java</span>
                      </div>
                      <SyntaxHighlighter
                        language="java"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: 0,
                          padding: '1.5rem',
                          minHeight: '400px',
                        }}
                        showLineNumbers
                      >
                        {parts[previewPartIndex].starterCode || `// Write your solution here\n// Part (${parts[previewPartIndex].partLetter})\n\npublic class Solution {\n    \n    // Your code goes here\n    \n}`}
                      </SyntaxHighlighter>
                    </div>

                    <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-blue-900 mb-2">📝 Grading Guidelines</p>
                          <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              <span>Evaluated using official AP CS A rubrics for accuracy and completeness</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              <span>Points awarded for correct implementation of required features</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              <span>Write complete, compilable Java code with proper structure and syntax</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              <span>Minor syntax errors may not be penalized if intent is clear</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>

            {/* Preview Footer */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-xl">
                    <Award className="h-5 w-5 text-indigo-600" />
                    <span className="font-bold text-indigo-900">
                      Total: {calculateTotalPoints()} points
                    </span>
                  </div>
                  {parts.length > 1 && (
                    <div className="text-sm text-gray-600">
                      {parts.map((p, i) => (
                        <span key={i} className="mr-3">
                          Part {p.partLetter}: {p.maxPoints}pts
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* Table Builder */}
      {showTableBuilder !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TableIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Insert Table</h2>
                  <p className="text-sm text-gray-600">{tableData.rows} × {tableData.cols} table</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTableBuilder(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
              <Button
                variant="outline"
                size="sm"
                onClick={addRow}
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addColumn}
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </Button>
              {selectedCell && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRow(selectedCell.row)}
                    className="text-sm text-red-600 hover:bg-red-50"
                    disabled={tableData.rows <= 1}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Row {selectedCell.row + 1}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteColumn(selectedCell.col)}
                    className="text-sm text-red-600 hover:bg-red-50"
                    disabled={tableData.cols <= 1}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Column {selectedCell.col + 1}
                  </Button>
                </>
              )}
            </div>

            <div className="flex-1 overflow-auto p-6 bg-white">
              <div className="inline-block min-w-full">
                <table className="border-collapse w-full">
                  <tbody>
                    {tableData.data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className={`border-2 transition-all ${
                              selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                                ? 'border-blue-500 bg-blue-50'
                                : rowIndex === 0
                                ? 'border-gray-400 bg-gray-100'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                          >
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                              onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                              placeholder={rowIndex === 0 ? `Column ${colIndex + 1}` : ''}
                              className={`w-full min-w-[150px] px-3 py-2 outline-none bg-transparent ${
                                rowIndex === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'
                              }`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <strong>Tip:</strong> First row will be used as table headers
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTableBuilder(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={insertTable}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Insert Table
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="p-8 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">Select a unit</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      Unit {unit.unitNumber}: {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  FRQ Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.frqType}
                  onChange={(e) => setFormData({ ...formData, frqType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="METHODS_CONTROL">Question 1: Methods and Control Structures</option>
                  <option value="CLASSES">Question 2: Classes</option>
                  <option value="ARRAYLIST">Question 3: Data Analysis with ArrayList</option>
                  <option value="TWO_D_ARRAY">Question 4: 2D Array</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Question Summary <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Brief description (e.g., 'Bird Feeder Simulation')"
                  className="py-3"
                />
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-indigo-600" />
                  <p className="text-lg font-bold text-indigo-900">
                    Total Points: {calculateTotalPoints()} <span className="text-sm font-normal text-indigo-700">(Standard is 9 points)</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Question Context */}
          <Card className="p-8 bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Question Context</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-gray-700">
                    Main Scenario/Introduction <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openTableBuilder(-1)}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <TableIcon className="h-4 w-4 mr-2" />
                    Insert Table
                  </Button>
                </div>
                <textarea
                  required
                  value={formData.promptText}
                  onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm transition-all"
                  placeholder="This question simulates birds eating at a bird feeder. The following Feeder class contains information..."
                />
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Shared context for all parts (scenario, class definition, etc.). Use Markdown for tables. Press Enter for new lines.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Class Information/Starter Code
                </label>
                <textarea
                  value={formData.starterCode}
                  onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                  rows={14}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm bg-gray-50 transition-all"
                  placeholder="public class Feeder&#10;{&#10;    private int currentFood;&#10;    public void simulateOneDay(int numBirds)&#10;    public int simulateManyDays(int numBirds, int numDays)&#10;}"
                />
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                  <Code className="h-3 w-3" />
                  Class structure shown to students (method signatures, instance variables)
                </p>
              </div>
            </div>
          </Card>

          {/* Question Parts */}
          {parts.map((part, partIndex) => (
            <Card key={partIndex} className="p-8 bg-gradient-to-br from-white to-green-50 border-l-8 border-l-green-500 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center font-bold text-white text-xl">
                    {part.partLetter}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Part ({part.partLetter})
                  </h2>
                </div>
                {parts.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePart(partIndex)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Part
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-gray-700">
                      Part ({part.partLetter}) Instructions <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openTableBuilder(partIndex)}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <TableIcon className="h-4 w-4 mr-2" />
                      Insert Table
                    </Button>
                  </div>
                  <textarea
                    required
                    value={part.promptText}
                    onChange={(e) => updatePart(partIndex, 'promptText', e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm transition-all"
                    placeholder="(a) Write the simulateOneDay method, which simulates numBirds birds or possibly a bear..."
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Use Markdown for tables and formatting. Press Enter for new lines.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Method Signature/Code Template
                  </label>
                  <textarea
                    value={part.starterCode}
                    onChange={(e) => updatePart(partIndex, 'starterCode', e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm bg-gray-50 transition-all"
                    placeholder="public void simulateOneDay(int numBirds)&#10;{"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Maximum Points for Part ({part.partLetter})
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    value={part.maxPoints}
                    onChange={(e) => updatePart(partIndex, 'maxPoints', parseInt(e.target.value))}
                    className="py-3"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Scoring Rubric</h3>
                    <Button
                      type="button"
                      onClick={() => addRubricPoint(partIndex)}
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Criterion
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {part.rubricPoints.map((rubric, rubricIndex) => (
                      <div key={rubricIndex} className="border-2 border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-4">
                            <Input
                              placeholder="Criterion (e.g., 'Declares method header correctly')"
                              value={rubric.criterion}
                              onChange={(e) => updateRubricPoint(partIndex, rubricIndex, 'criterion', e.target.value)}
                              required
                              className="font-semibold"
                            />
                            <div className="flex gap-4">
                              <div className="w-32">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Points</label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={5}
                                  placeholder="Points"
                                  value={rubric.points}
                                  onChange={(e) => updateRubricPoint(partIndex, rubricIndex, 'points', parseInt(e.target.value))}
                                  required
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                                <textarea
                                  placeholder="Detailed description..."
                                  value={rubric.description}
                                  onChange={(e) => updateRubricPoint(partIndex, rubricIndex, 'description', e.target.value)}
                                  rows={3}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                            </div>
                          </div>
                          {part.rubricPoints.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeRubricPoint(partIndex, rubricIndex)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-bold text-green-900">
                        Part ({part.partLetter}) Rubric Total:{' '}
                        {part.rubricPoints.reduce((sum, r) => sum + r.points, 0)} / {part.maxPoints} points
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Sample Solution for Part ({part.partLetter}) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={part.sampleSolution}
                    onChange={(e) => updatePart(partIndex, 'sampleSolution', e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm bg-gray-900 text-green-400 transition-all"
                    placeholder="public void simulateOneDay(int numBirds)&#10;{&#10;    // Sample solution&#10;}"
                  />
                </div>
              </div>
            </Card>
          ))}

          {/* Add Part Button */}
          {parts.length < 4 && (
            <Button
              type="button"
              onClick={addPart}
              variant="outline"
              className="w-full border-dashed border-4 border-green-300 py-8 text-lg font-semibold hover:bg-green-50 hover:border-green-400"
            >
              <Plus className="h-6 w-6 mr-3" />
              Add Part ({String.fromCharCode(97 + parts.length)})
            </Button>
          )}

          {/* Actions */}
          <Card className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="approved"
                  checked={formData.approved}
                  onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="approved" className="text-sm font-semibold text-gray-700">
                  Approve for use in exams
                </label>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/admin/exam-bank">
                  <Button type="button" variant="outline" size="lg">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={saving}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-3" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-3" />
                      Update FRQ Question
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}