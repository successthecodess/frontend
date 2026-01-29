'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Clock,
  Award,
  Calendar,
  BarChart3,
  Eye,
} from 'lucide-react';
import { examApi } from '@/lib/examApi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function UserAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await examApi.adminGetUserAnalytics(userId);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      alert('Failed to load user analytics');
      router.push('/admin/practice-tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Prepare chart data
  const dailyChartData = analytics.dailyAnalytics
    .slice(0, 30)
    .reverse()
    .map((day: any) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: day.averageAccuracy,
      questions: day.questionsAttempted,
      studyTime: Math.floor(day.studyTime / 60),
    }));

  const weeklyChartData = analytics.weeklyAnalytics
    .slice(0, 12)
    .reverse()
    .map((week: any) => ({
      week: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: week.averageAccuracy,
      questions: week.totalQuestions,
      activeDays: week.activeDays,
    }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/practice-tests')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Practice Tests
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Analytics</h1>
          <p className="text-gray-600">Comprehensive performance overview</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalSessions}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.avgAccuracy?.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalResponses}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((analytics.overview.totalStudyTime || 0) / 3600)}h
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Performance (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Accuracy (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="questions" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Questions"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Weekly Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Trends (Last 12 Weeks)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="questions" fill="#3b82f6" name="Questions" />
                <Bar dataKey="activeDays" fill="#10b981" name="Active Days" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Unit Progress */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Unit Progress</h3>
          <div className="space-y-4">
            {analytics.progress
              .sort((a: any, b: any) => b.masteryLevel - a.masteryLevel)
              .map((prog: any) => (
                <div key={prog.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{prog.unit.name}</p>
                      <p className="text-sm text-gray-600">
                        {prog.correctAttempts}/{prog.totalAttempts} correct • 
                        Accuracy: {prog.totalAttempts > 0 
                          ? ((prog.correctAttempts / prog.totalAttempts) * 100).toFixed(1) 
                          : 0}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">
                        {(prog.masteryLevel * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-600">Mastery</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all"
                      style={{ width: `${prog.masteryLevel * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Recent Sessions */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Sessions</h3>
          <div className="space-y-3">
            {analytics.recentSessions.map((session: any) => (
              <div
                key={session.id}
                className="border rounded-lg p-4 hover:border-indigo-300 transition-all cursor-pointer"
                onClick={() => router.push(`/admin/practice-tests/sessions/${session.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{session.sessionType}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.endedAt).toLocaleDateString()} •{' '}
                      {session.totalQuestions} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {session.accuracyRate?.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">Accuracy</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}