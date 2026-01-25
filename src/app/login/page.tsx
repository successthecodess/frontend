'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Mail, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleRequestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setNotAuthorized(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/student/request-login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a system configuration error
        if (response.status === 400 || response.status === 401) {
          throw new Error(data.error || 'System configuration error');
        }
        throw new Error(data.error || 'Request failed');
      }

      // IMPORTANT: Backend returns success even if email not found (for security)
      // But we still show the "check email" message
      // If email doesn't exist in TutorBoss, they won't receive an email
      setEmailSent(true);
      
    } catch (err: any) {
      console.error('Login request error:', err);
      setError(err.message || 'Request failed. Please try again.');
      setLoading(false);
    }
  };

  // Email sent success state
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h1>
            <p className="text-gray-600 mb-6">
              We've sent a secure login link to <strong>{email}</strong>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                📧 Click the link in your email to log in securely.
                <br />
                ⏰ The link expires in 15 minutes.
              </p>
            </div>

            {/* Warning about authorization */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-yellow-800 font-semibold mb-1">
                    Not receiving the email?
                  </p>
                  <p className="text-xs text-yellow-700">
                    If you don't receive an email within a few minutes, your account may not be registered with us yet. Please use the <strong>Sign Up</strong> option below to create an account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setLoading(false);
                }}
                variant="outline"
                className="w-full"
              >
                Try Different Email
              </Button>
              
              <Link href="/signup" className="block">
                <Button variant="default" className="w-full">
                  Create New Account Instead
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Main login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
            <Code className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Log in with your email - no password needed
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 mb-1">Login Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleRequestLogin} className="space-y-4">
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
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              🔒 <strong>Secure Login:</strong> We'll send a magic link to your email. Click it to log in instantly - no password required!
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              ⚠️ <strong>Existing Students Only:</strong> This login is for students already registered in our system. If you're new, please sign up below.
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
                Sending Link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Login Link
              </>
            )}
          </Button>
        </form>

  
       
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}