'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Award,
  AlertCircle,
  FileQuestion,
  Lock
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Unit {
  id: string;
  unitNumber: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  questionCount?: number;
}

export default function PracticePage() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const response = await api.getUnits();
      setUnits(response.data.units || []);
    } catch (error) {
      console.error('Failed to load units:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPractice = (unitId: string, hasQuestions: boolean) => {
    if (!hasQuestions) {
      return; // Prevent navigation for units without questions
    }
    router.push(`/dashboard/practice/${unitId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Practice by Unit</h1>
        <p className="mt-2 text-gray-600">
          Choose a unit to begin your practice session
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">
              Adaptive Learning System
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Questions adapt to your performance. The system tracks your progress
              and adjusts difficulty to maximize learning. Answer correctly to
              advance to harder questions!
            </p>
          </div>
        </div>
      </Card>

      {/* Units Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => {
          const hasQuestions = (unit.questionCount || 0) > 0;
          const IconComponent = hasQuestions ? BookOpen : Lock;

          return (
            <Card
              key={unit.id}
              className={`overflow-hidden transition-all ${
                hasQuestions
                  ? 'hover:shadow-lg cursor-pointer'
                  : 'opacity-75 cursor-not-allowed'
              }`}
              onClick={() => handleStartPractice(unit.id, hasQuestions)}
            >
              {/* Unit Header with Color */}
              <div
                className={`h-2 ${hasQuestions ? unit.color : 'bg-gray-300'}`}
              />

              <div className="p-6">
                {/* Unit Number and Icon */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        variant={hasQuestions ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        Unit {unit.unitNumber}
                      </Badge>
                      {!hasQuestions && (
                        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          No Questions
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {unit.name}
                    </h3>
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      hasQuestions ? unit.color.replace('bg-', 'bg-') + '/10' : 'bg-gray-100'
                    }`}
                  >
                    <IconComponent
                      className={`h-6 w-6 ${
                        hasQuestions ? unit.color.replace('bg-', 'text-') : 'text-gray-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Unit Description */}
                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                  {unit.description}
                </p>

                {/* Question Count or Message */}
                {hasQuestions ? (
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <FileQuestion className="h-4 w-4" />
                    <span>
                      {unit.questionCount} question{unit.questionCount !== 1 ? 's' : ''} available
                    </span>
                  </div>
                ) : (
                  <div className="mb-4 rounded-lg bg-yellow-50 p-3 border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">
                          No questions available
                        </p>
                        <p className="mt-1 text-xs text-yellow-700">
                          Questions are being prepared for this unit.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {hasQuestions ? (
                  <Button className="w-full gap-2">
                    <Target className="h-4 w-4" />
                    Start Practice
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full gap-2" 
                      disabled
                      variant="secondary"
                    >
                      <Lock className="h-4 w-4" />
                      Not Available
                    </Button>
                    <Link href="/admin/questions/new" className="block">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full gap-2 text-xs"
                      >
                        <FileQuestion className="h-3 w-3" />
                        Add Questions (Admin)
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-100 p-3">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">{units.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <FileQuestion className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Units with Questions</p>
              <p className="text-2xl font-bold text-gray-900">
                {units.filter(u => (u.questionCount || 0) > 0).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">
                {units.reduce((sum, unit) => sum + (unit.questionCount || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Notice for Empty Units */}
      {units.some(u => (u.questionCount || 0) === 0) && (
        <Card className="border-orange-200 bg-orange-50 p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">
                Some Units Need Questions
              </h3>
              <p className="mt-1 text-sm text-orange-700">
                {units.filter(u => (u.questionCount || 0) === 0).length} unit(s) don't have any questions yet. 
                {' '}Administrators can add questions through the{' '}
                <Link href="/admin/questions/new" className="font-semibold underline">
                  Admin Panel
                </Link>
                {' '}or{' '}
                <Link href="/admin/upload" className="font-semibold underline">
                  bulk upload
                </Link>
                {' '}them via CSV.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}