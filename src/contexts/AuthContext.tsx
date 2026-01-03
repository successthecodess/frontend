'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { TokenManager } from '@/utils/tokenManager';

interface User {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  isAdmin?: boolean;
  isStaff?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const token = TokenManager.getAccessToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token is still valid by making a request
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await TokenManager.refreshAccessToken();
        
        if (newToken) {
          // Retry with new token
          const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setUser(data.user);
          } else {
            TokenManager.clearTokens();
          }
        } else {
          TokenManager.clearTokens();
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      TokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store both tokens
      TokenManager.setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      
      console.log('✅ Login successful:', data.user.email);
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      const accessToken = TokenManager.getAccessToken();
      
      if (refreshToken && accessToken) {
        // Notify server to revoke tokens
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refreshToken }),
        }).catch(err => console.warn('Logout request failed:', err));
      }
    } finally {
      // Always clear tokens and redirect
      TokenManager.clearTokens();
      setUser(null);
      router.push('/login');
      console.log('✅ Logged out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}