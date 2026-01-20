'use client';

import { useEffect, useState, useMemo, useCallback, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  FileQuestion,
  BookOpen,
  FileText,
  Code,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { examApi } from '@/lib/examApi';
import type { ExamUnit, QuestionCounts } from '@/types/exam';

const ITEMS_PER_PAGE = 20;

// Memoized question row component to prevent unnecessary re-renders
const QuestionRow = memo(function QuestionRow({
  question,
  onDelete,
  onApprove,
}: {
  question: any;
  onDelete: (id: string) => void;
  onApprove: (id: string, approved: boolean) => void;
}) {
  const getFRQTypeName = (frqType: string) => {
    switch (frqType) {
      case 'METHODS_CONTROL': return 'Q1: Methods & Control';
      case 'CLASSES': return 'Q2: Classes';
      case 'ARRAYLIST': return 'Q3: ArrayList';
      case 'TWO_D_ARRAY': return 'Q4: 2D Array';
      default: return frqType;
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="max-w-md">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {question.questionText}
          </p>
          {question.frqType && (
            <p className="text-xs text-purple-600 mt-1 font-medium">
              {getFRQTypeName(question.frqType)}
            </p>
          )}
          {question.topic && (
            <Badge variant="outline" className="mt-1 text-xs">
              {question.topic.name}
            </Badge>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="secondary">
          Unit {question.unit?.unitNumber || '?'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          question.questionType === 'MCQ'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {question.questionType === 'MCQ' ? (
            <><FileText className="h-3 w-3" /> MCQ</>
          ) : (
            <><Code className="h-3 w-3" /> FRQ</>
          )}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          question.difficulty === 'EASY'
            ? 'bg-green-100 text-green-700'
            : question.difficulty === 'MEDIUM'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {question.difficulty || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {question.approved ? (
          <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Approved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-yellow-600 text-sm font-medium">
            <XCircle className="h-4 w-4" />
            Pending
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-xs text-gray-600 space-y-1">
          <div>Used: {question.timesUsed || question.timesAttempted || 0}x</div>
          {question.timesAttempted > 0 && (
            <div>
              Accuracy: {Math.round(((question.timesCorrect || 0) / question.timesAttempted) * 100)}%
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/questions/${question.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4 text-gray-500" />
            </Button>
          </Link>
          <Link href={
            question.questionType === 'MCQ' 
              ? `/admin/questions/${question.id}/edit`
              : `/admin/exam-bank/edit-frq/${question.id}`
          }>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Edit className="h-4 w-4 text-gray-500" />
            </Button>
          </Link>
          {!question.approved ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onApprove(question.id, true)}
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onApprove(question.id, false)}
            >
              <XCircle className="h-4 w-4 text-yellow-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onDelete(question.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

import { memo } from 'react';

// Memoized stats cards
const StatsCards = memo(function StatsCards({ 
  counts, 
  totalQuestions 
}: { 
  counts: QuestionCounts | null;
  totalQuestions: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 bg-gradient-to-br from-white to-indigo-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Questions</p>
            <p className="text-3xl font-bold text-gray-900">{counts?.total || totalQuestions}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">MCQ Questions</p>
            <p className="text-3xl font-bold text-blue-600">{counts?.mcq || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Need 42+ for full exam</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-white to-purple-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">FRQ Questions</p>
            <p className="text-3xl font-bold text-purple-600">{counts?.frq || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Need 1+ per type</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Code className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <p className="text-sm text-gray-600 mb-3">FRQ by Type</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Methods & Control:</span>
              <Badge variant="secondary">{counts?.frqByType?.methodsControl || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Classes:</span>
              <Badge variant="secondary">{counts?.frqByType?.classes || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ArrayList:</span>
              <Badge variant="secondary">{counts?.frqByType?.arrayList || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">2D Array:</span>
              <Badge variant="secondary">{counts?.frqByType?.twoDArray || 0}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

// Memoized units overview
const UnitsOverview = memo(function UnitsOverview({
  units,
  onUnitClick,
}: {
  units: ExamUnit[];
  onUnitClick: (unitId: string) => void;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">AP CS A Units Coverage</h2>
        <Badge variant="outline" className="text-xs">
          2025 Curriculum
        </Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {units.map(unit => (
          <div
            key={unit.id}
            className="border rounded-lg p-3 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onUnitClick(unit.id)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900 text-sm">Unit {unit.unitNumber}</span>
              <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                {unit.examWeight}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate mb-2">{unit.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {unit.mcqCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                {unit.frqCount || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [frqTypeFilter, setFrqTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [units, setUnits] = useState<ExamUnit[]>([]);
  const [counts, setCounts] = useState<QuestionCounts | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load data with optimized fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load units first (fastest, needed for UI)
        const unitsRes = await examApi.getExamUnits();
        setUnits(unitsRes.data.units || []);
        
        // Load counts in parallel with questions (show stats quickly)
        const [countsRes, practiceQuestionsRes, examQuestionsRes] = await Promise.all([
          examApi.getQuestionCounts().catch(() => ({ data: null })),
          api.getQuestions().catch(() => ({ data: { questions: [] } })),
          examApi.getExamBankQuestions({}).catch(() => ({ data: { questions: [] } })),
        ]);

        setCounts(countsRes.data);

        // Merge questions efficiently
        const practiceQuestions = practiceQuestionsRes.data.questions || [];
        const examQuestions = examQuestionsRes.data.questions || [];
        
        const questionMap = new Map();
        
        for (const q of practiceQuestions) {
          questionMap.set(q.id, {
            ...q,
            questionType: q.questionType || 'MCQ',
            source: 'practice',
          });
        }
        
        for (const q of examQuestions) {
          questionMap.set(q.id, {
            ...q,
            source: 'exam',
          });
        }

        setQuestions(Array.from(questionMap.values()));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Memoized filtered questions - only recalculate when dependencies change
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.questionText?.toLowerCase().includes(searchLower) ||
          q.explanation?.toLowerCase().includes(searchLower) ||
          q.promptText?.toLowerCase().includes(searchLower)
      );
    }

    // Unit filter
    if (unitFilter !== 'all') {
      filtered = filtered.filter((q) => q.unitId === unitFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
    }

    // Status filter
    if (statusFilter === 'approved') {
      filtered = filtered.filter((q) => q.approved);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter((q) => !q.approved);
    }

    // Type filter (MCQ/FRQ)
    if (typeFilter !== 'all') {
      filtered = filtered.filter((q) => q.questionType === typeFilter);
    }

    // FRQ Type filter
    if (frqTypeFilter !== 'all' && typeFilter === 'FRQ') {
      filtered = filtered.filter((q) => q.frqType === frqTypeFilter);
    }

    return filtered;
  }, [questions, debouncedSearch, unitFilter, difficultyFilter, statusFilter, typeFilter, frqTypeFilter]);

  // Paginated questions
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [unitFilter, difficultyFilter, statusFilter, typeFilter, frqTypeFilter]);

  const handleDelete = useCallback(async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await Promise.allSettled([
        api.deleteQuestion(questionId),
        examApi.deleteQuestion(questionId),
      ]);
      setQuestions(prev => prev.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  }, []);

  const handleApprove = useCallback(async (questionId: string, approved: boolean) => {
    try {
      await api.approveQuestion(questionId, approved);
      setQuestions(prev =>
        prev.map((q) => (q.id === questionId ? { ...q, approved } : q))
      );
    } catch (error) {
      console.error('Failed to update question:', error);
      alert('Failed to update question');
    }
  }, []);

  const clearFilters = useCallback(() => {
    startTransition(() => {
      setSearchQuery('');
      setDebouncedSearch('');
      setUnitFilter('all');
      setDifficultyFilter('all');
      setStatusFilter('all');
      setTypeFilter('all');
      setFrqTypeFilter('all');
      setCurrentPage(1);
    });
  }, []);

  const handleUnitClick = useCallback((unitId: string) => {
    startTransition(() => {
      setUnitFilter(unitId);
    });
  }, []);

  const handleFilterChange = useCallback((setter: (value: string) => void) => {
    return (value: string) => {
      startTransition(() => {
        setter(value);
      });
    };
  }, []);

  // Show skeleton loader while loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6">
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </Card>
          ))}
        </div>

        {/* Table skeleton */}
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="mt-2 text-gray-600">
            Manage all MCQ and FRQ questions for practice and full exams
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/questions/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              <FileText className="h-4 w-4" />
              Add MCQ
            </Button>
          </Link>
          <Link href="/admin/exam-bank/create-frq">
            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Plus className="h-4 w-4" />
              <Code className="h-4 w-4" />
              Add FRQ
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Memoized */}
      <StatsCards counts={counts} totalQuestions={questions.length} />

      {/* Units Overview - Memoized */}
      <UnitsOverview units={units} onUnitClick={handleUnitClick} />

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {isPending && (
            <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-6">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Unit Filter */}
          <Select value={unitFilter} onValueChange={handleFilterChange(setUnitFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="All Units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  Unit {unit.unitNumber}: {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={handleFilterChange(setTypeFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="MCQ">MCQ</SelectItem>
              <SelectItem value="FRQ">FRQ</SelectItem>
            </SelectContent>
          </Select>

          {/* FRQ Type Filter - Only show when FRQ is selected */}
          {typeFilter === 'FRQ' ? (
            <Select value={frqTypeFilter} onValueChange={handleFilterChange(setFrqTypeFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="All FRQ Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All FRQ Types</SelectItem>
                <SelectItem value="METHODS_CONTROL">Q1: Methods & Control</SelectItem>
                <SelectItem value="CLASSES">Q2: Classes</SelectItem>
                <SelectItem value="ARRAYLIST">Q3: ArrayList</SelectItem>
                <SelectItem value="TWO_D_ARRAY">Q4: 2D Array</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select value={difficultyFilter} onValueChange={handleFilterChange(setDifficultyFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing <strong>{paginatedQuestions.length}</strong> of <strong>{filteredQuestions.length}</strong> questions
            {filteredQuestions.length !== questions.length && (
              <span className="text-gray-400"> (filtered from {questions.length})</span>
            )}
          </span>
          <button
            onClick={clearFilters}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      </Card>

      {/* Questions List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedQuestions.map((question) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  onDelete={handleDelete}
                  onApprove={handleApprove}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16">
            <FileQuestion className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No questions found
            </h3>
            <p className="mt-2 text-gray-600 max-w-sm mx-auto">
              Try adjusting your filters or create a new question to get started.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/admin/questions/new">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add MCQ
                </Button>
              </Link>
              <Link href="/admin/exam-bank/create-frq">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add FRQ
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}