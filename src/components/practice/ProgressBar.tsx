'use client';

import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  correct: number;
}

export function ProgressBar({ current, total, correct }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const accuracy = current > 0 ? (correct / current) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Question {current} of {total}
        </span>
        <span className="font-medium text-gray-900">
          {Math.round(accuracy)}% Correct
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{correct} correct</span>
        <span>{current - correct} incorrect</span>
      </div>
    </div>
  );
}