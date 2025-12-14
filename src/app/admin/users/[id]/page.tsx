'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Tag, RefreshCw } from 'lucide-react';

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    role: 'STUDENT',
    isAdmin: false,
    isStaff: false,
    hasAccessToQuestionBank: false,
    hasAccessToTimedPractice: false,
    hasAccessToAnalytics: false,
    isPremium: false,
    premiumUntil: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      setUser(data);
      setFormData({
        role: data.role || 'STUDENT',
        isAdmin: data.isAdmin || false,
        isStaff: data.isStaff || false,
        hasAccessToQuestionBank: data.hasAccessToQuestionBank || false,
        hasAccessToTimedPractice: data.hasAccessToTimedPractice || false,
        hasAccessToAnalytics: data.hasAccessToAnalytics || false,
        isPremium: data.isPremium || false,
        premiumUntil: data.premiumUntil ? new Date(data.premiumUntil).toISOString().split('T')[0] : '',
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
  setSaving(true);
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${params.id}/permissions`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          premiumUntil: formData.premiumUntil || null,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      // Show success message with better feedback
      alert(
        '✅ User permissions updated successfully!\n\n' 
      );
      loadUser();
    } else {
      alert('Failed to update permissions: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    alert('Failed to update permissions. Please try again.');
  } finally {
    setSaving(false);
  }
};
       

  const syncTags = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${params.id}/sync-tags`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(`✅ Tags synced!\nTags: ${data.tags.join(', ') || 'None'}`);
        loadUser();
      }
    } catch (error) {
      alert('Failed to sync tags');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{user.name || user.email}</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        <Button onClick={syncTags} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Tags
        </Button>
      </div>

      {/* User Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">User ID</p>
            <p className="font-mono text-xs mt-1">{user.id}</p>
          </div>
          <div>
            <p className="text-gray-600">GHL User ID</p>
            <p className="font-mono text-xs mt-1">{user.ghlUserId || 'Not linked'}</p>
          </div>
          <div>
            <p className="text-gray-600">Created</p>
            <p className="mt-1">{new Date(user.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Active</p>
            <p className="mt-1">{new Date(user.lastActive).toLocaleString()}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-6">
          <p className="text-gray-600 mb-2">GHL Tags</p>
          <div className="flex flex-wrap gap-2">
            {user.ghlTags && user.ghlTags.length > 0 ? (
              user.ghlTags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm"
                >
                  <Tag className="h-4 w-4" />
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">No tags</span>
            )}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Progress Records</p>
            <p className="text-2xl font-bold mt-1">{user._count?.progress || 0}</p>
          </div>
          <div>
            <p className="text-gray-600">Questions Answered</p>
            <p className="text-2xl font-bold mt-1">{user._count?.questionResponses || 0}</p>
          </div>
          <div>
            <p className="text-gray-600">Study Sessions</p>
            <p className="text-2xl font-bold mt-1">{user._count?.studySessions || 0}</p>
          </div>
        </div>
      </Card>

      {/* Permissions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Permissions & Access</h2>
        
        <div className="space-y-6">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {/* Admin & Staff Flags */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <div>
                <p className="font-medium text-gray-900">Admin Access</p>
                <p className="text-sm text-gray-600">Full system access</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isStaff}
                onChange={(e) => setFormData(prev => ({ ...prev, isStaff: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <div>
                <p className="font-medium text-gray-900">Staff Access</p>
                <p className="text-sm text-gray-600">Can view admin panel</p>
              </div>
            </label>
          </div>

          {/* Feature Access */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Feature Access</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.hasAccessToQuestionBank}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasAccessToQuestionBank: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <span className="text-gray-900">Question Bank Access</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.hasAccessToTimedPractice}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasAccessToTimedPractice: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <span className="text-gray-900">Timed Practice Access</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.hasAccessToAnalytics}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasAccessToAnalytics: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <span className="text-gray-900">Analytics Dashboard Access</span>
              </label>
            </div>
          </div>

          {/* Premium */}
          <div>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Premium Access</p>
                <p className="text-sm text-gray-600">Access to premium features</p>
              </div>
            </label>

            {formData.isPremium && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Premium Until
                </label>
                <input
                  type="date"
                  value={formData.premiumUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, premiumUntil: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}