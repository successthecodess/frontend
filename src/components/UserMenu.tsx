'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Crown,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user from localStorage
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    const subscriptionStatus = localStorage.getItem('subscriptionStatus') || 'FREE';

    if (userEmail) {
      setUser({
        email: userEmail,
        name: userName,
        id: userId,
        subscriptionStatus,
      });
    }

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleManageSubscription = () => {
    window.open('https://billing.stripe.com/p/login/cN icN63LC0GI47A75E2wU00', '_blank');
  };

  if (!user) return null;

  const isPremium = user.subscriptionStatus === 'ACTIVE' || user.subscriptionStatus === 'TRIALING';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            {user.name || user.email}
            {isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
          </p>
          <p className="text-xs text-gray-600">
            {isPremium ? (
              <span className="text-indigo-600 font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Premium Member
              </span>
            ) : (
              'Free Plan'
            )}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-72 shadow-xl border-2 z-50">
          <div className="p-4 border-b bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{user.name || 'User'}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            {isPremium ? (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Premium Member
              </div>
            ) : (
              <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm">
                Free Plan
              </div>
            )}
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                router.push('/settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all text-left"
            >
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Account Settings</span>
            </button>

            {isPremium ? (
              <button
                onClick={() => {
                  handleManageSubscription();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all text-left"
              >
                <CreditCard className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Manage Subscription</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  router.push('/pricing');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 transition-all text-left bg-gradient-to-r from-indigo-50 to-purple-50"
              >
                <Crown className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-indigo-600 font-bold">Upgrade to Premium</p>
                  <p className="text-xs text-indigo-500">Unlimited practice exams</p>
                </div>
              </button>
            )}

            <div className="border-t my-2"></div>

            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all text-left text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}