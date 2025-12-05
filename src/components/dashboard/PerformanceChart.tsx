'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { TrendingUp } from 'lucide-react';

interface PerformanceData {
  date: string;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
}

export function PerformanceChart() {
  const { user } = useUser();
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (user) {
      loadPerformanceData();
    }
  }, [user, days]);

  const loadPerformanceData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.getPerformanceHistory(user.id, days);
      setData(response.data.performanceHistory);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading performance data..." />;
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Over Time
        </h3>
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Practice more to see your performance trends!
          </p>
        </div>
      </Card>
    );
  }

  const maxAccuracy = Math.max(...data.map(d => d.accuracy), 100);
  const maxQuestions = Math.max(...data.map(d => d.questionsAttempted), 1);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Performance Over Time
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDays(7)}
            className={`px-3 py-1 text-sm rounded ${
              days === 7
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-3 py-1 text-sm rounded ${
              days === 30
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((day, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {new Date(day.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-gray-900 font-medium">
                  {day.questionsAttempted} questions
                </span>
                <span
                  className={`font-semibold ${
                    day.accuracy >= 80
                      ? 'text-green-600'
                      : day.accuracy >= 60
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {day.accuracy}%
                </span>
              </div>
            </div>
            <div className="flex gap-2 h-2">
              {/* Correct answers bar */}
              <div
                className="bg-green-500 rounded-full transition-all"
                style={{
                  width: `${(day.correctAnswers / maxQuestions) * 100}%`,
                }}
              />
              {/* Incorrect answers bar */}
              <div
                className="bg-red-500 rounded-full transition-all"
                style={{
                  width: `${
                    ((day.questionsAttempted - day.correctAnswers) / maxQuestions) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-600">Correct</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-gray-600">Incorrect</span>
        </div>
      </div>
    </Card>
  );
}