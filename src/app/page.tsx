import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Target, TrendingUp, Zap, BookOpen, Award, Brain, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-600 p-2">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AP Computer Science
              </span>
            </div>
            <div className="flex gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" className="font-medium">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 mb-6">
            <Zap className="h-4 w-4" />
            Adaptive AI-Powered Learning
          </div>
          
          <h1 className="text-6xl font-black tracking-tight text-gray-900 sm:text-7xl md:text-8xl">
            Ace Your
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AP CS A Exam
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-gray-600">
            Practice smarter with our adaptive question bank that learns from your performance. 
            Get personalized difficulty progression, instant feedback, and track your mastery across all 10 AP CS A units.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all">
                Start Practicing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-gray-300 hover:border-indigo-600 hover:text-indigo-600">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>100% Free to Use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>All 10 Units Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Track Your Progress</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by AP CS teachers for AP CS students. Practice with confidence.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-10 w-10 text-indigo-600" />}
              title="Adaptive Learning"
              description="Questions automatically adjust from EASY to EXPERT based on your performance. Master fundamentals before advancing."
              highlight="Smart Progression"
            />
            <FeatureCard
              icon={<Target className="h-10 w-10 text-purple-600" />}
              title="Track Your Mastery"
              description="See your progress in real-time with detailed analytics. Know exactly which topics need more practice."
              highlight="Real-Time Stats"
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-pink-600" />}
              title="Full AP Coverage"
              description="Practice questions for all 10 units: Primitives, Objects, Booleans, Loops, Classes, Arrays, ArrayLists, 2D Arrays, Inheritance, and Recursion."
              highlight="Complete Curriculum"
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-green-600" />}
              title="Performance Analytics"
              description="Visualize your learning journey with charts, streaks, and achievements. Stay motivated with clear goals."
              highlight="Visual Progress"
            />
            <FeatureCard
              icon={<Code className="h-10 w-10 text-blue-600" />}
              title="Code Analysis Practice"
              description="Read, trace, and debug real Java code. Practice exactly what you'll see on the AP exam."
              highlight="Exam-Ready"
            />
            <FeatureCard
              icon={<Award className="h-10 w-10 text-yellow-600" />}
              title="Unlock Achievements"
              description="Earn badges for hitting milestones. Build streaks to stay consistent. Compete with yourself."
              highlight="Stay Motivated"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="py-24 bg-gradient-to-r from-indigo-50 to-purple-50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start practicing in three simple steps
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto">
            <StepCard
              number="1"
              title="Choose Your Unit"
              description="Select any of the 10 AP CS A units. Start with Unit 1 or jump to any topic you want to practice."
            />
            <StepCard
              number="2"
              title="Practice & Learn"
              description="Answer questions at your level. Get instant feedback with detailed explanations. Watch your difficulty progress."
            />
            <StepCard
              number="3"
              title="Track Progress"
              description="See your mastery increase with each session. Build streaks. Unlock achievements. Ace the exam."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 text-center">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-16 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join students using our adaptive question bank to master AP Computer Science A.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-12 py-6 bg-white text-indigo-600 hover:bg-gray-100 shadow-lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-indigo-200">
              No credit card required • Start practicing immediately
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-600 p-2">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Daniel - The AP Computer Science Tutor</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2026 Daniel - The AP Computer Science Tutor. Built for students, by educators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  highlight 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  highlight: string;
}) {
  return (
    <div className="group relative rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1">
      <div className="absolute top-4 right-4">
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {highlight}
        </span>
      </div>
      <div className="mb-4 inline-block rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-3">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description 
}: { 
  number: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className="relative">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl font-bold text-white shadow-lg">
          {number}
        </div>
        <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}