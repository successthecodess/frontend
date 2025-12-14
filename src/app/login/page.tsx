'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Mail, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-fill email if coming from signup
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with email:', email);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/student/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      console.log('Login response:', { success: data.success, hasToken: !!data.token });

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      console.log('Token stored successfully');

      // Force a small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));

      // Decode token to check if user is admin
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      
      // Fetch user details to check admin status
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${payload.userId}`,
        {
          headers: { Authorization: `Bearer ${data.token}` }
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        // Redirect based on admin status
        if (userData.isAdmin || userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
          console.log('Admin user detected, redirecting to admin dashboard...');
          window.location.href = '/admin';
        } else {
          console.log('Regular user, redirecting to student dashboard...');
          window.location.href = '/dashboard';
        }
      } else {
        // If we can't fetch user details, default to student dashboard
        console.log('Could not fetch user details, redirecting to dashboard...');
        window.location.href = '/dashboard';
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
            <Code className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Log in with your Tutor Boss email
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Use the same email registered in Tutor Boss
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have a Tutor Boss account?{' '}
              <Link
                href="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Admin Link */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Admin?{' '}
            <Link
              href="/admin/ghl-setup"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Setup GHL Integration
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}