import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { NetworkStatus } from '@/components/NetworkStatus';
import { AuthProvider } from '@/contexts/AuthContext';
export const metadata: Metadata = {
  title: {
    default: 'AP Computer Science A Practice Platform',
    template: '%s | AP CS Practice',
  },
  description: 'Master AP Computer Science A with adaptive practice tests, instant feedback, and comprehensive analytics. Free diagnostic quiz available.',
  keywords: ['AP Computer Science', 'AP CS A', 'Java', 'Practice Tests', 'AP Exam Prep', 'Computer Science Education'],
  authors: [{ name: 'Enginearu' }],
  creator: 'Enginearu',
  publisher: 'Enginearu',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'AP CS Practice Platform',
    title: 'AP Computer Science A Practice Platform',
    description: 'Master AP Computer Science A with adaptive practice tests, instant feedback, and comprehensive analytics.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AP CS Practice Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AP Computer Science A Practice Platform',
    description: 'Master AP CS A with adaptive practice tests and instant feedback.',
    images: ['/og-image.png'],
    creator: '@enginearu',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};
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