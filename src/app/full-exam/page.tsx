'use client';

import { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { examApi } from '@/lib/examApi';

export default function FullExamStartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);

  const handleStartExam = async () => {
    if (!user || !agreedToRules) return;

    setLoading(true);

    try {
      const response = await examApi.startFullExam(user.userId);
      const { examAttemptId } = response.data;

      // Navigate to exam
      router.push(`/full-exam/${examAttemptId}`);
    } catch (error: any) {
      console.error('Failed to start exam:', error);
      alert(error.message || 'Failed to start exam. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
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
            <label htmlFor="agree" className="text-gray-700">
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
            className="px-8 py-6 text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3" />
                Starting Exam...
              </>
            ) : (
              <>
                Start Exam
                <ArrowRight className="h-5 w-5 ml-3" />
              </>
            )}
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