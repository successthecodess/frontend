'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Flag,
  Tag,
  Crown,
  Users,
  Save,
  X
} from 'lucide-react';

export default function FeaturesPage() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    requiredGhlTag: '',
    requiresPremium: false,
    requiresStaff: false,
    isEnabled: true,
  });

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/features`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      setFeatures(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load features:', error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/features`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert('✅ Feature flag created!');
        setCreating(false);
        resetForm();
        loadFeatures();
      }
    } catch (error) {
      alert('Failed to create feature flag');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const feature = features.find((f: any) => f.id === id);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/features/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert('✅ Feature flag updated!');
        setEditing(null);
        resetForm();
        loadFeatures();
      }
    } catch (error) {
      alert('Failed to update feature flag');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete feature flag "${name}"?`)) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/features/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        alert('✅ Feature flag deleted!');
        loadFeatures();
      }
    } catch (error) {
      alert('Failed to delete feature flag');
    }
  };

  const startEdit = (feature: any) => {
    setFormData({
      name: feature.name,
      displayName: feature.displayName,
      description: feature.description || '',
      requiredGhlTag: feature.requiredGhlTag || '',
      requiresPremium: feature.requiresPremium,
      requiresStaff: feature.requiresStaff,
      isEnabled: feature.isEnabled,
    });
    setEditing(feature.id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      requiredGhlTag: '',
      requiresPremium: false,
      requiresStaff: false,
      isEnabled: true,
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-gray-600 mt-2">Control access to features with tags and permissions</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Feature Flag
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <Card className="p-6 border-2 border-indigo-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {creating ? 'Create Feature Flag' : 'Edit Feature Flag'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreating(false);
                setEditing(null);
                resetForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feature Name (slug)
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="question_bank"
                  disabled={!!editing}
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase, underscores only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Question Bank Access"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does this feature do?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required GHL Tag
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={formData.requiredGhlTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredGhlTag: e.target.value }))}
                  placeholder="apcs-access"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Users must have this tag in GHL to access this feature
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.requiresPremium}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresPremium: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    Premium
                  </p>
                  <p className="text-xs text-gray-600">Requires premium</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.requiresStaff}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresStaff: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Staff
                  </p>
                  <p className="text-xs text-gray-600">Staff only</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, isEnabled: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Flag className="h-4 w-4 text-green-600" />
                    Enabled
                  </p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </label>
            </div>

            <Button
              onClick={() => editing ? handleUpdate(editing) : handleCreate()}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {editing ? 'Update Feature Flag' : 'Create Feature Flag'}
            </Button>
          </div>
        </Card>
      )}

      {/* Features List */}
      <div className="grid gap-4">
        {features.map((feature: any) => (
          <Card key={feature.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.displayName}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feature.isEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {feature.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>

                <div className="flex flex-wrap gap-2">
                  <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                    {feature.name}
                  </code>

                  {feature.requiredGhlTag && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-800 text-sm">
                      <Tag className="h-3 w-3" />
                      {feature.requiredGhlTag}
                    </span>
                  )}

                  {feature.requiresPremium && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  )}

                  {feature.requiresStaff && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                      <Users className="h-3 w-3" />
                      Staff
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(feature)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(feature.id, feature.displayName)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}