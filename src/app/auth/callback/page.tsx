'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingState } from '@/components/LoadingState';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      router.push('/dashboard');
    } else {
      router.push('/login?error=auth_failed');
    }
  }, [searchParams, router]);

  return <LoadingState message="Completing login..." fullScreen />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." fullScreen />}>
      <CallbackContent />
    </Suspense>
  );
}
