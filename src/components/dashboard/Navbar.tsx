'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Code, Menu, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Code className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">AP CS Bank</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-6">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/practice" 
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Practice
              </Link>
              <Link 
                href="/dashboard/progress" 
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Progress
              </Link>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            {/* Desktop User Display */}
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || 'Student'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            {/* Mobile User Info */}
            {user && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-2">
              <Link 
                href="/dashboard" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/practice" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Practice
              </Link>
              <Link 
                href="/dashboard/progress" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Progress
              </Link>
            </div>

            {/* Mobile Logout */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}