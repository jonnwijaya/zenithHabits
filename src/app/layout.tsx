
import type { Metadata, Viewport } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-pt-sans',
});

const APP_NAME = 'Zenith Habits';
const APP_DESCRIPTION = 'Track your habits and achieve your goals with Zenith Habits. Reach your peak potential, one day at a time.';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'; // Replace with your actual domain in .env.local

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  authors: [{ name: 'Firebase Studio User' }], // Optional: Change this
  keywords: ['habits', 'tracker', 'goals', 'productivity', 'self-improvement', 'zenith'],
  robots: 'index, follow',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [{
      url: '/og-image.png', // Replace with your actual OG image path
      width: 1200,
      height: 630,
      alt: `${APP_NAME} - Habit Tracking`,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/twitter-image.png'], // Replace with your actual Twitter image path
    // creator: '@yourTwitterHandle', // Optional: Add your Twitter handle
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F5F9' }, // --background light
    { media: '(prefers-color-scheme: dark)', color: '#2E2A30' }, // --background dark
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Optional: consider if you want to allow zoom
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={ptSans.variable}>
      <head />
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
