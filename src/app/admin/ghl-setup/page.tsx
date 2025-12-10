'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Shield, ExternalLink } from 'lucide-react';

export default function GHLSetupPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/admin/status`
      );
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/admin/authorize`
      );
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to start authorization:', error);
    }
  };

  const success = searchParams.get('success') === 'true';
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Shield className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            GoHighLevel Integration Setup
          </h1>
          <p className="mt-2 text-gray-600">
            One-time authorization for Tutor Boss admin
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="p-6 border-green-200 bg-green-50">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Authorization Successful!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Your Tutor Boss account is now connected. Students can now log in
                  using their Tutor Boss credentials.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Authorization Failed</h3>
                <p className="mt-1 text-sm text-red-700">
                  {error === 'authorization_failed'
                    ? 'Authorization was cancelled or failed. Please try again.'
                    : 'Something went wrong during setup. Please try again.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Current Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Status
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
              <p className="mt-4 text-sm text-gray-600">Checking status...</p>
            </div>
          ) : status?.authorized ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Connected to GoHighLevel</span>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Company ID:</span>
                  <span className="font-mono text-gray-900">{status.companyId}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Authorized By:</span>
                  <span className="text-gray-900">{status.authorizedBy}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Authorized On:</span>
                  <span className="text-gray-900">
                    {new Date(status.authorizedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Token Expires:</span>
                  <span className="text-gray-900">
                    {new Date(status.tokenExpiry).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleAuthorize}
                variant="outline"
                className="w-full mt-4"
              >
                Re-authorize
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Not Connected</span>
              </div>

              <p className="text-sm text-gray-600">
                To enable student login with Tutor Boss credentials, an admin must
                authorize this application.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-900 mb-2">Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>You must be a Tutor Boss admin</li>
                  <li>You need access to your GHL account</li>
                  <li>This is a one-time setup process</li>
                </ul>
              </div>

              <Button
                onClick={handleAuthorize}
                className="w-full gap-2"
                size="lg"
              >
                <ExternalLink className="h-5 w-5" />
                Authorize with GoHighLevel
              </Button>
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-xs">
                1
              </span>
              <span>
                Click "Authorize with GoHighLevel" to connect your Tutor Boss account
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-xs">
                2
              </span>
              <span>
                Log in with your admin GHL credentials when prompted
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-xs">
                3
              </span>
              <span>
                Grant permissions to access student data
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-xs">
                4
              </span>
              <span>
                Students can now log in using their Tutor Boss email addresses
              </span>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}