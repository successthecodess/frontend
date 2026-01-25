'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Code, Menu, X, Home, Target, GraduationCap, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('FREE');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load subscription status
    const status = localStorage.getItem('subscriptionStatus') || 'FREE';
    setSubscriptionStatus(status);

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/practice', label: 'Practice', icon: Target },
    { href: '/dashboard/full-exam', label: 'Full Exam', icon: GraduationCap },
  ];

  const isActive = (href: string) => pathname === href;
  const isPremium = subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIALING';

  // Get user initials
  const getInitials = (name: string | undefined): string => {
    if (!name) return 'S';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleManageSubscription = () => {
    window.open('https://billing.stripe.com/p/login/cNicN63LC0GI47A75E2wU00', '_blank');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                <Code className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
                AP CS Bank
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {getInitials(user.name)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {user.name || user.email}
                      {isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                    </p>
                    <p className="text-xs text-gray-600">
                      {isPremium ? (
                        <span className="text-indigo-600 font-semibold flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Premium
                        </span>
                      ) : (
                        'Free Plan'
                      )}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-100 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b bg-gradient-to-br from-indigo-50 to-purple-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {getInitials(user.name)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{user.name || 'User'}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
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

                    {/* Menu Items */}
                    <div className="py-2">
                      {isPremium ? (
                        <button
                          onClick={() => {
                            handleManageSubscription();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all text-left"
                        >
                          <Crown className="h-5 w-5 text-gray-600" />
                          <span className="text-gray-700 font-medium">Manage Subscription</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            router.push('/dashboard/pricing');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-all text-left bg-gradient-to-r from-indigo-50 to-purple-50"
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
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-all text-left text-red-600"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Mobile User Info */}
            {user && (
              <div className="px-3 py-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {user.name || user.email}
                      {isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                    </p>
                    <p className="text-xs text-gray-600">{user.email}</p>
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
            )}

            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Actions */}
            <div className="space-y-2 pt-2 border-t">
              {isPremium ? (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    handleManageSubscription();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Crown className="h-4 w-4" />
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  onClick={() => {
                    router.push('/pricing');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}