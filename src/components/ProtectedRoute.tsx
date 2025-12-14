'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccessDenied } from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireStaff?: boolean;
  requireFeature?: string;
  requireCourse?: string;
  fallbackUrl?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireStaff = false,
  requireFeature,
  requireCourse,
  fallbackUrl = '/dashboard',
}: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<{
    feature?: string;
    requiredTag?: string;
    requiresPremium?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Decode JWT to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Fetch user details with fresh data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${payload.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store', // Force fresh data
        }
      );

      if (!response.ok) {
        router.push('/login');
        return;
      }

      const user = await response.json();

      // Check admin requirement
      if (requireAdmin && !user.isAdmin && user.role !== 'ADMIN') {
        setAccessError({
          message: 'This page requires administrator privileges.',
        });
        setLoading(false);
        return;
      }

      // Check staff requirement
      if (requireStaff && !user.isStaff && !user.isAdmin && user.role === 'STUDENT') {
        setAccessError({
          message: 'This page requires staff privileges.',
        });
        setLoading(false);
        return;
      }

      // Check feature access
      if (requireFeature) {
        const featureResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/features`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }
        );

        if (featureResponse.ok) {
          const features = await featureResponse.json();
          const feature = features.find((f: any) => f.name === requireFeature);

          if (feature) {
            // Staff and admin bypass feature checks
            if (!user.isStaff && !user.isAdmin) {
              // Check if feature is enabled
              if (!feature.isEnabled) {
                setAccessError({
                  feature: feature.displayName,
                  message: 'This feature is currently disabled.',
                });
                setLoading(false);
                return;
              }

              // Check if user has required tag
              if (feature.requiredGhlTag && !user.ghlTags?.includes(feature.requiredGhlTag)) {
                setAccessError({
                  feature: feature.displayName,
                  requiredTag: feature.requiredGhlTag,
                  message: `You need the "${feature.requiredGhlTag}" tag to access this feature.`,
                });
                setLoading(false);
                return;
              }

              // Check if user has premium if required
              if (feature.requiresPremium && !user.isPremium) {
                setAccessError({
                  feature: feature.displayName,
                  requiresPremium: true,
                  message: 'This feature requires premium access.',
                });
                setLoading(false);
                return;
              }
            }
          }
        }
      }

      // Check course access
      if (requireCourse) {
        const courseResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }
        );

        if (courseResponse.ok) {
          const courses = await courseResponse.json();
          const course = courses.find((c: any) => c.courseSlug === requireCourse);

          if (course) {
            // Staff and admin bypass course checks
            if (!user.isStaff && !user.isAdmin) {
              const hasTag = user.ghlTags?.includes(course.requiredGhlTag);
              const hasFallback = course.fallbackToFlag && user[course.fallbackToFlag];

              if (!hasTag && !hasFallback) {
                setAccessError({
                  requiredTag: course.requiredGhlTag,
                  message: `You need access to ${course.courseName}.`,
                });
                setLoading(false);
                return;
              }
            }
          }
        }
      }

      setAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error('Access check failed:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (accessError) {
    return <AccessDenied {...accessError} />;
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}