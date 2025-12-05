'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-red-600 text-white rounded-lg shadow-lg p-4 flex items-center gap-3">
        <WifiOff className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">No Internet Connection</p>
          <p className="text-xs opacity-90">
            Please check your connection and try again
          </p>
        </div>
      </div>
    </div>
  );
}