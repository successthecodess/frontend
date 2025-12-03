'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings } from 'lucide-react';

interface SessionSettingsProps {
  unitName: string;
  onStart: (questionCount: number) => void;
  onCancel: () => void;
}

export function SessionSettings({ unitName, onStart, onCancel }: SessionSettingsProps) {
  const [selectedCount, setSelectedCount] = useState(40);

  const questionOptions = [
    { value: 10, label: '10 Questions', duration: '~15 min' },
    { value: 15, label: '15 Questions', duration: '~20 min' },
    { value: 20, label: '20 Questions', duration: '~30 min' },
    { value: 40, label: '40 Questions', duration: '~60 min' },
  ];

  return (
    <Card className="mx-auto max-w-2xl">
      <div className="p-8">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Practice Session Setup
          </h2>
          <p className="text-gray-600">{unitName}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              How many questions would you like to practice?
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {questionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedCount(option.value)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedCount === option.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600">{option.duration}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Adaptive Learning Active</p>
                <p className="mt-1">
                  Questions will adapt to your performance. The system will
                  increase difficulty as you improve!
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onStart(selectedCount)}
              className="flex-1"
            >
              Start Practice
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}