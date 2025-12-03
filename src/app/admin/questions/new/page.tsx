'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionForm } from '@/components/admin/QuestionForm';
import { api } from '@/lib/api';

export default function NewQuestionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.createQuestion(data);
      alert('Question created successfully!');
      router.push('/admin/questions');
    } catch (error) {
      console.error('Failed to create question:', error);
      alert('Failed to create question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Question</h1>
        <p className="mt-2 text-gray-600">
          Create a new question for the question bank
        </p>
      </div>

      <QuestionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}