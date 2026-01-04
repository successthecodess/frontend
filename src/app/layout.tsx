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
  description: 'Your one-stop shop for prepping for the AP Computer Science A exam the right way. Master Java with adaptive practice tests, instant feedback, and comprehensive analytics.',
  keywords: [
    'AP Computer Science A',
    'AP CS A exam prep',
    'AP CS A practice',
    'Java programming',
    'AP exam preparation',
    'Computer Science practice tests',
    'AP CS study guide',
    'Java practice questions',
    'AP Computer Science tutorial',
    'AP CS exam review',
  ],
  authors: [{ name: 'Daniel - The AP Computer Science Tutor' }],
  creator: 'Daniel - The AP Computer Science Tutor',
  publisher: 'EngiNearU',
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'ACE AP Computer Science A Exam Prep',
    title: 'ACE AP Computer Science A Exam Prep',
    description: 'Your one-stop shop for prepping for the AP Computer Science A exam the right way. Adaptive practice tests, instant feedback, and detailed analytics.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'ACE AP Computer Science A Exam Prep Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACE AP Computer Science A Exam Prep',
    description: 'Your one-stop shop for prepping for the AP Computer Science A exam the right way.',
    images: [`${baseUrl}/og-image.png`],
    creator: '@enginearu',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/img.jpeg', type: 'image/jpeg' },
      { url: '/img.jpeg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/img.jpeg', sizes: '16x16', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/img.jpeg', type: 'image/jpeg' },
      { url: '/img.jpeg', sizes: '180x180', type: 'image/jpeg' },
    ],
    shortcut: '/img.jpeg',
  },
  manifest: '/manifest.json',
  applicationName: 'ACE AP CS A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ACE AP CS A',
  },
  formatDetection: {
    telephone: false,
  },
  category: 'education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Favicon - using your custom image */}
          <link rel="icon" type="image/jpeg" href="/img.jpeg" />
          <link rel="shortcut icon" type="image/jpeg" href="/img.jpeg" />
          <link rel="apple-touch-icon" href="/img.jpeg" />
          
          {/* Additional meta tags */}
          <meta name="theme-color" content="#4f46e5" />
          <meta name="color-scheme" content="light" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          
          {/* Preconnect to improve performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className="antialiased">
          <ErrorBoundary>
            <NetworkStatus />
            <AuthProvider>
              {children}
            </AuthProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}