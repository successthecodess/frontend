'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  AlertCircle,
  FileQuestion,
  Lock,
  Clock,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Unit {
  id: string;
  unitNumber: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  questionCount?: number;
}

function PracticePageContent() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(90);
  const [showModal, setShowModal] = useState(false);

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
      return;
    }
    setSelectedUnit(unitId);
    setShowModal(true);
  };

  const handleConfirmStart = () => {
    if (!selectedUnit) return;
    
    localStorage.setItem('targetQuestions', questionCount.toString());
    localStorage.setItem('isTimedMode', isTimedMode.toString());
    localStorage.setItem('timePerQuestion', timePerQuestion.toString());
    
    const params = new URLSearchParams({
      questions: questionCount.toString(),
      timed: isTimedMode.toString(),
      timePerQuestion: timePerQuestion.toString(),
    });
    
    router.push(`/dashboard/practice/${selectedUnit}?${params}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading units...</p>
        </div>
      </div>
    );
  }

  const selectedUnitData = units.find(u => u.id === selectedUnit);

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Modal for Question Count & Timer Selection */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Start Practice Session
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                {selectedUnitData?.name}
              </p>

              <div className="space-y-4 sm:space-y-6">
                {/* Question Count */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    How many questions?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 10, 15, 20, 25].map((count) => (
                      <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`rounded-lg py-2 px-2 text-xs sm:text-sm font-medium transition-colors ${
                          questionCount === count
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom input */}
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Or enter custom amount:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Timed Mode Toggle */}
                <div className="border-t pt-4 sm:pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        Timed Mode
                      </label>
                    </div>
                    <button
                      onClick={() => setIsTimedMode(!isTimedMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isTimedMode ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isTimedMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {isTimedMode && (
                    <div className="mt-4 space-y-3 rounded-lg bg-indigo-50 p-3 sm:p-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">
                        Time per question (seconds)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[60, 90, 120, 180].map((time) => (
                          <button
                            key={time}
                            onClick={() => setTimePerQuestion(time)}
                            className={`rounded-lg py-2 px-2 text-xs font-medium transition-colors ${
                              timePerQuestion === time
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {time}s
                          </button>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 mt-3">
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-700">
                          Practice under exam conditions! Timer will count down for each question.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedUnit(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleConfirmStart}
                  >
                    {isTimedMode ? (
                      <>
                        <Clock className="h-4 w-4" />
                        <span className="hidden sm:inline">Start Timed</span>
                        <span className="sm:hidden">Timed</span>
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4" />
                        <span className="hidden sm:inline">Start Practice</span>
                        <span className="sm:hidden">Start</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Practice Tests</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Choose a unit to take a practice test
          </p>
        </div>

        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50 p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
                Practice Test Mode
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-blue-700">
                Take full practice tests to prepare for the AP exam. Questions are selected
                based on your performance. Use timed mode to simulate real exam conditions!
              </p>
            </div>
          </div>
        </Card>

        {/* Units Grid - Responsive */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                <div
                  className={`h-2 ${hasQuestions ? unit.color : 'bg-gray-300'}`}
                />

                <div className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
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
                      <h3 className="text-base sm:text-xl font-bold text-gray-900">
                        {unit.name}
                      </h3>
                    </div>
                    <div
                      className={`rounded-lg p-2 sm:p-3 flex-shrink-0 ${
                        hasQuestions ? unit.color.replace('bg-', 'bg-') + '/10' : 'bg-gray-100'
                      }`}
                    >
                      <IconComponent
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          hasQuestions ? unit.color.replace('bg-', 'text-') : 'text-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {unit.description}
                  </p>

                  {hasQuestions ? (
                    <div className="mb-3 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <FileQuestion className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {unit.questionCount} question{unit.questionCount !== 1 ? 's' : ''} available
                      </span>
                    </div>
                  ) : (
                    <div className="mb-3 sm:mb-4 rounded-lg bg-yellow-50 p-3 border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-yellow-800">
                            No questions available
                          </p>
                          <p className="mt-1 text-xs text-yellow-700">
                            Questions are being prepared for this unit.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasQuestions ? (
                    <Button className="w-full gap-2 text-sm sm:text-base">
                      <Target className="h-4 w-4" />
                      Start Practice Test
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        className="w-full gap-2 text-sm sm:text-base" 
                        disabled
                        variant="secondary"
                      >
                        <Lock className="h-4 w-4" />
                        Not Available
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats - Responsive */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-full bg-indigo-100 p-2 sm:p-3 flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Total Units</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{units.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-full bg-green-100 p-2 sm:p-3 flex-shrink-0">
                <FileQuestion className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Units with Questions</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {units.filter(u => (u.questionCount || 0) > 0).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-full bg-purple-100 p-2 sm:p-3 flex-shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Total Questions</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {units.reduce((sum, unit) => sum + (unit.questionCount || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


export default function PracticePage() {
  return (
    <ProtectedRoute 
      requireFeature="practice_test"
      requireCourse="apcs-a"
      fallbackUrl="/dashboard"
    >
      <PracticePageContent />
    </ProtectedRoute>
  );
}