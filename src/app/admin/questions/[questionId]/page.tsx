'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { MarkdownContent } from '@/components/practice/MarkdownContent';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ViewQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.questionId as string;

  const [question, setQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      const response = await api.getQuestionById(questionId);
      setQuestion(response.data.question);
    } catch (error) {
      console.error('Failed to load question:', error);
      alert('Failed to load question');
      router.push('/admin/questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await api.deleteQuestion(questionId);
      alert('Question deleted successfully');
      router.push('/admin/questions');
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  };

  const handleApprove = async (approved: boolean) => {
    try {
      await api.approveQuestion(questionId, approved);
      setQuestion({ ...question, approved });
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
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Question not found</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/questions')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">View Question</h1>
        </div>

        <div className="flex gap-2">
          {!question.approved && (
            <Button
              onClick={() => handleApprove(true)}
              variant="outline"
              className="gap-2 text-green-600 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          )}
          {question.approved && (
            <Button
              onClick={() => handleApprove(false)}
              variant="outline"
              className="gap-2 text-yellow-600 hover:text-yellow-700"
            >
              <XCircle className="h-4 w-4" />
              Unapprove
            </Button>
          )}
          <Link href={`/admin/questions/${questionId}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Question Details */}
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">
            {question.difficulty.toLowerCase()}
          </Badge>
          <Badge variant="secondary">
            Unit {question.unit?.unitNumber}: {question.unit?.name}
          </Badge>
          {question.topic && (
            <Badge variant="secondary">{question.topic.name}</Badge>
          )}
          <Badge variant="secondary">{question.type}</Badge>
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

        <div className="space-y-6">
          {/* Question Text */}
          <div>
            <h3 className="mb-2 font-semibold text-gray-900">Question:</h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <MarkdownContent content={question.questionText} />
            </div>
          </div>

          {/* Options */}
          <div>
            <h3 className="mb-2 font-semibold text-gray-900">Answer Options:</h3>
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`rounded-lg border-2 p-4 ${
                    option === question.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-gray-700">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <div className="flex-1">
                      <MarkdownContent content={option} />
                    </div>
                    {option === question.correctAnswer && (
                      <Badge className="bg-green-500">Correct</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h3 className="mb-2 font-semibold text-gray-900">Explanation:</h3>
            <div className="rounded-lg bg-blue-50 p-4">
              <MarkdownContent content={question.explanation} />
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">Statistics</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Times Attempted</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {question.timesAttempted || 0}
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-gray-600">Times Correct</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {question.timesCorrect || 0}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-600">Accuracy Rate</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {question.timesAttempted
                ? Math.round(
                    ((question.timesCorrect || 0) / question.timesAttempted) * 100
                  )
                : 0}
              %
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-sm text-gray-600">Avg. Time</p>
            <p className="mt-1 text-2xl font-bold text-purple-600">
              {question.averageTime ? Math.round(question.averageTime) : 0}s
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}