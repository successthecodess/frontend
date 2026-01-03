'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AchievementsDisplay } from '@/components/dashboard/AchievementsDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, ArrowRight, Lock, Mail } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [hasUsedTrial, setHasUsedTrial] = useState<boolean | null>(null);
  const [hasFullAccess, setHasFullAccess] = useState(false);

  useEffect(() => {
    if (user) {
      checkAccess();
    }
  }, [user]);

  const checkAccess = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      
      // Check free trial status
      const trialResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/free-trial/status/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const trialData = await trialResponse.json();
      setHasUsedTrial(trialData.hasUsedFreeTrial);

      // Check if user has full access (course + practice test tags)
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userData = await userResponse.json();
      const tags = userData.ghlTags || [];
      const hasCourse = tags.includes('course-apcs-a');
      const hasPractice = tags.includes('apcs-test-access');
      setHasFullAccess(hasCourse && hasPractice);
    } catch (error) {
      console.error('Failed to check access:', error);
    }
  };

  const handleContactInstructor = () => {
    const subject = encodeURIComponent('Request for Full Access - Free Trial Completed');
    const body = encodeURIComponent(
      `Hi,\n\nI've completed the free diagnostic quiz and would like to request full access to the AP Computer Science A practice platform.\n\nMy account details:\nName: ${user?.name || 'N/A'}\nEmail: ${user?.email || 'N/A'}\n\nThank you!`
    );
    window.location.href = `mailto:daniel@enginearu.com?subject=${subject}&body=${body}`;
  };

  // Layout handles auth checks, so user will always exist here
  if (!user) return null;

  const showFreeTrialPrompt = hasUsedTrial === false && !hasFullAccess;
  const showTrialCompletePrompt = hasUsedTrial === true && !hasFullAccess;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track your progress and achievements
          </p>
        </div>

        {/* Free Trial Prompt - Not Used Yet */}
        {showFreeTrialPrompt && (
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 sm:p-8 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
                <Gift className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  🎉 Try Our Free Diagnostic Quiz!
                </h3>
                <p className="text-white/90 mb-4 text-sm sm:text-base">
                  Test your AP Computer Science A knowledge with 10 carefully selected questions covering all units. Get instant feedback and see where you stand!
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => router.push('/dashboard/free-trial')}
                    className="bg-white text-indigo-600 hover:bg-gray-100"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <span>✓ 10 questions</span>
                    <span>•</span>
                    <span>✓ Instant feedback</span>
                    <span>•</span>
                    <span>✓ No commitment</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Trial Complete - Need Full Access */}
        {showTrialCompletePrompt && (
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 sm:p-8 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
                <Lock className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Ready to Continue Learning?
                </h3>
                <p className="text-white/90 mb-4 text-sm sm:text-base">
                  You've completed the free trial! Get full access to unlimited practice questions, adaptive difficulty, detailed analytics, and exam mode.
                </p>
                <Button
                  onClick={handleContactInstructor}
                  className="bg-white text-orange-600 hover:bg-gray-100"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Instructor for Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                  daniel@enginearu.com
                </Button>
                <br/>
                
              </div>
            </div>
          </Card>
        )}

        {/* Dashboard Overview */}
        <DashboardOverview userId={user.userId} />
        
        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceChart userId={user.userId} />
          <AchievementsDisplay userId={user.userId} />
        </div>
      </div>
    </div>
  );
}