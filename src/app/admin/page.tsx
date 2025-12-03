'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { FileQuestion, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    approvedQuestions: 0,
    pendingQuestions: 0,
    totalAttempts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.getAdminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Questions',
      value: stats.totalQuestions,
      icon: FileQuestion,
      color: 'bg-blue-500',
    },
    {
      title: 'Approved',
      value: stats.approvedQuestions,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Review',
      value: stats.pendingQuestions,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Attempts',
      value: stats.totalAttempts,
      icon: XCircle,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage questions and view statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/questions/new"
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <FileQuestion className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="font-semibold text-gray-900">Add Question</p>
              <p className="text-sm text-gray-600">Create a new question</p>
            </div>
          </Link>
          
          <Link
            href="/admin/upload"
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <FileQuestion className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="font-semibold text-gray-900">Bulk Upload</p>
              <p className="text-sm text-gray-600">Upload multiple questions</p>
            </div>
          </Link>
          
          <Link
            href="/admin/questions"
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <FileQuestion className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="font-semibold text-gray-900">View All</p>
              <p className="text-sm text-gray-600">Manage questions</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}