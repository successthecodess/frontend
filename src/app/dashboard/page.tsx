'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AchievementsDisplay } from '@/components/dashboard/AchievementsDisplay';
import { LoadingState } from '@/components/LoadingState';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header - Mobile Optimized */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track your progress and achievements
          </p>
        </div>

        {/* Dashboard Overview */}
        <DashboardOverview userId={user.userId} />
        
        {/* Charts Grid - Stacks on Mobile */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceChart userId={user.userId} />
          <AchievementsDisplay userId={user.userId} />
        </div>
      </div>
    </div>
  );
}