import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Target, TrendingUp, Zap, BookOpen, Award, Brain, CheckCircle, LogIn, UserPlus, Sparkles, Star, Clock, Home, DollarSign } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 transition-transform hover:scale-105 min-w-0 flex-shrink">
              <Image
                src="/img.jpeg"
                alt="AP CS A Logo"
                width={40}
                height={40}
                className="object-contain w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm md:text-base lg:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                AP CS A Practice
              </span>
            </Link>
            <div className="flex gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="font-medium text-xs sm:text-sm md:text-base hover:bg-purple-50 transition-colors px-2 sm:px-3 md:px-4">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5 md:mr-2" />
                  <span className="hidden sm:inline">Pricing</span>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium text-xs sm:text-sm md:text-base hover:bg-indigo-50 transition-colors px-2 sm:px-3 md:px-4">
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5 md:mr-2" />
                  <span className="xs:inline">Login</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg transition-all px-2 sm:px-3 md:px-4">
                  <span className="xs:inline">Sign Up</span>
                </Button>
              </Link>
              <Link href="https://csprep.aceapcomputerscience.com/">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold transition-all hover:scale-105 shadow-sm"
                >
                  <Home className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to </span>Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-28 text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-semibold text-indigo-700 mb-4 sm:mb-6 md:mb-8 shadow-sm animate-in fade-in slide-in-from-top duration-500">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">AI-Powered Learning</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tight text-gray-900 animate-in fade-in slide-in-from-bottom duration-700 px-2">
            Ace Your
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              AP CS A Exam
            </span>
          </h1>
          
          <p className="mx-auto mt-4 sm:mt-6 md:mt-8 max-w-3xl text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-gray-600 px-3 sm:px-4 md:px-6 animate-in fade-in slide-in-from-bottom duration-1000">
            Practice smarter with our <strong className="text-gray-900">adaptive question bank</strong> that learns from your performance. 
            Get personalized difficulty progression, instant feedback, and track your mastery across all 10 AP CS A units.
          </p>
          
          <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3 md:gap-4 px-3 sm:px-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <UserPlus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Start Free Today</span>
                <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <LogIn className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Log In to Practice</span>
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600 px-3">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 group">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium whitespace-nowrap">All 10 Units Covered</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 group">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium whitespace-nowrap">Instant Feedback</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 group">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium whitespace-nowrap">Track Progress</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 max-w-3xl mx-auto px-3 sm:px-4">
            <div className="group cursor-default">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                10
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">Units</div>
            </div>
            <div className="group cursor-default">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                1000+
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">Questions</div>
            </div>
            <div className="group cursor-default">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform flex items-center justify-center">
                <Star className="inline h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">Quality</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-10 sm:py-12 md:py-16 lg:py-24 px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-14 lg:mb-16">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-indigo-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-indigo-700 mb-3 sm:mb-4">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Powerful Features</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4 md:mb-6 px-2">
              Everything You Need to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-3">
              Built by <strong className="text-gray-900">AP CS teachers</strong> for AP CS students. Practice with confidence.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-indigo-600" />}
              title="Adaptive Learning"
              description="Questions automatically adjust from EASY to HARD based on your performance. Master fundamentals before advancing to complex topics."
              highlight="Smart AI"
              gradient="from-indigo-500 to-purple-500"
            />
            <FeatureCard
              icon={<Target className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-purple-600" />}
              title="Track Your Mastery"
              description="See your progress in real-time with detailed analytics. Know exactly which topics need more practice with precision insights."
              highlight="Real-Time"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-pink-600" />}
              title="Full AP Coverage"
              description="Practice questions for all 10 units: Primitives, Objects, Booleans, Loops, Classes, Arrays, ArrayLists, 2D Arrays, Inheritance, Recursion."
              highlight="Complete"
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-green-600" />}
              title="Performance Analytics"
              description="Visualize your learning journey with beautiful charts, streaks, and achievements. Stay motivated with clear, actionable goals."
              highlight="Insights"
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Code className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-600" />}
              title="Code Analysis"
              description="Read, trace, and debug real Java code with syntax highlighting. Practice exactly what you'll see on the AP exam."
              highlight="Exam-Ready"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Award className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-yellow-600" />}
              title="Achievements"
              description="Earn badges for hitting milestones. Build daily streaks to stay consistent. Compete with yourself and improve daily."
              highlight="Motivation"
              gradient="from-yellow-500 to-orange-500"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="py-10 sm:py-12 md:py-16 lg:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 -mx-3 px-3 sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 rounded-2xl sm:rounded-3xl shadow-inner">
          <div className="text-center mb-8 sm:mb-10 md:mb-14 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4 md:mb-6 px-2">
              How It <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-3">
              Start mastering AP Computer Science A in three simple steps
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:gap-10 lg:gap-12 md:grid-cols-3 max-w-6xl mx-auto px-2">
            <StepCard
              number="1"
              title="Choose Your Unit"
              description="Select any of the 10 AP CS A units. Start with Unit 1 (Primitives) or jump straight to any topic you want to master."
              icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            />
            <StepCard
              number="2"
              title="Practice & Learn"
              description="Answer adaptive questions at your level. Get instant feedback with detailed explanations. Watch your difficulty level progress naturally."
              icon={<Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            />
            <StepCard
              number="3"
              title="Track Progress"
              description="See your mastery increase with every session. Build learning streaks. Unlock achievements. Ace the AP exam with confidence."
              icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            />
          </div>
        </div>

        {/* Pricing Teaser Section */}
        <div className="py-10 sm:py-12 md:py-16 lg:py-20 px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4 md:mb-6 px-2">
              Simple, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Affordable</span> Pricing
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-3 mb-6">
              Choose the plan that fits your learning goals
            </p>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all">
                <DollarSign className="mr-2 h-5 w-5" />
                View Full Pricing Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-10 sm:py-12 md:py-16 lg:py-24 text-center px-3 sm:px-4">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-6 md:px-10 py-10 sm:py-12 md:py-16 lg:py-20 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 md:mb-6 px-2">
                Ready to Start Your Journey?
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-indigo-100 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto font-medium px-3">
                Join students worldwide using our adaptive question bank to master AP Computer Science A and ace their exams.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 justify-center items-center px-2">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-8 sm:px-10 md:px-14 py-5 sm:py-6 md:py-7 bg-white text-indigo-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                    <UserPlus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Sign Up Free Now</span>
                    <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  </Button>
                </Link>
              </div>
              <p className="mt-4 sm:mt-5 md:mt-6 text-xs sm:text-sm md:text-base text-indigo-200 font-medium px-2">
                ✓ No credit card required  •  ✓ Start practicing immediately  •  ✓ 100% free access
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/90 backdrop-blur-md mt-10 sm:mt-12 md:mt-16 lg:mt-24 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 transition-transform hover:scale-105">
               <Image
                src="/img.jpeg"
                alt="AP CS A Logo"
                width={40}
                height={40}
                className="object-contain w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0"
              />
              <span className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AP CS A Practice
              </span>
            </Link>
            <div className="flex flex-col items-center md:items-end gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 text-center md:text-right">
                Daniel - The AP CS Tutor
              </div>
              <div className="text-xs sm:text-sm text-gray-600 text-center md:text-right">
                © 2026 Built for students, by educators.
              </div>
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
    <div className="group relative rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-md transition-all hover:shadow-2xl hover:border-transparent hover:-translate-y-2">
      <div className={`absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-indigo-200 whitespace-nowrap">
          {highlight}
        </span>
      </div>
      
      <div className="mb-3 sm:mb-4 inline-block rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-2.5 sm:p-3 md:p-4 group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      
      <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl md:text-2xl font-black text-gray-900">{title}</h3>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{description}</p>
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
        <div className="relative mb-4 sm:mb-6 md:mb-8">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-xl sm:text-2xl md:text-3xl font-black text-white shadow-xl group-hover:scale-110 transition-transform">
            {number}
          </div>
          <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white shadow-md">
            {icon}
          </div>
        </div>
        
        <h3 className="mb-2 sm:mb-3 md:mb-4 text-lg sm:text-xl md:text-2xl font-black text-gray-900 px-2">{title}</h3>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-xs px-2">{description}</p>
      </div>
    </div>
  );
}