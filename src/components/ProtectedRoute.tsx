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
      console.log('🔐 PROTECTED ROUTE: Starting access check');
      console.log('===========================================');
      console.log('📋 Route Requirements:', {
        requireAdmin,
        requireStaff,
        requireFeature,
        requireCourse,
      });

      const token = localStorage.getItem('authToken');
      
      console.log('\n📍 STEP 1: Checking for auth token...');
      if (!token) {
        console.log('❌ No token found');
        router.push('/login');
        return;
      }
      console.log('✅ Token found');

      console.log('\n📍 STEP 2: Decoding JWT token...');
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('✅ Token decoded:', { userId: payload.userId, email: payload.email });

      console.log('\n📍 STEP 3: Fetching user details...');
      console.log('🔗 URL:', `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/me`);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }
      );

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        console.log('❌ Failed to fetch user details');
        console.log('➡️ Redirecting to /login');
        router.push('/login');
        return;
      }

      const user = await response.json();
      console.log('✅ User loaded successfully');
      console.log('👤 User Details:', {
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        isStaff: user.isStaff,
        tags: user.ghlTags,
        isPremium: user.isPremium,
      });

      // Check admin requirement
      if (requireAdmin) {
        console.log('\n📍 STEP 4a: Checking admin requirement...');
        if (!user.isAdmin && user.role !== 'ADMIN') {
          console.log('❌ Admin access required but user is not admin');
          setAccessError({
            message: 'This page requires administrator privileges.',
          });
          setLoading(false);
          return;
        }
        console.log('✅ Admin check passed');
      }

      // Check staff requirement
      if (requireStaff) {
        console.log('\n📍 STEP 4b: Checking staff requirement...');
        if (!user.isStaff && !user.isAdmin && user.role === 'STUDENT') {
          console.log('❌ Staff access required but user is not staff');
          setAccessError({
            message: 'This page requires staff privileges.',
          });
          setLoading(false);
          return;
        }
        console.log('✅ Staff check passed');
      }

      // Check feature access
      if (requireFeature) {
        console.log('\n📍 STEP 5: Checking feature access...');
        console.log('🔍 Required feature:', requireFeature);

        // Admins and staff bypass all feature checks
        if (user.isAdmin || user.isStaff || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          console.log('✅ Admin/Staff user - bypassing feature checks');
          console.log('===========================================');
          setAuthorized(true);
          setLoading(false);
          return;
        }

        console.log('👤 Regular student - checking feature flags...');

        const featureResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/features`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }
        );

        console.log('📋 Features API status:', featureResponse.status);

        if (featureResponse.ok) {
          const features = await featureResponse.json();
          console.log('🎯 Available features:', features.map((f: any) => f.name));
          
          const feature = features.find((f: any) => f.name === requireFeature);
          
          if (!feature) {
            console.log('⚠️ Feature not found in database:', requireFeature);
            console.log('💡 Available features:', features.map((f: any) => f.name).join(', '));
            setAccessError({
              message: `Feature "${requireFeature}" is not configured. Please contact your administrator.`,
            });
            setLoading(false);
            return;
          }

          console.log('✨ Feature found:', {
            name: feature.name,
            displayName: feature.displayName,
            requiredTag: feature.requiredGhlTag,
            requiresPremium: feature.requiresPremium,
            isEnabled: feature.isEnabled,
          });

          // Check if feature is enabled
          if (!feature.isEnabled) {
            console.log('❌ Feature is disabled');
            setAccessError({
              feature: feature.displayName,
              message: 'This feature is currently disabled.',
            });
            setLoading(false);
            return;
          }
          console.log('✅ Feature is enabled');

          // Check if user has required tag
          if (feature.requiredGhlTag) {
            const hasTag = user.ghlTags?.includes(feature.requiredGhlTag);
            console.log('🏷️ Tag check:', {
              required: feature.requiredGhlTag,
              userTags: user.ghlTags || [],
              hasTag,
            });

            if (!hasTag) {
              console.log('❌ User missing required tag:', feature.requiredGhlTag);
              setAccessError({
                feature: feature.displayName,
                requiredTag: feature.requiredGhlTag,
                message: `You need the "${feature.requiredGhlTag}" tag to access this feature.`,
              });
              setLoading(false);
              return;
            }
            console.log('✅ User has required tag');
          }

          // Check if user has premium if required
          if (feature.requiresPremium && !user.isPremium) {
            console.log('❌ Premium required but user does not have premium');
            setAccessError({
              feature: feature.displayName,
              requiresPremium: true,
              message: 'This feature requires premium access.',
            });
            setLoading(false);
            return;
          }
          
          if (feature.requiresPremium) {
            console.log('✅ Premium check passed');
          }

          console.log('✅ All feature checks passed!');
        } else {
          console.log('⚠️ Could not fetch features, denying access');
          setAccessError({
            message: 'Could not verify feature access. Please try again.',
          });
          setLoading(false);
          return;
        }
      }

      // Check course access
      if (requireCourse) {
        console.log('\n📍 STEP 6: Checking course access...');
        console.log('🎓 Required course:', requireCourse);

        // Admins and staff bypass course checks
        if (user.isAdmin || user.isStaff || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          console.log('✅ Admin/Staff user - bypassing course checks');
          console.log('===========================================');
          setAuthorized(true);
          setLoading(false);
          return;
        }

        const courseResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }
        );

        if (courseResponse.ok) {
          const courses = await courseResponse.json();
          const course = courses.find((c: any) => c.courseSlug === requireCourse);

          if (course) {
            const hasTag = user.ghlTags?.includes(course.requiredGhlTag);
            const hasFallback = course.fallbackToFlag && user[course.fallbackToFlag];

            console.log('🎓 Course check:', {
              course: course.courseName,
              requiredTag: course.requiredGhlTag,
              hasTag,
              hasFallback,
            });

            if (!hasTag && !hasFallback) {
              console.log('❌ User does not have course access');
              setAccessError({
                requiredTag: course.requiredGhlTag,
                message: `You need access to ${course.courseName}.`,
              });
              setLoading(false);
              return;
            }
            console.log('✅ Course access granted');
          }
        }
      }

      console.log('\n🎉 ALL CHECKS PASSED - GRANTING ACCESS');
      console.log('===========================================\n');
      setAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error('💥 Access check failed with error:', error);
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