'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QuestionForm } from '@/components/admin/QuestionForm';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.questionId as string;
  
  const [question, setQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      const response = await api.getQuestion(questionId);
      setQuestion(response.data.question);
    } catch (error) {
      console.error('Failed to load question:', error);
      alert('Failed to load question');
      router.push('/admin/questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.updateQuestion(questionId, data);
      alert('Question updated successfully!');
      router.push('/admin/questions');
    } catch (error) {
      console.error('Failed to update question:', error);
      alert('Failed to update question');
    } finally {
      setIsSubmitting(false);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Question</h1>
        <p className="mt-2 text-gray-600">Update the question details</p>
      </div>

      <QuestionForm
        initialData={question}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}