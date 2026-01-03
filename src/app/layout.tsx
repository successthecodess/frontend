import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { NetworkStatus } from '@/components/NetworkStatus';
import { AuthProvider } from '@/contexts/AuthContext';

// Get base URL for absolute paths
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  title: {
    default: 'ACE AP Computer Science A Exam Prep',
    template: '%s | ACE AP CS A',
  },
  description: 'Your one-stop shop for prepping for the AP Computer Science A exam the right way.',
  keywords: ['AP Computer Science', 'AP CS A', 'Java', 'Practice Tests', 'AP Exam Prep', 'Computer Science Education'],
  authors: [{ name: 'Enginearu' }],
  creator: 'Enginearu',
  publisher: 'Enginearu',
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'ACE AP Computer Science A Exam Prep',
    title: 'ACE AP Computer Science A Exam Prep',
    description: 'Your one-stop shop for prepping for the AP Computer Science A exam the right way.',
    images: [
      {
        url: `${baseUrl}/og-image.jpeg`,
        width: 1200,
        height: 630,
        alt: 'ACE AP Computer Science A Exam Prep',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACE AP Computer Science A Exam Prep',
    description: 'Your one-stop shop for prepping for the AP Computer Science A exam the right way.',
    images: [`${baseUrl}/og-image.jpeg`],
    creator: '@enginearu',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.jpeg',
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
