'use client';

import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AchievementsDisplay } from '@/components/dashboard/AchievementsDisplay';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Track your progress and achievements
        </p>
      </div>

      <DashboardOverview />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceChart />
        <AchievementsDisplay />
      </div>
    </div>
  );
}