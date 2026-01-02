'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lock, 
  Mail, 
  Tag, 
  ArrowLeft,
  Crown,
  Shield,
  Gift,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface AccessDeniedProps {
  feature?: string;
  requiredTag?: string;
  requiresPremium?: boolean;
  message?: string;
}

export function AccessDenied({ 
  feature, 
  requiredTag, 
  requiresPremium,
  message 
}: AccessDeniedProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [hasUsedTrial, setHasUsedTrial] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      checkTrialStatus();
    }
  }, [user]);

  const checkTrialStatus = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/free-trial/status/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setHasUsedTrial(data.hasUsedFreeTrial);
    } catch (error) {
      console.error('Failed to check trial status:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleContactInstructor = () => {
    const subject = encodeURIComponent('Request for Full Access to AP CS Practice Platform');
    const body = encodeURIComponent(
      `Hi,\n\nI've completed the free diagnostic quiz and would like to request full access to the AP Computer Science A practice platform.\n\nMy account details:\nName: ${user?.name || 'N/A'}\nEmail: ${user?.email || 'N/A'}\n\nThank you!`
    );
    window.location.href = `mailto:daniel@enginearu.com?subject=${subject}&body=${body}`;
  };

  // Show free trial prompt if user hasn't used it yet
  if (hasUsedTrial === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full p-8">
          {/* Free Trial Offer */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
                <Gift className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  🎉 Try Our Free Diagnostic Quiz!
                </h2>
                <p className="text-white/90 mb-4">
                  Before getting full access, take our free 10-question diagnostic quiz to test your AP Computer Science A knowledge. It's completely free and gives you instant feedback!
                </p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span>✓ 10 questions covering all units</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>✓ Instant feedback & explanations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>✓ No commitment required</span>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/free-trial')}
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                  size="lg"
                >
                  Start Free Trial Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Access Required Info */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Full Access Required
            </h3>
            
            {message ? (
              <p className="text-gray-600 mb-6">{message}</p>
            ) : (
              <div className="mb-6 space-y-2">
                {feature && (
                  <p className="text-gray-600">
                    This page requires: <span className="font-semibold">{feature.replace(/_/g, ' ')}</span>
                  </p>
                )}
                {requiredTag && (
                  <p className="text-sm text-gray-500">
                    Required tag: <code className="px-2 py-1 bg-gray-100 rounded text-xs">{requiredTag}</code>
                  </p>
                )}
                {requiresPremium && (
                  <p className="text-sm text-orange-600 font-medium">
                    Premium subscription required
                  </p>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>After the free trial:</strong> Contact your instructor to get full access with unlimited practice questions, adaptive difficulty, and detailed analytics.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show upgrade prompt if trial already used
  if (hasUsedTrial === true) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full p-8">
          {/* Upgrade Prompt */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg p-8 text-white mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
                <Crown className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  Ready to Continue Learning?
                </h2>
                <p className="text-white/90 mb-4">
                  You've completed the free trial! Get full access to unlock:
                </p>
                <ul className="space-y-2 mb-4 text-sm">
                  <li>• Unlimited practice questions across all 10 units</li>
                  <li>• Adaptive difficulty that adjusts to your level</li>
                  <li>• Full-length practice tests with timed mode</li>
                  <li>• Detailed analytics and progress tracking</li>
                  <li>• Premium exam mode with AP score predictions</li>
                </ul>
                <Button
                  onClick={handleContactInstructor}
                  className="bg-white text-orange-600 hover:bg-gray-100"
                  size="lg"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Instructor for Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Access Required Info */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Access Needed
            </h3>
            
            {message ? (
              <p className="text-gray-600 mb-6">{message}</p>
            ) : (
              <div className="mb-6 space-y-2">
                {feature && (
                  <p className="text-gray-600">
                    This page requires: <span className="font-semibold">{feature.replace(/_/g, ' ')}</span>
                  </p>
                )}
                {requiredTag && (
                  <p className="text-sm text-gray-500">
                    Required tag: <code className="px-2 py-1 bg-gray-100 rounded text-xs">{requiredTag}</code>
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <Button onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Page'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Default access denied (loading or no trial status)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full p-8 sm:p-12">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-10 w-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Access Restricted
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-8">
            {message || "You don't have permission to access this feature yet."}
          </p>

          {/* Requirements */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <div className="space-y-3">
              {requiresPremium && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Crown className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Premium Access</p>
                    <p className="text-sm text-gray-600">
                      This feature requires a premium subscription
                    </p>
                  </div>
                </div>
              )}

              {feature && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Feature Access</p>
                    <p className="text-sm text-gray-600">
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
              )}

              {requiredTag && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Tag className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Required Tag</p>
                    <p className="text-sm text-gray-600">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs">{requiredTag}</code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-left flex-1">
                <p className="font-semibold text-indigo-900 mb-1">
                  Need Access?
                </p>
                <p className="text-sm text-indigo-700 mb-3">
                  Contact your instructor to request access to this feature. They can grant you the necessary permissions from their admin panel.
                </p>
                <Button
                  onClick={handleContactInstructor}
                  variant="outline"
                  size="sm"
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                >
                  <Mail className="mr-2 h-3 w-3" />
                  Email Instructor
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Button 
              className="flex-1 gap-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Page'}
            </Button>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-sm text-gray-500">
            If you believe this is an error, please contact support or try refreshing the page.
          </p>
        </div>
      </Card>
    </div>
  );
}