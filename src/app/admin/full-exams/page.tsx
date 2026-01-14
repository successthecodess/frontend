'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  TrendingUp,
  Clock,
  FileText,
  Search,
  Eye,
  Download,
  Filter,
  BarChart3,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { examApi } from '@/lib/examApi';

export default function AdminFullExamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, attemptsRes] = await Promise.all([
        examApi.adminGetExamStatistics(),
        examApi.adminGetExamUsers(),
        examApi.adminGetAllAttempts({ limit: 20 }),
      ]);

      setStatistics(statsRes.data);
      setUsers(usersRes.data.users);
      setAttempts(attemptsRes.data.attempts);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async () => {
    try {
      const filters: any = { limit: 20 };
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (selectedUser) filters.userId = selectedUser;

      const response = await examApi.adminGetAllAttempts(filters);
      setAttempts(response.data.attempts);
    } catch (error) {
      console.error('Failed to load attempts:', error);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, [statusFilter, selectedUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAPScoreColor = (score: number) => {
    if (score === 5) return 'text-green-600 bg-green-100';
    if (score === 4) return 'text-blue-600 bg-blue-100';
    if (score === 3) return 'text-yellow-600 bg-yellow-100';
    if (score === 2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Full Exam Management</h1>
          <p className="text-gray-600">Monitor student exam attempts and performance</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.totalAttempts || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg MCQ Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.averages?.mcqPercentage?.toFixed(1) || 0}%
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
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((statistics?.averages?.totalTimeSpent || 0) / 60)} min
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Students List */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Students</h3>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              <button
                onClick={() => setSelectedUser(null)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedUser === null
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">All Students</p>
                <p className="text-sm text-gray-600">{attempts.length} total attempts</p>
              </button>

              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedUser === user.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{user.name || user.email}</p>
                  <p className="text-sm text-gray-600">
                    {user._count.fullExamAttempts} attempt
                    {user._count.fullExamAttempts !== 1 ? 's' : ''}
                  </p>
                  {user.fullExamAttempts[0] && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last: {user.fullExamAttempts[0].mcqScore}/42 (
                      {user.fullExamAttempts[0].mcqPercentage?.toFixed(1)}%)
                    </p>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Exam Attempts */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Exam Attempts</h3>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="GRADED">Graded</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {attempts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No exam attempts found</p>
                </div>
              ) : (
                attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="border rounded-lg p-4 hover:border-indigo-300 transition-all cursor-pointer"
                    onClick={() => router.push(`/admin/full-exams/${attempt.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {attempt.user.name || attempt.user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          Attempt #{attempt.attemptNumber} •{' '}
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          attempt.status
                        )}`}
                      >
                        {attempt.status}
                      </span>
                    </div>

                    {attempt.status === 'GRADED' && (
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                        <div>
                          <p className="text-xs text-gray-600">MCQ Score</p>
                          <p className="text-lg font-bold text-gray-900">
                            {attempt.mcqScore}/42
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Percentage</p>
                          <p className="text-lg font-bold text-gray-900">
                            {attempt.mcqPercentage?.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Time</p>
                          <p className="text-lg font-bold text-gray-900">
                            {Math.floor((attempt.totalTimeSpent || 0) / 60)}m
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/full-exams/${attempt.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}