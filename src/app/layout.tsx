import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { NetworkStatus } from '@/components/NetworkStatus';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ErrorBoundary>
            <NetworkStatus/>
            <AuthProvider>
            {children}
            </AuthProvider>
          </ErrorBoundary>
        
        </body>
      </html>
    </ClerkProvider>
  );
}