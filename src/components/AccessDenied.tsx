'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lock, 
  Mail, 
  Tag, 
  ArrowLeft,
  Crown,
  Shield
} from 'lucide-react';
import Link from 'next/link';

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
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              What you need:
            </h2>
            <div className="space-y-3">
              {requiredTag && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Tag className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Required Tag</p>
                    <p className="text-sm text-gray-600">
                      Your instructor needs to add the <code className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-mono">{requiredTag}</code> tag to your account
                    </p>
                  </div>
                </div>
              )}

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
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold text-indigo-900 mb-1">
                  Need Access?
                </p>
                <p className="text-sm text-indigo-700">
                  Contact your instructor to request access to this feature. They can grant you the necessary permissions from their admin panel.
                </p>
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
              onClick={() => window.location.reload()}
            >
              Refresh Page
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