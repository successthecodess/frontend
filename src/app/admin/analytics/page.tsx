'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Users,
  Award,
  AlertCircle,
  Download
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('30'); // days

  useEffect(() => {
    loadUnits();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      loadAnalytics();
    }
  }, [selectedUnit, timeRange]);

  const loadUnits = async () => {
    try {
      const response = await api.getUnits();
      setUnits(response.data.units || []);
    } catch (error) {
      console.error('Failed to load units:', error);
    }
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAnalytics(selectedUnit, timeRange);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await api.downloadAnalyticsReport(selectedUnit, timeRange);
      // Create download link
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Track performance metrics and student progress
          </p>
        </div>
        <Button onClick={downloadReport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Unit
            </label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    Unit {unit.unitNumber}: {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Time Range
            </label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics?.totalStudents || 0}
              </p>
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +12% from last period
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Questions Attempted</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics?.totalAttempts?.toLocaleString() || 0}
              </p>
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +8% from last period
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Accuracy</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {analytics?.averageAccuracy || 0}%
              </p>
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                -2% from last period
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Time per Question</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {Math.round(analytics?.averageTime || 0)}s
              </p>
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                -5s from last period
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance by Difficulty */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Performance by Difficulty
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {['EASY', 'MEDIUM', 'HARD', 'EXPERT'].map((difficulty) => {
            const data = analytics?.byDifficulty?.[difficulty] || { accuracy: 0, attempts: 0 };
            return (
              <div key={difficulty} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {difficulty.toLowerCase()}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(data.accuracy)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{ width: `${data.accuracy}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {data.attempts.toLocaleString()} attempts
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Performing Topics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Top Performing Topics
          </h2>
          <div className="space-y-3">
            {analytics?.topTopics?.slice(0, 5).map((topic: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{topic.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {topic.accuracy}% accuracy
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500">No data available</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Topics Needing Attention
          </h2>
          <div className="space-y-3">
            {analytics?.strugglingTopics?.slice(0, 5).map((topic: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium text-gray-900">{topic.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {topic.accuracy}% accuracy
                  </span>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500">No data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Question Statistics */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Question Statistics
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-sm font-semibold text-gray-700">
                  Metric
                </th>
                <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                  Value
                </th>
                <th className="pb-3 text-right text-sm font-semibold text-gray-700">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-3 text-sm text-gray-900">Most Attempted</td>
                <td className="py-3 text-right text-sm text-gray-900">
                  {analytics?.mostAttempted?.attempts || 0} attempts
                </td>
                <td className="py-3 text-right text-sm text-green-600">+15%</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-900">Least Attempted</td>
                <td className="py-3 text-right text-sm text-gray-900">
                  {analytics?.leastAttempted?.attempts || 0} attempts
                </td>
                <td className="py-3 text-right text-sm text-red-600">-5%</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-900">Hardest Question</td>
                <td className="py-3 text-right text-sm text-gray-900">
                  {analytics?.hardestQuestion?.accuracy || 0}% accuracy
                </td>
                <td className="py-3 text-right text-sm text-red-600">-8%</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-900">Easiest Question</td>
                <td className="py-3 text-right text-sm text-gray-900">
                  {analytics?.easiestQuestion?.accuracy || 0}% accuracy
                </td>
                <td className="py-3 text-right text-sm text-green-600">+3%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Session Completion Rates */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Session Completion Rates
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-gray-600">Completed Sessions</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {analytics?.completedSessions || 0}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {analytics?.completionRate || 0}% completion rate
            </p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {analytics?.inProgressSessions || 0}
            </p>
            <p className="mt-1 text-sm text-gray-600">Active sessions</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-gray-600">Abandoned</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {analytics?.abandonedSessions || 0}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {analytics?.abandonmentRate || 0}% abandonment rate
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}