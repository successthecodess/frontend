'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { GHLIntegration } from '@/components/settings/GHLIntegration';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    // Check for GHL connection status in URL
    const ghlStatus = searchParams.get('ghl');
    const errorMessage = searchParams.get('message');

    if (ghlStatus === 'connected') {
      setNotification({
        type: 'success',
        message: 'Successfully connected to GoHighLevel!',
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } else if (ghlStatus === 'error') {
      setNotification({
        type: 'error',
        message: errorMessage || 'Failed to connect to GoHighLevel',
      });
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and integrations
        </p>
      </div>

      {/* Notification Banner */}
      {notification && (
        <Alert
          variant={notification.type === 'success' ? 'default' : 'destructive'}
          className={
            notification.type === 'success'
              ? 'border-green-200 bg-green-50'
              : ''
          }
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* GHL Integration Card */}
      <GHLIntegration />

      {/* Other settings can go here */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Account Settings
        </h3>
        <p className="text-sm text-gray-600">
          Additional settings coming soon...
        </p>
      </Card>
    </div>
  );
}