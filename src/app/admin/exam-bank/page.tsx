'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Code,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { examApi } from '@/lib/examApi';
import type { ExamBankQuestion, ExamUnit, QuestionCounts } from '@/types/exam';

export default function ExamBankPage() {
  const [questions, setQuestions] = useState<ExamBankQuestion[]>([]);
  const [units, setUnits] = useState<ExamUnit[]>([]);
  const [counts, setCounts] = useState<QuestionCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    unitId: '',
    questionType: '',
    frqType: '',
    approved: undefined as boolean | undefined,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [unitsRes, questionsRes, countsRes] = await Promise.all([
        examApi.getExamUnits(),
        examApi.getExamBankQuestions(filters),
        examApi.getQuestionCounts(),
      ]);

      setUnits(unitsRes.data.units);
      setQuestions(questionsRes.data.questions);
      setCounts(countsRes.data);
    } catch (error) {
      console.error('Failed to load exam bank data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await examApi.deleteQuestion(questionId);
      loadData();
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.questionText.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Question Bank</h1>
          <p className="text-gray-600 mt-2">
            Manage questions for full AP CS A exam simulation (42 MCQ + 4 FRQ)
          </p>
        </div>
        <div className="flex gap-3">
      
          <Link href="/admin/exam-bank/create-mcq">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add MCQ
            </Button>
          </Link>
          <Link href="/admin/exam-bank/create-frq">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add FRQ
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-3xl font-bold text-gray-900">{counts?.total || 0}</p>
            </div>
            <BookOpen className="h-10 w-10 text-indigo-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">MCQ Questions</p>
              <p className="text-3xl font-bold text-blue-600">{counts?.mcq || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Need 42+ for exam</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">FRQ Questions</p>
              <p className="text-3xl font-bold text-purple-600">{counts?.frq || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Need 1+ per type</p>
            </div>
            <Code className="h-10 w-10 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">FRQ by Type</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Methods & Control:</span>
                <span className="font-semibold">{counts?.frqByType.methodsControl || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Classes:</span>
                <span className="font-semibold">{counts?.frqByType.classes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>ArrayList:</span>
                <span className="font-semibold">{counts?.frqByType.arrayList || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>2D Array:</span>
                <span className="font-semibold">{counts?.frqByType.twoDArray || 0}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Units Info */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">2025 AP CS A Units</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {units.map(unit => (
            <div
              key={unit.id}
              className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Unit {unit.unitNumber}</h3>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                  {unit.examWeight}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{unit.name}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{unit.mcqCount || 0} MCQ</span>
                <span>{unit.frqCount || 0} FRQ</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <select
            value={filters.unitId}
            onChange={(e) => setFilters({ ...filters, unitId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Units</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                Unit {unit.unitNumber}: {unit.name}
              </option>
            ))}
          </select>

          <select
            value={filters.questionType}
            onChange={(e) => setFilters({ ...filters, questionType: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="FRQ">FRQ</option>
          </select>

          {filters.questionType === 'FRQ' && (
            <select
              value={filters.frqType}
              onChange={(e) => setFilters({ ...filters, frqType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All FRQ Types</option>
              <option value="METHODS_CONTROL">Q1: Methods & Control</option>
              <option value="CLASSES">Q2: Classes</option>
              <option value="ARRAYLIST">Q3: ArrayList</option>
              <option value="TWO_D_ARRAY">Q4: 2D Array</option>
            </select>
          )}

          <select
            value={filters.approved === undefined ? '' : String(filters.approved)}
            onChange={(e) => setFilters({ 
              ...filters, 
              approved: e.target.value === '' ? undefined : e.target.value === 'true' 
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
        </div>
      </Card>

      {/* Questions List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usage
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {question.questionText}
                      </p>
                      {question.frqType && (
                        <p className="text-xs text-gray-500 mt-1">
                          {question.frqType === 'METHODS_CONTROL' && 'Q1: Methods & Control'}
                          {question.frqType === 'CLASSES' && 'Q2: Classes'}
                          {question.frqType === 'ARRAYLIST' && 'Q3: ArrayList'}
                          {question.frqType === 'TWO_D_ARRAY' && 'Q4: 2D Array'}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      Unit {question.unit?.unitNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      question.questionType === 'MCQ'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {question.questionType === 'MCQ' ? (
                        <><FileText className="h-3 w-3" /> MCQ</>
                      ) : (
                        <><Code className="h-3 w-3" /> FRQ</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      question.difficulty === 'EASY'
                        ? 'bg-green-100 text-green-800'
                        : question.difficulty === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {question.approved ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                        <XCircle className="h-4 w-4" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {question.timesUsed} times
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link  href={
        question.questionType === 'MCQ' 
          ? `/admin/exam-bank/edit-mcq/${question.id}`
          : `/admin/exam-bank/edit-frq/${question.id}`
      }>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">No questions found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your filters or create a new question
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}