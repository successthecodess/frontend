import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { NetworkStatus } from '@/components/NetworkStatus';

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
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}