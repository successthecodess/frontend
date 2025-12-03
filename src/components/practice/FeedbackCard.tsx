'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight, TrendingUp, Trophy } from 'lucide-react';
import { MarkdownContent } from './MarkdownContent';
import type { AnswerResult } from '@/types';

interface FeedbackCardProps {
  result: AnswerResult;
  onNext: () => void;
  isLoading: boolean;
  questionsRemaining: number;
}

export function FeedbackCard({
  result,
  onNext,
  isLoading,
  questionsRemaining,
}: FeedbackCardProps) {
  const isCorrect = result.isCorrect;
  const isLastQuestion = questionsRemaining === 0;

  return (
    <Card className="overflow-hidden">
      {/* Result Header */}
      <div
        className={`p-6 ${
          isCorrect
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-red-500 to-rose-500'
        }`}
      >
        <div className="flex items-center gap-4 text-white">
          {isCorrect ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <CheckCircle className="h-10 w-10" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <XCircle className="h-10 w-10" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </h2>
            <p className="mt-1 text-white/90">
              {isCorrect
                ? 'Great job! Keep up the excellent work.'
                : "Don't worry, let's learn from this."}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Your Answer */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Your Answer:
          </h3>
          <div
            className={`rounded-lg p-4 ${
              isCorrect
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}
          >
            <MarkdownContent content={result.userAnswer} />
          </div>
        </div>

        {/* Correct Answer (if wrong) */}
        {!isCorrect && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Correct Answer:
            </h3>
            <div className="rounded-lg bg-green-50 border-2 border-green-200 p-4">
              <MarkdownContent content={result.correctAnswer} />
            </div>
          </div>
        )}

        {/* Explanation */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            Explanation:
          </h3>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <MarkdownContent content={result.explanation} />
          </div>
        </div>

        {/* Progress Stats (only if progress is available) */}
        {result.progress && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-indigo-50 p-3 text-center">
              <p className="text-xs text-gray-600">Difficulty</p>
              <p className="text-lg font-bold text-indigo-600 capitalize">
                {result.progress.currentDifficulty.toLowerCase()}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-xs text-gray-600">Streak</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.progress.consecutiveCorrect} 🔥
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <p className="text-xs text-gray-600">Mastery</p>
              <p className="text-lg font-bold text-purple-600">
                {Math.round(result.progress.masteryLevel)}%
              </p>
            </div>
          </div>
        )}

        {/* Last Question Message */}
        {isLastQuestion && (
          <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">
                  Last Question Complete! 🎉
                </p>
                <p className="text-sm text-yellow-800">
                  Click continue to see your session summary
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            {isLastQuestion ? (
              <span className="font-semibold text-indigo-600">
                Ready to view results
              </span>
            ) : (
              `${questionsRemaining} question${questionsRemaining !== 1 ? 's' : ''} remaining`
            )}
          </p>
          <Button
            onClick={onNext}
            disabled={isLoading}
            size="lg"
            className="gap-2"
          >
            {isLoading ? (
              'Loading...'
            ) : isLastQuestion ? (
              <>
                View Results
                <Trophy className="h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}