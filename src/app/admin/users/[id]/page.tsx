'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Tag, RefreshCw, X, Plus, CheckCircle } from 'lucide-react';

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);
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
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
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
        alert(
          '✅ User permissions updated successfully!\n\n' +
          'The user will see these changes immediately when they:\n' +
          '• Refresh their current page\n' +
          '• Navigate to a new page\n' +
          '• Login again'
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
        alert(`✅ Tags synced from GHL!\nTags: ${data.tags.join(', ') || 'None'}`);
        loadUser();
      }
    } catch (error) {
      alert('Failed to sync tags');
    }
  };

  const handleAddTag = async (tagToAdd?: string) => {
    const tag = tagToAdd || newTag.trim();
    if (!tag) return;

    setAddingTag(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${params.id}/tags/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tag }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Tag "${tag}" added successfully to GHL!`);
        setNewTag('');
        loadUser();
      } else {
        alert(`Failed to add tag: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to add tag');
    } finally {
      setAddingTag(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!confirm(`Remove tag "${tag}" from GHL?\n\nThis will remove the tag from both the database and GHL.`)) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${params.id}/tags/remove`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tag }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Tag "${tag}" removed successfully from GHL!`);
        loadUser();
      } else {
        alert(`Failed to remove tag: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to remove tag');
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

      {/* Tag Management */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">GHL Tags Management</h2>

        {/* Add Tag */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Tag to GHL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name (e.g., apcs-exam)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button onClick={() => handleAddTag()} disabled={!newTag.trim() || addingTag}>
              {addingTag ? 'Adding...' : 'Add Tag'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This will add the tag to both the database and GHL
          </p>
        </div>

        {/* Current Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {user.ghlTags && user.ghlTags.length > 0 ? (
              user.ghlTags.map((tag: string) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm"
                >
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-purple-900"
                    title="Remove tag"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-400">No tags</span>
            )}
          </div>
        </div>

        {/* Quick Add Common Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Add Common Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { tag: 'apcs-test-access', label: 'Practice Test', color: 'bg-purple-50 text-purple-700 border-purple-200' },
              { tag: 'apcs-exam', label: '🔥 Premium Full Exam', color: 'bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 border-orange-300' },
             
            ].map(({ tag, label, color }) => (
              <Button
                key={tag}
                size="sm"
                variant="outline"
                onClick={() => handleAddTag(tag)}
                disabled={user.ghlTags?.includes(tag) || addingTag}
                className={`text-xs border ${color} ${user.ghlTags?.includes(tag) ? 'opacity-50' : ''} ${tag === 'apcs-exam' ? 'font-bold shadow-md' : ''}`}
              >
                {user.ghlTags?.includes(tag) ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {label}
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    {label}
                  </>
                )}
              </Button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Tag Guide:</strong>
            </p>
            <ul className="text-xs text-blue-600 mt-1 space-y-1">
              <li>• <strong>apcs-test-access</strong>: Full practice test access</li>
              <li>• <strong className="text-orange-600">apcs-exam</strong>: 🔥 PREMIUM - Full exam with detailed report, AP score prediction, analytics & recommendations</li>
             
            </ul>
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

          {/* Feature Access */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Feature Access (Database Flags)</p>
            <div className="space-y-3">
              {/* Empty - keeping structure for future use */}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              For the best experience, add GHL tags above. Database flags are fallback options.
            </p>
          </div>

          {/* Premium */}
          <div>
            <label className="flex items-center gap-3 p-4 border-2 border-orange-300 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg cursor-pointer hover:shadow-md transition-all">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 rounded"
              />
              <div className="flex-1">
                <p className="font-bold text-gray-900">🔥 Premium Full Exam Access</p>
                <p className="text-sm text-gray-700">Access to premium features (also requires <strong>apcs-exam</strong> tag)</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <div className="mt-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-orange-200">
                  <p className="text-xs text-orange-900 font-semibold mb-2">
                    🔥 PREMIUM FEATURES:
                  </p>
                  <ul className="text-xs text-orange-800 space-y-1">
                    <li>✅ Full 3-hour official AP CS A exam (42 MCQ + 4 FRQ)</li>
                    <li>✅ Detailed performance report with score breakdown</li>
                    <li>✅ AP Score prediction (1-5 scale with percentile)</li>
                    <li>✅ Wrong answer analysis with explanations</li>
                    <li>✅ Personalized study recommendations</li>
                    <li>✅ Unit-by-unit strength/weakness analysis</li>
                    <li>✅ Time management insights</li>
                    <li>✅ Unlimited retakes with progress tracking</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}