'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Flag, 
  BookOpen, 
  RefreshCw,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalFeatures: 0,
    totalCourses: 0,
    premiumUsers: 0,
  });
  const [features, setFeatures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, featuresRes, coursesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?limit=1000`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/features`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/courses`, { headers }),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        const users = data.users;
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => {
            const lastActive = new Date(u.lastActive);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return lastActive > weekAgo;
          }).length,
          premiumUsers: users.filter((u: any) => u.isPremium).length,
        }));
      }

      if (featuresRes.ok) {
        const data = await featuresRes.json();
        setFeatures(data);
        setStats(prev => ({ ...prev, totalFeatures: data.length }));
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data);
        setStats(prev => ({ ...prev, totalCourses: data.length }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setLoading(false);
    }
  };

  const syncAllTags = async () => {
    if (!confirm('This will sync tags for all users from GHL. Continue?')) {
      return;
    }

    setSyncing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/sync-all-tags`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Sync complete!\nSynced: ${data.synced}\nFailed: ${data.failed}\nTotal: ${data.total}`);
        loadData();
      } else {
        alert('Sync failed. Please try again.');
      }
    } catch (error) {
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, features, and access control</p>
        </div>
        <Button 
          onClick={syncAllTags} 
          disabled={syncing}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync All Tags'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <Users className="h-10 w-10 text-indigo-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active (7 days)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
            </div>
            <Activity className="h-10 w-10 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Premium Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.premiumUsers}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Feature Flags</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFeatures}</p>
            </div>
            <Flag className="h-10 w-10 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Features */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Flags</h2>
          <div className="space-y-3">
            {features.slice(0, 5).map((feature: any) => (
              <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{feature.displayName}</p>
                  <p className="text-sm text-gray-600">Tag: {feature.requiredGhlTag || 'None'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  feature.isEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {feature.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Courses */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Courses</h2>
          <div className="space-y-3">
            {courses.map((course: any) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{course.courseName}</p>
                  <p className="text-sm text-gray-600">Tag: {course.requiredGhlTag}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}