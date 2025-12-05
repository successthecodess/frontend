'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { MarkdownContent } from './MarkdownContent';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string, timeSpent: number) => void;
  isSubmitting: boolean;
  questionNumber?: number;
  totalQuestions?: number;
  startTime?: number; 
}

export function QuestionCard({ 
  question, 
  onSubmit, 
  isSubmitting,
  startTime = Date.now() // Default to current time if not provided
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [localStartTime] = useState(startTime);

  useEffect(() => {
    setSelectedAnswer('');
    
    // Update time display every second
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - localStartTime) / 1000);
      setTimeSpent(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [question.id, localStartTime]);

  const handleSubmit = () => {
    if (selectedAnswer) {
      const finalTimeSpent = Math.floor((Date.now() - localStartTime) / 1000);
      onSubmit(selectedAnswer, finalTimeSpent);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle undefined options
  const options = question.options || [];

  // Show error if no options
  if (options.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading question</p>
          <p className="text-sm">This question has no answer options.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {question.difficulty.toLowerCase()}
            </Badge>
            {question.topic && (
              <Badge variant="secondary">{question.topic.name}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          {formatTime(timeSpent)}
        </div>
      </div>

      <div className="mb-6">
        <MarkdownContent content={question.questionText} />
      </div>

      <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                selectedAnswer === option
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer text-base leading-relaxed"
              >
                <MarkdownContent content={option} />
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <div className="mt-6">
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </Button>
      </div>
    </Card>
  );
}