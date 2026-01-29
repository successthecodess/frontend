'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  BookOpen, 
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Upload,
  Gift,
  FileText,
  GraduationCap,
  BarChart,
  TestTubes
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }
    
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/admin/login'); // Changed from /login to /admin/login
        return;
      }

      // Verify token by fetching user info
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Not authorized');
      }

      const userData = await response.json();
      
      if (!userData.isAdmin && userData.role !== 'ADMIN') {
        alert('Access denied. Admin privileges required.');
        router.push('/dashboard');
        return;
      }

      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      router.push('/admin/login'); // Changed from /login to /admin/login
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/admin/login'); // Changed from /login to /admin/login
  };

  // Don't show loading on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Admins', href: '/admin/admins', icon: Shield },
     { name: 'Questions', href: '/admin/questions', icon: Settings },
    { name: 'Feature Flags', href: '/admin/features', icon: Flag },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Exam Metrics', href: '/admin/full-exams', icon: BarChart },
    { name: 'Practice Tests', href: '/admin/practice-tests', icon: TestTubes },
    { name: 'Bulk Upload', href: '/admin/upload', icon: Upload },
   
    { name: 'GHL Setup', href: '/admin/ghl-setup', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-indigo-600">Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
