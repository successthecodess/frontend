'use client';

import { UserButton } from '@clerk/nextjs';
import { Code, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Code className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">AP CS Bank</span>
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/dashboard/practice" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Practice
              </Link>
              <Link href="/dashboard/exams" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Exams
              </Link>

              <Link href="/dashboard/progress" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Progress
              </Link>
             
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}