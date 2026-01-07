'use client';

import { useEffect, useState } from 'react';
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
import { Search, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, FileQuestion } from 'lucide-react'; // Added FileQuestion
import { api } from '@/lib/api';
import Link from 'next/link';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    loadUnits();
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchQuery, unitFilter, difficultyFilter, statusFilter]);

  const loadUnits = async () => {
    try {
      const response = await api.getUnits();
      setUnits(response.data.units || []);
    } catch (error) {
      console.error('Failed to load units:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await api.getQuestions();
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.explanation?.toLowerCase().includes(searchQuery.toLowerCase())
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

    setFilteredQuestions(filtered);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await api.deleteQuestion(questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  };

  const handleApprove = async (questionId: string, approved: boolean) => {
    try {
      await api.approveQuestion(questionId, approved);
      setQuestions(
        questions.map((q) => (q.id === questionId ? { ...q, approved } : q))
      );
    } catch (error) {
      console.error('Failed to update question:', error);
      alert('Failed to update question');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="mt-2 text-gray-600">
            Manage all questions in the question bank
          </p>
        </div>
        <Link href="/admin/questions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
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
          <Select value={unitFilter} onValueChange={setUnitFilter}>
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

          {/* Difficulty Filter */}
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
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

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            Showing {filteredQuestions.length} of {questions.length} questions
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setUnitFilter('all');
              setDifficultyFilter('all');
              setStatusFilter('all');
            }}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Clear filters
          </button>
        </div>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Question Header */}
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {question.difficulty.toLowerCase()}
                  </Badge>
                  <Badge variant="secondary">
                    Unit {question.unit?.unitNumber}
                  </Badge>
                  {question.topic && (
                    <Badge variant="secondary">{question.topic.name}</Badge>
                  )}
                  {question.approved ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                  {question.aiGenerated && (
                    <Badge variant="outline">AI Generated</Badge>
                  )}
                </div>

                {/* Question Text */}
                <p className="mb-3 text-gray-900 line-clamp-2">
                  {question.questionText}
                </p>

                {/* Stats */}
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Attempts: {question.timesAttempted || 0}</span>
                  <span>
                    Accuracy:{' '}
                    {question.timesAttempted
                      ? Math.round(
                          ((question.timesCorrect || 0) /
                            question.timesAttempted) *
                            100
                        )
                      : 0}
                    %
                  </span>
                  {question.averageTime && (
                    <span>Avg Time: {Math.round(question.averageTime)}s</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/admin/questions/${question.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/questions/${question.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                {!question.approved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApprove(question.id, true)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {question.approved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApprove(question.id, false)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(question.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredQuestions.length === 0 && (
          <Card className="p-12 text-center">
            <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No questions found
            </h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your filters or add a new question.
            </p>
            <Link href="/admin/questions/new">
              <Button className="mt-4">Add Question</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}