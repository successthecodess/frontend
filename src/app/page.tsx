import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Target, TrendingUp, Zap, BookOpen, Award, Brain, CheckCircle, LogIn, UserPlus, Sparkles, Star, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-2 shadow-md">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AP Computer Science A
              </span>
            </Link>
            <div className="flex gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-medium text-sm sm:text-base hover:bg-indigo-50 transition-colors">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Log In</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm sm:text-base shadow-md hover:shadow-lg transition-all">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-indigo-700 mb-6 sm:mb-8 shadow-sm animate-in fade-in slide-in-from-top duration-500">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            Adaptive AI-Powered Learning Platform
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-gray-900 animate-in fade-in slide-in-from-bottom duration-700">
            Ace Your
            <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              AP CS A Exam
            </span>
          </h1>
          
          <p className="mx-auto mt-6 sm:mt-8 max-w-3xl text-base sm:text-lg lg:text-xl leading-relaxed text-gray-600 px-4 animate-in fade-in slide-in-from-bottom duration-1000">
            Practice smarter with our <strong className="text-gray-900">adaptive question bank</strong> that learns from your performance. 
            Get personalized difficulty progression, instant feedback, and track your mastery across all 10 AP CS A units.
          </p>
          
          <div className="mt-8 sm:mt-10 lg:mt-12 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <UserPlus className="mr-2 h-5 w-5" />
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Log In to Practice
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600 px-4">
            
            <div className="flex items-center justify-center gap-2 group">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium">All 10 Units Covered</span>
            </div>
            <div className="flex items-center justify-center gap-2 group">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Instant Feedback</span>
            </div>
            <div className="flex items-center justify-center gap-2 group">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Track Progress</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto px-4">
            <div className="group cursor-default">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                10
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">Units Covered</div>
            </div>
            <div className="group cursor-default">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                1000+
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">Questions</div>
            </div>
            <div className="group cursor-default">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                <Star className="inline h-8 w-8 sm:h-10 sm:w-10 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">Quality Content</div>
            </div>
          </div>
        </div>


        {/* Features Grid */}
        <div className="py-12 sm:py-16 lg:py-24 px-4">
          <div className="text-center mb-10 sm:mb-14 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full text-sm font-semibold text-indigo-700 mb-4">
              <Zap className="h-4 w-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
              Everything You Need to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Built by <strong className="text-gray-900">AP CS teachers</strong> for AP CS students. Practice with confidence.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600" />}
              title="Adaptive Learning"
              description="Questions automatically adjust from EASY to HARD based on your performance. Master fundamentals before advancing to complex topics."
              highlight="Smart AI"
              gradient="from-indigo-500 to-purple-500"
            />
            <FeatureCard
              icon={<Target className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600" />}
              title="Track Your Mastery"
              description="See your progress in real-time with detailed analytics. Know exactly which topics need more practice with precision insights."
              highlight="Real-Time"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-pink-600" />}
              title="Full AP Coverage"
              description="Practice questions for all 10 units: Primitives, Objects, Booleans, Loops, Classes, Arrays, ArrayLists, 2D Arrays, Inheritance, Recursion."
              highlight="Complete"
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />}
              title="Performance Analytics"
              description="Visualize your learning journey with beautiful charts, streaks, and achievements. Stay motivated with clear, actionable goals."
              highlight="Insights"
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Code className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />}
              title="Code Analysis"
              description="Read, trace, and debug real Java code with syntax highlighting. Practice exactly what you'll see on the AP exam."
              highlight="Exam-Ready"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Award className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-600" />}
              title="Achievements"
              description="Earn badges for hitting milestones. Build daily streaks to stay consistent. Compete with yourself and improve daily."
              highlight="Motivation"
              gradient="from-yellow-500 to-orange-500"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-3xl shadow-inner">
          <div className="text-center mb-10 sm:mb-14 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
              How It <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Start mastering AP Computer Science A in three simple steps
            </p>
          </div>

          <div className="grid gap-8 sm:gap-10 lg:gap-12 md:grid-cols-3 max-w-6xl mx-auto">
            <StepCard
              number="1"
              title="Choose Your Unit"
              description="Select any of the 10 AP CS A units. Start with Unit 1 (Primitives) or jump straight to any topic you want to master."
              icon={<BookOpen className="h-6 w-6 text-white" />}
            />
            <StepCard
              number="2"
              title="Practice & Learn"
              description="Answer adaptive questions at your level. Get instant feedback with detailed explanations. Watch your difficulty level progress naturally."
              icon={<Brain className="h-6 w-6 text-white" />}
            />
            <StepCard
              number="3"
              title="Track Progress"
              description="See your mastery increase with every session. Build learning streaks. Unlock achievements. Ace the AP exam with confidence."
              icon={<TrendingUp className="h-6 w-6 text-white" />}
            />
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-12 sm:py-16 lg:py-24 text-center px-4">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 sm:px-10 py-12 sm:py-16 lg:py-20 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 mb-8 sm:mb-10 max-w-2xl mx-auto font-medium">
                Join students worldwide using our adaptive question bank to master AP Computer Science A and ace their exams.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-10 sm:px-14 py-6 sm:py-7 bg-white text-indigo-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up Free Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              
              </div>
              <p className ="mt-6 text-sm sm:text-base text-indigo-200 font-medium">
                ✓ No credit card required  •  ✓ Start practicing immediately  •  ✓ 100% free access
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/90 backdrop-blur-md mt-12 sm:mt-16 lg:mt-24 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-2 shadow-md">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AP Computer Science A Practice
              </span>
            </Link>
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="text-sm sm:text-base font-semibold text-gray-900">
                Daniel - The AP Computer Science Tutor
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                © 2026 Built for students, by educators.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuickStepCard({ 
  number, 
  title, 
  description,
  color 
}: { 
  number: string; 
  title: string; 
  description: string;
  color: 'indigo' | 'purple' | 'pink';
}) {
  const colorClasses = {
    indigo: 'from-indigo-600 to-indigo-700 border-indigo-200',
    purple: 'from-purple-600 to-purple-700 border-purple-200',
    pink: 'from-pink-600 to-pink-700 border-pink-200',
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border-2 hover:shadow-xl transition-all hover:-translate-y-1 group">
      <div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white font-black text-xl sm:text-2xl mb-4 mx-auto shadow-md group-hover:scale-110 transition-transform`}>
        {number}
      </div>
      <h3 className="font-black text-base sm:text-lg text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  highlight,
  gradient
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  highlight: string;
  gradient: string;
}) {
  return (
    <div className="group relative rounded-2xl sm:rounded-3xl border-2 border-gray-200 bg-white p-6 sm:p-8 shadow-md transition-all hover:shadow-2xl hover:border-transparent hover:-translate-y-2">
      <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      
      <div className="absolute top-4 right-4">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
          {highlight}
        </span>
      </div>
      
      <div className="mb-4 inline-block rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-3 sm:p-4 group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      
      <h3 className="mb-3 text-xl sm:text-2xl font-black text-gray-900">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description,
  icon
}: { 
  number: string; 
  title: string; 
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6 sm:mb-8">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl sm:text-3xl font-black text-white shadow-xl group-hover:scale-110 transition-transform">
            {number}
          </div>
          <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
            {icon}
          </div>
        </div>
        
        <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-black text-gray-900">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xs">{description}</p>
      </div>
    </div>
  );
}