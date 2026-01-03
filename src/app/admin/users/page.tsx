'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter,
  UserCog,
  Mail,
  Calendar,
  Tag,
  Crown,
  Shield,
  Users as UsersIcon,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    loadUsers();
  }, [pagination.page, search, roleFilter]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      setUsers(data.users);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      setLoading(false);
    }
  };

  const syncUserTags = async (userId: string, email: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/sync-tags`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Tags synced for ${email}\nTags: ${data.tags.join(', ') || 'None'}`);
        loadUsers();
      }
    } catch (error) {
      alert('Failed to sync tags');
    }
  };

  const deleteUser = async (userId: string, userName: string, userEmail: string) => {
    // Double confirmation
    const confirmMessage = `⚠️ DELETE USER FROM PORTAL?\n\nUser: ${userName || userEmail}\nEmail: ${userEmail}\n\nThis will:\n✓ Delete user from the portal\n✓ Remove all their progress and data\n✓ Keep them in Tutor Boss\n✓ Allow them to sign up fresh next time\n\nAre you sure?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Second confirmation
    const finalConfirm = confirm(`FINAL CONFIRMATION\n\nType the user's email to confirm:\n${userEmail}\n\nAre you absolutely sure you want to delete this user?`);
    
    if (!finalConfirm) {
      return;
    }

    setDeletingUserId(userId);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`✅ User deleted successfully!\n\n${userName || userEmail} has been removed from the portal.\n\nThey can sign up again with a fresh account.`);
        loadUsers(); // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(`❌ Failed to delete user: ${error.message}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleBadge = (user: any) => {
    if (user.isAdmin || user.role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      );
    }
    if (user.isStaff || user.role === 'INSTRUCTOR') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
          <UserCog className="h-3 w-3" />
          Staff
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
        <UsersIcon className="h-3 w-3" />
        Student
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
      </div>

      {/* Warning Banner */}
      <Card className="bg-yellow-50 border-yellow-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-900">Important Note</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Deleting a user removes them from the portal only. They will remain in Tutor Boss and can sign up again with a fresh account.
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="INSTRUCTOR">Instructors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <UsersIcon className="h-4 w-4" />
          <span>{pagination.total} total users</span>
        </div>
      </Card>

      {/* Users List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.ghlTags && user.ghlTags.length > 0 ? (
                        user.ghlTags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                      {user.ghlTags && user.ghlTags.length > 3 && (
                        <span className="text-xs text-gray-500">+{user.ghlTags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {user.isPremium && (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                          <Crown className="h-3 w-3" />
                          Premium
                        </span>
                      )}
                      {user.hasAccessToQuestionBank && (
                        <span className="text-xs text-green-600">✓ Question Bank</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncUserTags(user.id, user.email)}
                        title="Sync tags from Tutor Boss"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/users/${user.id}`}>
                        <Button size="sm">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        onClick={() => deleteUser(user.id, user.name, user.email)}
                        disabled={deletingUserId === user.id}
                        title="Delete user from portal (keeps in Tutor Boss)"
                      >
                        {deletingUserId === user.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}