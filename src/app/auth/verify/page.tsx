'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Suspense } from 'react';

function VerifyMagicLink() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No token provided');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/student/verify-magic-link`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        // Store token FIRST
        localStorage.setItem('authToken', data.token);

        // Format user data to match context expectations
        const userData = {
          userId: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          isAdmin: data.user.isAdmin,
          isStaff: data.user.isStaff,
        };

        // Set user in context
        setUser(userData);

        setStatus('success');
        setMessage('Login successful! Redirecting...');

        // Wait a bit longer before redirect to ensure state is set
        await new Promise(resolve => setTimeout(resolve, 500));

        // Use replace instead of push to avoid back button issues
        if (data.user.isAdmin) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }

      } catch (err: any) {
        console.error('Verification error:', err);
        setStatus('error');
        setMessage(err.message || 'Verification failed');
      }
    };

    verifyToken();
  }, [searchParams, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h1>
              <p className="text-gray-600">Please wait while we log you in</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Try Again
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <VerifyMagicLink />
    </Suspense>
  );
}