'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertCircle } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'no_code') {
      setError('Authorization was cancelled. Please try again.');
    } else if (errorParam === 'auth_failed') {
      setError('Failed to authenticate with Tutor Boss. Please try again.');
    }
  }, [searchParams]);

  const handleLoginWithTutorBoss = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/ghl/login`
      );
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate login:', error);
      setError('Failed to connect to Tutor Boss. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AP CS Question Bank
          </h1>
          <p className="text-gray-600">
            Practice with adaptive learning
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <Button
          onClick={handleLoginWithTutorBoss}
          disabled={isLoading}
          size="lg"
          className="w-full gap-2 text-lg py-6"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="h-5 w-5" />
              Login with Tutor Boss
            </>
          )}
        </Button>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Use your Tutor Boss credentials to access the question bank.</p>
          <p className="mt-2">
            Don't have an account?{' '}
            <a 
              href="https://tutorboss.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Contact your tutor
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}