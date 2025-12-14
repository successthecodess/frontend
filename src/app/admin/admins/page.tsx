'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Plus, 
  Trash2, 
  Mail,
  Calendar,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AdminEmailsPage() {
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    loadAdminEmails();
  }, []);

  const loadAdminEmails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/admin-emails`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      setAdminEmails(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin emails:', error);
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    setAdding(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/admin-emails`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: newEmail.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          data.userUpdated
            ? '✅ Admin email added and existing user granted admin access!'
            : '✅ Admin email added! User will get admin access on next login.'
        );
        setNewEmail('');
        loadAdminEmails();
      } else {
        alert(data.error || 'Failed to add admin email');
      }
    } catch (error) {
      alert('Failed to add admin email');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove admin access for ${email}?\n\nNote: This only removes the email from the admin list. If the user already has admin access, you'll need to manually revoke it from the Users page.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/admin-emails/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        alert('✅ Admin email removed');
        loadAdminEmails();
      }
    } catch (error) {
      alert('Failed to remove admin email');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/admin-emails/${id}/toggle`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        loadAdminEmails();
      }
    } catch (error) {
      alert('Failed to toggle status');
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Emails</h1>
        <p className="text-gray-600 mt-2">
          Manage who gets automatic admin access on login/signup
        </p>
      </div>

      {/* Add New Admin Email */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add Admin Email
        </h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@example.com"
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={adding}>
            <Plus className="h-4 w-4 mr-2" />
            {adding ? 'Adding...' : 'Add Admin'}
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          💡 When users with these emails log in or sign up, they'll automatically get admin privileges
        </p>
      </Card>

      {/* Admin Emails List */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Emails ({adminEmails.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {adminEmails.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No admin emails configured
            </div>
          ) : (
            adminEmails.map((admin: any) => (
              <div key={admin.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-full ${
                      admin.isActive 
                        ? 'bg-indigo-100' 
                        : 'bg-gray-100'
                    }`}>
                      <Shield className={`h-6 w-6 ${
                        admin.isActive 
                          ? 'text-indigo-600' 
                          : 'text-gray-400'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {admin.email}
                        </span>
                        {admin.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Added by: {admin.addedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(admin.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(admin.id)}
                    >
                      {admin.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(admin.id, admin.email)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• When a user with an admin email logs in or signs up, they automatically get admin privileges</li>
          <li>• Admin users get: isAdmin, isStaff, role: ADMIN, and access to all features</li>
          <li>• If you deactivate an email, new logins won't grant admin access</li>
          <li>• Removing an email doesn't revoke existing admin access (manage that in Users page)</li>
          <li>• Current admin emails are checked on every login/signup</li>
        </ul>
      </Card>
    </div>
  );
}