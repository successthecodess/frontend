'use client';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AchievementsDisplay } from '@/components/dashboard/AchievementsDisplay';

export default function DashboardPage() {
  const { user } = useAuth();

  // Layout handles auth checks, so user will always exist here
  if (!user) return null;

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