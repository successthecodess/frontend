'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Clock, 
  FileText, 
  Code, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Lock,
  Star,
  TrendingUp,
  Loader2,
  Sparkles
} from 'lucide-react';
import { examApi } from '@/lib/examApi';

// Loading steps for optimistic UI
const LOADING_STEPS = [
  { id: 1, text: 'Preparing your exam environment...', icon: Sparkles },
  { id: 2, text: 'Selecting 42 MCQ questions...', icon: FileText },
  { id: 3, text: 'Loading FRQ challenges...', icon: Code },
  { id: 4, text: 'Initializing timer...', icon: Clock },
  { id: 5, text: 'Almost ready!', icon: CheckCircle },
];

export default function FullExamStartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  
  // Optimistic UI states
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    checkAccess();
  }, []);

  // Animate through loading steps
  useEffect(() => {
    if (!loading) return;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(stepInterval);
  }, [loading]);

  // Update loading message based on current step
  useEffect(() => {
    if (currentStep < LOADING_STEPS.length) {
      setLoadingMessage(LOADING_STEPS[currentStep].text);
    }
  }, [currentStep]);

  const checkAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setHasAccess(false);
        setCheckingAccess(false);
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
        setHasAccess(data.canAccessPremiumExam || false);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Failed to check access:', error);
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleStartExam = async () => {
    if (!user || !agreedToRules) return;

    // Start loading immediately for optimistic UI
    setLoading(true);
    setCurrentStep(0);

    try {
      const response = await examApi.startFullExam(user.userId);
      const { examAttemptId } = response.data;

      // Small delay to show final step before navigation
      setCurrentStep(LOADING_STEPS.length - 1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to exam
      router.push(`/dashboard/full-exam/${examAttemptId}`);
    } catch (error: any) {
      console.error('Failed to start exam:', error);
      setLoading(false);
      setCurrentStep(0);
      alert(error.message || 'Failed to start exam. Please try again.');
    }
  };

  // Full-screen loading overlay
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-lg">
          {/* Main loading icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-0 w-24 h-24 mx-auto">
              <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="70 200"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-2">
            Preparing Your Exam
          </h2>
          <p className="text-indigo-200 mb-8">
            Setting up your personalized AP Computer Science A exam
          </p>

          {/* Progress steps */}
          <div className="space-y-3 mb-8">
            {LOADING_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                    isActive
                      ? 'bg-white/20 backdrop-blur-sm scale-105 shadow-lg'
                      : isComplete
                      ? 'bg-white/10 backdrop-blur-sm'
                      : 'bg-white/5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600'
                      : isComplete
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white'
                      : isComplete
                      ? 'text-green-300'
                      : 'text-white/50'
                  }`}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
            />
          </div>

          <p className="text-indigo-300 text-sm">
            {currentStep < LOADING_STEPS.length - 1 
              ? 'Please wait while we prepare your exam...'
              : 'Launching exam interface...'}
          </p>
        </div>
      </div>
    );
  }

  // Loading state for access check
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // No Access - Show Premium Upgrade Page
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Premium Full Exam
            </h1>
            <h2 className="text-xl text-gray-600">
              Official AP CS A Exam Simulation
            </h2>
          </div>

          {/* Premium Features */}
          <Card className="p-8 mb-6 border-2 border-orange-300 bg-gradient-to-br from-white to-orange-50">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold mb-4">
                <Star className="h-5 w-5" />
                PREMIUM ACCESS REQUIRED
              </div>
              <p className="text-gray-700">
                This is our most comprehensive exam preparation tool. Get the full AP experience!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Full 3-Hour Exam</p>
                  <p className="text-sm text-gray-600">42 MCQ + 4 FRQ questions, exactly like the real AP exam</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">AP Score Prediction</p>
                  <p className="text-sm text-gray-600">Get your predicted score (1-5) based on official scoring guidelines</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Detailed Performance Report</p>
                  <p className="text-sm text-gray-600">Unit-by-unit breakdown with strengths and weaknesses</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Wrong Answer Analysis</p>
                  <p className="text-sm text-gray-600">Detailed explanations for every question you miss</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Personalized Study Plan</p>
                  <p className="text-sm text-gray-600">Get custom recommendations based on your performance</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-200">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Unlimited Retakes</p>
                  <p className="text-sm text-gray-600">Practice as many times as you need to improve</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-6 border-2 border-orange-300">
              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 mb-2">Why Premium?</p>
                  <p className="text-sm text-gray-700">
                    The Premium Full Exam is designed to give you the most realistic AP exam experience possible. 
                    With authentic timing, official question formats, and comprehensive scoring, you'll know exactly 
                    what to expect on test day. Our detailed analytics help you focus your studying where it matters most.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Try Free Diagnostic */}
          <Card className="p-8 mb-6 border-2 border-indigo-300 bg-gradient-to-br from-white to-indigo-50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Not Ready for the Full Exam Yet?
              </h3>
              <p className="text-gray-600 mb-6">
                Start with our free diagnostic test to assess your current level and identify areas for improvement.
              </p>
              <Button
                onClick={() => router.push('/dashboard/free-trial')}
                size="lg"
                variant="outline"
                className="border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                <GraduationCap className="h-5 w-5 mr-2" />
                Take Free Diagnostic Test
              </Button>
            </div>
          </Card>

          {/* Contact for Access */}
         <Card className="p-8 bg-gray-50 border-2 border-gray-200">
  <div className="text-center">
    <h3 className="text-xl font-bold text-gray-900 mb-3">
      🔒 Premium Feature
    </h3>
    <p className="text-gray-600 mb-6">
      Subscribe to get unlimited access to full AP Computer Science A practice exams.
    </p>
    
    {/* Stripe Subscribe Button */}
    <div className="flex justify-center mb-4">
      {React.createElement('stripe-buy-button', {
        'buy-button-id': 'buy_btn_1StboLLjtL6H5DDgtyuMoZGM',
        'publishable-key': 'pk_live_51OmqHSLjtL6H5DDguApXwAGi7o73Y5cSCDGpb8P1d7kSoX4Z7dulkmAlgUKU9rKbx5Y8YGT8PCkz4okdHkmPfBsc00jBA1WCs4'
      })}
    </div>

  
  </div>
</Card>
        </div>
      </div>
    );
  }

  // Has Access - Show Normal Exam Start Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Premium Badge */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-sm">
            <Star className="h-4 w-4" />
            PREMIUM EXAM
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AP Computer Science A
          </h1>
          <h2 className="text-2xl text-gray-600">
            Full Exam Simulation
          </h2>
        </div>

        {/* Exam Overview */}
        <Card className="p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Exam Format</h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* MCQ Section */}
            <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Section I: MCQ</h4>
                  <p className="text-sm text-gray-600">Multiple Choice</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Questions:</span>
                  <span className="font-semibold">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Time:</span>
                  <span className="font-semibold">90 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Weight:</span>
                  <span className="font-semibold">55% of score</span>
                </div>
              </div>
            </div>

            {/* FRQ Section */}
            <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Section II: FRQ</h4>
                  <p className="text-sm text-gray-600">Free Response</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Questions:</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Time:</span>
                  <span className="font-semibold">90 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Weight:</span>
                  <span className="font-semibold">45% of score</span>
                </div>
              </div>
            </div>
          </div>

          {/* FRQ Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">FRQ Question Types:</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Q1: Methods and Control Structures</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Q2: Classes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Q3: Data Analysis with ArrayList</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Q4: 2D Array</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-indigo-600" />
                <span className="font-bold text-gray-900">Total Exam Time:</span>
              </div>
              <span className="text-2xl font-bold text-indigo-600">3 hours</span>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Important Instructions</h3>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">This is a timed exam simulation</p>
                <p className="text-sm text-gray-600">
                  You'll have 90 minutes for MCQ and 90 minutes for FRQ. The timer will start when you begin.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">MCQ Section</p>
                <p className="text-sm text-gray-600">
                  You can flag questions for review and navigate between questions freely. Submit when done or time runs out.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">FRQ Section</p>
                <p className="text-sm text-gray-600">
                  Write your Java code in the provided editor. Your code will be automatically evaluated using AP CS A rubrics.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Scoring</p>
                <p className="text-sm text-gray-600">
                  MCQ: 55% of score (1 point each) • FRQ: 45% of score (9 points each) • You'll receive a predicted AP score (1-5)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Auto-Save</p>
                <p className="text-sm text-gray-600">
                  Your answers are automatically saved as you work. You can take breaks between sections.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Agreement */}
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agree"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
            />
            <label htmlFor="agree" className="text-gray-700 cursor-pointer">
              I understand the exam format and instructions. I'm ready to begin the full AP Computer Science A exam simulation.
            </label>
          </div>
        </Card>

        {/* Start Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleStartExam}
            disabled={!agreedToRules || loading}
            size="lg"
            className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            Start Exam
            <ArrowRight className="h-5 w-5 ml-3" />
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Good luck! Remember to manage your time effectively and show your work on FRQs.</p>
        </div>
      </div>
    </div>
  );
}