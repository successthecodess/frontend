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
  BarChart3,
  Target,
  Award,
  AlertCircle,
} from 'lucide-react';
import { examApi } from '@/lib/examApi';

export default function AdminPracticeTestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, sessionsRes] = await Promise.all([
        examApi.adminGetPracticeStatistics(),
        examApi.adminGetPracticeUsers(),
        examApi.adminGetPracticeSessions({ limit: 100 }), // Increased limit
      ]);

      setStatistics(statsRes.data);
      setUsers(usersRes.data.users);
      setSessions(sessionsRes.data.sessions);
      setAllSessions(sessionsRes.data.sessions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const filters: any = { limit: 100 };
      if (sessionTypeFilter !== 'all') filters.sessionType = sessionTypeFilter;
      if (selectedUser) filters.userId = selectedUser;

      const response = await examApi.adminGetPracticeSessions(filters);
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      loadSessions();
    }
  }, [sessionTypeFilter, selectedUser]);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'PRACTICE':
        return 'bg-blue-100 text-blue-800';
      case 'TIMED_DRILL':
        return 'bg-purple-100 text-purple-800';
      case 'EXAM':
        return 'bg-green-100 text-green-800';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADAPTIVE':
        return 'bg-indigo-100 text-indigo-800';
      case 'FREE_TRIAL':
        return 'bg-pink-100 text-pink-800';
      case 'MIXED_PRACTICE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSessionType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportAllSessions = () => {
    try {
      const csvData = [
        ['Student Name', 'Student Email', 'Session Type', 'Questions', 'Correct', 'Accuracy (%)', 'Duration (min)', 'Date'],
        ...allSessions.map((session) => [
          session.user.name || 'N/A',
          session.user.email,
          formatSessionType(session.sessionType),
          session.totalQuestions,
          session.correctAnswers,
          session.accuracyRate?.toFixed(1) || '0',
          Math.floor((session.totalDuration || 0) / 60),
          new Date(session.endedAt).toLocaleDateString(),
        ]),
      ];

      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `practice-sessions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export data');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Test Analytics</h1>
          <p className="text-gray-600">Monitor student practice sessions and progress</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.totalSessions || 0}
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
                  {statistics?.averages?.accuracyRate?.toFixed(1) || 0}%
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
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.totalResponses || 0}
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
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((statistics?.averages?.totalDuration || 0) / 60)} min
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
              <Button size="sm" variant="outline" onClick={exportAllSessions}>
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
                <p className="text-sm text-gray-600">{allSessions.length} total sessions</p>
              </button>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No students found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
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
                      {user._count.studySessions} session{user._count.studySessions !== 1 ? 's' : ''}
                    </p>
                    {user.studySessions && user.studySessions.length > 0 && user.studySessions[0] && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last: {user.studySessions[0].accuracyRate?.toFixed(1) || 0}% accuracy
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Practice Sessions */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Practice Sessions</h3>
              <select
                value={sessionTypeFilter}
                onChange={(e) => setSessionTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="PRACTICE">Practice</option>
                <option value="TIMED_DRILL">Timed Drill</option>
                <option value="EXAM">Exam</option>
                <option value="REVIEW">Review</option>
                <option value="ADAPTIVE">Adaptive</option>
                <option value="FREE_TRIAL">Free Trial</option>
                <option value="MIXED_PRACTICE">Mixed Practice</option>
              </select>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No practice sessions found</p>
                  {selectedUser && (
                    <p className="text-sm text-gray-500 mt-2">
                      Try selecting "All Students" or changing the filter
                    </p>
                  )}
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:border-indigo-300 transition-all cursor-pointer"
                    onClick={() => router.push(`/admin/practice-tests/sessions/${session.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {session.user.name || session.user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(session.endedAt).toLocaleDateString()} •{' '}
                          {new Date(session.endedAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getSessionTypeColor(
                          session.sessionType
                        )}`}
                      >
                        {formatSessionType(session.sessionType)}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-600">Questions</p>
                        <p className="text-lg font-bold text-gray-900">
                          {session.totalQuestions || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Correct</p>
                        <p className="text-lg font-bold text-green-600">
                          {session.correctAnswers || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Accuracy</p>
                        <p className="text-lg font-bold text-gray-900">
                          {session.accuracyRate?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Time</p>
                        <p className="text-lg font-bold text-gray-900">
                          {Math.floor((session.totalDuration || 0) / 60)}m
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/practice-tests/sessions/${session.id}`);
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