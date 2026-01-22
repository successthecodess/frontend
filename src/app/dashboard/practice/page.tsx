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
  Lock,
  Clock,
  Zap,
  CheckCircle,
  Star,
  TrendingUp,
  GraduationCap,
  ArrowRight,
  Shuffle,
  Layers
} from 'lucide-react';
import { api } from '@/lib/api';

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
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isMixedMode, setIsMixedMode] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(90);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/my-access`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🔐 Access check:', data);
        
        const canAccess = data.hasFullAccess || data.isAdmin || false;
        setHasAccess(canAccess);
        
        if (canAccess) {
          loadUnits();
        } else {
          setIsLoading(false);
        }
      } else {
        setHasAccess(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to check access:', error);
      setHasAccess(false);
      setIsLoading(false);
    } finally {
      setCheckingAccess(false);
    }
  };

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
    if (!hasQuestions) return;
    setSelectedUnit(unitId);
    setIsMixedMode(false);
    setShowModal(true);
  };

  const handleStartMixedPractice = () => {
    const totalQuestions = units.reduce((sum, u) => sum + (u.questionCount || 0), 0);
    if (totalQuestions === 0) return;
    
    setSelectedUnit(null);
    setIsMixedMode(true);
    setShowModal(true);
  };

  const handleConfirmStart = () => {
    localStorage.setItem('targetQuestions', questionCount.toString());
    localStorage.setItem('isTimedMode', isTimedMode.toString());
    localStorage.setItem('timePerQuestion', timePerQuestion.toString());
    
    const params = new URLSearchParams({
      questions: questionCount.toString(),
      timed: isTimedMode.toString(),
      timePerQuestion: timePerQuestion.toString(),
    });
    
    if (isMixedMode) {
      params.append('mixed', 'true');
      router.push(`/dashboard/practice/mixed?${params}`);
    } else if (selectedUnit) {
      router.push(`/dashboard/practice/${selectedUnit}?${params}`);
    }
  };

  const totalQuestionsAllUnits = units.reduce((sum, u) => sum + (u.questionCount || 0), 0);
  const unitsWithQuestions = units.filter(u => (u.questionCount || 0) > 0);

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Practice Tests
            </h1>
            <h2 className="text-xl text-gray-600">
              Unit-by-Unit AP CS A Practice
            </h2>
          </div>

          <Card className="p-8 mb-6 border-2 border-blue-300 bg-gradient-to-br from-white to-blue-50">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-bold mb-4">
                <Star className="h-5 w-5" />
                PRACTICE ACCESS REQUIRED
              </div>
              <p className="text-gray-700">
                Unlock unlimited practice tests to master every AP CS A concept!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">All 10 AP Units</p>
                  <p className="text-sm text-gray-600">Practice every topic from Primitive Types to Recursion</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Mixed Practice Mode</p>
                  <p className="text-sm text-gray-600">Randomize questions across all units for comprehensive review</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Timed Practice Mode</p>
                  <p className="text-sm text-gray-600">Simulate real exam conditions with countdown timers</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Detailed Explanations</p>
                  <p className="text-sm text-gray-600">Learn from every question with step-by-step solutions</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Progress Tracking</p>
                  <p className="text-sm text-gray-600">See your mastery level for each unit and topic</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">AI-Powered Insights</p>
                  <p className="text-sm text-gray-600">Get personalized recommendations after each session</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-6 border-2 border-blue-300">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 mb-2">Why Practice Tests?</p>
                  <p className="text-sm text-gray-700">
                    Targeted practice is the most effective way to prepare for the AP exam. 
                    Our practice tests let you focus on specific units, identify weak spots, 
                    and build confidence before taking the full exam. Studies show that students 
                    who practice regularly score 1-2 points higher on the AP exam!
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-6 border-2 border-green-400 bg-gradient-to-br from-white to-green-50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Start with Our Free Diagnostic Test!
              </h3>
              <p className="text-gray-600 mb-6">
                Take a free 10-question diagnostic to assess your current level and get personalized recommendations.
              </p>
              <Button
                onClick={() => router.push('/dashboard/free-trial')}
                size="lg"
                className="px-8 py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Target className="h-5 w-5 mr-2" />
                Take Free Diagnostic Test
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-gray-50">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Want Full Practice Test Access?
              </h3>
              <p className="text-gray-600 mb-4">
                Contact your instructor or course administrator to get access to unlimited practice tests.
              </p>
              <p className="text-sm text-gray-500">
                If you believe you should have access, please contact support or check with your instructor.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading units...</p>
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
                {isMixedMode ? (
                  <span className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4 text-purple-600" />
                    Mixed Practice - All Units
                  </span>
                ) : (
                  selectedUnitData?.name
                )}
              </p>

              {isMixedMode && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Layers className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">
                        Questions from {unitsWithQuestions.length} units
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        {totalQuestionsAllUnits} total questions available
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Or enter custom amount:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={isMixedMode ? totalQuestionsAllUnits : 100}
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
                      setIsMixedMode(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={`flex-1 gap-2 ${isMixedMode ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' : ''}`}
                    onClick={handleConfirmStart}
                  >
                    {isTimedMode ? (
                      <>
                        <Clock className="h-4 w-4" />
                        <span className="hidden sm:inline">Start Timed</span>
                        <span className="sm:hidden">Timed</span>
                      </>
                    ) : isMixedMode ? (
                      <>
                        <Shuffle className="h-4 w-4" />
                        <span className="hidden sm:inline">Start Mixed</span>
                        <span className="sm:hidden">Start</span>
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
            Choose a unit to take a practice test or try mixed practice
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

        {/* Mixed Practice Card */}
        {totalQuestionsAllUnits > 0 && (
          <Card 
            className="overflow-hidden border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-all cursor-pointer"
            onClick={handleStartMixedPractice}
          >
            <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
            
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                      <Shuffle className="h-3 w-3 mr-1" />
                      Mixed Practice
                    </Badge>
                    <Badge variant="outline" className="text-purple-700 border-purple-400">
                      {totalQuestionsAllUnits} Questions
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Practice All Units
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Randomize questions across all {unitsWithQuestions.length} units for comprehensive exam preparation. 
                    Perfect for final review before the AP exam!
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {unitsWithQuestions.slice(0, 5).map((unit) => (
                      <span 
                        key={unit.id}
                        className={`px-2 py-1 rounded text-xs font-medium ${unit.color} text-white`}
                      >
                        U{unit.unitNumber}
                      </span>
                    ))}
                    {unitsWithQuestions.length > 5 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                        +{unitsWithQuestions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Layers className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>

              <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                <Shuffle className="h-4 w-4" />
                Start Mixed Practice
              </Button>
            </div>
          </Card>
        )}

        {/* Section Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-4 text-sm text-gray-500 font-medium">
              Or practice by unit
            </span>
          </div>
        </div>

        {/* Units Grid */}
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
                        {hasQuestions && (
                          <Badge variant="outline" className="text-xs">
                            {unit.questionCount} Qs
                          </Badge>
                        )}
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
                        hasQuestions ? 'bg-opacity-10' : 'bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: hasQuestions ? undefined : undefined,
                      }}
                    >
                      <IconComponent
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          hasQuestions ? 'text-indigo-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {unit.description}
                  </p>

                  {!hasQuestions && (
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
                    <Button 
                      className="w-full gap-2 text-sm sm:text-base" 
                      disabled
                      variant="secondary"
                    >
                      <Lock className="h-4 w-4" />
                      Not Available
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}