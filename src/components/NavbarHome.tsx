'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Code, Menu, X, Home, LogIn, UserPlus, CreditCard } from 'lucide-react';
import Image from 'next/image';

export function NavbarHome() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'Login', href: '/login', icon: LogIn },
    { name: 'Sign Up', href: '/signup', icon: UserPlus },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
                           src="/img.jpeg"
                           alt="AP CS A Logo"
                           width={40}
                           height={40}
                           className="object-contain w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0"
                         />
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              AP CS A Exam Prep
            </span>
            <span className="font-bold text-lg text-gray-900 sm:hidden">
              AP CS A
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className={isActive(item.href) ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer' : ''}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-900" />
            ) : (
              <Menu className="h-6 w-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.href) ? 'default' : 'ghost'}
                    className={`w-full justify-start ${
                      isActive(item.href) ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}