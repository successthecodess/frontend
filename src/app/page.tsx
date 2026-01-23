import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Target, TrendingUp, Zap, BookOpen, Award, Brain, CheckCircle, LogIn, UserPlus, Sparkles, Star, Monitor, Cpu } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 sm:p-2 shadow-md">
                <Code className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AP Computer Science
              </span>
            </Link>
            
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8 sm:py-16 lg:py-24 text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-indigo-700 mb-4 sm:mb-8 shadow-sm animate-in fade-in slide-in-from-top duration-500">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            Adaptive AI-Powered Learning Platform
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 animate-in fade-in slide-in-from-bottom duration-700">
            Ace Your
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              AP CS Exam
            </span>
          </h1>
          
          <p className="mx-auto mt-4 sm:mt-8 max-w-3xl text-sm sm:text-lg lg:text-xl leading-relaxed text-gray-600 px-2 animate-in fade-in slide-in-from-bottom duration-1000">
            Practice smarter with our <strong className="text-gray-900">adaptive question bank</strong> for both{' '}
            <span className="text-indigo-600 font-semibold">AP CS A</span> and{' '}
            <span className="text-purple-600 font-semibold">AP CS Principles</span>. 
            Personalized difficulty, instant feedback, and progress tracking.
          </p>

          {/* Course Selection Cards */}
          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto px-2 animate-in fade-in slide-in-from-bottom duration-1000 delay-100">
            <Link href="https:/csaprep.aceapcomputerscience.com/signup" className="group">
              <div className="relative p-4 sm:p-6 rounded-2xl border-2 border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <span className="text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    Java
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                    <Code className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-base sm:text-xl text-gray-900">AP CS A</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Object-Oriented Programming</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full text-gray-600">Arrays</span>
                  <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full text-gray-600">Classes</span>
                  <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full text-gray-600">Recursion</span>
                  <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full text-gray-600">+7 more</span>
                </div>
              </div>
            </Link>

            <Link href="https://cspprep.aceapcomputerscience.com/signup" className="group">
              <div className="relative p-4 sm:p-6 rounded-2xl border-2 border-purple-200 bg-white hover:border-purple-400 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <span className="text-[10px] sm:text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    Concepts
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                    <Monitor className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-base sm:text-xl text-gray-900">AP CS Principles</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Computing Fundamentals</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full text-gray-600">Internet</span>
                  <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full text-gray-600">Data</span>
                  <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full text-gray-600">Algorithms</span>
                  <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full text-gray-600">+5 more</span>
                </div>
              </div>
            </Link>
          </div>
          
          

          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-16 flex flex-wrap justify-center gap-3 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600 px-2">
            <div className="flex items-center gap-1.5 sm:gap-2 group">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Both AP Courses</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 group">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Instant Feedback</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 group">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Track Progress</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-8 max-w-3xl mx-auto px-2">
            <div className="group cursor-default">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                2
              </div>
              <div className="text-[10px] sm:text-sm text-gray-600 font-medium mt-1">AP Courses</div>
            </div>
            <div className="group cursor-default">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                1000+
              </div>
              <div className="text-[10px] sm:text-sm text-gray-600 font-medium mt-1">Questions</div>
            </div>
            <div className="group cursor-default">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                <Star className="inline h-6 w-6 sm:h-10 sm:w-10 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-[10px] sm:text-sm text-gray-600 font-medium mt-1">Quality Content</div>
            </div>
          </div>
        </div>

        {/* Course Comparison Section */}
        <div className="py-8 sm:py-16 lg:py-24 px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-indigo-700 mb-4">
              <Cpu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Choose Your Path
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-6">
              Two Courses, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">One Platform</span>
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Whether you're learning programming fundamentals or mastering Java, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto">
            {/* AP CS A Card */}
            <div className="rounded-2xl sm:rounded-3xl border-2 border-indigo-200 bg-white p-5 sm:p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <Code className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">AP CS A</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Java Programming</p>
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Master object-oriented programming with Java. Perfect for students pursuing software development or computer science degrees.
              </p>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <h4 className="font-bold text-sm sm:text-base text-gray-900">10 Units Covered:</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['Primitives', 'Objects', 'Booleans', 'Iteration', 'Classes', 'Arrays', 'ArrayList', '2D Arrays', 'Inheritance', 'Recursion'].map((unit) => (
                    <span key={unit} className="text-[10px] sm:text-xs bg-indigo-50 text-indigo-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                      {unit}
                    </span>
                  ))}
                </div>
              </div>

              <Link href="https://csaprep.aceapcomputerscience.com/signup">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base py-4 sm:py-6">
                  Start AP CS A Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* AP CSP Card */}
            <div className="rounded-2xl sm:rounded-3xl border-2 border-purple-200 bg-white p-5 sm:p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">AP CS Principles</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Computing Concepts</p>
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Explore the foundations of computing, the internet, data, and algorithms. Great for beginners and those interested in technology's impact.
              </p>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <h4 className="font-bold text-sm sm:text-base text-gray-900">Big Ideas Covered:</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['Creative Development', 'Data', 'Algorithms', 'Programming', 'Computer Systems', 'Networks', 'Impact of Computing'].map((unit) => (
                    <span key={unit} className="text-[10px] sm:text-xs bg-purple-50 text-purple-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                      {unit}
                    </span>
                  ))}
                </div>
              </div>

              <Link href="https://cspprep.aceapcomputerscience.com/signup">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-base py-4 sm:py-6">
                  Start AP CSP Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-8 sm:py-16 lg:py-24 px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-14 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-indigo-700 mb-4">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Powerful Features
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-6">
              Everything You Need to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Built by <strong className="text-gray-900">AP CS teachers</strong> for AP CS students. Practice with confidence.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-8 w-8 sm:h-12 sm:w-12 text-indigo-600" />}
              title="Adaptive Learning"
              description="Questions automatically adjust from EASY to HARD based on your performance. Master fundamentals before advancing."
              highlight="Smart AI"
              gradient="from-indigo-500 to-purple-500"
            />
            <FeatureCard
              icon={<Target className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600" />}
              title="Track Your Mastery"
              description="See your progress in real-time with detailed analytics. Know exactly which topics need more practice."
              highlight="Real-Time"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-pink-600" />}
              title="Full AP Coverage"
              description="Complete coverage for both AP CS A (10 units) and AP CS Principles (7 big ideas). Everything in one place."
              highlight="Complete"
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />}
              title="Performance Analytics"
              description="Visualize your learning journey with charts, streaks, and achievements. Stay motivated with clear goals."
              highlight="Insights"
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Code className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />}
              title="Code Analysis"
              description="Read, trace, and debug real code with syntax highlighting. Practice exactly what you'll see on the exam."
              highlight="Exam-Ready"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Award className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-600" />}
              title="Achievements"
              description="Earn badges for hitting milestones. Build daily streaks to stay consistent. Compete with yourself."
              highlight="Motivation"
              gradient="from-yellow-500 to-orange-500"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="py-8 sm:py-16 lg:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-2xl sm:rounded-3xl shadow-inner">
          <div className="text-center mb-8 sm:mb-14 lg:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-6">
              How It <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Start mastering AP Computer Science in three simple steps
            </p>
          </div>

          <div className="grid gap-6 sm:gap-10 lg:gap-12 sm:grid-cols-3 max-w-6xl mx-auto">
            <StepCard
              number="1"
              title="Choose Your Course"
              description="Select AP CS A for Java programming or AP CS Principles for computing concepts. Both courses are fully supported."
              icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            />
            <StepCard
              number="2"
              title="Practice & Learn"
              description="Answer adaptive questions at your level. Get instant feedback with detailed explanations for every question."
              icon={<Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            />
            <StepCard
              number="3"
              title="Track Progress"
              description="See your mastery increase with every session. Build streaks, unlock achievements, and ace your AP exam."
              icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            />
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-8 sm:py-16 lg:py-24 text-center px-2 sm:px-4">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-10 py-10 sm:py-16 lg:py-20 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-sm sm:text-lg lg:text-xl text-indigo-100 mb-6 sm:mb-10 max-w-2xl mx-auto font-medium px-2">
                Join students worldwide mastering AP Computer Science A and AP CS Principles with our adaptive practice platform.
              </p>
            
              <p className="mt-4 sm:mt-6 text-xs sm:text-base text-indigo-200 font-medium px-2">
                ✓ No credit card required  •  ✓ Start practicing immediately  •  ✓ 100% free access
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/90 backdrop-blur-md mt-8 sm:mt-16 lg:mt-24 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 sm:p-2 shadow-md">
                <Code className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AP Computer Science Practice
              </span>
            </Link>
            <div className="flex flex-col items-center md:items-end gap-1 sm:gap-2">
              <div className="text-xs sm:text-base font-semibold text-gray-900">
                Daniel - The AP Computer Science Tutor
              </div>
              <div className="text-[10px] sm:text-sm text-gray-600">
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
    <div className="group relative rounded-xl sm:rounded-3xl border-2 border-gray-200 bg-white p-4 sm:p-8 shadow-md transition-all hover:shadow-2xl hover:border-transparent hover:-translate-y-1 sm:hover:-translate-y-2">
      <div className={`absolute inset-0 rounded-xl sm:rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <span className="text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-indigo-200">
          {highlight}
        </span>
      </div>
      
      <div className="mb-3 sm:mb-4 inline-block rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-2.5 sm:p-4 group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      
      <h3 className="mb-2 sm:mb-3 text-lg sm:text-2xl font-black text-gray-900">{title}</h3>
      <p className="text-xs sm:text-base text-gray-600 leading-relaxed">{description}</p>
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
        <div className="relative mb-4 sm:mb-8">
          <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-xl sm:text-3xl font-black text-white shadow-xl group-hover:scale-110 transition-transform">
            {number}
          </div>
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white shadow-md">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full p-1.5 sm:p-2">
              {icon}
            </div>
          </div>
        </div>
        
        <h3 className="mb-2 sm:mb-4 text-lg sm:text-2xl font-black text-gray-900">{title}</h3>
        <p className="text-xs sm:text-base text-gray-600 leading-relaxed max-w-xs px-2">{description}</p>
      </div>
    </div>
  );
}