import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { NetworkStatus } from '@/components/NetworkStatus';
import { AuthProvider } from '@/contexts/AuthContext';
import { StripeScript } from '@/components/StripeScript';


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
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 1200,
        alt: 'ACE AP Computer Science A Exam Prep',
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
  },
  icons: {
    icon: '/og-image.png',
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
        <head>
           {/* <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '844452550568473');
              fbq('track', 'PageView');
            `,
          }}
        />
         <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=844452550568473&ev=PageView&noscript=1"
            alt=""
          />
        </noscript> */}
        </head>
        <body>
          {/* <MetaPixel/> */}
          <ErrorBoundary>
            <NetworkStatus/>
            <StripeScript/>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}