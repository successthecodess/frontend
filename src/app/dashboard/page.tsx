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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name || 'Student'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Track your progress and achievements
        </p>
      </div>

      <DashboardOverview userId={user.userId} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceChart userId={user.userId} />
        <AchievementsDisplay userId={user.userId} />
      </div>
    </div>
  );
}