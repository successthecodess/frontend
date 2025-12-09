'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingState } from '@/components/LoadingState';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      // No token, redirect back to login with error
      router.push('/login?error=auth_failed');
    }
  }, [searchParams, router]);

  return <LoadingState message="Completing login..." fullScreen />;
}