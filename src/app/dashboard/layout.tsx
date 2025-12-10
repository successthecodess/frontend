'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { LoadingState } from '@/components/LoadingState';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard layout - Auth status:', { user: !!user, isLoading });
    
    if (!isLoading && !user) {
      console.log('No user, redirecting to login...');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  if (!user) {
    return null; // Will redirect
  }

  console.log('Dashboard layout - User authenticated:', user.email);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}